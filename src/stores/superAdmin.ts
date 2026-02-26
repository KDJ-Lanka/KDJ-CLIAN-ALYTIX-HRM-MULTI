import { defineStore } from 'pinia';
import { supabase } from 'src/boot/supabase';

export interface SuperAdmin {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: 'super_admin' | 'support' | 'billing';
  permissions: string[];
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  slug?: string;
  email: string;
  phone?: string;
  website?: string;
  is_active: boolean;
  subscription_plan?: string;
  subscription_status?: string;
  employee_count?: number;
  created_at: string;
}

interface SuperAdminState {
  superAdmin: SuperAdmin | null;
  isAuthenticated: boolean;
  loading: boolean;
  companies: Company[];
  stats: {
    totalCompanies: number;
    activeCompanies: number;
    totalEmployees: number;
    totalRevenue: number;
  } | null;
}

export const useSuperAdminStore = defineStore('superAdmin', {
  state: (): SuperAdminState => ({
    superAdmin: null,
    isAuthenticated: false,
    loading: false,
    companies: [],
    stats: null,
  }),

  getters: {
    isAdmin: (state) => state.isAuthenticated && state.superAdmin?.is_active,
    hasPermission: (state) => (permission: string) => {
      if (!state.superAdmin) return false;
      if (state.superAdmin.permissions.includes('all')) return true;
      return state.superAdmin.permissions.includes(permission);
    },
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true;
      try {
        // First check if this is a super admin email
        const { data: adminCheck, error: adminError } = await supabase
          .from('super_admins')
          .select('*')
          .eq('email', email)
          .eq('is_active', true)
          .single();

        if (adminError || !adminCheck) {
          return { success: false, error: 'Invalid super admin credentials' };
        }

        // Now authenticate with Supabase Auth
        const { error: authError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (authError) throw authError;

        this.superAdmin = adminCheck as SuperAdmin;
        this.isAuthenticated = true;

        // Set localStorage flag for route guard (more reliable than sessionStorage)
        localStorage.setItem('superAdminAuth', 'true');

        // Update last login
        await supabase
          .from('super_admins')
          .update({ last_login_at: new Date().toISOString() } as never)
          .eq('id', (adminCheck as { id: string }).id);

        return { success: true };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Login failed';
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      await supabase.auth.signOut();
      this.superAdmin = null;
      this.isAuthenticated = false;
      this.companies = [];
      this.stats = null;
      // Remove localStorage flag for route guard
      localStorage.removeItem('superAdminAuth');
    },

    async checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: admin } = await supabase
          .from('super_admins')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .single();

        if (admin) {
          this.superAdmin = admin as SuperAdmin;
          this.isAuthenticated = true;
          // Set localStorage flag for route guard
          localStorage.setItem('superAdminAuth', 'true');
          return true;
        }
      }

      this.superAdmin = null;
      this.isAuthenticated = false;
      localStorage.removeItem('superAdminAuth');
      return false;
    },

    async fetchCompanies() {
      const { data, error } = await supabase
        .from('companies')
        .select(
          `
          *,
          employees(count)
        `
        )
        .order('created_at', { ascending: false });

      if (!error && data) {
        this.companies = (data as Array<{ id: string; name: string; email: string; is_active: boolean; created_at: string; employees?: Array<{ count: number }> }>).map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          is_active: c.is_active,
          created_at: c.created_at,
          employee_count: c.employees?.[0]?.count || 0,
        }));
      }
    },

    async fetchStats() {
      // Get total companies
      const { count: totalCompanies } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      // Get active companies
      const { count: activeCompanies } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get total employees
      const { count: totalEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      this.stats = {
        totalCompanies: totalCompanies || 0,
        activeCompanies: activeCompanies || 0,
        totalEmployees: totalEmployees || 0,
        totalRevenue: 0, // Would come from billing system
      };
    },

    async toggleCompanyStatus(companyId: string, isActive: boolean) {
      const { error } = await supabase
        .from('companies')
        .update({ is_active: isActive } as never)
        .eq('id', companyId);

      if (!error) {
        await this.fetchCompanies();
        return { success: true };
      }
      return { success: false, error: error.message };
    },

    async deleteCompany(companyId: string) {
      // Soft delete - mark as deleted
      const { error } = await supabase
        .from('companies')
        .update({ is_active: false, deleted_at: new Date().toISOString() } as never)
        .eq('id', companyId);

      if (!error) {
        await this.fetchCompanies();
        return { success: true };
      }
      return { success: false, error: error.message };
    },
  },
});
