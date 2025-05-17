import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type Plan = "free" | "premium";

interface User {
  id: string;
  email: string;
  plan: Plan;
  is_admin?: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isLoading: boolean; // Added this to fix TypeScript errors
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;  // New function
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load user from localStorage on initial render
  useEffect(() => {
    const savedUser = localStorage.getItem("convertUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
    
    // Set up Supabase auth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          localStorage.removeItem("convertUser");
        } else if (session?.user) {
          // When auth changes, fetch the complete user profile
          fetchUserProfile(session.user.id);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Function to fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      // Get user data from the users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError) throw userError;

      if (userData) {
        const fullUser: User = {
          id: userId,
          email: userData.email,
          plan: userData.plan as Plan || "free",
          is_admin: userData.is_admin || false,
        };
        
        setUser(fullUser);
        localStorage.setItem("convertUser", JSON.stringify(fullUser));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data?.user) {
        await fetchUserProfile(data.user.id);
        
        toast({
          title: "Login bem sucedido",
          description: "Bem-vindo de volta!",
        });
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error?.message || "Verifique suas credenciais e tente novamente.",
      });
      throw error;
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Create authentication account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            email_verified: true, // For demo purposes only
          },
        },
      });

      if (error) throw error;

      // In a real app, the user profile would be created via a database trigger
      // For demo purposes, we're creating it directly here
      if (data?.user) {
        // Create a default user in our users table
        const { error: profileError } = await supabase
          .from("users")
          .insert([
            {
              id: data.user.id,
              email: email,
              plan: "free",
            },
          ]);

        if (profileError) throw profileError;

        // Save the user to state and localStorage
        const newUser: User = {
          id: data.user.id,
          email,
          plan: "free",
        };

        setUser(newUser);
        localStorage.setItem("convertUser", JSON.stringify(newUser));

        toast({
          title: "Conta criada com sucesso",
          description: "Bem-vindo ao Convert!",
        });
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar conta",
        description: error?.message || "Tente novamente com um email diferente.",
      });
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem("convertUser");
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error?.message || "Ocorreu um erro ao tentar sair.",
      });
    }
  };

  // Function to refresh user data
  const refreshUser = async () => {
    if (!user?.id) return;
    
    try {
      await fetchUserProfile(user.id);
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const authContextValue: AuthState = {
    user,
    loading,
    isLoading: loading, // Added this to fix TypeScript errors
    signIn,
    signUp,
    signOut,
    refreshUser
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
