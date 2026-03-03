<template>
  <q-page class="epf-etf-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">EPF & ETF Forms</h1>
        <p class="page-subtitle">Generate Employees' Provident Fund and Employees' Trust Fund statutory forms</p>
      </div>
      <q-btn flat icon="arrow_back" label="Back to Reports" no-caps @click="goBack" />
    </div>

    <q-card class="form-card">
      <q-card-section>
        <q-form @submit="generateForms" class="q-gutter-md">
          <div class="text-subtitle1 q-mb-md">Form Selection & Period</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.form_type"
                :options="formTypeOptions"
                label="Form Type *"
                outlined
                dense
                emit-value
                map-options
                :rules="[v => !!v || 'Required']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.month"
                :options="monthOptions"
                label="Month *"
                outlined
                dense
                emit-value
                map-options
                :rules="[v => !!v || 'Required']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.year"
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

          <q-btn label="Generate Forms" color="black" type="submit" :loading="loading" no-caps />
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Forms Preview -->
    <q-card v-if="formsData" class="forms-card q-mt-md">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">{{ formsData.title }} - {{ monthOptions.find(m => m.value === form.month)?.label }} {{ form.year }}</div>
          <div class="row q-gutter-sm">
            <q-btn label="Print" icon="print" color="black" no-caps @click="printForms" />
            <q-btn label="Download PDF" icon="download" color="primary" no-caps @click="downloadPDF" />
          </div>
        </div>

        <!-- EPF Form (Form C) -->
        <div v-if="form.form_type === 'epf' || form.form_type === 'both'" class="form-section">
          <div id="epf-form-content" class="form-content">
            <div class="form-header">
              <div class="form-logo">
                <q-icon v-if="companyData.logo_url" size="48px">
                  <img :src="companyData.logo_url" alt="Company Logo" />
                </q-icon>
                <q-icon v-else name="business" size="48px" color="grey-5" />
              </div>
              <div class="form-title">
                <h1>Employees' Provident Fund</h1>
                <h2>Form C - Contribution Return</h2>
                <div class="form-subtitle">Sri Lanka Department of Labour</div>
              </div>
            </div>

            <div class="form-divider"></div>

            <div class="employer-section">
              <div class="section-title">Employer Details</div>
              <div class="details-grid compact">
                <div class="detail-row">
                  <span class="detail-label">Employer Name:</span>
                  <span class="detail-value">{{ companyData.name }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Employer Address:</span>
                  <span class="detail-value">{{ companyData.address || 'N/A' }}, {{ companyData.city || '' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">EPF Employer No:</span>
                  <span class="detail-value">{{ companyData.epf_number || 'N/A' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Period:</span>
                  <span class="detail-value">{{ monthOptions.find(m => m.value === form.month)?.label }} {{ form.year }}</span>
                </div>
              </div>
            </div>

            <div class="form-divider"></div>

            <div class="contributions-section">
              <div class="section-title">Employee Contributions Summary</div>
              <q-table
                :rows="formsData.epf_data.employee_contributions"
                :columns="epfColumns"
                row-key="id"
                flat
                bordered
                dense
                hide-pagination
                :rows-per-page-options="[0]"
                class="contribution-table"
              />
            </div>

            <div class="totals-section">
              <div class="totals-grid">
                <div class="total-box">
                  <div class="total-label">Total Employee Share (8%)</div>
                  <div class="total-value">{{ formatCurrency(formsData.epf_data.total_employee_share) }}</div>
                </div>
                <div class="total-box">
                  <div class="total-label">Total Employer Share (12%)</div>
                  <div class="total-value">{{ formatCurrency(formsData.epf_data.total_employer_share) }}</div>
                </div>
                <div class="total-box highlight">
                  <div class="total-label">Total EPF Contribution (20%)</div>
                  <div class="total-value">{{ formatCurrency(formsData.epf_data.total_contribution) }}</div>
                </div>
              </div>
            </div>

            <div class="form-footer">
              <div class="form-note">
                This form should be submitted to the Department of Labour on or before the 15th of the following month.
                <br />Penalty will be charged for late submissions.
              </div>
            </div>
          </div>
        </div>

        <!-- ETF Form (Form ETF 3) -->
        <div v-if="form.form_type === 'etf' || form.form_type === 'both'" class="form-section q-mt-lg">
          <div id="etf-form-content" class="form-content">
            <div class="form-header">
              <div class="form-logo">
                <q-icon v-if="companyData.logo_url" size="48px">
                  <img :src="companyData.logo_url" alt="Company Logo" />
                </q-icon>
                <q-icon v-else name="business" size="48px" color="grey-5" />
              </div>
              <div class="form-title">
                <h1>Employees' Trust Fund</h1>
                <h2>Form ETF 3 - Monthly Return</h2>
                <div class="form-subtitle">Sri Lanka Department of Labour</div>
              </div>
            </div>

            <div class="form-divider"></div>

            <div class="employer-section">
              <div class="section-title">Employer Details</div>
              <div class="details-grid compact">
                <div class="detail-row">
                  <span class="detail-label">Employer Name:</span>
                  <span class="detail-value">{{ companyData.name }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Employer Address:</span>
                  <span class="detail-value">{{ companyData.address || 'N/A' }}, {{ companyData.city || '' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">ETF Employer No:</span>
                  <span class="detail-value">{{ companyData.etf_number || 'N/A' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Period:</span>
                  <span class="detail-value">{{ monthOptions.find(m => m.value === form.month)?.label }} {{ form.year }}</span>
                </div>
              </div>
            </div>

            <div class="form-divider"></div>

            <div class="contributions-section">
              <div class="section-title">Employee Contributions Summary</div>
              <q-table
                :rows="formsData.etf_data.employee_contributions"
                :columns="etfColumns"
                row-key="id"
                flat
                bordered
                dense
                hide-pagination
                :rows-per-page-options="[0]"
                class="contribution-table"
              />
            </div>

            <div class="totals-section">
              <div class="totals-grid">
                <div class="total-box highlight full-width">
                  <div class="total-label">Total ETF Contribution (3%)</div>
                  <div class="total-value">{{ formatCurrency(formsData.etf_data.total_contribution) }}</div>
                </div>
              </div>
            </div>

            <div class="form-footer">
              <div class="form-note">
                This form should be submitted to the Employees' Trust Fund Board on or before the last day of the following month.
                <br />Penalty will be charged for late submissions.
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const loading = ref(false);
const companyData = ref<Record<string, string>>({});
const formsData = ref<any>(null);

const form = reactive({
  form_type: 'both',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
});

const formTypeOptions = [
  { label: 'EPF Form (Form C)', value: 'epf' },
  { label: 'ETF Form (Form ETF 3)', value: 'etf' },
  { label: 'Both Forms', value: 'both' },
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

const yearOptions = [
  { label: '2025', value: 2025 },
  { label: '2024', value: 2024 },
  { label: '2023', value: 2023 },
];

const epfColumns = [
  { name: 'name', label: 'Employee Name', field: 'name', align: 'left' as const },
  { name: 'nic', label: 'NIC No', field: 'nic', align: 'left' as const },
  { name: 'basic_salary', label: 'Basic Salary', field: 'basic_salary', align: 'right' as const, format: (val: number) => formatCurrency(val) },
  { name: 'employee_share', label: 'Employee Share (8%)', field: 'employee_share', align: 'right' as const, format: (val: number) => formatCurrency(val) },
  { name: 'employer_share', label: 'Employer Share (12%)', field: 'employer_share', align: 'right' as const, format: (val: number) => formatCurrency(val) },
  { name: 'total', label: 'Total (20%)', field: 'total', align: 'right' as const, format: (val: number) => formatCurrency(val) },
];

const etfColumns = [
  { name: 'name', label: 'Employee Name', field: 'name', align: 'left' as const },
  { name: 'nic', label: 'NIC No', field: 'nic', align: 'left' as const },
  { name: 'basic_salary', label: 'Basic Salary', field: 'basic_salary', align: 'right' as const, format: (val: number) => formatCurrency(val) },
  { name: 'etf_contribution', label: 'ETF Contribution (3%)', field: 'etf_contribution', align: 'right' as const, format: (val: number) => formatCurrency(val) },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount || 0);

const goBack = () => {
  void router.push({ name: 'reports' });
};

const fetchCompanyData = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;

  try {
    const { data } = await supabase.from('companies').select('*').eq('id', companyId).single();
    companyData.value = data || {};
  } catch (error) {
    console.error('Error fetching company data:', error);
  }
};

const generateForms = async () => {
  loading.value = true;
  try {
    const companyId = authStore.company?.id;
    if (!companyId) return;

    // Calculate pay period range
    const startDate = `${form.year}-${String(form.month).padStart(2, '0')}-01`;
    const endDate = form.month === 12
      ? `${form.year + 1}-01-01`
      : `${form.year}-${String(form.month + 1).padStart(2, '0')}-01`;

    // Fetch employees with their salary structures and pay slips
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: employeesData } = await (supabase
      .from('employees') as any)
      .select('id, employee_code, profiles!employees_profile_id_fkey(full_name, nic_number)')
      .eq('company_id', companyId)
      .eq('status', 'active');

    if (!employeesData) throw new Error('No employees found');

    // Fetch pay slips for the selected period
    const { data: paySlips } = await supabase
      .from('pay_slips')
      .select('*')
      .eq('company_id', companyId)
      .gte('pay_period', startDate)
      .lt('pay_period', endDate);

    const epfEmployeeContributions: any[] = [];
    const etfEmployeeContributions: any[] = [];
    let totalEmployeeShare = 0;
    let totalEmployerShare = 0;
    let totalEtfContribution = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const employee of employeesData as any[]) {
      // Get pay slip for this employee
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const employeePaySlip = paySlips?.find((p: any) => p.employee_id === employee.id) as any;
      const basicSalary = employeePaySlip?.basic_salary || 0;

      // Calculate EPF contributions (8% employee, 12% employer)
      const employeeShare = Math.round(basicSalary * 0.08);
      const employerShare = Math.round(basicSalary * 0.12);
      const totalEpf = employeeShare + employerShare;

      // Calculate ETF contribution (3% employer only)
      const etfContribution = Math.round(basicSalary * 0.03);

      if (basicSalary > 0) {
        // Add to EPF data
        epfEmployeeContributions.push({
          id: employee.id,
          name: employee.profiles?.full_name || 'N/A',
          nic: employee.profiles?.nic_number || 'N/A',
          basic_salary: basicSalary,
          employee_share: employeeShare,
          employer_share: employerShare,
          total: totalEpf,
        });

        totalEmployeeShare += employeeShare;
        totalEmployerShare += employerShare;

        // Add to ETF data
        etfEmployeeContributions.push({
          id: employee.id,
          name: employee.profiles?.full_name || 'N/A',
          nic: employee.profiles?.nic_number || 'N/A',
          basic_salary: basicSalary,
          etf_contribution: etfContribution,
        });

        totalEtfContribution += etfContribution;
      }
    }

    let title = '';
    if (form.form_type === 'epf') title = 'EPF Form C';
    else if (form.form_type === 'etf') title = 'ETF Form ETF 3';
    else title = 'EPF & ETF Forms';

    formsData.value = {
      title,
      epf_data: {
        employee_contributions: epfEmployeeContributions,
        total_employee_share: totalEmployeeShare,
        total_employer_share: totalEmployerShare,
        total_contribution: totalEmployeeShare + totalEmployerShare,
      },
      etf_data: {
        employee_contributions: etfEmployeeContributions,
        total_contribution: totalEtfContribution,
      },
    };

    $q.notify({ type: 'positive', message: 'Forms generated successfully' });
  } catch (error) {
    console.error('Error generating forms:', error);
    $q.notify({ type: 'negative', message: 'Failed to generate forms' });
  } finally {
    loading.value = false;
  }
};

const printForms = () => {
  const epfContent = document.getElementById('epf-form-content');
  const etfContent = document.getElementById('etf-form-content');

  const printWindow = window.open('', '', 'height=800,width=1000');
  if (!printWindow) return;

  printWindow.document.write('<html><head><title>EPF & ETF Forms</title>');
  printWindow.document.write('<style>');
  printWindow.document.write(`
    body { font-family: Arial, sans-serif; padding: 20px; }
    .form-section { margin-bottom: 40px; page-break-after: always; }
    .form-header { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
    .form-logo img { width: 60px; height: 60px; object-fit: contain; }
    .form-title h1 { margin: 0; font-size: 20px; text-align: center; }
    .form-title h2 { margin: 5px 0; font-size: 14px; text-align: center; font-weight: normal; }
    .form-subtitle { text-align: center; font-size: 12px; color: #666; }
    .form-divider { border-top: 1px solid #ccc; margin: 15px 0; }
    .employer-section { margin: 15px 0; }
    .section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; }
    .details-grid.compact .detail-row { font-size: 12px; }
    .detail-row { display: flex; margin: 5px 0; }
    .detail-label { width: 180px; font-weight: 500; }
    .detail-value { flex: 1; }
    .contribution-table { font-size: 11px; }
    .totals-section { margin: 20px 0; }
    .totals-grid { display: flex; gap: 15px; flex-wrap: wrap; }
    .total-box { flex: 1; min-width: 180px; padding: 12px; background: #f5f5f5; border-radius: 4px; text-align: center; }
    .total-box.highlight { background: #e3f2fd; border: 1px solid #2196f3; }
    .total-box.full-width { width: 100%; }
    .total-label { font-size: 12px; color: #666; margin-bottom: 5px; }
    .total-value { font-size: 16px; font-weight: bold; color: #1976d2; }
    .form-footer { margin-top: 20px; }
    .form-note { font-size: 11px; color: #666; line-height: 1.4; }
    @media print { .form-section { page-break-after: always; } }
  `);
  printWindow.document.write('</style></head><body>');

  if (epfContent) {
    printWindow.document.write('<div class="form-section">');
    printWindow.document.write(epfContent.innerHTML);
    printWindow.document.write('</div>');
  }

  if (etfContent) {
    printWindow.document.write('<div class="form-section">');
    printWindow.document.write(etfContent.innerHTML);
    printWindow.document.write('</div>');
  }

  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
};

const downloadPDF = () => {
  $q.notify({ type: 'info', message: 'PDF download feature - Use Print to PDF option' });
};

onMounted(async () => {
  await fetchCompanyData();
});
</script>

<style lang="scss" scoped>
.epf-etf-page { padding: var(--spacing-5); }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-5); }
.page-title { font-size: 28px; font-weight: 700; margin: 0 0 var(--spacing-1); }
.page-subtitle { font-size: 14px; color: var(--color-gray-500); margin: 0; }

.form-card, .forms-card { border-radius: var(--radius-lg); }
.form-section { border: 1px solid var(--color-gray-200); border-radius: var(--radius-md); padding: var(--spacing-5); }

.form-content {
  background: white;
}

.form-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-5);
}

.form-logo {
  flex-shrink: 0;
  width: 60px;
  height: 60px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.form-title {
  flex: 1;
  text-align: center;

  h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--color-primary);
  }

  h2 {
    margin: 4px 0 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-gray-600);
  }

  .form-subtitle {
    font-size: 12px;
    color: var(--color-gray-500);
    margin-top: 4px;
  }
}

.form-divider {
  border-top: 1px solid var(--color-gray-300);
  margin: var(--spacing-4) 0;
}

.employer-section {
  margin: var(--spacing-4) 0;
}

.section-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: var(--spacing-2);
  color: var(--color-gray-800);
}

.details-grid {
  display: grid;
  gap: var(--spacing-2);

  &.compact {
    .detail-row {
      font-size: 13px;
    }
  }
}

.detail-row {
  display: flex;
  align-items: flex-start;
}

.detail-label {
  width: 180px;
  font-weight: 500;
  color: var(--color-gray-700);
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  color: var(--color-gray-900);
}

.contributions-section {
  margin: var(--spacing-4) 0;
}

.contribution-table {
  margin: var(--spacing-3) 0;
}

.totals-section {
  margin: var(--spacing-5) 0;
}

.totals-grid {
  display: flex;
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

.total-box {
  flex: 1;
  min-width: 180px;
  padding: var(--spacing-3);
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
  text-align: center;

  &.highlight {
    background: #e3f2fd;
    border: 1px solid var(--color-primary);
  }

  &.full-width {
    width: 100%;
  }
}

.total-label {
  font-size: 12px;
  color: var(--color-gray-600);
  margin-bottom: var(--spacing-1);
}

.total-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
}

.form-footer {
  margin-top: var(--spacing-5);
}

.form-note {
  font-size: 11px;
  color: var(--color-gray-500);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .form-header {
    flex-direction: column;
    text-align: center;
  }

  .detail-row {
    flex-direction: column;
  }

  .detail-label {
    width: 100%;
  }

  .totals-grid {
    flex-direction: column;
  }

  .total-box {
    width: 100%;
  }
}

@media print {
  .form-section {
    page-break-after: always;
  }
}
</style>
