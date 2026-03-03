<template>
  <q-page class="page-class">
    <div class="page-header">
      <div>
        <h1 class="page-title">Payroll Management</h1>
        <p class="page-subtitle">Manage employee payroll, salary structures, and pay slips</p>
      </div>
      <div class="header-actions">
        <q-btn
          v-if="canManage"
          label="New Salary Structure"
          icon="add"
          color="black"
          no-caps
          @click="openStructureDialog()"
          class="q-mr-sm"
        />
        <q-btn
          v-if="canManage"
          label="Run Payroll"
          icon="play_arrow"
          outline
          color="black"
          no-caps
          @click="openPayrollDialog()"
        />
      </div>
    </div>

    <!-- Access Warning -->
    <q-card v-if="!canView" class="access-card q-mb-lg">
      <q-card-section class="text-center">
        <q-icon name="lock" size="48px" color="grey-5" />
        <p class="text-grey-6 q-mt-md">You don't have permission to access payroll management.</p>
        <p class="text-caption text-grey-5">Contact your administrator to request access.</p>
      </q-card-section>
    </q-card>

    <template v-else>
      <!-- Tabs -->
      <q-card class="tabs-card">
        <q-tabs v-model="activeTab" dense class="text-grey-7" active-color="black" indicator-color="black">
          <q-tab name="structures" label="Salary Structures" no-caps />
          <q-tab name="payroll" label="Payroll Runs" no-caps />
          <q-tab name="payslips" label="Pay Slips" no-caps />
        </q-tabs>
      </q-card>

      <!-- Salary Structures Tab -->
      <q-card v-show="activeTab === 'structures'" class="table-card q-mt-md">
        <q-card-section class="q-pa-none">
          <q-table :rows="salaryStructures" :columns="structureColumns" row-key="id" flat :loading="loading">
            <template v-slot:body-cell-employee="props">
              <q-td :props="props">
                <div class="employee-cell">
                  <q-avatar size="32px" color="grey-3" text-color="grey-7">
                    {{ getInitials(props.row.employee?.full_name) }}
                  </q-avatar>
                  <div>
                    <div class="text-weight-medium">{{ props.row.employee?.full_name || 'N/A' }}</div>
                    <div class="text-caption text-grey-6">{{ props.row.employee?.employee_code }}</div>
                  </div>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-gross_salary="props">
              <q-td :props="props">
                <span class="text-weight-medium">{{ formatCurrency(props.row.gross_salary) }}</span>
              </q-td>
            </template>
            <template v-slot:body-cell-net_salary="props">
              <q-td :props="props">
                <span class="text-weight-bold">{{ formatCurrency(props.row.net_salary) }}</span>
              </q-td>
            </template>
            <template v-slot:body-cell-is_active="props">
              <q-td :props="props">
                <q-badge :color="props.row.is_active ? 'positive' : 'grey'" :label="props.row.is_active ? 'Active' : 'Inactive'" />
              </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn v-if="canManage" flat dense round icon="more_vert">
                  <q-menu>
                    <q-list>
                      <q-item clickable v-close-popup @click="openStructureDialog(props.row)">
                        <q-item-section avatar><q-icon name="edit" /></q-item-section>
                        <q-item-section>Edit</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="viewStructureDetails(props.row)">
                        <q-item-section avatar><q-icon name="visibility" /></q-item-section>
                        <q-item-section>View Details</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
                <q-btn v-else flat dense round icon="visibility" @click="viewStructureDetails(props.row)">
                  <q-tooltip>View</q-tooltip>
                </q-btn>
              </q-td>
            </template>
            <template v-slot:no-data>
              <div class="empty-state">
                <q-icon name="account_balance_wallet" size="48px" color="gray-4" />
                <p>No salary structures found</p>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Payroll Runs Tab -->
      <q-card v-show="activeTab === 'payroll'" class="table-card q-mt-md">
        <q-card-section class="q-pa-none">
          <q-table :rows="payrollPeriods" :columns="payrollColumns" row-key="id" flat :loading="loading">
            <template v-slot:body-cell-period="props">
              <q-td :props="props">
                {{ getMonthName(props.row.period_month) }} {{ props.row.period_year }}
              </q-td>
            </template>
            <template v-slot:body-cell-total_net="props">
              <q-td :props="props">
                <span class="text-weight-bold">{{ formatCurrency(props.row.total_net) }}</span>
              </q-td>
            </template>
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-badge :color="getPayrollStatusColor(props.row.status)" :label="capitalize(props.row.status)" />
              </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  v-if="canManage && props.row.status === 'draft'"
                  flat
                  dense
                  color="positive"
                  icon="check_circle"
                  @click="approvePayroll(props.row)"
                >
                  <q-tooltip>Approve & Process</q-tooltip>
                </q-btn>
                <q-btn flat dense icon="visibility" @click="viewPayrollDetails(props.row)">
                  <q-tooltip>View</q-tooltip>
                </q-btn>
              </q-td>
            </template>
            <template v-slot:no-data>
              <div class="empty-state">
                <q-icon name="event_repeat" size="48px" color="gray-4" />
                <p>No payroll runs found</p>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Pay Slips Tab -->
      <q-card v-show="activeTab === 'payslips'" class="table-card q-mt-md">
        <q-card-section class="q-pa-none">
          <q-table :rows="paySlips" :columns="payslipColumns" row-key="id" flat :loading="loading">
            <template v-slot:body-cell-employee="props">
              <q-td :props="props">
                <div class="employee-cell">
                  <q-avatar size="32px" color="grey-3" text-color="grey-7">
                    {{ getInitials(props.row.employee?.full_name) }}
                  </q-avatar>
                  <div>
                    <div class="text-weight-medium">{{ props.row.employee?.full_name || 'N/A' }}</div>
                    <div class="text-caption text-grey-6">{{ props.row.employee?.employee_code }}</div>
                  </div>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-period="props">
              <q-td :props="props">
                {{ getMonthName(props.row.period_month) }} {{ props.row.period_year }}
              </q-td>
            </template>
            <template v-slot:body-cell-net_salary="props">
              <q-td :props="props">
                <span class="text-weight-bold">{{ formatCurrency(props.row.net_salary) }}</span>
              </q-td>
            </template>
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-badge :color="getPayslipStatusColor(props.row.status)" :label="capitalize(props.row.status)" />
              </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn flat dense icon="visibility" @click="viewPayslipDetails(props.row)">
                  <q-tooltip>View</q-tooltip>
                </q-btn>
                <q-btn v-if="props.row.status === 'paid'" flat dense icon="download" @click="downloadPayslip(props.row)">
                  <q-tooltip>Download</q-tooltip>
                </q-btn>
              </q-td>
            </template>
            <template v-slot:no-data>
              <div class="empty-state">
                <q-icon name="receipt_long" size="48px" color="gray-4" />
                <p>No pay slips found</p>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </template>

    <!-- Salary Structure Dialog -->
    <q-dialog v-model="structureDialog" persistent>
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h6">{{ editingStructure ? 'Edit' : 'New' }} Salary Structure</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveStructure">
            <q-select
              v-model="structureForm.employee_id"
              :options="employeeOptions"
              label="Employee *"
              outlined
              dense
              emit-value
              map-options
              :rules="[v => !!v || 'Required']"
              :disable="!!editingStructure"
              class="q-mb-md"
            />
            <q-input
              v-model="structureForm.name"
              label="Structure Name *"
              outlined
              dense
              hint="e.g., Standard Salary Package"
              :rules="[v => !!v || 'Required']"
              class="q-mb-md"
            />
            <q-input
              v-model="structureForm.gross_salary"
              label="Gross Salary *"
              type="number"
              outlined
              dense
              :rules="[v => v > 0 || 'Must be greater than 0']"
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <span class="text-grey-6">$</span>
              </template>
            </q-input>
            <q-input
              v-model="structureForm.net_salary"
              label="Net Salary *"
              type="number"
              outlined
              dense
              :rules="[v => v > 0 || 'Must be greater than 0']"
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <span class="text-grey-6">$</span>
              </template>
            </q-input>
            <q-input
              v-model="structureForm.effective_from"
              label="Effective From *"
              type="date"
              outlined
              dense
              :rules="[v => !!v || 'Required']"
              class="q-mb-md"
            />
            <q-select
              v-model="structureForm.payment_frequency"
              :options="frequencyOptions"
              label="Payment Frequency"
              outlined
              dense
              emit-value
              map-options
              class="q-mb-md"
            />
            <q-checkbox v-model="structureForm.is_active" label="Active" dense />

            <div class="flex justify-end gap-3 q-mt-lg">
              <q-btn flat label="Cancel" v-close-popup />
              <q-btn color="black" :label="editingStructure ? 'Update' : 'Create'" type="submit" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Run Payroll Dialog -->
    <q-dialog v-model="payrollDialog" persistent>
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h6">Run Payroll</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="runPayroll">
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-select
                  v-model="payrollForm.month"
                  :options="monthOptions"
                  label="Month *"
                  outlined
                  dense
                  emit-value
                  map-options
                  :rules="[v => !!v || 'Required']"
                />
              </div>
              <div class="col-6">
                <q-select
                  v-model="payrollForm.year"
                  :options="yearOptions"
                  label="Year *"
                  outlined
                  dense
                  emit-value
                  map-options
                  :rules="[v => !!v || 'Required']"
                />
              </div>
            </div>
            <q-input
              v-model="payrollForm.payment_date"
              label="Payment Date *"
              type="date"
              outlined
              dense
              :rules="[v => !!v || 'Required']"
              class="q-mt-md"
            />
            <div class="text-caption text-grey-6 q-mt-sm">
              This will generate pay slips for all active employees with salary structures.
            </div>

            <div class="flex justify-end gap-3 q-mt-lg">
              <q-btn flat label="Cancel" v-close-popup />
              <q-btn color="black" label="Run Payroll" type="submit" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Pay Slip Detail Dialog -->
    <q-dialog v-model="payslipDetailDialog">
      <q-card class="payslip-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">Pay Slip Details</div>
        </q-card-section>
        <q-card-section v-if="selectedPayslip">
          <div class="payslip-header">
            <div class="payslip-row">
              <span class="label">Employee</span>
              <span class="value">{{ selectedPayslip.employee?.full_name }}</span>
            </div>
            <div class="payslip-row">
              <span class="label">Period</span>
              <span class="value">{{ getMonthName(selectedPayslip.period_month) }} {{ selectedPayslip.period_year }}</span>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="section-title">Earnings</div>
          <div v-for="(amount, key) in selectedPayslip.earnings" :key="key" class="payslip-row">
            <span class="label">{{ formatComponentName(key) }}</span>
            <span class="value">{{ formatCurrency(amount) }}</span>
          </div>
          <div class="payslip-row total">
            <span class="label">Total Earnings</span>
            <span class="value">{{ formatCurrency(selectedPayslip.total_earnings) }}</span>
          </div>

          <q-separator class="q-my-md" />

          <div class="section-title">Deductions</div>
          <div v-for="(amount, key) in selectedPayslip.deductions" :key="key" class="payslip-row">
            <span class="label">{{ formatComponentName(key) }}</span>
            <span class="value text-negative">-{{ formatCurrency(amount) }}</span>
          </div>
          <div class="payslip-row total">
            <span class="label">Total Deductions</span>
            <span class="value text-negative">-{{ formatCurrency(selectedPayslip.total_deductions) }}</span>
          </div>

          <q-separator class="q-my-md" />

          <div class="payslip-row final">
            <span class="label">Net Salary</span>
            <span class="value">{{ formatCurrency(selectedPayslip.net_salary) }}</span>
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';

