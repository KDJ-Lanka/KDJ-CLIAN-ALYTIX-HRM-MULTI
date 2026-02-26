<template>
  <q-page class="employees-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Employees</h1>
        <p class="page-subtitle">Manage your organization's employees</p>
      </div>
      <div class="page-actions">
        <q-btn
          label="Add Employee"
          icon="person_add"
          color="black"
          to="/employees/new"
          no-caps
        />
      </div>
    </div>

    <!-- Filters -->
    <q-card class="filters-card">
      <q-card-section>
        <div class="filters-row">
          <q-input
            v-model="search"
            placeholder="Search employees..."
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
            v-model="filterDepartment"
            :options="departmentOptions"
            label="Department"
            outlined
            dense
            clearable
            emit-value
            map-options
            class="filter-select"
          />

          <q-select
            v-model="filterStatus"
            :options="statusOptions"
            label="Status"
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

    <!-- Employees Table -->
    <q-card class="table-card">
      <q-card-section class="q-pa-none">
        <q-table
          :rows="employees"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          flat
          binary-state-sort
          @request="onRequest"
        >
          <!-- Employee Cell -->
          <template v-slot:body-cell-employee="props">
            <q-td :props="props">
              <div class="employee-cell">
                <q-avatar size="36px" color="gray-3" text-color="gray-7">
                  {{ getInitials(props.row.profile?.full_name) }}
                </q-avatar>
                <div class="employee-info">
                  <div class="employee-name">
                    {{ props.row.profile?.full_name || 'N/A' }}
                  </div>
                  <div class="employee-code">
                    {{ props.row.employee_code }}
                  </div>
                </div>
              </div>
            </q-td>
          </template>

          <!-- Department Cell -->
          <template v-slot:body-cell-department="props">
            <q-td :props="props">
              {{ props.row.department?.name || '-' }}
            </q-td>
          </template>

          <!-- Designation Cell -->
          <template v-slot:body-cell-designation="props">
            <q-td :props="props">
              {{ props.row.designation?.title || '-' }}
            </q-td>
          </template>

          <!-- Status Cell -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="getStatusColor(props.row.status)"
                :label="props.row.status"
                class="status-badge"
              />
            </q-td>
          </template>

          <!-- Joining Date Cell -->
          <template v-slot:body-cell-date_of_joining="props">
            <q-td :props="props">
              {{ formatDate(props.row.date_of_joining) }}
            </q-td>
          </template>

          <!-- Actions Cell -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense round icon="more_vert" class="action-btn">
                <q-menu>
                  <q-list style="min-width: 150px">
                    <q-item
                      clickable
                      v-close-popup
                      :to="`/employees/${props.row.id}`"
                    >
                      <q-item-section avatar>
                        <q-icon name="edit" size="18px" />
                      </q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-close-popup
                      @click="viewEmployee(props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon name="visibility" size="18px" />
                      </q-item-section>
                      <q-item-section>View</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item
                      clickable
                      v-close-popup
                      class="text-negative"
                      @click="confirmDelete(props.row)"
                    >
                      <q-item-section avatar>
                        <q-icon name="delete" size="18px" />
                      </q-item-section>
                      <q-item-section>Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-td>
          </template>

          <!-- No Data -->
          <template v-slot:no-data>
            <div class="empty-state">
              <q-icon name="people" size="64px" color="gray-4" />
              <p class="text-gray-500">No employees found</p>
              <q-btn
                label="Add First Employee"
                color="black"
                to="/employees/new"
                no-caps
                flat
              />
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- View Employee Dialog -->
    <q-dialog v-model="viewDialog">
      <q-card class="view-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">Employee Details</div>
          <q-btn flat dense round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section v-if="selectedEmployee">
          <div class="employee-detail">
            <div class="detail-row">
              <span class="detail-label">Name</span>
              <span class="detail-value">{{
                selectedEmployee.profile?.full_name
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Employee Code</span>
              <span class="detail-value">{{
                selectedEmployee.employee_code
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email</span>
              <span class="detail-value">{{
                selectedEmployee.profile?.email
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Department</span>
              <span class="detail-value">{{
                selectedEmployee.department?.name || '-'
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Designation</span>
              <span class="detail-value">{{
                selectedEmployee.designation?.title || '-'
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Joining Date</span>
              <span class="detail-value">{{
                formatDate(selectedEmployee.date_of_joining)
              }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status</span>
              <q-badge
                :color="getStatusColor(selectedEmployee.status)"
                :label="selectedEmployee.status"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';
import type { Department } from 'src/types/models';

const $q = useQuasar();
const authStore = useAuthStore();

// State
const loading = ref(false);
interface EmployeeWithRelations {
  id: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone?: string;
  department_id?: string;
  designation_id?: string;
  date_of_joining: string;
  status: string;
  profile?: { full_name?: string; email?: string };
  department?: { id: string; name: string };
  designation?: { id: string; title: string };
}
const employees = ref<EmployeeWithRelations[]>([]);
const departments = ref<Department[]>([]);
const search = ref('');
const filterDepartment = ref<string | null>(null);
const filterStatus = ref<string | null>(null);
const viewDialog = ref(false);
const selectedEmployee = ref<EmployeeWithRelations | null>(null);

// Pagination
const pagination = ref({
  sortBy: 'date_of_joining',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

// Options
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Pending', value: 'pending' },
];

const departmentOptions = computed(() =>
  departments.value.map((d) => ({ label: d.name, value: d.id }))
);

// Table columns
const columns = [
  {
    name: 'employee',
    label: 'Employee',
    field: 'profile',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'department',
    label: 'Department',
    field: 'department_id',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'designation',
    label: 'Designation',
    field: 'designation_id',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'date_of_joining',
    label: 'Joining Date',
    field: 'date_of_joining',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
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

// Fetch employees
const fetchEmployees = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;

  loading.value = true;

  try {
    let query = supabase
      .from('employees')
      .select(
        `*,
        profile:profiles!profile_id(*),
        department:departments(id, name),
        designation:designations(id, title)`,
        { count: 'exact' }
      )
      .eq('company_id', companyId)
      .is('deleted_at', null);

    // Apply search
    if (search.value) {
      query = query.ilike('employee_code', `%${search.value}%`);
    }

    // Apply filters
    if (filterDepartment.value) {
      query = query.eq('department_id', filterDepartment.value);
    }

    if (filterStatus.value) {
      query = query.eq('status', filterStatus.value);
    }

    // Apply sorting
    const { sortBy, descending, page, rowsPerPage } = pagination.value;
    const offset = (page - 1) * rowsPerPage;

    if (sortBy) {
      query = query.order(sortBy, { ascending: !descending });
    }

    // Apply pagination
    query = query.range(offset, offset + rowsPerPage - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    employees.value = data || [];
    pagination.value.rowsNumber = count || 0;
  } catch (error) {
    console.error('Error fetching employees:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load employees',
    });
  } finally {
    loading.value = false;
  }
};

// Fetch departments for filter
const fetchDepartments = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;

  try {
    const { data } = await supabase
      .from('departments')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');

    departments.value = data || [];
  } catch (error) {
    console.error('Error fetching departments:', error);
  }
};

// Table request handler
const onRequest = (props: { pagination: { sortBy: string; descending: boolean; page: number; rowsPerPage: number; rowsNumber?: number } }) => {
  pagination.value = { ...pagination.value, ...props.pagination };
  void fetchEmployees();
};

// Helper functions
const getInitials = (name: string | undefined) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (date: string | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'positive',
    inactive: 'grey',
    pending: 'warning',
  };
  return colors[status] || 'grey';
};

const viewEmployee = (employee: EmployeeWithRelations) => {
  selectedEmployee.value = employee;
  viewDialog.value = true;
};

const confirmDelete = (employee: EmployeeWithRelations) => {
  $q.dialog({
    title: 'Delete Employee',
    message: `Are you sure you want to delete ${employee.profile?.full_name}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void deleteEmployee(employee.id);
  });
};

const deleteEmployee = async (id: string) => {
  try {
    const { error } = await supabase
      .from('employees')
      .update({ deleted_at: new Date().toISOString(), status: 'deleted' } as never)
      .eq('id', id);

    if (error) throw error;

    $q.notify({
      type: 'positive',
      message: 'Employee deleted successfully',
    });

    void fetchEmployees();
  } catch {
    console.error('Error deleting employee');
    $q.notify({
      type: 'negative',
      message: 'Failed to delete employee',
    });
  }
};

// Watch filters
watch([search, filterDepartment, filterStatus], () => {
  pagination.value.page = 1;
  void fetchEmployees();
});

onMounted(() => {
  void fetchDepartments();
  void fetchEmployees();
});
</script>

<style lang="scss" scoped>
.employees-page {
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
  color: var(--color-black);
  margin: 0 0 var(--spacing-1);
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-gray-500);
  margin: 0;
}

.filters-card {
  margin-bottom: var(--spacing-4);
  border-radius: var(--radius-lg);
}

.filters-row {
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}

.search-input {
  min-width: 250px;
  flex: 1;
}

.filter-select {
  min-width: 180px;
}

.table-card {
  border-radius: var(--radius-lg);
}

.employee-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.employee-info {
  display: flex;
  flex-direction: column;
}

.employee-name {
  font-weight: 500;
  color: var(--color-black);
}

.employee-code {
  font-size: 12px;
  color: var(--color-gray-500);
}

.status-badge {
  text-transform: capitalize;
}

.action-btn {
  color: var(--color-gray-500);

  &:hover {
    color: var(--color-black);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-8);
  color: var(--color-gray-400);

  p {
    margin: var(--spacing-3) 0;
    font-size: 14px;
  }
}

.view-dialog {
  min-width: 400px;
  max-width: 500px;
  border-radius: var(--radius-xl);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-gray-100);
}

.employee-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-2) 0;
  border-bottom: 1px solid var(--color-gray-100);

  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  color: var(--color-gray-500);
  font-size: 14px;
}

.detail-value {
  font-weight: 500;
  color: var(--color-black);
  font-size: 14px;
}
</style>
