
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User extends SupabaseUser {
  user_metadata?: {
    name?: string;
    avatar?: string;
  };
  plan?: 'free' | 'premium';
  is_admin?: boolean;
}
