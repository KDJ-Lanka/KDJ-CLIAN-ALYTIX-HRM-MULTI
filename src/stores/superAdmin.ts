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

export interface PlatformUser {
  id: string;
  email: string;
  full_name?: string | undefined;
  company_id?: string | undefined;
  company_name?: string | undefined;
  role?: string | undefined;
  status?: string | undefined;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  company_id?: string | undefined;
  company_name?: string | undefined;
  reporter_id?: string | undefined;
  reporter_name?: string | undefined;
  subject: string;
  description?: string | undefined;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category?: string | undefined;
  assigned_to?: string | undefined;
  assigned_to_name?: string | undefined;
  created_at: string;
  updated_at: string;
  resolved_at?: string | undefined;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id?: string | undefined;
  sender_name?: string | undefined;
  sender_type: 'user' | 'super_admin';
  message: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  price_monthly: string;
  price_yearly: string;
  currency: string;
  max_employees: number;
  max_storage_mb: number;
  features: Record<string, unknown>;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
}

export interface PlatformSetting {
  key: string;
  value: unknown;
  description?: string;
  category: string;
  is_public: boolean;
}

export interface AnalyticsData {
  companyGrowth: Array<{ month: string; count: number }>;
  employeeGrowth: Array<{ month: string; count: number }>;
  activeUsers: Array<{ date: string; count: number }>;
  topCompanies: Array<{ name: string; employees: number }>;
  subscriptionDistribution: Array<{ plan: string; count: number }>;
}

export interface BillingData {
  mrr: number;
  totalRevenue: number;
  activeSubscriptions: number;
  plans: SubscriptionPlan[];
  companiesByPlan: Array<{ plan: string; count: number }>;
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
  // Users
  users: PlatformUser[];
  usersLoading: boolean;
  usersPagination: { page: number; rowsPerPage: number; rowsNumber: number };
  // Support
  tickets: SupportTicket[];
  ticketsLoading: boolean;
  selectedTicket: SupportTicket | null;
  ticketMessages: TicketMessage[];
  // Analytics
  analytics: AnalyticsData | null;
  analyticsLoading: boolean;
  // Billing
  billing: BillingData | null;
  billingLoading: boolean;
  // Settings
  platformSettings: Record<string, unknown>;
  settingsLoading: boolean;
}

