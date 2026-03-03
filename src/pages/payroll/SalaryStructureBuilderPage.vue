<template>
  <q-page class="salary-builder-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Salary Structure Builder</h1>
        <p class="page-subtitle">Create and manage custom salary structures with flexible earnings and deductions</p>
      </div>
      <div class="header-actions">
        <q-btn
          label="Create New Structure"
          icon="add"
          color="black"
          no-caps
          @click="openStructureDialog()"
        />
      </div>
    </div>

    <!-- Structures List -->
    <q-card class="table-card">
      <q-card-section class="q-pa-none">
        <q-table :rows="salaryStructures" :columns="columns" row-key="id" flat :loading="loading">
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
          <template v-slot:body-cell-earnings="props">
            <q-td :props="props">
              <div class="component-preview">
                <div v-for="(amount, key) in getEarningsPreview(props.row.earnings)" :key="key" class="component-item">
                  <span class="component-name">{{ formatComponentName(key) }}</span>
                  <span class="component-value">{{ formatCurrency(amount) }}</span>
                </div>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-deductions="props">
            <q-td :props="props">
              <div class="component-preview">
                <div v-for="(amount, key) in getDeductionsPreview(props.row.deductions)" :key="key" class="component-item">
                  <span class="component-name">{{ formatComponentName(key) }}</span>
                  <span class="component-value text-negative">-{{ formatCurrency(amount) }}</span>
                </div>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-net_salary="props">
            <q-td :props="props">
              <span class="text-weight-bold text-primary">{{ formatCurrency(props.row.net_salary) }}</span>
            </q-td>
          </template>
          <template v-slot:body-cell-is_active="props">
            <q-td :props="props">
              <q-badge :color="props.row.is_active ? 'positive' : 'grey'" :label="props.row.is_active ? 'Active' : 'Inactive'" />
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense icon="edit" @click="editStructure(props.row)">
                <q-tooltip>Edit Structure</q-tooltip>
              </q-btn>
              <q-btn flat dense icon="delete" @click="confirmDelete(props.row)" color="negative">
                <q-tooltip>Delete</q-tooltip>
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

    <!-- Salary Structure Builder Dialog -->
    <q-dialog v-model="builderDialog" persistent maximized>
      <q-card class="builder-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">{{ editingStructure ? 'Edit' : 'Create' }} Salary Structure</div>
        </q-card-section>

        <q-card-section style="max-height: 70vh; overflow-y: auto;">
          <q-form @submit="saveStructure" class="q-gutter-md">
            <!-- Basic Info -->
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="builderForm.employee_id"
                  :options="employeeOptions"
                  label="Employee *"
                  outlined
                  dense
                  emit-value
                  map-options
                  :rules="[v => !!v || 'Required']"
                  :disable="!!editingStructure"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="builderForm.name"
                  label="Structure Name *"
                  outlined
                  dense
                  hint="e.g., Standard Executive Package"
                  :rules="[v => !!v || 'Required']"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="builderForm.basic_salary"
                  label="Basic Salary *"
                  type="number"
                  outlined
                  dense
                  :rules="[v => v > 0 || 'Required']"
                >
                  <template v-slot:prepend>
                    <span class="text-grey-6">$</span>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="builderForm.payment_frequency"
                  label="Payment Frequency"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="builderForm.effective_from"
                  label="Effective From *"
                  type="date"
                  outlined
                  dense
                  :rules="[v => !!v || 'Required']"
                />
              </div>
            </div>

            <q-separator class="q-my-md" />
            <div class="text-subtitle1 q-mb-md">Earnings & Allowances</div>

            <!-- Fixed Allowances -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="builderForm.allowances.hra"
                  label="House Rent Allowance (HRA)"
                  type="number"
                  outlined
                  dense
                  hint="% of basic or fixed amount"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="builderForm.allowances.da"
                  label="Dearness Allowance (DA)"
                  type="number"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="builderForm.allowances.conveyance"
                  label="Conveyance Allowance"
                  type="number"
                  outlined
                  dense
                />
              </div>
            </div>

            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="builderForm.allowances.medical"
                  label="Medical Allowance"
                  type="number"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="builderForm.allowances.special"
                  label="Special Allowance"
                  type="number"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="builderForm.allowances.other"
                  label="Other Allowance"
                  type="number"
                  outlined
                  dense
                />
              </div>
            </div>

            <!-- Custom Earnings -->
            <div class="q-mb-md">
              <div class="row items-center q-mb-sm">
                <div class="text-subtitle2">Custom Earnings</div>
                <q-btn flat dense icon="add" label="Add Earning" @click="addCustomEarning" no-caps size="sm" />
              </div>
              <div v-if="builderForm.customEarnings.length === 0" class="text-caption text-grey-6 q-mb-sm">
                No custom earnings added
              </div>
              <div v-for="(earning, index) in builderForm.customEarnings" :key="index" class="row q-col-gutter-sm q-mb-sm items-center">
                <div class="col-5">
                  <q-input v-model="earning.name" label="Earning Name" outlined dense />
                </div>
                <div class="col-5">
                  <q-input v-model="earning.amount" label="Amount" type="number" outlined dense />
                </div>
                <div class="col-2">
                  <q-btn flat dense round icon="delete" color="negative" @click="removeCustomEarning(index)" />
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" />
            <div class="text-subtitle1 q-mb-md">Deductions</div>

            <!-- Fixed Deductions -->
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="builderForm.deductions.provident_fund"
                  label="Provident Fund (PF) %"
                  type="number"
                  outlined
                  dense
                  hint="Employee contribution %"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="builderForm.deductions.professional_tax"
                  label="Professional Tax"
                  type="number"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="builderForm.deductions.income_tax"
                  label="Income Tax / TDS"
                  type="number"
                  outlined
                  dense
                />
              </div>
            </div>

            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="builderForm.deductions.health_insurance"
                  label="Health Insurance"
                  type="number"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="builderForm.deductions.other"
                  label="Other Deductions"
                  type="number"
                  outlined
                  dense
                />
              </div>
            </div>

            <!-- Custom Deductions -->
            <div class="q-mb-md">
              <div class="row items-center q-mb-sm">
                <div class="text-subtitle2">Custom Deductions</div>
                <q-btn flat dense icon="add" label="Add Deduction" @click="addCustomDeduction" no-caps size="sm" />
              </div>
              <div v-if="builderForm.customDeductions.length === 0" class="text-caption text-grey-6 q-mb-sm">
                No custom deductions added
              </div>
              <div v-for="(deduction, index) in builderForm.customDeductions" :key="index" class="row q-col-gutter-sm q-mb-sm items-center">
                <div class="col-5">
                  <q-input v-model="deduction.name" label="Deduction Name" outlined dense />
                </div>
                <div class="col-5">
                  <q-input v-model="deduction.amount" label="Amount" type="number" outlined dense />
                </div>
                <div class="col-2">
                  <q-btn flat dense round icon="delete" color="negative" @click="removeCustomDeduction(index)" />
                </div>
              </div>
            </div>

            <!-- Preview -->
            <q-separator class="q-my-md" />
            <div class="text-subtitle1 q-mb-md">Preview</div>

            <div class="preview-section q-pa-md bg-grey-1">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="preview-card">
                    <div class="preview-title">Total Earnings</div>
                    <div class="preview-value text-positive">{{ formatCurrency(calculateTotalEarnings) }}</div>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="preview-card">
                    <div class="preview-title">Total Deductions</div>
                    <div class="preview-value text-negative">{{ formatCurrency(calculateTotalDeductions) }}</div>
                  </div>
                </div>
              </div>
              <div class="q-mt-md">
                <div class="preview-card preview-card-net">
                  <div class="preview-title">Net Salary</div>
                  <div class="preview-value">{{ formatCurrency(calculateNetSalary) }}</div>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 q-mt-lg">
              <q-btn flat label="Cancel" v-close-popup />
              <q-btn color="black" :label="editingStructure ? 'Update' : 'Create'" type="submit" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';