interface SalaryStructure {
  id: string;
  company_id: string;
  employee_id: string;
  name: string;
  gross_salary: number;
  net_salary: number;
  effective_from: string;
  effective_to?: string;
  payment_frequency: string;
  is_active: boolean;
  employee?: {
    full_name: string;
    employee_code: string;
  };
}

interface PayrollPeriod {
  id: string;
  company_id: string;
  name: string;
  period_month: number;
  period_year: number;
  start_date: string;
  end_date: string;
  payment_date: string;
  status: string;
  total_employees: number;
  total_gross: number;
  total_deductions: number;
  total_net: number;
}

interface PaySlip {
  id: string;
  employee_id: string;
  company_id: string;
  period_month: number;
  period_year: number;
  earnings: Record<string, number>;
  deductions: Record<string, number>;
  total_earnings: number;
  total_deductions: number;
  gross_salary: number;
  net_salary: number;
  status: string;
  employee?: {
    full_name: string;
    employee_code: string;
  };
}

interface Employee {
  id: string;
  employee_code: string;
  profile?: {
    full_name: string;
  };
}

const $q = useQuasar();
const authStore = useAuthStore();

const loading = ref(false);
const saving = ref(false);
const activeTab = ref('structures');
const structureDialog = ref(false);
const payrollDialog = ref(false);
const payslipDetailDialog = ref(false);
const editingStructure = ref<SalaryStructure | null>(null);
const selectedPayslip = ref<PaySlip | null>(null);

