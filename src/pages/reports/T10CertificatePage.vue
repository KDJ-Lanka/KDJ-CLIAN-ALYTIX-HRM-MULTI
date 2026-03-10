<template>
  <q-page class="t10-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">T10 Certificate (APIT Deduction)</h1>
        <p class="page-subtitle">Generate APIT deduction certificates for Sri Lankan tax compliance</p>
      </div>
      <q-btn flat icon="arrow_back" label="Back to Reports" no-caps @click="goBack" />
    </div>

    <q-card class="form-card">
      <q-card-section>
        <q-form @submit="generateCertificate" class="q-gutter-md">
          <div class="text-subtitle1 q-mb-md">Select Employee & Year</div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.employee_id"
                :options="employeeOptions"
                label="Employee *"
                outlined
                dense
                emit-value
                map-options
                :rules="[v => !!v || 'Required']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="form.year"
                :options="yearOptions"
                label="Tax Year *"
                outlined
                dense
                emit-value
                map-options
                :rules="[v => !!v || 'Required']"
              />
            </div>
          </div>

          <q-btn label="Generate Certificate" color="black" type="submit" :loading="loading" no-caps />
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Certificate Preview -->
    <q-card v-if="certificateData" class="certificate-card q-mt-md">
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h6">T10 Certificate Preview</div>
          <div class="row q-gutter-sm">
            <q-btn label="Print" icon="print" color="black" no-caps @click="printCertificate" />
            <q-btn label="Download PDF" icon="download" color="primary" no-caps @click="downloadPDF" />
          </div>
        </div>

        <div id="certificate-content" class="certificate-content">
          <div class="certificate-header">
            <div class="certificate-logo">
              <q-icon v-if="companyData.logo_url" size="64px">
                <img :src="companyData.logo_url" alt="Company Logo" />
              </q-icon>
              <q-icon v-else name="business" size="64px" color="grey-5" />
            </div>
            <div class="certificate-title">
              <h1>TAX CERTIFICATE</h1>
              <h2>(Pay-As-You-Earn Tax - APIT)</h2>
              <div class="certificate-subtitle">Form T10 - Sri Lanka</div>
            </div>
          </div>

          <div class="certificate-divider"></div>

          <div class="certificate-section">
            <div class="section-title">Employer Details</div>
            <div class="details-grid">
              <div class="detail-row">
                <span class="detail-label">Employer Name:</span>
                <span class="detail-value">{{ companyData.name }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Employer Address:</span>
                <span class="detail-value">{{ companyData.address || 'N/A' }}, {{ companyData.city || '' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Tax Registration No (TIN):</span>
                <span class="detail-value">{{ companyData.tax_id || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <div class="certificate-section">
            <div class="section-title">Employee Details</div>
            <div class="details-grid">
              <div class="detail-row">
                <span class="detail-label">Employee Name:</span>
                <span class="detail-value">{{ certificateData.employee_name }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">NIC Number:</span>
                <span class="detail-value">{{ certificateData.nic_number || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Employee Tax No (TIN):</span>
                <span class="detail-value">{{ certificateData.employee_tin || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <div class="certificate-section">
            <div class="section-title">APIT Deduction Summary for Year {{ form.year }}</div>
            <q-table
              :rows="certificateData.monthly_deductions"
              :columns="deductionColumns"
              row-key="month"
              flat
              bordered
              dense
              hide-pagination
              :rows-per-page-options="[0]"
              class="deduction-table"
            />
            <div class="summary-total">
              <div class="total-row">
                <span>Total APIT Deducted for the Year:</span>
                <span class="total-value">{{ formatCurrency(certificateData.total_deduction) }}</span>
              </div>
            </div>
          </div>

          <div class="certificate-footer">
            <div class="certificate-note">
              This certificate is issued under section 99 of the Inland Revenue Act No. 10 of 2006 as amended.
              <br />This is a computer-generated document and does not require a signature.
            </div>
            <div class="certificate-date">
              Date of Issue: {{ formatDate(new Date().toISOString()) }}
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const loading = ref(false);
const employees = ref<any[]>([]);
const companyData = ref<Record<string, string>>({});
const certificateData = ref<any>(null);

const form = reactive({
  employee_id: '',
  year: new Date().getFullYear(),
});

const yearOptions = [
  { label: '2025', value: 2025 },
  { label: '2024', value: 2024 },
  { label: '2023', value: 2023 },
  { label: '2022', value: 2022 },
];

const deductionColumns = [
  { name: 'month', label: 'Month', field: 'month', align: 'left' as const },
  { name: 'basic_salary', label: 'Basic Salary', field: 'basic_salary', align: 'right' as const, format: (val: number) => formatCurrency(val) },
  { name: 'taxable_income', label: 'Taxable Income', field: 'taxable_income', align: 'right' as const, format: (val: number) => formatCurrency(val) },
  { name: 'apit_rate', label: 'APIT Rate', field: 'apit_rate', align: 'center' as const, format: (val: number) => `${val}%` },
  { name: 'apit_deduction', label: 'APIT Deducted', field: 'apit_deduction', align: 'right' as const, format: (val: number) => formatCurrency(val) },
];

const employeeOptions = computed(() =>
  employees.value.map((e) => ({
    label: `${e.profile?.full_name || 'Unknown'} (${e.employee_code})`,
    value: e.id,
  }))
);

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount || 0);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const goBack = () => {
  void router.push({ name: 'reports' });
};

const fetchEmployees = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;

  try {
    const { data } = await supabase
      .from('employees')
      .select('id, employee_code, profiles!employees_profile_id_fkey(full_name, nic_number)')
      .eq('company_id', companyId)
      .eq('status', 'active');

    employees.value = (data || []) as any[];
  } catch (error) {
    console.error('Error fetching employees:', error);
  }
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

const generateCertificate = async () => {
  loading.value = true;
  try {
    const companyId = authStore.company?.id;
    if (!companyId) return;

    // Fetch employee details
    const employee = employees.value.find((e) => e.id === form.employee_id);
    if (!employee) throw new Error('Employee not found');

    // Fetch payroll data for the selected year
    const { data: payrollData } = await supabase
      .from('pay_slips')
      .select('*')
      .eq('employee_id', form.employee_id)
      .gte('pay_period', `${form.year}-01-01`)
      .lt('pay_period', `${form.year + 1}-01-01`)
      .order('pay_period', { ascending: true });

    // Generate monthly deductions data
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const monthly_deductions = monthNames.map((month, index) => {
        const monthData = payrollData?.find((p: any) => {
        const monthNum = new Date(p.pay_period).getMonth();
        return monthNum === index;
      });

      return {
        month,
            basic_salary: (monthData as any)?.basic_salary || 0,
            taxable_income: (monthData as any)?.gross_salary || 0,
            apit_rate: (monthData as any)?.tax_deduction ? Math.round(((monthData as any).tax_deduction / (monthData as any).gross_salary) * 100) : 0,
            apit_deduction: (monthData as any)?.tax_deduction || 0,
      };
    });

    const total_deduction = monthly_deductions.reduce((sum, m) => sum + m.apit_deduction, 0);

    certificateData.value = {
      employee_name: employee.profile?.full_name || 'N/A',
      nic_number: employee.profile?.nic_number || null,
      employee_tin: null, // Would come from employee profile
      monthly_deductions,
      total_deduction,
    };

    $q.notify({ type: 'positive', message: 'Certificate generated successfully' });
  } catch (error) {
    console.error('Error generating certificate:', error);
    $q.notify({ type: 'negative', message: 'Failed to generate certificate' });
  } finally {
    loading.value = false;
  }
};

const printCertificate = () => {
  const content = document.getElementById('certificate-content');
  if (!content) return;

  const printWindow = window.open('', '', 'height=600,width=800');
  if (!printWindow) return;

  printWindow.document.write('<html><head><title>T10 Certificate</title>');
  printWindow.document.write('<style>');
  printWindow.document.write(`
    body { font-family: Arial, sans-serif; padding: 20px; }
    .certificate-header { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; }
    .certificate-logo img { width: 80px; height: 80px; object-fit: contain; }
    .certificate-title h1 { margin: 0; font-size: 24px; text-align: center; }
    .certificate-title h2 { margin: 5px 0; font-size: 16px; text-align: center; font-weight: normal; }
    .certificate-subtitle { text-align: center; font-size: 14px; color: #666; }
    .certificate-divider { border-top: 2px solid #333; margin: 20px 0; }
    .certificate-section { margin: 20px 0; }
    .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; }
    .details-grid { display: grid; gap: 8px; }
    .detail-row { display: flex; }
    .detail-label { width: 200px; font-weight: 500; }
    .detail-value { flex: 1; }
    .deduction-table { margin: 15px 0; }
    .summary-total { margin-top: 15px; }
    .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; }
    .total-value { color: #1976d2; }
    .certificate-footer { margin-top: 30px; }
    .certificate-note { font-size: 12px; color: #666; margin-bottom: 10px; }
    .certificate-date { font-weight: bold; }
  `);
  printWindow.document.write('</style></head><body>');
  printWindow.document.write(content.innerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
};

const downloadPDF = () => {
  $q.notify({ type: 'info', message: 'PDF download feature - Use Print to PDF option' });
};

onMounted(async () => {
  await fetchEmployees();
  await fetchCompanyData();
});
</script>

<style lang="scss" scoped>
.t10-page { padding: var(--spacing-5); }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-5); }
.page-title { font-size: 28px; font-weight: 700; margin: 0 0 var(--spacing-1); }
.page-subtitle { font-size: 14px; color: var(--color-gray-500); margin: 0; }

.form-card, .certificate-card { border-radius: var(--radius-lg); }

.certificate-content {
  background: white;
  padding: var(--spacing-6);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
}

.certificate-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-5);
  margin-bottom: var(--spacing-6);
}

.certificate-logo {
  flex-shrink: 0;
  width: 80px;
  height: 80px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.certificate-title {
  flex: 1;
  text-align: center;

  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: var(--color-primary);
  }

  h2 {
    margin: 4px 0 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--color-gray-600);
  }

  .certificate-subtitle {
    font-size: 14px;
    color: var(--color-gray-500);
    margin-top: 4px;
  }
}

.certificate-divider {
  border-top: 2px solid var(--color-gray-300);
  margin: var(--spacing-5) 0;
}

.certificate-section {
  margin: var(--spacing-5) 0;
}

.section-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: var(--spacing-3);
  color: var(--color-gray-800);
}

.details-grid {
  display: grid;
  gap: var(--spacing-2);
}

.detail-row {
  display: flex;
  align-items: flex-start;
}

.detail-label {
  width: 200px;
  font-weight: 500;
  color: var(--color-gray-700);
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  color: var(--color-gray-900);
}

.deduction-table {
  margin: var(--spacing-4) 0;
}

.summary-total {
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-3);
  border-top: 2px solid var(--color-gray-200);
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  font-size: 16px;
}

.total-value {
  color: var(--color-primary);
}

.certificate-footer {
  margin-top: var(--spacing-6);
}

.certificate-note {
  font-size: 12px;
  color: var(--color-gray-500);
  line-height: 1.5;
  margin-bottom: var(--spacing-3);
}

.certificate-date {
  font-weight: 600;
  color: var(--color-gray-700);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: var(--spacing-3);
  }

  .certificate-header {
    flex-direction: column;
    text-align: center;
  }

  .detail-row {
    flex-direction: column;
  }

  .detail-label {
    width: 100%;
  }
}
</style>
