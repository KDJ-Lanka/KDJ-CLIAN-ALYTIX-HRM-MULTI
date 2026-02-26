<template>
  <q-page class="page-class">
    <div class="page-header">
      <div>
        <h1 class="page-title">Salary Structure</h1>
        <p class="page-subtitle">View your compensation details</p>
      </div>
    </div>

    <div class="structure-grid">
      <q-card class="structure-card">
        <q-card-section>
          <div class="card-title">Basic Salary</div>
          <div class="card-value">{{ formatCurrency(salaryStructure?.basic_salary || 0) }}</div>
          <div class="card-label">per month</div>
        </q-card-section>
      </q-card>

      <q-card class="structure-card">
        <q-card-section>
          <div class="card-title">Gross Salary</div>
          <div class="card-value">{{ formatCurrency(calculateGross) }}</div>
          <div class="card-label">per month</div>
        </q-card-section>
      </q-card>

      <q-card class="structure-card">
        <q-card-section>
          <div class="card-title">Annual CTC</div>
          <div class="card-value">{{ formatCurrency(calculateGross * 12) }}</div>
          <div class="card-label">per year</div>
        </q-card-section>
      </q-card>
    </div>

    <q-card class="details-card">
      <q-card-section>
        <div class="section-title">Earnings</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="detail-row">
          <span>Basic Salary</span>
          <span class="text-weight-medium">{{ formatCurrency(salaryStructure?.basic_salary || 0) }}</span>
        </div>
        <div class="detail-row">
          <span>House Rent Allowance (HRA)</span>
          <span class="text-weight-medium">{{ formatCurrency(salaryStructure?.hra || 0) }}</span>
        </div>
        <div class="detail-row">
          <span>Dearness Allowance (DA)</span>
          <span class="text-weight-medium">{{ formatCurrency(salaryStructure?.da || 0) }}</span>
        </div>
        <div class="detail-row">
          <span>Conveyance Allowance</span>
          <span class="text-weight-medium">{{ formatCurrency(salaryStructure?.conveyance_allowance || 0) }}</span>
        </div>
        <div class="detail-row">
          <span>Medical Allowance</span>
          <span class="text-weight-medium">{{ formatCurrency(salaryStructure?.medical_allowance || 0) }}</span>
        </div>
        <div class="detail-row">
          <span>Special Allowance</span>
          <span class="text-weight-medium">{{ formatCurrency(salaryStructure?.special_allowance || 0) }}</span>
        </div>
        <div class="detail-row total">
          <span>Gross Salary</span>
          <span class="text-weight-bold">{{ formatCurrency(calculateGross) }}</span>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="details-card q-mt-md">
      <q-card-section>
        <div class="section-title">Deductions</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div class="detail-row">
          <span>Provident Fund (PF)</span>
          <span class="text-weight-medium text-negative">-{{ formatCurrency(salaryStructure?.pf || 0) }}</span>
        </div>
        <div class="detail-row">
          <span>Professional Tax</span>
          <span class="text-weight-medium text-negative">-{{ formatCurrency(salaryStructure?.professional_tax || 0) }}</span>
        </div>
        <div class="detail-row">
          <span>Income Tax (TDS)</span>
          <span class="text-weight-medium text-negative">-{{ formatCurrency(salaryStructure?.tax_deduction || 0) }}</span>
        </div>
        <div class="detail-row total">
          <span>Total Deductions</span>
          <span class="text-weight-bold text-negative">-{{ formatCurrency(calculateDeductions) }}</span>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="details-card q-mt-md net-card">
      <q-card-section>
        <div class="detail-row">
          <span class="text-h6">Net Salary (Take Home)</span>
          <span class="text-h5 text-weight-bold">{{ formatCurrency(calculateGross - calculateDeductions) }}</span>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';
import type { SalaryStructure } from 'src/types/models';

const authStore = useAuthStore();
const salaryStructure = ref<SalaryStructure | null>(null);

const calculateGross = computed(() => {
  if (!salaryStructure.value) return 0;
  return (
    (salaryStructure.value.basic_salary || 0) +
    (salaryStructure.value.hra || 0) +
    (salaryStructure.value.da || 0) +
    (salaryStructure.value.conveyance_allowance || 0) +
    (salaryStructure.value.medical_allowance || 0) +
    (salaryStructure.value.special_allowance || 0)
  );
});

const calculateDeductions = computed(() => {
  if (!salaryStructure.value) return 0;
  return (
    (salaryStructure.value.pf || 0) +
    (salaryStructure.value.professional_tax || 0) +
    (salaryStructure.value.tax_deduction || 0)
  );
});

const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

const fetchData = async () => {
  const employeeId = authStore.profile?.id;
  if (!employeeId) return;

  const { data } = await supabase.from('salary_structures').select('*').eq('employee_id', employeeId).eq('is_active', true).single();
  salaryStructure.value = data;
};

onMounted(fetchData);
</script>

<style lang="scss" scoped>
.page-class { padding: var(--spacing-5); }
.page-header { margin-bottom: var(--spacing-5); }
.page-title { font-size: 28px; font-weight: 700; margin: 0 0 var(--spacing-1); }
.page-subtitle { font-size: 14px; color: var(--color-gray-500); margin: 0; }
.structure-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-4); margin-bottom: var(--spacing-5); }
.structure-card { border-radius: var(--radius-lg); text-align: center; }
.card-title { font-size: 12px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.5px; }
.card-value { font-size: 28px; font-weight: 700; margin: var(--spacing-2) 0; }
.card-label { font-size: 12px; color: var(--color-gray-400); }
.details-card { border-radius: var(--radius-lg); }
.section-title { font-weight: 600; font-size: 16px; }
.detail-row { display: flex; justify-content: space-between; padding: var(--spacing-2) 0; border-bottom: 1px solid var(--color-gray-100);
  &:last-child { border-bottom: none; }
  &.total { margin-top: var(--spacing-2); padding-top: var(--spacing-3); border-top: 2px solid var(--color-gray-200); border-bottom: none; }
}
.net-card { background: var(--color-gray-50); }
</style>
