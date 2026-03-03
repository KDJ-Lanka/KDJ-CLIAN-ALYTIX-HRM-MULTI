<template>
  <q-page class="users-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Platform Users</h1>
        <p class="page-subtitle">Manage all users across companies</p>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="filters-section">
      <q-card flat class="filters-card">
        <q-card-section class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchQuery"
              dense
              outlined
              placeholder="Search by name or email..."
              clearable
              @update:model-value="debouncedSearch"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filterCompany"
              :options="companyOptions"
              dense
              outlined
              clearable
              label="Filter by Company"
              emit-value
              map-options
              @update:model-value="fetchUsers"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filterStatus"
              :options="statusOptions"
              dense
              outlined
              clearable
              label="Filter by Status"
              @update:model-value="fetchUsers"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-btn
              flat
              label="Reset"
              icon="refresh"
              class="full-width"
              @click="resetFilters"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Users Table -->
    <q-card flat class="table-card">
      <q-table
        :rows="superAdminStore.users"
        :columns="columns"
        :loading="superAdminStore.usersLoading"
        :pagination="pagination"
        row-key="id"
        flat
        @request="onRequest"
      >
        <template #body-cell-name="props">
          <q-td :props="props">
            <div class="user-cell">
              <q-avatar size="36px" color="grey-4" text-color="grey-8">
                {{ getInitials(props.row.full_name || props.row.email) }}
              </q-avatar>
              <div class="user-info">
                <span class="user-name">{{ props.row.full_name || 'No Name' }}</span>
                <span class="user-email">{{ props.row.email }}</span>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-company="props">
          <q-td :props="props">
            <q-chip
              dense
              flat
              :color="props.row.company_name !== 'N/A' ? 'grey-4' : 'red-1'"
              :text-color="props.row.company_name !== 'N/A' ? 'grey-9' : 'red-8'"
            >
              {{ props.row.company_name }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge
              :color="getStatusColor(props.row.status)"
              :label="props.row.status || 'active'"
              class="status-badge"
            />
          </q-td>
        </template>

        <template #body-cell-created="props">
          <q-td :props="props">
            {{ formatDate(props.row.created_at) }}
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat dense round icon="visibility" size="sm" @click="viewUser(props.row)">
              <q-tooltip>View Details</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="no-data">
            <q-icon name="people_outline" size="48px" color="grey-4" />
            <p>No users found</p>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- User Details Dialog -->
    <q-dialog v-model="userDialog.show">
      <q-card class="user-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">User Details</div>
          <q-btn flat dense round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section v-if="userDialog.user" class="q-pa-md">
          <div class="user-profile-header">
            <q-avatar size="64px" color="grey-4" text-color="grey-8">
              {{ getInitials(userDialog.user.full_name || userDialog.user.email) }}
            </q-avatar>
            <div class="user-profile-info">
              <div class="text-h6">{{ userDialog.user.full_name || 'No Name' }}</div>
              <div class="text-body2 text-grey-7">{{ userDialog.user.email }}</div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Company</span>
              <span class="detail-value">{{ userDialog.user.company_name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status</span>
              <q-badge :color="getStatusColor(userDialog.user.status)">
                {{ userDialog.user.status || 'active' }}
              </q-badge>
            </div>
            <div class="detail-item">
              <span class="detail-label">Joined</span>
              <span class="detail-value">{{ formatDate(userDialog.user.created_at) }}</span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useSuperAdminStore, type PlatformUser } from 'src/stores/superAdmin';

const superAdminStore = useSuperAdminStore();

// Filters
const searchQuery = ref('');
const filterCompany = ref<string | null>(null);
const filterStatus = ref<string | null>(null);

// Debounce timer
let searchTimeout: ReturnType<typeof setTimeout>;

const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    void fetchUsers();
  }, 300);
};

// Options
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Pending', value: 'pending' },
];

const companyOptions = computed(() => {
  const companies = superAdminStore.companies.map((c) => ({
    label: c.name,
    value: c.id,
  }));
  return companies;
});

// Pagination
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
});

// Table columns
const columns = [
  {
    name: 'name',
    label: 'User',
    field: 'full_name',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'company',
    label: 'Company',
    field: 'company_name',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'created',
    label: 'Joined',
    field: 'created_at',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    align: 'right' as const,
  },
];

// User dialog
const userDialog = ref<{ show: boolean; user: PlatformUser | null }>({
  show: false,
  user: null,
});

// Methods
const fetchUsers = async () => {
  const filters: { search?: string; company_id?: string; status?: string } = {};
  if (searchQuery.value) filters.search = searchQuery.value;
  if (filterCompany.value) filters.company_id = filterCompany.value;
  if (filterStatus.value) filters.status = filterStatus.value;

  await superAdminStore.fetchUsers(filters, {
    page: pagination.value.page,
    rowsPerPage: pagination.value.rowsPerPage,
  });
  pagination.value.rowsNumber = superAdminStore.usersPagination.rowsNumber;
};

const onRequest = async (props: { pagination: { page: number; rowsPerPage: number; sortBy: string; descending: boolean } }) => {
  pagination.value.page = props.pagination.page;
  pagination.value.rowsPerPage = props.pagination.rowsPerPage;
  pagination.value.sortBy = props.pagination.sortBy;
  pagination.value.descending = props.pagination.descending;
  await fetchUsers();
};

const resetFilters = () => {
  searchQuery.value = '';
  filterCompany.value = null;
  filterStatus.value = null;
  pagination.value.page = 1;
  void fetchUsers();
};

const viewUser = (user: PlatformUser) => {
  userDialog.value = { show: true, user };
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getStatusColor = (status?: string): string => {
  const colors: Record<string, string> = {
    active: 'positive',
    inactive: 'grey',
    pending: 'warning',
    suspended: 'negative',
  };
  return colors[status || 'active'] || 'grey';
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Lifecycle
onMounted(() => {
  void superAdminStore.fetchCompanies();
  void fetchUsers();
});
</script>

<style lang="scss" scoped>
.users-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #000000;
}

.page-subtitle {
  color: #737373;
  margin: 4px 0 0 0;
}

.filters-section {
  margin-bottom: 24px;
}

.filters-card {
  border: 1px solid #e5e5e5;
  border-radius: 12px;
}

.table-card {
  border: 1px solid #e5e5e5;
  border-radius: 12px;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: #000000;
}

.user-email {
  font-size: 12px;
  color: #737373;
}

.status-badge {
  text-transform: capitalize;
}

.no-data {
  padding: 48px;
  text-align: center;
  color: #737373;
}

.user-dialog {
  min-width: 400px;
  max-width: 500px;
  border-radius: 16px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-profile-info {
  display: flex;
  flex-direction: column;
}

.detail-grid {
  display: grid;
  gap: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: #737373;
  font-size: 14px;
}

.detail-value {
  font-weight: 500;
  color: #000000;
}
</style>
