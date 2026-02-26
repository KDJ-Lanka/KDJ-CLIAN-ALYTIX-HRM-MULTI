// Auth-related types

import type { User, Session } from '@supabase/supabase-js';
import type { Profile, Company, CompanyAdmin } from './database';

export interface Employee {
  id: string;
  profile_id: string;
  company_id: string;
  employee_code: string;
  status: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  company: Company | null;
  companyAdmin: CompanyAdmin | null;
  employee: Employee | null;
  loading: boolean;
  initialized: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  // Company info
  companyName: string;
  companySlug: string;
  companyEmail: string;
  companyPhone?: string;
  companyAddress?: string;

  // Admin info
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export type UserRole = 'owner' | 'admin' | 'super_admin';