const salaryStructures = ref<SalaryStructure[]>([]);
const payrollPeriods = ref<PayrollPeriod[]>([]);
const paySlips = ref<PaySlip[]>([]);
const employees = ref<Employee[]>([]);

// Permission checks
const canView = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminData = authStore.companyAdmin as any;
  const role = adminData?.role;
  const permissions = adminData?.permissions as string[] | undefined;
  if (role === 'owner' || role === 'admin') return true;
  if (permissions?.includes('payroll.view') || permissions?.includes('payroll.manage')) return true;
  return false;
});

const canManage = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminData = authStore.companyAdmin as any;
  const role = adminData?.role;
  const permissions = adminData?.permissions as string[] | undefined;
  if (role === 'owner' || role === 'admin') return true;
  if (permissions?.includes('payroll.manage')) return true;
  return false;
});

const structureForm = reactive({
  employee_id: '',
  name: '',
  gross_salary: 0,
  net_salary: 0,
  effective_from: new Date().toISOString().split('T')[0],
  payment_frequency: 'monthly',
  is_active: true,
});

const payrollForm = reactive({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  payment_date: '',
});

const employeeOptions = computed(() =>
  employees.value.map((e) => ({
    label: `${e.profile?.full_name || 'Unknown'} (${e.employee_code})`,
    value: e.id,
  }))
);

