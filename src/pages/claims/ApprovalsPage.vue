<template>
  <q-page class="page-class">
    <div class="page-header">
      <div>
        <h1 class="page-title">Claim Approvals</h1>
        <p class="page-subtitle">Review and approve employee claims</p>
      </div>
    </div>

    <q-card class="table-card">
      <q-card-section class="q-pa-none">
        <q-table :rows="claims" :columns="columns" row-key="id" flat :loading="loading">
          <template v-slot:body-cell-employee="props">
            <q-td :props="props">
              <div class="employee-cell">
                <q-avatar size="32px" color="gray-3" text-color="gray-7">{{ getInitials(props.row.employee?.full_name) }}</q-avatar>
                <span class="q-ml-sm">{{ props.row.employee?.full_name || 'Unknown' }}</span>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-amount="props">
            <q-td :props="props">
              <span class="text-weight-medium">{{ formatCurrency(props.row.amount) }}</span>
            </q-td>
          </template>
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.status)" :label="props.row.status" />
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <template v-if="props.row.status === 'pending'">
                <q-btn flat dense color="positive" icon="check" @click="approveClaim(props.row)">
                  <q-tooltip>Approve</q-tooltip>
                </q-btn>
                <q-btn flat dense color="negative" icon="close" @click="rejectClaim(props.row)">
                  <q-tooltip>Reject</q-tooltip>
                </q-btn>
              </template>
              <span v-else class="text-gray-400">-</span>
            </q-td>
          </template>
          <template v-slot:no-data>
            <div class="empty-state">
              <q-icon name="fact_check" size="48px" color="gray-4" />
              <p>No pending claims</p>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';
import type { TravelClaim } from 'src/types/models';

const $q = useQuasar();
const authStore = useAuthStore();

const loading = ref(false);
const claims = ref<TravelClaim[]>([]);

const columns = [
  { name: 'date', label: 'Date', field: 'claim_date', align: 'left' as const },
  { name: 'employee', label: 'Employee', field: 'employee', align: 'left' as const },
  { name: 'type', label: 'Type', field: 'claim_type', align: 'left' as const },
  { name: 'description', label: 'Description', field: 'description', align: 'left' as const },
  { name: 'amount', label: 'Amount', field: 'amount', align: 'right' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

const getStatusColor = (status: string) => ({ pending: 'warning', approved: 'positive', rejected: 'negative', paid: 'blue' }[status] || 'grey');
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
const getInitials = (name: string) => name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?';

const fetchData = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;

  loading.value = true;
  const { data } = await supabase
    .from('travel_claims')
    .select('*, employee:employees(full_name)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  claims.value = (data as TravelClaim[]) || [];
  loading.value = false;
};

const approveClaim = async (item: TravelClaim) => {
  try {
    await supabase.from('travel_claims').update({ status: 'approved', approved_by: authStore.profile?.id } as never).eq('id', item.id);
    $q.notify({ type: 'positive', message: 'Claim approved' });
    void fetchData();
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to approve claim' });
  }
};

const rejectClaim = (item: TravelClaim) => {
  $q.dialog({ title: 'Reject Claim', message: 'Are you sure you want to reject this claim?', cancel: true }).onOk(() => {
    void (async () => {
      try {
        await supabase.from('travel_claims').update({ status: 'rejected', approved_by: authStore.profile?.id } as never).eq('id', item.id);
        $q.notify({ type: 'positive', message: 'Claim rejected' });
        void fetchData();
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to reject claim' });
      }
    })();
  });
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
.employee-cell { display: flex; align-items: center; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--spacing-6); color: var(--color-gray-400); }
</style>
