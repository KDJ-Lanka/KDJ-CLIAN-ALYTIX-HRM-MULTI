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
              {{ formatMonth(props.row.pay_period_month) }} {{ props.row.pay_period_year }}
            </q-td>
          </template>
          <template v-slot:body-cell-net_salary="props">
            <q-td :props="props">
              <span class="text-weight-bold">{{ formatCurrency(props.row.net_salary) }}</span>
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
          <div class="text-h6">Pay Slip - {{ selectedSlip ? formatMonth(selectedSlip.pay_period_month) : '' }} {{ selectedSlip?.pay_period_year }}</div>
        </q-card-section>
        <q-card-section v-if="selectedSlip">
          <div class="payslip-section">
            <div class="payslip-row">
              <span class="label">Employee</span>
              <span class="value">{{ authStore.profile?.full_name }}</span>
            </div>
            <div class="payslip-row">
              <span class="label">Pay Period</span>
              <span class="value">{{ formatMonth(selectedSlip.pay_period_month) }} {{ selectedSlip.pay_period_year }}</span>
            </div>
          </div>
          <q-separator class="q-my-md" />
          <div class="payslip-section">
            <div class="section-title">Earnings</div>
            <div class="payslip-row">
              <span class="label">Basic Salary</span>
              <span class="value">{{ formatCurrency(selectedSlip.basic_salary) }}</span>
            </div>
            <div class="payslip-row">
              <span class="label">Allowances</span>
              <span class="value">{{ formatCurrency(selectedSlip.allowances || 0) }}</span>
            </div>
            <div class="payslip-row">
              <span class="label">Overtime</span>
              <span class="value">{{ formatCurrency(selectedSlip.overtime_amount || 0) }}</span>
            </div>
            <div class="payslip-row total">
              <span class="label">Gross Salary</span>
              <span class="value">{{ formatCurrency(selectedSlip.gross_salary) }}</span>
            </div>
          </div>
          <q-separator class="q-my-md" />
          <div class="payslip-section">
            <div class="section-title">Deductions</div>
            <div class="payslip-row">
              <span class="label">Tax</span>
              <span class="value text-negative">-{{ formatCurrency(selectedSlip.tax_deduction || 0) }}</span>
            </div>
            <div class="payslip-row">
              <span class="label">Other Deductions</span>
              <span class="value text-negative">-{{ formatCurrency(selectedSlip.other_deductions || 0) }}</span>
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

const columns = [
  { name: 'period', label: 'Period', field: 'period', align: 'left' as const },
  { name: 'gross', label: 'Gross', field: 'gross_salary', align: 'right' as const, format: (v: number) => formatCurrency(v) },
  { name: 'deductions', label: 'Deductions', field: 'total_deductions', align: 'right' as const, format: (v: number) => formatCurrency(v || 0) },
  { name: 'net_salary', label: 'Net Salary', field: 'net_salary', align: 'right' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
const formatMonth = (month: number) => ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month];

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const downloadPaySlip = (_slip?: PaySlip) => {
  $q.notify({ type: 'info', message: 'Download feature coming soon' });
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
.payslip-dialog { min-width: 450px; border-radius: var(--radius-xl); }
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
