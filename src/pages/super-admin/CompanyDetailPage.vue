<template>
  <q-page class="company-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <q-spinner size="48px" color="black" />
    </div>

    <template v-else-if="company">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <q-btn flat dense round icon="arrow_back" @click="goBack" class="back-btn" />
          <div class="header-info">
            <h1 class="page-title">{{ company.name }}</h1>
            <span class="company-email">{{ company.email }}</span>
          </div>
        </div>
        <div class="header-actions">
          <q-badge
            :color="company.is_active ? 'positive' : 'grey'"
            :label="company.is_active ? 'Active' : 'Inactive'"
            class="status-badge"
          />
          <q-btn
            flat
            :label="company.is_active ? 'Deactivate' : 'Activate'"
            :icon="company.is_active ? 'block' : 'check_circle'"
            :class="company.is_active ? 'deactivate-btn' : 'activate-btn'"
            @click="toggleStatus"
          />
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <q-card flat class="stat-card">
          <q-card-section>
            <div class="stat-icon employees">
              <q-icon name="people" size="24px" />
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ company.employee_count || 0 }}</span>
              <span class="stat-label">Employees</span>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat class="stat-card">
          <q-card-section>
            <div class="stat-icon plan">
              <q-icon name="workspace_premium" size="24px" />
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ capitalize(company.subscription_plan || 'free') }}</span>
              <span class="stat-label">Plan</span>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat class="stat-card">
          <q-card-section>
            <div class="stat-icon status">
              <q-icon name="verified" size="24px" />
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ capitalize(company.subscription_status || 'active') }}</span>
              <span class="stat-label">Subscription</span>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat class="stat-card">
          <q-card-section>
            <div class="stat-icon date">
              <q-icon name="calendar_today" size="24px" />
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ formatDate(company.created_at) }}</span>
              <span class="stat-label">Created</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Company Info -->
        <q-card flat class="info-card">
          <q-card-section class="card-header">
            <span class="card-title">Company Information</span>
          </q-card-section>
          <q-separator />
          <q-card-section class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Name</span>
                <span class="info-value">{{ company.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">{{ company.email }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone</span>
                <span class="info-value">{{ company.phone || 'Not provided' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Website</span>
                <span class="info-value">
                  <a v-if="company.website" :href="company.website" target="_blank">
                    {{ company.website }}
                  </a>
                  <span v-else>Not provided</span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Slug</span>
                <span class="info-value">{{ company.slug || 'N/A' }}</span>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Subscription Info -->
        <q-card flat class="info-card">
          <q-card-section class="card-header">
            <span class="card-title">Subscription</span>
          </q-card-section>
          <q-separator />
          <q-card-section class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Plan</span>
                <q-select
                  v-model="selectedPlan"
                  :options="planOptions"
                  dense
                  outlined
                  emit-value
                  map-options
                  @update:model-value="updatePlan"
                />
              </div>
              <div class="info-item">
                <span class="info-label">Status</span>
                <q-badge
                  :color="getSubscriptionColor(company.subscription_status)"
                  :label="capitalize(company.subscription_status || 'active')"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Quick Actions -->
        <q-card flat class="info-card">
          <q-card-section class="card-header">
            <span class="card-title">Quick Actions</span>
          </q-card-section>
          <q-separator />
          <q-card-section class="card-body">
            <q-btn
              flat
              label="View Employees"
              icon="people"
              class="action-btn full-width"
              @click="viewEmployees"
            />
            <q-btn
              flat
              label="Impersonate Company"
              icon="admin_panel_settings"
              class="action-btn full-width"
              @click="impersonateCompany"
            />
            <q-btn
              flat
              label="Send Support Message"
              icon="email"
              class="action-btn full-width"
              @click="sendSupportMessage"
            />
          </q-card-section>
        </q-card>
      </div>
    </template>

    <!-- Not Found -->
    <div v-else class="not-found">
      <q-icon name="business" size="64px" color="grey-4" />
      <h2>Company not found</h2>
      <q-btn flat label="Go Back" icon="arrow_back" @click="goBack" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useSuperAdminStore, type Company } from 'src/stores/superAdmin';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const superAdminStore = useSuperAdminStore();

const loading = ref(true);
const company = computed<Company | null>(() => {
  const companyId = route.params.id as string;
  return superAdminStore.companies.find((c) => c.id === companyId) || null;
});

const selectedPlan = ref<string>('');

const planOptions = [
  { label: 'Free', value: 'free' },
  { label: 'Starter', value: 'starter' },
  { label: 'Professional', value: 'professional' },
  { label: 'Enterprise', value: 'enterprise' },
];

const loadCompany = () => {
  void superAdminStore.fetchCompanies().then(() => {
    if (company.value) {
      selectedPlan.value = company.value.subscription_plan || 'free';
    }
    loading.value = false;
  });
};

const goBack = () => {
  void router.push('/super-admin/companies');
};

const toggleStatus = () => {
  if (!company.value) return;
  const newStatus = !company.value.is_active;
  void superAdminStore.toggleCompanyStatus(company.value.id, newStatus).then((result) => {
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: `Company ${newStatus ? 'activated' : 'deactivated'}`,
      });
    } else {
      $q.notify({ type: 'negative', message: 'Failed to update company status' });
    }
  });
};