const frequencyOptions = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Bi-Weekly', value: 'bi_weekly' },
  { label: 'Weekly', value: 'weekly' },
];

const monthOptions = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
];

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => ({
    label: String(currentYear - i),
    value: currentYear - i,
  }));
});

const structureColumns = [
  { name: 'employee', label: 'Employee', field: 'employee', align: 'left' as const },
  { name: 'name', label: 'Structure Name', field: 'name', align: 'left' as const },
  { name: 'gross_salary', label: 'Gross Salary', field: 'gross_salary', align: 'right' as const },
  { name: 'net_salary', label: 'Net Salary', field: 'net_salary', align: 'right' as const },
  { name: 'effective_from', label: 'Effective From', field: 'effective_from', align: 'left' as const },
  { name: 'is_active', label: 'Status', field: 'is_active', align: 'center' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

const payrollColumns = [
  { name: 'period', label: 'Period', field: 'period', align: 'left' as const },
  { name: 'total_employees', label: 'Employees', field: 'total_employees', align: 'center' as const },
  { name: 'total_gross', label: 'Total Gross', field: 'total_gross', align: 'right' as const, format: (v: number) => formatCurrency(v) },
  { name: 'total_net', label: 'Total Net', field: 'total_net', align: 'right' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'center' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

const payslipColumns = [
  { name: 'employee', label: 'Employee', field: 'employee', align: 'left' as const },
  { name: 'period', label: 'Period', field: 'period', align: 'left' as const },
  { name: 'gross_salary', label: 'Gross', field: 'gross_salary', align: 'right' as const, format: (v: number) => formatCurrency(v) },
  { name: 'net_salary', label: 'Net Salary', field: 'net_salary', align: 'right' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'center' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

// Utility functions
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

const getMonthName = (month: number) =>
  ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month];

const getInitials = (name?: string) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const getPayrollStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'grey',
    processing: 'orange',
    approved: 'blue',
    paid: 'positive',
    cancelled: 'negative',
  };
  return colors[status] || 'grey';
};

const getPayslipStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'grey',
    pending: 'orange',
    paid: 'positive',
    cancelled: 'negative',
  };
  return colors[status] || 'grey';
};

const formatComponentName = (key: string) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

// Data fetching
const fetchData = async () => {
  if (!canView.value) return;

  const companyId = authStore.company?.id;
  if (!companyId) return;

  loading.value = true;
  try {
    // Fetch employees
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: empData } = await (supabase.from('employees') as any)
      .select('id, employee_code, profiles!employees_profile_id_fkey(full_name)')
      .eq('company_id', companyId)
      .eq('status', 'active');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    employees.value = (empData || []).map((e: any) => ({
      id: e.id,
      employee_code: e.employee_code,
      profile: e.profiles,
    }));

    // Fetch salary structures
    const { data: structData } = await supabase
      .from('salary_structures')
      .select('*, employees(employee_code, profiles!employees_profile_id_fkey(full_name))')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    salaryStructures.value = (structData || []).map((s: Record<string, unknown>) => ({
      ...s,
      employee: s.employees as { full_name: string; employee_code: string } | undefined,
    })) as SalaryStructure[];

    // Fetch payroll periods
    const { data: periodData } = await supabase
      .from('payroll_periods')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    payrollPeriods.value = (periodData as PayrollPeriod[]) || [];

    // Fetch pay slips
    const { data: slipData } = await supabase
      .from('pay_slips')
      .select('*, employees(employee_code, profiles!employees_profile_id_fkey(full_name))')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(100);

    paySlips.value = (slipData || []).map((s: Record<string, unknown>) => ({
      ...s,
      employee: s.employees as { full_name: string; employee_code: string } | undefined,
    })) as PaySlip[];
  } catch (error) {
    console.error('Error fetching payroll data:', error);
    $q.notify({ type: 'negative', message: 'Failed to load payroll data' });
  } finally {
    loading.value = false;
  }
};

