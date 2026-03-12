<template>
  <q-page class="page-class">
    <div class="page-header">
      <div>
        <h1 class="page-title">Pay Slips</h1>
        <p class="page-subtitle">View your salary history</p>
      </div>
    </div>

    <q-card class="table-card">
      <q-card-section class="q-pa-none">
        <q-table :rows="paySlips" :columns="columns" row-key="id" flat :loading="loading">
          <template v-slot:body-cell-period="props">
            <q-td :props="props">
              {{ formatMonth(props.row.period_month) }} {{ props.row.period_year }}
            </q-td>
          </template>
          <template v-slot:body-cell-net_salary="props">
            <q-td :props="props">
              <span class="text-weight-bold">{{ formatCurrency(props.row.net_salary) }}</span>
            </q-td>
          </template>
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.status)" :label="capitalize(props.row.status)" />
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense icon="visibility" @click="viewPaySlip(props.row)">
                <q-tooltip>View Details</q-tooltip>
              </q-btn>
              <q-btn flat dense icon="download" @click="downloadPaySlip(props.row)">
                <q-tooltip>Download</q-tooltip>
              </q-btn>
            </q-td>
          </template>
          <template v-slot:no-data>
            <div class="empty-state">
              <q-icon name="receipt_long" size="48px" color="gray-4" />
              <p>No pay slips available</p>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="detailDialog">
      <q-card class="payslip-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">Pay Slip - {{ selectedSlip ? formatMonth(selectedSlip.period_month) : '' }} {{ selectedSlip?.period_year }}</div>
        </q-card-section>
        <q-card-section v-if="selectedSlip">
          <div class="payslip-section">
            <div class="payslip-row">
              <span class="label">Employee</span>
              <span class="value">{{ authStore.profile?.full_name }}</span>
            </div>
            <div class="payslip-row">
              <span class="label">Pay Period</span>
              <span class="value">{{ formatMonth(selectedSlip.period_month) }} {{ selectedSlip.period_year }}</span>
            </div>
            <div class="payslip-row">
              <span class="label">Payment Date</span>
              <span class="value">{{ selectedSlip.paid_at ? formatDate(selectedSlip.paid_at) : 'Pending' }}</span>
            </div>
          </div>
          <q-separator class="q-my-md" />
          <div class="payslip-section">
            <div class="section-title">Earnings</div>
            <div v-for="(amount, key) in selectedSlip.earnings" :key="key" class="payslip-row">
              <span class="label">{{ formatComponentName(key) }}</span>
              <span class="value">{{ formatCurrency(amount) }}</span>
            </div>
            <div class="payslip-row total">
              <span class="label">Total Earnings</span>
              <span class="value">{{ formatCurrency(selectedSlip.total_earnings) }}</span>
            </div>
          </div>
          <q-separator class="q-my-md" />
          <div class="payslip-section">
            <div class="section-title">Deductions</div>
            <div v-for="(amount, key) in selectedSlip.deductions" :key="key" class="payslip-row">
              <span class="label">{{ formatComponentName(key) }}</span>
              <span class="value text-negative">-{{ formatCurrency(amount) }}</span>
            </div>
            <div class="payslip-row total">
              <span class="label">Total Deductions</span>
              <span class="value text-negative">-{{ formatCurrency(selectedSlip.total_deductions) }}</span>
            </div>
          </div>
          <q-separator class="q-my-md" />
          <div class="payslip-section">
            <div class="payslip-row total final">
              <span class="label">Net Salary</span>
              <span class="value">{{ formatCurrency(selectedSlip.net_salary) }}</span>
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
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';
import type { PaySlip } from 'src/types/models';

const $q = useQuasar();
const authStore = useAuthStore();

const loading = ref(false);
const paySlips = ref<PaySlip[]>([]);
const detailDialog = ref(false);
const selectedSlip = ref<PaySlip | null>(null);
const downloading = ref(false);

const columns = [
  { name: 'period', label: 'Period', field: 'period', align: 'left' as const },
  { name: 'gross', label: 'Gross', field: 'gross_salary', align: 'right' as const, format: (v: number) => formatCurrency(v) },
  { name: 'deductions', label: 'Deductions', field: 'total_deductions', align: 'right' as const, format: (v: number) => formatCurrency(v || 0) },
  { name: 'net_salary', label: 'Net Salary', field: 'net_salary', align: 'right' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount || 0);

const formatMonth = (month: number) =>
  ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month];

const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const formatComponentName = (key: string) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'grey',
    pending: 'orange',
    paid: 'positive',
    cancelled: 'negative',
  };
  return colors[status] || 'grey';
};

const fetchData = async () => {
  const employeeId = authStore.profile?.id;
  if (!employeeId) return;

  loading.value = true;
  const { data } = await supabase.from('pay_slips').select('*').eq('employee_id', employeeId).order('created_at', { ascending: false });
  paySlips.value = (data as PaySlip[]) || [];
  loading.value = false;
};

const viewPaySlip = (slip: PaySlip) => {
  selectedSlip.value = slip;
  detailDialog.value = true;
};

const downloadPaySlip = (slip: PaySlip) => {
  if (!slip) return;

  downloading.value = true;
  try {
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
    downloading.value = false;
    $q.notify({ type: 'positive', message: 'Pay slip downloaded successfully' });
  } catch (error) {
    console.error('Error generating pay slip:', error);
    $q.notify({ type: 'negative', message: 'Failed to generate pay slip. Please try again.' });
    downloading.value = false;
  }
};

