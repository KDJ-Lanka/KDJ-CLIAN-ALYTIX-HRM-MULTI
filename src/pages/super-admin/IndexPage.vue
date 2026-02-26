<template>
  <q-page class="dashboard-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Platform Dashboard</h1>
        <p class="page-subtitle">Overview of all companies and platform metrics</p>
      </div>
      <q-btn
        label="Refresh Stats"
        icon="refresh"
        flat
        no-caps
        @click="refreshStats"
        :loading="loading"
      />
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <q-card class="stat-card">
        <q-card-section>
          <div class="stat-icon companies">
            <q-icon name="business" size="24px" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats?.totalCompanies || 0 }}</div>
            <div class="stat-label">Total Companies</div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="stat-card">
        <q-card-section>
          <div class="stat-icon active">
            <q-icon name="check_circle" size="24px" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats?.activeCompanies || 0 }}</div>
            <div class="stat-label">Active Companies</div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="stat-card">
        <q-card-section>
          <div class="stat-icon employees">
            <q-icon name="people" size="24px" />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats?.totalEmployees || 0 }}</div>
            <div class="stat-label">Total Employees</div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="stat-card">
        <q-card-section>
          <div class="stat-icon revenue">
            <q-icon name="attach_money" size="24px" />
          </div>
          <div class="stat-content">
            <div class="stat-value">${{ formatNumber(stats?.totalRevenue || 0) }}</div>
            <div class="stat-label">Monthly Revenue</div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Recent Companies -->
    <q-card class="table-card">
      <q-card-section class="card-header">
        <div class="text-h6">Recent Companies</div>
        <q-btn flat label="View All" to="/super-admin/companies" no-caps />
      </q-card-section>
      <q-separator />
      <q-card-section class="q-pa-none">
        <q-table
          :rows="recentCompanies"
          :columns="columns"
          row-key="id"
          flat
          :loading="loading"
          hide-pagination
          :rows-per-page-options="[0]"
        >
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.is_active ? 'positive' : 'negative'"
                :label="props.row.is_active ? 'Active' : 'Inactive'"
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
              <q-btn
                flat
                dense
                round
                icon="visibility"
                :to="`/super-admin/companies/${props.row.id}`"
              >
                <q-tooltip>View Details</q-tooltip>
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

    <!-- Quick Actions -->
    <div class="quick-actions">
      <q-card class="action-card" clickable @click="$router.push('/super-admin/companies')">
        <q-card-section class="text-center">
          <q-icon name="add_business" size="32px" color="black" />
          <div class="action-title">Manage Companies</div>
          <div class="action-desc">Add, edit, or suspend companies</div>
        </q-card-section>
      </q-card>

      <q-card class="action-card" clickable @click="$router.push('/super-admin/users')">
        <q-card-section class="text-center">
          <q-icon name="admin_panel_settings" size="32px" color="black" />
          <div class="action-title">User Management</div>
          <div class="action-desc">View and manage all users</div>
        </q-card-section>
      </q-card>

      <q-card class="action-card" clickable @click="$router.push('/super-admin/analytics')">
        <q-card-section class="text-center">
          <q-icon name="analytics" size="32px" color="black" />
          <div class="action-title">Analytics</div>
          <div class="action-desc">Platform usage insights</div>
        </q-card-section>
      </q-card>

      <q-card class="action-card" clickable @click="$router.push('/super-admin/support')">
        <q-card-section class="text-center">
          <q-icon name="support_agent" size="32px" color="black" />
          <div class="action-title">Support</div>
          <div class="action-desc">Handle support tickets</div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSuperAdminStore } from 'src/stores/superAdmin';

const superAdminStore = useSuperAdminStore();
const loading = ref(false);

const stats = computed(() => superAdminStore.stats);
const recentCompanies = computed(() => superAdminStore.companies.slice(0, 5));

const columns = [
  { name: 'name', label: 'Company Name', field: 'name', align: 'left' as const },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const },
  { name: 'employees', label: 'Employees', field: 'employee_count', align: 'center' as const },
  { name: 'status', label: 'Status', field: 'is_active', align: 'center' as const },
  { name: 'created_at', label: 'Created', field: 'created_at', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const refreshStats = async () => {
  loading.value = true;
  await Promise.all([superAdminStore.fetchStats(), superAdminStore.fetchCompanies()]);
  loading.value = false;
};

onMounted(() => {
  void refreshStats();
});
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: var(--spacing-5);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-5);
}

.stat-card {
  border-radius: var(--radius-lg);

  .q-card__section {
    display: flex;
    align-items: center;
    gap: var(--spacing-4);
  }
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;

  &.companies {
    background: var(--color-gray-100);
    color: var(--color-black);
  }

  &.active {
    background: #dcfce7;
    color: #16a34a;
  }

  &.employees {
    background: #dbeafe;
    color: #2563eb;
  }

  &.revenue {
    background: #fef3c7;
    color: #d97706;
  }
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
}

.stat-label {
  font-size: 13px;
  color: var(--color-gray-500);
}

.table-card {
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-5);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-6);
  color: var(--color-gray-400);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
}

.action-card {
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
}

.action-title {
  font-weight: 600;
  margin: var(--spacing-2) 0 var(--spacing-1);
}

.action-desc {
  font-size: 13px;
  color: var(--color-gray-500);
}
</style>