interface Employee {
  id: string;
  employee_code: string;
  profile?: {
    full_name: string;
  };
}

interface SalaryStructure {
  id: string;
  company_id: string;
  employee_id: string;
  name: string;
  basic_salary: number;
  net_salary: number;
  effective_from: string;
  payment_frequency: string;
  is_active: boolean;
  earnings: Record<string, number>;
  deductions: Record<string, number>;
  employee?: {
    full_name: string;
    employee_code: string;
  };
}

const $q = useQuasar();
const authStore = useAuthStore();

const loading = ref(false);
const saving = ref(false);
const builderDialog = ref(false);
const editingStructure = ref<SalaryStructure | null>(null);
const salaryStructures = ref<SalaryStructure[]>([]);
const employees = ref<Employee[]>([]);

const builderForm = reactive({
  employee_id: '',
  name: '',
  basic_salary: 0,
  payment_frequency: 'monthly',
  effective_from: new Date().toISOString().split('T')[0],
  is_active: true,
  allowances: {
    hra: 0,
    da: 0,
    conveyance: 0,
    medical: 0,
    special: 0,
    other: 0,
  },
  deductions: {
    provident_fund: 0,
    professional_tax: 0,
    income_tax: 0,
    health_insurance: 0,
    other: 0,
  },
  customEarnings: [] as Array<{ name: string; amount: number }>,
  customDeductions: [] as Array<{ name: string; amount: number }>,
});

