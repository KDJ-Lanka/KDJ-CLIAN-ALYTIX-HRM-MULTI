<template>
  <q-page class="companies-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Companies</h1>
        <p class="page-subtitle">Manage all registered companies on the platform</p>
      </div>
    </div>

    <!-- Filters -->
    <q-card class="filters-card">
      <q-card-section>
        <div class="filters-row">
          <q-input
            v-model="search"
            label="Search companies..."
            outlined
            dense
            clearable
            class="search-input"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-select
            v-model="statusFilter"
            :options="statusOptions"
            label="Status"
            outlined
            dense
            clearable
            emit-value
            map-options
            class="filter-select"
          />
          <q-select
            v-model="planFilter"
            :options="planOptions"
            label="Plan"
            outlined
            dense
            clearable
            emit-value
            map-options
            class="filter-select"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Companies Table -->
    <q-card class="table-card">
      <q-card-section class="q-pa-none">
        <q-table
          :rows="filteredCompanies"
          :columns="columns"
          row-key="id"
          flat
          :loading="loading"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:body-cell-company="props">
            <q-td :props="props">
              <div class="company-cell">
                <q-avatar size="36px" color="gray-3" text-color="gray-7">
                  {{ getInitials(props.row.name) }}
                </q-avatar>
                <div class="company-info">
                  <div class="company-name">{{ props.row.name }}</div>
                  <div class="company-email">{{ props.row.email }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-employees="props">
            <q-td :props="props" class="text-center">
              <q-badge color="gray-2" text-color="black">
                {{ props.row.employee_count || 0 }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-plan="props">
            <q-td :props="props">
              <q-badge
                :color="getPlanColor(props.row.subscription_plan)"
                :label="props.row.subscription_plan || 'Free'"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.is_active ? 'positive' : 'negative'"
                :label="props.row.is_active ? 'Active' : 'Suspended'"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-created_at="props">
            <q-td :props="props">
              {{ formatDate(props.row.created_at) }}
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense round icon="more_vert">
                <q-menu>
                  <q-list style="min-width: 160px">
                    <q-item clickable v-close-popup @click="viewCompany(props.row)">
                      <q-item-section avatar>
                        <q-icon name="visibility" />
                      </q-item-section>
                      <q-item-section>View Details</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="loginAsCompany(props.row)">
                      <q-item-section avatar>
                        <q-icon name="login" />
                      </q-item-section>
                      <q-item-section>Login as Company</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item
                      v-if="props.row.is_active"
                      clickable
                      v-close-popup
                      @click="toggleStatus(props.row, false)"
                      class="text-warning"
                    >
                      <q-item-section avatar>
                        <q-icon name="pause" />
                      </q-item-section>
                      <q-item-section>Suspend</q-item-section>
                    </q-item>
                    <q-item
                      v-else
                      clickable
                      v-close-popup
                      @click="toggleStatus(props.row, true)"
                      class="text-positive"
                    >
                      <q-item-section avatar>
                        <q-icon name="play_arrow" />
                      </q-item-section>
                      <q-item-section>Activate</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      @click="deleteCompany(props.row)"
                      class="text-negative"
                    >
                      <q-item-section avatar>
                        <q-icon name="delete" />
                      </q-item-section>
                      <q-item-section>Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="empty-state">
              <q-icon name="business" size="48px" color="gray-4" />
              <p>No companies found</p>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Company Detail Dialog -->
    <q-dialog v-model="detailDialog">
      <q-card class="detail-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">{{ selectedCompany?.name }}</div>
          <q-btn flat dense round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section v-if="selectedCompany">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Email</span>
              <span class="detail-value">{{ selectedCompany.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Phone</span>
              <span class="detail-value">{{ selectedCompany.phone || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Website</span>
              <span class="detail-value">{{ selectedCompany.website || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Employees</span>
              <span class="detail-value">{{ selectedCompany.employee_count || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Plan</span>
              <span class="detail-value">{{ selectedCompany.subscription_plan || 'Free' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status</span>
              <q-badge
                :color="selectedCompany.is_active ? 'positive' : 'negative'"
                :label="selectedCompany.is_active ? 'Active' : 'Suspended'"
              />
            </div>
            <div class="detail-item full-width">
              <span class="detail-label">Address</span>
              <span class="detail-value">{{ (selectedCompany as Record<string, unknown>).address || '-' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Created</span>
              <span class="detail-value">{{ formatDate(selectedCompany.created_at) }}</span>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useSuperAdminStore } from 'src/stores/superAdmin';
import { supabase } from 'src/boot/supabase';
import type { Company } from 'src/stores/superAdmin';

const $q = useQuasar();
const router = useRouter();
const superAdminStore = useSuperAdminStore();

const loading = ref(false);
const search = ref('');
const statusFilter = ref<boolean | null>(null);
const planFilter = ref<string | null>(null);
const detailDialog = ref(false);
const selectedCompany = ref<Company | null>(null);

const statusOptions = [
  { label: 'Active', value: true },
  { label: 'Suspended', value: false },
];

const planOptions = [
  { label: 'Free', value: 'free' },
  { label: 'Starter', value: 'starter' },
  { label: 'Professional', value: 'professional' },
  { label: 'Enterprise', value: 'enterprise' },
];

const columns = [
  { name: 'company', label: 'Company', field: 'name', align: 'left' as const },
  { name: 'employees', label: 'Employees', field: 'employee_count', align: 'center' as const },
  { name: 'plan', label: 'Plan', field: 'subscription_plan', align: 'left' as const },
  { name: 'status', label: 'Status', field: 'is_active', align: 'left' as const },
  { name: 'created_at', label: 'Created', field: 'created_at', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

const filteredCompanies = computed(() => {
  let result = superAdminStore.companies;

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower)
    );
  }

  if (statusFilter.value !== null) {
    result = result.filter((c) => c.is_active === statusFilter.value);
  }

  if (planFilter.value) {
    result = result.filter((c) => c.subscription_plan === planFilter.value);
  }

  return result;
});

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const getPlanColor = (plan: string | undefined) => {
  const colors: Record<string, string> = {
    free: 'gray',
    starter: 'blue',
    professional: 'purple',
    enterprise: 'orange',
  };
  return colors[plan || 'free'] || 'gray';
};

const viewCompany = (company: Company) => {
  selectedCompany.value = company;
  detailDialog.value = true;
};

const loginAsCompany = (company: Company) => {
  $q.dialog({
    title: 'Login as Company',
    message: `You will be logged out of super admin and logged in as an admin of "${company.name}". Continue?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      // First, get a company admin user for this company
      const { data: adminUser, error: adminError } = await supabase
        .from('company_admins')
        .select('user_id, users!inner(email)')
        .eq('company_id', company.id)
        .limit(1)
        .single();

      if (adminError || !adminUser) {
        // Try to find any user from this company
        const { data: anyUser, error: anyUserError } = await supabase
          .from('profiles')
          .select('user_id, email')
          .eq('company_id', company.id)
          .limit(1)
          .single();

        if (anyUserError || !anyUser) {
          $q.notify({
            type: 'warning',
            message: 'No users found for this company. Cannot login.',
          });
          return;
        }

        $q.notify({
          type: 'warning',
          message: 'Company has no admin users. You can reset their password to login.',
        });
        return;
      }

      // Store super admin session for return
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        sessionStorage.setItem('superAdminReturnToken', session.access_token || '');
        sessionStorage.setItem('superAdminReturnRefresh', session.refresh_token || '');
      }

      // Logout from super admin
      await superAdminStore.logout();

      // Set a flag to indicate we're logging in as company
      localStorage.setItem('loginAsCompany', company.id);

      // Redirect to login with pre-filled email
      void router.push({
        path: '/auth/login',
        query: { email: ((adminUser as Record<string, unknown>).users as Record<string, unknown> | undefined)?.email as string || '' },
      });

      $q.notify({
        type: 'info',
        message: 'Please enter the password for this company account.',
      });
    } catch {
      $q.notify({
        type: 'negative',
        message: 'Failed to login as company',
      });
    }
  });
};

const toggleStatus = (company: Company, isActive: boolean) => {
  const action = isActive ? 'Activate' : 'Suspend';
  $q.dialog({
    title: `${action} Company`,
    message: `Are you sure you want to ${action.toLowerCase()} "${company.name}"?`,
    cancel: true,
  }).onOk(() => {
    void (async () => {
      const result = await superAdminStore.toggleCompanyStatus(company.id, isActive);
      if (result.success) {
        $q.notify({ type: 'positive', message: `Company ${action.toLowerCase()}d` });
      } else {
        $q.notify({ type: 'negative', message: result.error || 'Failed to update' });
      }
    })();
  });
};

const deleteCompany = (company: Company) => {
  $q.dialog({
    title: 'Delete Company',
    message: `This will permanently delete "${company.name}" and all associated data. This cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      const result = await superAdminStore.deleteCompany(company.id);
      if (result.success) {
        $q.notify({ type: 'positive', message: 'Company deleted' });
      } else {
        $q.notify({ type: 'negative', message: result.error || 'Failed to delete' });
      }
    })();
  });
};

const fetchCompanies = async () => {
  loading.value = true;
  await superAdminStore.fetchCompanies();
  loading.value = false;
};

watch([search, statusFilter, planFilter], () => {
  // Filters are reactive, table updates automatically
});

onMounted(fetchCompanies);
</script>

<style lang="scss" scoped>
.companies-page {
  padding: var(--spacing-5);
}

.page-header {
  margin-bottom: var(--spacing-5);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 var(--spacing-1);
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-gray-500);
  margin: 0;
}

.filters-card {
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-4);
}

.filters-row {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.filter-select {
  width: 160px;
}

.table-card {
  border-radius: var(--radius-lg);
}

.company-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.company-name {
  font-weight: 500;
}

.company-email {
  font-size: 12px;
  color: var(--color-gray-500);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-6);
  color: var(--color-gray-400);
}

.detail-dialog {
  min-width: 500px;
  border-radius: var(--radius-xl);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-gray-100);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);

  &.full-width {
    grid-column: span 2;
  }
}

.detail-label {
  font-size: 12px;
  color: var(--color-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  color: var(--color-black);
}
</style>