const openStructureDialog = (item?: SalaryStructure) => {
  editingStructure.value = item || null;
  structureForm.employee_id = item?.employee_id || '';
  structureForm.name = item?.name || '';
  structureForm.gross_salary = item?.gross_salary || 0;
  structureForm.net_salary = item?.net_salary || 0;
  structureForm.effective_from = item?.effective_from || new Date().toISOString().split('T')[0];
  structureForm.payment_frequency = item?.payment_frequency || 'monthly';
  structureForm.is_active = item?.is_active ?? true;
  structureDialog.value = true;
};

const saveStructure = async () => {
  if (!canManage.value) return;

  const companyId = authStore.company?.id;
  if (!companyId) return;

  saving.value = true;
  try {
    if (editingStructure.value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('salary_structures') as any)
        .update({
          name: structureForm.name,
          gross_salary: structureForm.gross_salary,
          net_salary: structureForm.net_salary,
          effective_from: structureForm.effective_from,
          payment_frequency: structureForm.payment_frequency,
          is_active: structureForm.is_active,
        })
        .eq('id', editingStructure.value.id);
      $q.notify({ type: 'positive', message: 'Salary structure updated' });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('salary_structures') as any).insert({
        company_id: companyId,
        employee_id: structureForm.employee_id,
        name: structureForm.name,
        gross_salary: structureForm.gross_salary,
        net_salary: structureForm.net_salary,
        effective_from: structureForm.effective_from,
        payment_frequency: structureForm.payment_frequency,
        is_active: structureForm.is_active,
      });
      $q.notify({ type: 'positive', message: 'Salary structure created' });
    }
    structureDialog.value = false;
    void fetchData();
  } catch (error) {
    console.error('Error saving structure:', error);
    $q.notify({ type: 'negative', message: 'Failed to save salary structure' });
  } finally {
    saving.value = false;
  }
};

