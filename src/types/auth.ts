
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    avatar?: string;
  };
  plan?: 'free' | 'premium';
  is_admin?: boolean;
  name?: string;
}