const columns = [
  { name: 'employee', label: 'Employee', field: 'employee', align: 'left' as const },
  { name: 'name', label: 'Structure Name', field: 'name', align: 'left' as const },
  { name: 'earnings', label: 'Earnings', field: 'earnings', align: 'left' as const },
  { name: 'deductions', label: 'Deductions', field: 'deductions', align: 'left' as const },
  { name: 'net_salary', label: 'Net Salary', field: 'net_salary', align: 'left' as const },
  { name: 'is_active', label: 'Status', field: 'is_active', align: 'center' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

const employeeOptions = computed(() =>
  employees.value.map((e) => ({
    label: `${e.profile?.full_name || 'Unknown'} (${e.employee_code})`,
    value: e.id,
  }))
);

const calculateTotalEarnings = computed(() => {
  const allowances = builderForm.allowances;
  const custom = builderForm.customEarnings;
  return builderForm.basic_salary +
    (allowances.hra || 0) + (allowances.da || 0) + (allowances.conveyance || 0) +
    (allowances.medical || 0) + (allowances.special || 0) + (allowances.other || 0) +
    custom.reduce((sum, e) => sum + (e.amount || 0), 0);
});

const calculateTotalDeductions = computed(() => {
  const deductions = builderForm.deductions;
  const custom = builderForm.customDeductions;
  const pf = (builderForm.basic_salary * (deductions.provident_fund || 0)) / 100;
  return pf +
    (deductions.professional_tax || 0) + (deductions.income_tax || 0) +
    (deductions.health_insurance || 0) + (deductions.other || 0) +
    custom.reduce((sum, d) => sum + (d.amount || 0), 0);
});

const calculateNetSalary = computed(() => calculateTotalEarnings.value - calculateTotalDeductions.value);

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

const formatComponentName = (key: string) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const getEarningsPreview = (earnings: Record<string, number>) => {
  const preview: Record<string, number> = {};
  if (earnings.basic_salary) preview['Basic Salary'] = earnings.basic_salary;
  if (earnings.hra) preview['HRA'] = earnings.hra;
  if (earnings.da) preview['DA'] = earnings.da;
  return preview;
};

const getDeductionsPreview = (deductions: Record<string, number>) => {
  const preview: Record<string, number> = {};
  if (deductions.provident_fund) preview['PF'] = deductions.provident_fund;
  if (deductions.professional_tax) preview['Professional Tax'] = deductions.professional_tax;
  if (deductions.income_tax) preview['Income Tax'] = deductions.income_tax;
  return preview;
};

const getInitials = (name?: string) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const addCustomEarning = () => {
  builderForm.customEarnings.push({ name: '', amount: 0 });
};

const removeCustomEarning = (index: number) => {
  builderForm.customEarnings.splice(index, 1);
};

const addCustomDeduction = () => {
  builderForm.customDeductions.push({ name: '', amount: 0 });
};

const removeCustomDeduction = (index: number) => {
  builderForm.customDeductions.splice(index, 1);
};

const fetchData = async () => {
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
  } catch (error) {
    console.error('Error fetching data:', error);
    $q.notify({ type: 'negative', message: 'Failed to load data' });
  } finally {
    loading.value = false;
  }
};

const openStructureDialog = () => {
  resetBuilderForm();
  builderDialog.value = true;
};

const resetBuilderForm = () => {
  Object.assign(builderForm, {
    employee_id: '',
    name: '',
    basic_salary: 0,
    payment_frequency: 'monthly',
    effective_from: new Date().toISOString().split('T')[0],
    is_active: true,
    allowances: {
      hra: 0,
      da: 0,
      conveyance: 0,
      medical: 0,
      special: 0,
      other: 0,
    },
    deductions: {
      provident_fund: 0,
      professional_tax: 0,
      income_tax: 0,
      health_insurance: 0,
      other: 0,
    },
    customEarnings: [],
    customDeductions: [],
  });
};

const saveStructure = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;

  saving.value = true;
  try {
    const earnings: Record<string, number> = {
      basic_salary: builderForm.basic_salary,
    };

    // Add allowances
    if (builderForm.allowances.hra) earnings.hra = builderForm.allowances.hra;
    if (builderForm.allowances.da) earnings.da = builderForm.allowances.da;
    if (builderForm.allowances.conveyance) earnings.conveyance_allowance = builderForm.allowances.conveyance;
    if (builderForm.allowances.medical) earnings.medical_allowance = builderForm.allowances.medical;
    if (builderForm.allowances.special) earnings.special_allowance = builderForm.allowances.special;
    if (builderForm.allowances.other) earnings.other_allowance = builderForm.allowances.other;

    // Add custom earnings
    builderForm.customEarnings.forEach((e) => {
      if (e.name && e.amount) {
        earnings[e.name.toLowerCase().replace(/\s+/g, '_')] = e.amount;
      }
    });

    const deductions: Record<string, number> = {};
    // Add fixed deductions
    const pfAmount = (builderForm.basic_salary * (builderForm.deductions.provident_fund || 0)) / 100;
    if (pfAmount > 0) deductions.provident_fund = pfAmount;
    if (builderForm.deductions.professional_tax) deductions.professional_tax = builderForm.deductions.professional_tax;
    if (builderForm.deductions.income_tax) deductions.income_tax = builderForm.deductions.income_tax;
    if (builderForm.deductions.health_insurance) deductions.health_insurance = builderForm.deductions.health_insurance;
    if (builderForm.deductions.other) deductions.other = builderForm.deductions.other;

    // Add custom deductions
    builderForm.customDeductions.forEach((d) => {
      if (d.name && d.amount) {
        deductions[d.name.toLowerCase().replace(/\s+/g, '_')] = d.amount;
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('salary_structures') as any).insert({
      company_id: companyId,
      employee_id: builderForm.employee_id,
      name: builderForm.name,
      basic_salary: builderForm.basic_salary,
      hra: builderForm.allowances.hra || null,
      da: builderForm.allowances.da || null,
      conveyance_allowance: builderForm.allowances.conveyance || null,
      medical_allowance: builderForm.allowances.medical || null,
      special_allowance: builderForm.allowances.special || null,
      other_allowance: builderForm.allowances.other || null,
      pf: builderForm.deductions.provident_fund || null,
      professional_tax: builderForm.deductions.professional_tax || null,
      tax_deduction: builderForm.deductions.income_tax || null,
      earnings,
      total_earnings: calculateTotalEarnings.value,
      deductions,
      total_deductions: calculateTotalDeductions.value,
      gross_salary: calculateTotalEarnings.value,
      net_salary: calculateNetSalary.value,
      payment_frequency: builderForm.payment_frequency,
      effective_from: builderForm.effective_from,
      is_active: builderForm.is_active,
    });

    $q.notify({ type: 'positive', message: 'Salary structure created successfully' });
    builderDialog.value = false;
    void fetchData();
  } catch (error) {
    console.error('Error saving structure:', error);
    $q.notify({ type: 'negative', message: 'Failed to save salary structure' });
  } finally {
    saving.value = false;
  }
};

const editStructure = (structure: SalaryStructure) => {
  // Load existing structure into builder form
  builderForm.employee_id = structure.employee_id;
  builderForm.name = structure.name;
  builderForm.basic_salary = structure.basic_salary;
  builderForm.payment_frequency = structure.payment_frequency;
  builderForm.effective_from = structure.effective_from;
  builderForm.is_active = structure.is_active;

  // Load allowances
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  builderForm.allowances.hra = (structure as any).hra || 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  builderForm.allowances.da = (structure as any).da || 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  builderForm.allowances.conveyance = (structure as any).conveyance_allowance || 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  builderForm.allowances.medical = (structure as any).medical_allowance || 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  builderForm.allowances.special = (structure as any).special_allowance || 0;

  // Load deductions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  builderForm.deductions.provident_fund = (structure as any).pf || 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  builderForm.deductions.professional_tax = (structure as any).professional_tax || 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  builderForm.deductions.income_tax = (structure as any).tax_deduction || 0;

  // Load custom components
  builderForm.customEarnings = Object.entries(structure.earnings || {})
    .filter(([key]) => !['basic_salary', 'hra', 'da', 'conveyance_allowance', 'medical_allowance', 'special_allowance', 'other_allowance'].includes(key))
    .map(([key, amount]) => ({ name: formatComponentName(key), amount }));

  builderForm.customDeductions = Object.entries(structure.deductions || {})
    .filter(([key]) => !['provident_fund', 'professional_tax', 'tax_deduction'].includes(key))
    .map(([key, amount]) => ({ name: formatComponentName(key), amount }));

  builderDialog.value = true;
};

const confirmDelete = (structure: SalaryStructure) => {
  $q.dialog({
    title: 'Delete Salary Structure',
    message: `Are you sure you want to delete the salary structure for ${structure.employee?.full_name || 'this employee'}?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('salary_structures') as any).delete().eq('id', structure.id);
      $q.notify({ type: 'positive', message: 'Salary structure deleted' });
      void fetchData();
    } catch (error) {
      console.error('Error deleting structure:', error);
      $q.notify({ type: 'negative', message: 'Failed to delete structure' });
    }
  });
};

onMounted(fetchData);
</script>

<style lang="scss" scoped>
.salary-builder-page { padding: var(--spacing-5); }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-5); }
.page-title { font-size: 28px; font-weight: 700; margin: 0 0 var(--spacing-1); }
.page-subtitle { font-size: 14px; color: var(--color-gray-500); margin: 0; }
.table-card { border-radius: var(--radius-lg); }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--spacing-6); color: var(--color-gray-400); }
.employee-cell { display: flex; align-items: center; gap: var(--spacing-3); }
.component-preview { display: flex; flex-direction: column; gap: 4px; }
.component-item { display: flex; justify-content: space-between; font-size: 12px; }
.component-name { color: var(--color-gray-600); }
.component-value { font-weight: 500; }
.builder-dialog { max-width: 900px; }
.preview-section { border-radius: var(--radius-md); }
.preview-card { padding: var(--spacing-3); border-radius: var(--radius-md); background: white; margin-bottom: var(--spacing-2); text-align: center; }
.preview-title { font-size: 12px; color: var(--color-gray-500); }
.preview-value { font-size: 24px; font-weight: 700; }
.preview-card-net { background: var(--color-primary); color: white; }
@media (max-width: 600px) {
  .page-header { flex-direction: column; }
}
</style>
