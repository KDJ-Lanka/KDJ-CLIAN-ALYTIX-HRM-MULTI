import { defineStore } from 'pinia';
import { supabase } from 'src/boot/supabase';
import type { Profile } from 'src/types/database';
import type { LoginCredentials, RegisterData, AuthState, Employee } from 'src/types/auth';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    session: null,
    profile: null,
    company: null,
    companyAdmin: null,
    employee: null,
    loading: false,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user && !!state.session,
    userEmail: (state) => state.user?.email ?? null,
    userName: (state) => state.profile?.full_name ?? state.user?.email ?? 'User',
    userInitials: (state) => {
      if (state.profile?.first_name) {
        const first = state.profile.first_name.charAt(0).toUpperCase();
        const last = state.profile.last_name?.charAt(0).toUpperCase() ?? '';
        return `${first}${last}`;
      }
      return state.user?.email?.charAt(0).toUpperCase() ?? 'U';
    },
    companyName: (state) => state.company?.name ?? '',
    isAdmin: (state) => !!state.companyAdmin,
    userRole: (state) => state.companyAdmin?.role ?? null,
    employeeId: (state) => state.employee?.id ?? null,
  },

  actions: {
    async initialize() {
      if (this.initialized) return;

      this.loading = true;

      try {
        // Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          this.session = session;
          this.user = session.user;
          await this.fetchProfile();
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
          this.session = session;
          this.user = session?.user ?? null;

          if (event === 'SIGNED_IN' && session) {
            await this.fetchProfile();
          } else if (event === 'SIGNED_OUT') {
            this.profile = null;
            this.company = null;
            this.companyAdmin = null;
            this.employee = null;
          }
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        this.loading = false;
        this.initialized = true;
      }
    },

    async fetchProfile() {
      if (!this.user) return;

      try {
        // Check if this user is a super admin (no profile needed)
        const { data: superAdminCheck } = await supabase
          .from('super_admins')
          .select('id')
          .eq('user_id', this.user.id)
          .maybeSingle();

        // If user is a super admin, skip profile fetch
        if (superAdminCheck) {
          return;
        }

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', this.user.id)
          .single();

        if (profileError) throw profileError;
        this.profile = profile as Profile;

        // Fetch company
        const profileData = profile as { company_id?: string; id?: string } | null;
        if (profileData?.company_id) {
          const companyResult: any = await supabase
            .from('companies')
            .select('*')
            .eq('id', profileData.company_id)
            .single();

          if (!companyResult.error && companyResult.data) {
            // Use Object.assign to avoid type instantiation issues
            Object.assign(this, { company: companyResult.data });
          }

          // Fetch employee record using the profile's id
          if (this.profile?.id) {
            const employeeResult: any = await supabase
              .from('employees')
              .select('*')
              .eq('profile_id', this.profile.id)
              .maybeSingle();

            if (!employeeResult.error && employeeResult.data) {
              this.employee = employeeResult.data as Employee;
            }
          }

          // Check if user is company admin
          const adminResult: any = await supabase
            .from('company_admins')
            .select('*')
            .eq('user_id', this.user.id)
            .eq('company_id', profileData.company_id)
            .maybeSingle();

          if (!adminResult.error && adminResult.data) {
            // Use Object.assign to avoid type instantiation issues
            Object.assign(this, { companyAdmin: adminResult.data });
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    },

    async login(credentials: LoginCredentials) {
      this.loading = true;

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) throw error;

        this.session = data.session;
        this.user = data.user;
        await this.fetchProfile();

        return { success: true };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Login failed';
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },

    async register(data: RegisterData) {
      this.loading = true;

      try {
        // 1. Create auth user
        const { data: authData, error: authError } =
          await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              data: {
                first_name: data.firstName,
                last_name: data.lastName,
              },
            },
          });

        if (authError) throw authError;
        if (!authData.user) throw new Error('User creation failed');

        const userId = authData.user.id;

        // 2. Create company
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: data.companyName,
            slug: data.companySlug,
            email: data.companyEmail,
            phone: data.companyPhone,
            address: data.companyAddress,
            currency_code: 'LKR',
            timezone: 'Asia/Colombo',
          } as never)
          .select()
          .single();

        if (companyError) throw companyError;

        const companyId = (companyData as { id: string }).id;

        // 3. Create profile
        const { error: profileError } = await supabase.from('profiles').insert({
          user_id: userId,
          company_id: companyId,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
        } as never);

        if (profileError) throw profileError;

        // 4. Get the created profile to get its ID
        const { data: profileData, error: profileFetchError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', userId)
          .single();

        if (profileFetchError) throw profileFetchError;
        const profileId = (profileData as { id: string }).id;

        // 5. Create employee record for the admin
        const { error: employeeError } = await supabase
          .from('employees')
          .insert({
            profile_id: profileId,
            company_id: companyId,
            employee_code: `EMP-001`,
            date_of_joining: new Date().toISOString().split('T')[0],
            employment_type: 'full_time',
            status: 'active',
          } as never);

        if (employeeError) throw employeeError;

        // 6. Create company admin
        const { error: adminError } = await supabase
          .from('company_admins')
          .insert({
            company_id: companyId,
            user_id: userId,
            role: 'owner',
          } as never);

        if (adminError) throw adminError;

        // 7. Set session and fetch profile
        this.session = authData.session;
        this.user = authData.user;
        await this.fetchProfile();

        return { success: true };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Registration failed';
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      this.loading = true;

      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        this.user = null;
        this.session = null;
        this.profile = null;
        this.company = null;
        this.companyAdmin = null;
        this.employee = null;

        return { success: true };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Logout failed';
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },

    async resetPassword(email: string) {
      this.loading = true;

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) throw error;

        return { success: true };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Password reset failed';
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },

    async updatePassword(newPassword: string) {
      this.loading = true;

      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) throw error;

        return { success: true };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Password update failed';
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(updates: Partial<Profile>) {
      if (!this.profile) return { success: false, error: 'No profile found' };

      this.loading = true;

      try {
        const { error } = await supabase
          .from('profiles')
          .update(updates as never)
          .eq('id', this.profile.id);

        if (error) throw error;

        // Update local state
        this.profile = { ...this.profile, ...updates };

        return { success: true };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Profile update failed';
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },
  },
});