const viewStructureDetails = (item: SalaryStructure) => {
  $q.dialog({
    title: 'Salary Structure Details',
    message: `
      <strong>Employee:</strong> ${item.employee?.full_name || 'N/A'}<br>
      <strong>Structure:</strong> ${item.name}<br>
      <strong>Gross Salary:</strong> ${formatCurrency(item.gross_salary)}<br>
      <strong>Net Salary:</strong> ${formatCurrency(item.net_salary)}<br>
      <strong>Effective From:</strong> ${item.effective_from}<br>
      <strong>Frequency:</strong> ${capitalize(item.payment_frequency)}<br>
      <strong>Status:</strong> ${item.is_active ? 'Active' : 'Inactive'}
    `,
    html: true,
    ok: { label: 'Close', flat: true },
  });
};

const openPayrollDialog = () => {
  const now = new Date();
  payrollForm.month = now.getMonth() + 1;
  payrollForm.year = now.getFullYear();
  payrollForm.payment_date = '';
  payrollDialog.value = true;
};

const runPayroll = async () => {
  if (!canManage.value) return;

  const companyId = authStore.company?.id;
  if (!companyId) return;

  saving.value = true;
  try {
    // Create payroll period
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: periodData, error: periodError } = await (supabase
      .from('payroll_periods') as any)
      .insert({
        company_id: companyId,
        name: `${getMonthName(payrollForm.month)} ${payrollForm.year} Payroll`,
        period_month: payrollForm.month,
        period_year: payrollForm.year,
        start_date: new Date(payrollForm.year, payrollForm.month - 1, 1).toISOString().split('T')[0],
        end_date: new Date(payrollForm.year, payrollForm.month, 0).toISOString().split('T')[0],
        payment_date: payrollForm.payment_date,
        status: 'draft',
      })
      .select()
      .single();

    if (periodError) throw periodError;

    // Get active salary structures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: structures } = await (supabase
      .from('salary_structures') as any)
      .select('*, employees(id)')
      .eq('company_id', companyId)
      .eq('is_active', true);

    if (structures && structures.length > 0) {
      // Create pay slips for each employee
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paySlipsToCreate = structures.map((s: any) => ({
        company_id: companyId,
        employee_id: (s.employees as { id: string }).id,
        payroll_period_id: (periodData as { id: string }).id,
        salary_structure_id: s.id,
        period_month: payrollForm.month,
        period_year: payrollForm.year,
        earnings: { basic_salary: s.gross_salary },
        total_earnings: s.gross_salary,
        deductions: {},
        total_deductions: 0,
        gross_salary: s.gross_salary,
        net_salary: s.net_salary,
        status: 'draft',
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('pay_slips') as any).insert(paySlipsToCreate);

      // Update period totals
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase
        .from('payroll_periods') as any)
        .update({
          total_employees: structures.length,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          total_gross: structures.reduce((sum: number, s: any) => sum + (s.gross_salary || 0), 0),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          total_net: structures.reduce((sum: number, s: any) => sum + (s.net_salary || 0), 0),
        })
        .eq('id', (periodData as { id: string }).id);
    }

    $q.notify({ type: 'positive', message: 'Payroll run created successfully' });
    payrollDialog.value = false;
    void fetchData();
  } catch (error) {
    console.error('Error running payroll:', error);
    $q.notify({ type: 'negative', message: 'Failed to run payroll' });
  } finally {
    saving.value = false;
  }
};