const updatePlan = () => {
  if (!company.value) return;
  // This would typically call an API to update the subscription plan
  $q.notify({ type: 'info', message: 'Plan update would be implemented with billing integration' });
};

const viewEmployees = () => {
  // Navigate to users page filtered by company
  void router.push({
    path: '/super-admin/users',
    query: { company_id: String(route.params.id) },
  });
};

const impersonateCompany = () => {
  $q.dialog({
    title: 'Impersonate Company',
    message: 'This feature would allow you to log in as this company admin for debugging purposes.',
    cancel: true,
  });
};

const sendSupportMessage = () => {
  $q.dialog({
    title: 'Send Support Message',
    message: 'This would open a dialog to send a support message to the company.',
    cancel: true,
  });
};

const getSubscriptionColor = (status?: string): string => {
  const colors: Record<string, string> = {
    active: 'positive',
    past_due: 'warning',
    cancelled: 'negative',
    inactive: 'grey',
  };
  return colors[status || 'active'] || 'grey';
};

const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

onMounted(() => {
  void loadCompany();
});
</script>

<style lang="scss" scoped>
.company-detail-page {
  padding: 24px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.back-btn {
  margin-top: 4px;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #000000;
}

.company-email {
  color: #737373;
  margin-top: 4px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-badge {
  font-size: 12px;
  padding: 6px 12px;
}

.deactivate-btn {
  color: #ef4444;
}

.activate-btn {
  color: #22c55e;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  border: 1px solid #e5e5e5;
  border-radius: 12px;

  .q-card__section {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.employees {
    background: #e3f2fd;
    color: #1976d2;
  }
  &.plan {
    background: #fff3e0;
    color: #f57c00;
  }
  &.status {
    background: #e8f5e9;
    color: #2e7d32;
  }
  &.date {
    background: #fce4ec;
    color: #c2185b;
  }
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
}

.stat-label {
  font-size: 12px;
  color: #737373;
  text-transform: uppercase;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.info-card {
  border: 1px solid #e5e5e5;
  border-radius: 12px;
}

.card-header {
  padding: 16px 20px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-body {
  padding: 16px 20px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: #737373;
  font-size: 14px;
}

.info-value {
  font-weight: 500;
  color: #000000;

  a {
    color: #1976d2;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.action-btn {
  justify-content: flex-start;
  margin-bottom: 8px;
  color: #404040;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    background: #f5f5f5;
  }
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;

  h2 {
    margin: 16px 0;
    color: #737373;
  }
}
</style>