const generatePayslipHtml = (slip: PaySlip): string => {
  const company = authStore.company as { name: string; logo_url?: string } | null;
  const companyName = company?.name || 'Company';
  const companyLogo = company?.logo_url;
  const employeeName = authStore.profile?.full_name || 'Employee';
  const employeeCode = authStore.employee?.employee_code || 'N/A';
  const period = formatMonth(slip.period_month) + ' ' + slip.period_year;
  const netSalary = formatCurrency(slip.net_salary);
  const earningsRows = Object.entries(slip.earnings || {}).map(([key, amount]) =>
    '<div class="detail-row"><span class="detail-label">' + formatComponentName(key) + '</span><span class="detail-value">' + formatCurrency(amount) + '</span></div>'
  ).join('');
  const deductionsRows = Object.entries(slip.deductions || {}).map(([key, amount]) =>
    '<div class="detail-row"><span class="detail-label">' + formatComponentName(key) + '</span><span class="detail-value" style="color: #d32f2f;">-' + formatCurrency(amount) + '</span></div>'
  ).join('');

  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Payslip - ' + period + '</title>' +
    '<style>* { margin: 0; padding: 0; box-sizing: border-box; }body { font-family: Inter, Arial, sans-serif; font-size: 12px; color: #333; line-height: 1.6; background: #f5f5f5; }.container { max-width: 700px; margin: 40px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }.header { text-align: center; padding: 30px 20px; border-bottom: 2px solid #eee; }.company-logo { max-width: 80px; max-height: 80px; object-fit: contain; margin-bottom: 15px; }.company-name { font-size: 20px; font-weight: 700; color: #000; margin-bottom: 5px; }.payslip-title { font-size: 14px; color: #666; font-weight: 500; margin-bottom: 20px; }.payslip-period { font-size: 13px; color: #999; }.employee-info { display: flex; justify-content: space-between; padding: 20px; background: #f9f9f9; border-bottom: 1px solid #eee; }.info-item { flex: 1; }.info-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }.info-value { font-size: 14px; font-weight: 600; color: #000; margin-top: 4px; }.content { padding: 30px 20px; }.section-title { font-size: 14px; font-weight: 700; color: #000; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #000; text-transform: uppercase; letter-spacing: 1px; }.section { margin-bottom: 25px; }.detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }.detail-label { color: #666; font-size: 13px; }.detail-value { font-weight: 600; color: #000; }.total-row { display: flex; justify-content: space-between; padding: 15px 10px; background: #f5f5f5; font-weight: 700; }.net-salary-section { background: #000; color: #fff; padding: 25px; text-align: center; }.net-salary-label { font-size: 13px; opacity: 0.9; margin-bottom: 8px; }.net-salary-value { font-size: 28px; font-weight: 700; }.footer { text-align: center; padding: 20px; font-size: 11px; color: #999; border-top: 1px solid #eee; }@media print { .container { box-shadow: none; margin: 0; } }</style></head><body>' +
    '<div class="container">' +
      '<div class="header">' +
        (companyLogo ? '<img src="' + companyLogo + '" class="company-logo" alt="Company Logo" />' : '') +
        '<div class="company-name">' + companyName + '</div>' +
        '<div class="payslip-title">PAYSLIP</div>' +
        '<div class="payslip-period">' + period + '</div>' +
      '</div>' +
      '<div class="employee-info">' +
        '<div class="info-item"><div class="info-label">Employee Name</div><div class="info-value">' + employeeName + '</div></div>' +
        '<div class="info-item" style="text-align: center;"><div class="info-label">Employee ID</div><div class="info-value">' + employeeCode + '</div></div>' +
        '<div class="info-item" style="text-align: right;"><div class="info-label">Generated On</div><div class="info-value">' + new Date().toLocaleDateString() + '</div></div>' +
      '</div>' +
      '<div class="content">' +
        '<div class="section">' +
          '<div class="section-title">Earnings</div>' +
          earningsRows +
          '<div class="total-row"><span class="detail-label">Total Earnings</span><span class="detail-value">' + formatCurrency(slip.total_earnings) + '</span></div>' +
        '</div>' +
        '<div class="section">' +
          '<div class="section-title">Deductions</div>' +
          deductionsRows +
          '<div class="total-row"><span class="detail-label">Total Deductions</span><span class="detail-value" style="color: #d32f2f;">-' + formatCurrency(slip.total_deductions) + '</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="net-salary-section">' +
        '<div class="net-salary-label">Net Salary (Take Home)</div>' +
        '<div class="net-salary-value">' + netSalary + '</div>' +
      '</div>' +
      '<div class="footer">This is a computer-generated payslip. Generated on ' + new Date().toLocaleString() + '</div>' +
    '</div>' +
    '</body></html>';
};

onMounted(() => {
  void fetchData();
});
</script>

<style lang="scss" scoped>
.page-class { padding: var(--spacing-5); }
.page-header { margin-bottom: var(--spacing-5); }
.page-title { font-size: 28px; font-weight: 700; margin: 0 0 var(--spacing-1); }
.page-subtitle { font-size: 14px; color: var(--color-gray-500); margin: 0; }
.table-card { border-radius: var(--radius-lg); }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--spacing-6); color: var(--color-gray-400); }
.payslip-dialog { min-width: 500px; border-radius: var(--radius-xl); max-width: 90vw; }
.dialog-header { border-bottom: 1px solid var(--color-gray-100); }
.payslip-section { }
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
</style>
