
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/types/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        await fetchUserDetails(data.session.user.id);
      }
      setLoading(false);
    };

    getSession();

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        if (session?.user) {
          await fetchUserDetails(session.user.id);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });
  }, []);

  const fetchUserDetails = async (userId: string) => {
    try {
      // Get the user's profile information from the users table instead of profiles
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email, plan, is_admin')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;

      if (userData) {
        const authResponse = await supabase.auth.getUser();
        const authUser = authResponse.data.user;
        
        const fullUser: User = {
          id: userId,
          email: userData.email,
          user_metadata: authUser?.user_metadata || {},
          plan: (userData.plan as 'free' | 'premium') || 'free',
          is_admin: userData.is_admin || false,
        };
        
        setUser(fullUser);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };
  
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        throw error;
      }
      toast({
        title: "Login realizado com sucesso!",
      });
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
      if (error) {
        throw error;
      }

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
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast({
        title: "Logout realizado com sucesso!",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error.message,
      });
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
    loading,
    isLoading: loading,
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