export const useSuperAdminStore = defineStore('superAdmin', {
  state: (): SuperAdminState => ({
    superAdmin: null,
    isAuthenticated: false,
    loading: false,
    companies: [],
    stats: null,
    // Users
    users: [],
    usersLoading: false,
    usersPagination: { page: 1, rowsPerPage: 20, rowsNumber: 0 },
    // Support
    tickets: [],
    ticketsLoading: false,
    selectedTicket: null,
    ticketMessages: [],
    // Analytics
    analytics: null,
    analyticsLoading: false,
    // Billing
    billing: null,
    billingLoading: false,
    // Settings
    platformSettings: {},
    settingsLoading: false,
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
        .is('deleted_at', null) // Exclude soft-deleted companies
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

    // ==========================================
    // USERS MANAGEMENT
    // ==========================================
    async fetchUsers(
      filters: { search?: string; company_id?: string; status?: string } = {},
      pagination: { page: number; rowsPerPage: number } = { page: 1, rowsPerPage: 20 }
    ) {
      this.usersLoading = true;
      try {
        // Use the database view to get all user data in a single query
        // The view handles the JOIN between profiles, companies, and employees
        let query = supabase
          .from('super_admin_users_view')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        if (filters.search) {
          query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
        }
        if (filters.company_id) {
          query = query.eq('company_id', filters.company_id);
        }
        if (filters.status) {
          query = query.eq('employee_status', filters.status);
        }

        const from = (pagination.page - 1) * pagination.rowsPerPage;
        const to = from + pagination.rowsPerPage - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (!error && data) {
          const typedData = data as Array<{
            id: string;
            email: string;
            full_name?: string;
            company_id?: string;
            created_at: string;
            company_name?: string;
            employee_status?: string;
          }>;
          this.users = typedData.map((u) => ({
            id: u.id,
            email: u.email,
            full_name: u.full_name,
            company_id: u.company_id,
            company_name: u.company_name || 'N/A',
            status: u.employee_status || 'active',
            created_at: u.created_at,
          }));
          this.usersPagination = {
            page: pagination.page,
            rowsPerPage: pagination.rowsPerPage,
            rowsNumber: count || 0,
          };
        }
      } finally {
        this.usersLoading = false;
      }
    },

    async fetchUserDetails(userId: string) {
      // Use RPC function to fetch user details with company and employee info
      const { data, error } = await (supabase.rpc as any)('get_user_details', {
        user_id: userId,
      });

      if (!error && data) {
        return data;
      }
      return null;
    },

    async deactivateUser(userId: string) {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false } as never)
        .eq('id', userId);

      return { success: !error, error: error?.message };
    },

    // ==========================================
    // ANALYTICS
    // ==========================================
    async fetchAnalytics() {
      this.analyticsLoading = true;
      try {
        // Company growth (last 12 months)
        const { data: companyGrowth } = await supabase.rpc('get_company_growth');

        // Employee growth (last 12 months)
        const { data: employeeGrowth } = await supabase.rpc('get_employee_growth');

        // Top companies by employee count
        const { data: topCompanies } = await supabase
          .from('companies')
          .select('name, employees(count)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(10);

        // Subscription distribution
        const { data: subscriptionData } = await supabase
          .from('companies')
          .select('subscription_plan')
          .eq('is_active', true);

        const planCounts: Record<string, number> = {};
        const typedSubscriptionData = subscriptionData as Array<{ subscription_plan?: string }> | null;
        typedSubscriptionData?.forEach((c) => {
          const plan = c.subscription_plan || 'free';
          planCounts[plan] = (planCounts[plan] || 0) + 1;
        });

        const typedTopCompanies = topCompanies as Array<{
          name: string;
          employees?: Array<{ count: number }>;
        }> | null;

        this.analytics = {
          companyGrowth: companyGrowth || [],
          employeeGrowth: employeeGrowth || [],
          activeUsers: [],
          topCompanies:
            typedTopCompanies?.map((c) => ({
              name: c.name,
              employees: c.employees?.[0]?.count || 0,
            })) || [],
          subscriptionDistribution: Object.entries(planCounts).map(([plan, count]) => ({
            plan,
            count,
          })),
        };
      } finally {
        this.analyticsLoading = false;
      }
    },

    // ==========================================
    // BILLING
    // ==========================================
    async fetchBillingData() {
      this.billingLoading = true;
      try {
        // Fetch subscription plans
        const { data: plans } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        // Count companies by plan
        const { data: companies } = await supabase
          .from('companies')
          .select('subscription_plan, subscription_status')
          .eq('is_active', true);

        const planCounts: Record<string, number> = {};
        let mrr = 0;
        const planPrices: Record<string, number> = {};

        const typedPlans = plans as SubscriptionPlan[] | null;
        typedPlans?.forEach((p) => {
          planPrices[p.name] = parseFloat(p.price_monthly);
        });

        const typedCompanies = companies as Array<{ subscription_plan?: string; subscription_status?: string }> | null;
        typedCompanies?.forEach((c) => {
          const plan = c.subscription_plan || 'free';
          planCounts[plan] = (planCounts[plan] || 0) + 1;
          if (c.subscription_status === 'active') {
            mrr += planPrices[plan] || 0;
          }
        });

        this.billing = {
          mrr,
          totalRevenue: mrr * 12, // Simplified annual projection
          activeSubscriptions: typedCompanies?.filter((c) => c.subscription_status === 'active').length || 0,
          plans: typedPlans || [],
          companiesByPlan: Object.entries(planCounts).map(([plan, count]) => ({ plan, count })),
        };
      } finally {
        this.billingLoading = false;
      }
    },

    // ==========================================
    // SUPPORT TICKETS
    // ==========================================
    async fetchTickets(
      filters: { status?: string; priority?: string; company_id?: string } = {}
    ) {
      this.ticketsLoading = true;
      try {
        let query = supabase
          .from('support_tickets')
          .select(
            `
            *,
            companies ( name ),
            profiles ( full_name ),
            super_admins ( full_name )
          `
          )
          .order('created_at', { ascending: false });

        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.priority) {
          query = query.eq('priority', filters.priority);
        }
        if (filters.company_id) {
          query = query.eq('company_id', filters.company_id);
        }

        const { data, error } = await query;

        if (!error && data) {
          const typedData = data as Array<{
            id: string;
            company_id?: string;
            reporter_id?: string;
            subject: string;
            description?: string;
            status: 'open' | 'in_progress' | 'resolved' | 'closed';
            priority: 'low' | 'medium' | 'high' | 'urgent';
            category?: string;
            assigned_to?: string;
            created_at: string;
            updated_at: string;
            resolved_at?: string;
            companies?: { name?: string };
            profiles?: { full_name?: string };
            super_admins?: { full_name?: string };
          }>;
          this.tickets = typedData.map((t) => ({
            id: t.id,
            company_id: t.company_id,
            company_name: t.companies?.name || 'N/A',
            reporter_id: t.reporter_id,
            reporter_name: t.profiles?.full_name || 'Unknown',
            subject: t.subject,
            description: t.description,
            status: t.status,
            priority: t.priority,
            category: t.category,
            assigned_to: t.assigned_to,
            assigned_to_name: t.super_admins?.full_name,
            created_at: t.created_at,
            updated_at: t.updated_at,
            resolved_at: t.resolved_at,
          }));
        }
      } finally {
        this.ticketsLoading = false;
      }
    },

    async fetchTicketDetails(ticketId: string) {
      this.ticketsLoading = true;
      try {
        const { data, error } = await supabase
          .from('support_tickets')
          .select(
            `
            *,
            companies ( name, email ),
            profiles ( full_name, email ),
            super_admins ( full_name )
          `
          )
          .eq('id', ticketId)
          .single();

        if (!error && data) {
          const t = data as {
            id: string;
            company_id?: string;
            reporter_id?: string;
            subject: string;
            description?: string;
            status: 'open' | 'in_progress' | 'resolved' | 'closed';
            priority: 'low' | 'medium' | 'high' | 'urgent';
            category?: string;
            assigned_to?: string;
            created_at: string;
            updated_at: string;
            resolved_at?: string;
            companies?: { name?: string };
            profiles?: { full_name?: string };
            super_admins?: { full_name?: string };
          };
          this.selectedTicket = {
            id: t.id,
            company_id: t.company_id,
            company_name: t.companies?.name || 'N/A',
            reporter_id: t.reporter_id,
            reporter_name: t.profiles?.full_name || 'Unknown',
            subject: t.subject,
            description: t.description,
            status: t.status,
            priority: t.priority,
            category: t.category,
            assigned_to: t.assigned_to,
            assigned_to_name: t.super_admins?.full_name,
            created_at: t.created_at,
            updated_at: t.updated_at,
            resolved_at: t.resolved_at,
          };

          // Fetch messages
          await this.fetchTicketMessages(ticketId);
        }
      } finally {
        this.ticketsLoading = false;
      }
    },

    async fetchTicketMessages(ticketId: string) {
      const { data, error } = await supabase
        .from('support_ticket_messages')
        .select(
          `
          *,
          profiles ( full_name )
        `
        )
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        const typedMessages = data as Array<{
          id: string;
          ticket_id: string;
          sender_id?: string;
          sender_type: 'user' | 'super_admin';
          message: string;
          created_at: string;
          profiles?: { full_name?: string };
        }>;
        this.ticketMessages = typedMessages.map((m) => ({
          id: m.id,
          ticket_id: m.ticket_id,
          sender_id: m.sender_id,
          sender_name:
            m.sender_type === 'super_admin'
              ? 'Support Team'
              : m.profiles?.full_name || 'User',
          sender_type: m.sender_type,
          message: m.message,
          created_at: m.created_at,
        }));
      }
    },

    async createTicketReply(ticketId: string, message: string) {
      const { error } = await supabase.from('support_ticket_messages').insert({
        ticket_id: ticketId,
        sender_id: this.superAdmin?.id || null,
        sender_type: 'super_admin',
        message,
      } as never);

      if (!error) {
        await this.fetchTicketMessages(ticketId);
        return { success: true };
      }
      return { success: false, error: error.message };
    },

    async updateTicketStatus(
      ticketId: string,
      status: 'open' | 'in_progress' | 'resolved' | 'closed'
    ) {
      const updateData: Record<string, unknown> = { status };
      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData as never)
        .eq('id', ticketId);

      if (!error) {
        await this.fetchTicketDetails(ticketId);
        return { success: true };
      }
      return { success: false, error: error.message };
    },

    async assignTicket(ticketId: string, adminId: string) {
      const { error } = await supabase
        .from('support_tickets')
        .update({ assigned_to: adminId } as never)
        .eq('id', ticketId);

      if (!error) {
        await this.fetchTicketDetails(ticketId);
        return { success: true };
      }
      return { success: false, error: error.message };
    },

    // ==========================================
    // PLATFORM SETTINGS
    // ==========================================
    async fetchPlatformSettings() {
      this.settingsLoading = true;
      try {
        const { data, error } = await supabase
          .from('platform_settings')
          .select('*')
          .order('category')
          .order('key');

        if (!error && data) {
          const settings: Record<string, unknown> = {};
          const typedSettings = data as Array<{ key: string; value: unknown }>;
          typedSettings.forEach((s) => {
            settings[s.key] = s.value;
          });
          this.platformSettings = settings;
        }
      } finally {
        this.settingsLoading = false;
      }
    },

    async updatePlatformSetting(key: string, value: unknown) {
      const { error } = await supabase
        .from('platform_settings')
        .update({ value } as never)
        .eq('key', key);

      if (!error) {
        this.platformSettings[key] = value;
        return { success: true };
      }
      return { success: false, error: error.message };
    },

    async updateMultipleSettings(settings: Record<string, unknown>) {
      let success = true;
      for (const [key, value] of Object.entries(settings)) {
        const result = await this.updatePlatformSetting(key, value);
        if (!result.success) {
          success = false;
        }
      }
      return { success };
    },
  },
});
