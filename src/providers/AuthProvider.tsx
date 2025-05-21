
import React, { useState, useEffect, ReactNode, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Session } from "@supabase/supabase-js";
import { useUserData } from "@/hooks/useUserData";
import { authService } from "@/services/authService";
import { AuthContext, AuthState } from "@/contexts/AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, setUser, fetchUserDetails } = useUserData();
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
      const { data } = await authService.getSession();

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

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authService.signIn(email, password);
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
      await authService.signUp(email, password, name);
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
      await authService.signOut();
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
    const { data } = await authService.getSession();
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