const approvePayroll = (period: PayrollPeriod) => {
  $q.dialog({
    title: 'Approve Payroll',
    message: `Approve and mark payroll for ${getMonthName(period.period_month)} ${period.period_year} as paid?`,
    cancel: true,
  }).onOk(() => {
    void (async () => {
      try {
        // Update period status
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase
          .from('payroll_periods') as any)
          .update({
            status: 'paid',
            approved_by: authStore.user?.id,
            approved_at: new Date().toISOString(),
          })
          .eq('id', period.id);

        // Update all pay slips in this period
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase
          .from('pay_slips') as any)
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
          })
          .eq('payroll_period_id', period.id);

        $q.notify({ type: 'positive', message: 'Payroll approved and processed' });
        void fetchData();
      } catch (error) {
        console.error('Error approving payroll:', error);
        $q.notify({ type: 'negative', message: 'Failed to approve payroll' });
      }
    })();
  });
};

const viewPayrollDetails = (period: PayrollPeriod) => {
  $q.dialog({
    title: 'Payroll Details',
    message: `
      <strong>Period:</strong> ${getMonthName(period.period_month)} ${period.period_year}<br>
      <strong>Employees:</strong> ${period.total_employees}<br>
      <strong>Total Gross:</strong> ${formatCurrency(period.total_gross)}<br>
      <strong>Total Deductions:</strong> ${formatCurrency(period.total_deductions)}<br>
      <strong>Total Net:</strong> ${formatCurrency(period.total_net)}<br>
      <strong>Payment Date:</strong> ${period.payment_date}<br>
      <strong>Status:</strong> ${capitalize(period.status)}
    `,
    html: true,
    ok: { label: 'Close', flat: true },
  });
};

const viewPayslipDetails = (slip: PaySlip) => {
  selectedPayslip.value = slip;
  payslipDetailDialog.value = true;
};

