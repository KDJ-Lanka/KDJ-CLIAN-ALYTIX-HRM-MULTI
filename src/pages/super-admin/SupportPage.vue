<template>
  <q-page class="support-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Support Tickets</h1>
        <p class="page-subtitle">Manage customer support requests</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <q-card flat class="filters-card">
        <q-card-section class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-3">
            <q-select
              v-model="filterStatus"
              :options="statusOptions"
              dense
              outlined
              clearable
              label="Status"
              emit-value
              map-options
              @update:model-value="fetchTickets"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filterPriority"
              :options="priorityOptions"
              dense
              outlined
              clearable
              label="Priority"
              emit-value
              map-options
              @update:model-value="fetchTickets"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filterCompany"
              :options="companyOptions"
              dense
              outlined
              clearable
              label="Company"
              emit-value
              map-options
              @update:model-value="fetchTickets"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-btn
              flat
              label="Reset Filters"
              icon="refresh"
              class="full-width"
              @click="resetFilters"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-value">{{ ticketStats.open }}</span>
        <span class="stat-label">Open</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ ticketStats.in_progress }}</span>
        <span class="stat-label">In Progress</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ ticketStats.resolved }}</span>
        <span class="stat-label">Resolved</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ ticketStats.urgent }}</span>
        <span class="stat-label">Urgent</span>
      </div>
    </div>

    <!-- Tickets Table -->
    <q-card flat class="table-card">
      <q-table
        :rows="superAdminStore.tickets"
        :columns="columns"
        :loading="superAdminStore.ticketsLoading"
        row-key="id"
        flat
        @row-click="viewTicket"
      >
        <template #body-cell-id="props">
          <q-td :props="props">
            <span class="ticket-id">#{{ props.row.id.slice(0, 8).toUpperCase() }}</span>
          </q-td>
        </template>

        <template #body-cell-subject="props">
          <q-td :props="props">
            <div class="subject-cell">
              <span class="subject-text">{{ props.row.subject }}</span>
              <span class="subject-company">{{ props.row.company_name }}</span>
            </div>
          </q-td>
        </template>

        <template #body-cell-reporter="props">
          <q-td :props="props">
            {{ props.row.reporter_name }}
          </q-td>
        </template>

        <template #body-cell-status="props">
          <q-td :props="props">
            <q-badge
              :color="getStatusColor(props.row.status)"
              :label="formatStatus(props.row.status)"
              class="status-badge"
            />
          </q-td>
        </template>

        <template #body-cell-priority="props">
          <q-td :props="props">
            <q-badge
              :color="getPriorityColor(props.row.priority)"
              :label="props.row.priority"
              class="priority-badge"
            />
          </q-td>
        </template>

        <template #body-cell-created="props">
          <q-td :props="props">
            {{ formatDate(props.row.created_at) }}
          </q-td>
        </template>

        <template #no-data>
          <div class="no-data">
            <q-icon name="support_agent" size="48px" color="grey-4" />
            <p>No support tickets found</p>
          </div>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSuperAdminStore } from 'src/stores/superAdmin';

const router = useRouter();
const superAdminStore = useSuperAdminStore();

// Filters
const filterStatus = ref<string | null>(null);
const filterPriority = ref<string | null>(null);
const filterCompany = ref<string | null>(null);

// Options
const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

const companyOptions = computed(() => {
  return superAdminStore.companies.map((c) => ({
    label: c.name,
    value: c.id,
  }));
});

// Ticket stats
const ticketStats = computed(() => {
  const tickets = superAdminStore.tickets;
  return {
    open: tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
    urgent: tickets.filter((t) => t.priority === 'urgent').length,
  };
});

// Table columns
const columns = [
  {
    name: 'id',
    label: 'Ticket ID',
    field: 'id',
    align: 'left' as const,
  },
  {
    name: 'subject',
    label: 'Subject',
    field: 'subject',
    align: 'left' as const,
  },
  {
    name: 'reporter',
    label: 'Reporter',
    field: 'reporter_name',
    align: 'left' as const,
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center' as const,
  },
  {
    name: 'priority',
    label: 'Priority',
    field: 'priority',
    align: 'center' as const,
  },
  {
    name: 'created',
    label: 'Created',
    field: 'created_at',
    align: 'left' as const,
  },
];

// Methods
const fetchTickets = async () => {
  const filters: { status?: string; priority?: string; company_id?: string } = {};
  if (filterStatus.value) filters.status = filterStatus.value;
  if (filterPriority.value) filters.priority = filterPriority.value;
  if (filterCompany.value) filters.company_id = filterCompany.value;
  await superAdminStore.fetchTickets(filters);
};

const resetFilters = () => {
  filterStatus.value = null;
  filterPriority.value = null;
  filterCompany.value = null;
  void fetchTickets();
};

const viewTicket = (_evt: Event, row: { id: string }) => {
  void router.push(`/super-admin/support/${row.id}`);
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    open: 'blue',
    in_progress: 'orange',
    resolved: 'positive',
    closed: 'grey',
  };
  return colors[status] || 'grey';
};

const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: 'grey',
    medium: 'blue',
    high: 'orange',
    urgent: 'negative',
  };
  return colors[priority] || 'grey';
};

const formatStatus = (status: string): string => {
  return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

onMounted(() => {
  void superAdminStore.fetchCompanies();
  void fetchTickets();
});
</script>

<style lang="scss" scoped>
.support-page {
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

.stats-grid {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding: 16px 0;
  border-bottom: 1px solid #e5e5e5;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;
  border-right: 1px solid #e5e5e5;

  &:last-child {
    border-right: none;
  }
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
}

.stat-label {
  font-size: 12px;
  color: #737373;
  text-transform: uppercase;
}

.table-card {
  border: 1px solid #e5e5e5;
  border-radius: 12px;
}

.ticket-id {
  font-family: monospace;
  font-weight: 600;
  color: #000000;
}

.subject-cell {
  display: flex;
  flex-direction: column;
}

.subject-text {
  font-weight: 500;
  color: #000000;
}

.subject-company {
  font-size: 12px;
  color: #737373;
}

.status-badge,
.priority-badge {
  text-transform: capitalize;
}

.no-data {
  padding: 48px;
  text-align: center;
  color: #737373;
}
</style>
