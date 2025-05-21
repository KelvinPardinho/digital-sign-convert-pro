
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";

export const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);

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
          name: authUser?.user_metadata?.name || "Usuário",
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
            name: authData.user.user_metadata?.name || "Usuário",
          };
          
          setUser(fullUser);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      setUser(null);
    }
  };

  return { user, setUser, fetchUserDetails };
};