const downloadPayslip = (slip: PaySlip) => {
  // Generate and download pay slip as HTML
  const htmlContent = generatePayslipHtml(slip);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `payslip-${slip.period_month}-${slip.period_year}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  $q.notify({ type: 'positive', message: 'Pay slip downloaded successfully' });
};

const generatePayslipHtml = (slip: PaySlip): string => {
  const company = authStore.company as { name: string; logo_url?: string } | null;
  const companyName = company?.name || 'Company';
  const companyLogo = company?.logo_url;
  const employeeName = slip.employee?.full_name || 'Employee';
  const employeeCode = slip.employee?.employee_code || 'N/A';
  const period = getMonthName(slip.period_month) + ' ' + slip.period_year;
  const netSalary = formatCurrency(slip.net_salary);
  const earningsRows = Object.entries(slip.earnings || {}).map(([key, amount]) =>
    '<div class="row"><span class="label">' + formatComponentName(key) + '</span><span class="value">' + formatCurrency(amount) + '</span></div>'
  ).join('');
  const deductionsRows = Object.entries(slip.deductions || {}).map(([key, amount]) =>
    '<div class="row"><span class="label">' + formatComponentName(key) + '</span><span class="value">-' + formatCurrency(amount) + '</span></div>'
  ).join('');

  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Payslip - ' + period + '</title>' +
    '<style>body { font-family: Arial, sans-serif; font-size: 12px; margin: 0; padding: 20px; }.container { max-width: 600px; margin: 0 auto; }.header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 20px; }.company-name { font-size: 18px; font-weight: bold; }.payslip-title { font-size: 14px; color: #666; }.section { margin: 15px 0; }.section-title { font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #eee; }.row { display: flex; justify-content: space-between; padding: 5px 0; }.label { color: #666; }.value { font-weight: 500; }.total { font-weight: bold; background: #f5f5f5; padding: 10px; margin-top: 10px; }.net-salary { font-size: 18px; font-weight: bold; color: #000; }</style></head><body>' +
    '<div class="container">' +
      '<div class="header">' +
        (companyLogo ? '<img src="' + companyLogo + '" style="max-width: 60px; max-height: 60px;" alt="Logo" />' : '') +
        '<div class="company-name">' + companyName + '</div>' +
        '<div class="payslip-title">PAYSLIP</div>' +
      '</div>' +
      '<div class="section">' +
        '<div class="section-title">Employee Details</div>' +
        '<div class="row"><span class="label">Name</span><span class="value">' + employeeName + '</span></div>' +
        '<div class="row"><span class="label">Employee ID</span><span class="value">' + employeeCode + '</span></div>' +
        '<div class="row"><span class="label">Period</span><span class="value">' + period + '</span></div>' +
      '</div>' +
      '<div class="section">' +
        '<div class="section-title">Earnings</div>' +
        earningsRows +
        '<div class="total"><div class="row"><span class="label">Total Earnings</span><span class="value">' + formatCurrency(slip.total_earnings) + '</span></div></div>' +
      '</div>' +
      '<div class="section">' +
        '<div class="section-title">Deductions</div>' +
        deductionsRows +
        '<div class="total"><div class="row"><span class="label">Total Deductions</span><span class="value">-' + formatCurrency(slip.total_deductions) + '</span></div></div>' +
      '</div>' +
      '<div class="total"><div class="row"><span class="label">Net Salary</span><span class="value net-salary">' + netSalary + '</span></div></div>' +
    '</div>' +
    '</body></html>';
};

onMounted(() => {
  void fetchData();
});
</script>

<style lang="scss" scoped>
.page-class { padding: var(--spacing-5); }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-5); flex-wrap: wrap; gap: var(--spacing-4); }
.page-title { font-size: 28px; font-weight: 700; margin: 0 0 var(--spacing-1); }
.page-subtitle { font-size: 14px; color: var(--color-gray-500); margin: 0; }
.header-actions { display: flex; gap: var(--spacing-2); }
.access-card { border-radius: var(--radius-lg); }
.tabs-card { border-radius: var(--radius-lg); }
.table-card { border-radius: var(--radius-lg); }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--spacing-6); color: var(--color-gray-400); }
.employee-cell { display: flex; align-items: center; gap: var(--spacing-3); }
.dialog-card { min-width: 500px; border-radius: var(--radius-xl); }
.dialog-header { border-bottom: 1px solid var(--color-gray-100); }
.payslip-dialog { min-width: 450px; border-radius: var(--radius-xl); }
.payslip-header { }
.payslip-row { display: flex; justify-content: space-between; padding: var(--spacing-2) 0;
  .label { color: var(--color-gray-600); }
  .value { font-weight: 500; }
  &.total { margin-top: var(--spacing-2); padding-top: var(--spacing-2); border-top: 1px dashed var(--color-gray-200);
    .label, .value { font-weight: 600; }
  }
  &.final { background: var(--color-gray-50); margin: var(--spacing-2) calc(var(--spacing-4) * -1); padding: var(--spacing-3) var(--spacing-4); border-radius: var(--radius-md);
    .value { font-size: 18px; }
  }
}
.section-title { font-weight: 600; margin-bottom: var(--spacing-2); color: var(--color-gray-700); }

@media (max-width: 600px) {
  .page-header { flex-direction: column; }
  .header-actions { width: 100%; }
  .dialog-card { min-width: 100%; }
}
</style>
