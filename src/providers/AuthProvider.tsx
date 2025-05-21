
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types/auth";
import { Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean; // Added isLoading property to match usage in layout.tsx
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      
      if (event === "SIGNED_IN" && newSession?.user) {
        // Using setTimeout to avoid deadlocks
        setTimeout(() => {
          fetchUserDetails(newSession.user.id);
        }, 0);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setSession(null);
      }
    });

    // THEN check for existing session
    const getSession = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        setSession(data.session);
        await fetchUserDetails(data.session.user.id);
      }
      
      setLoading(false);
    };

    getSession();

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserDetails = async (userId: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, plan, is_admin')
        .eq('id', userId)
        .maybeSingle();

      if (userError) throw userError;

      if (userData) {
        const { data: authData } = await supabase.auth.getUser();
        const authUser = authData.user;

        const fullUser: User = {
          id: userId,
          email: userData.email,
          user_metadata: authUser?.user_metadata || {},
          plan: (userData.plan as 'free' | 'premium') || 'free',
          is_admin: userData.is_admin || false,
          name: authUser?.user_metadata?.name || "Usuário", // Now properly defined in User type
        };

        setUser(fullUser);
      } else {
        // Handle case where user is authenticated but not in users table
        console.warn("User authenticated but not found in users table");
        const { data: authData } = await supabase.auth.getUser();
        
        if (authData.user) {
          // Create basic user profile
          const fullUser: User = {
            id: userId,
            email: authData.user.email || "",
            user_metadata: authData.user.user_metadata || {},
            plan: 'free',
            is_admin: false,
            name: authData.user.user_metadata?.name || "Usuário", // Now properly defined in User type
          };
          
          setUser(fullUser);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      setUser(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      toast({ title: "Login realizado com sucesso!" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao logar",
        description: error.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      if (error) throw error;

      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar sua conta.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({ title: "Logout realizado com sucesso!" });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error.message,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      await fetchUserDetails(data.session.user.id);
    }
  };

  const authContextValue: AuthState = {
    user,
    session,
    loading,
    isLoading: loading, // Map loading to isLoading for consistency
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
