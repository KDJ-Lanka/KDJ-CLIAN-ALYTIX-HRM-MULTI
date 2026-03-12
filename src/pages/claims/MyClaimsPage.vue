<template>
  <q-page class="page-class">
    <div class="page-header">
      <div>
        <h1 class="page-title">My Claims</h1>
        <p class="page-subtitle">Submit and track reimbursement claims</p>
      </div>
      <q-btn label="New Claim" icon="add" color="black" no-caps @click="openDialog()" />
    </div>

    <q-card class="table-card">
      <q-card-section class="q-pa-none">
        <q-table :rows="claims" :columns="columns" row-key="id" flat :loading="loading">
          <template v-slot:body-cell-type="props">
            <q-td :props="props">
              <q-badge color="gray" :label="props.row.claim_type" />
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
                <q-btn flat dense round icon="more_vert">
                  <q-menu>
                    <q-list>
                      <q-item clickable v-close-popup @click="openDialog(props.row)">
                        <q-item-section avatar><q-icon name="edit" /></q-item-section>
                        <q-item-section>Edit</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="deleteClaim(props.row)" class="text-negative">
                        <q-item-section avatar><q-icon name="delete" /></q-item-section>
                        <q-item-section>Withdraw</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </template>
            </q-td>
          </template>
          <template v-slot:no-data>
            <div class="empty-state">
              <q-icon name="receipt" size="48px" color="gray-4" />
              <p>No claims submitted</p>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialog">
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h6">{{ editingId ? 'Edit' : 'New' }} Claim</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveClaim">
            <q-select v-model="form.claim_type" :options="claimTypes" label="Claim Type *" outlined dense class="q-mb-md" :rules="[v => !!v || 'Required']" />
            <q-input v-model.number="form.amount" label="Amount (Rs) *" type="number" step="0.01" outlined dense class="q-mb-md" :rules="[v => v > 0 || 'Enter valid amount']" />
            <q-input v-model="form.description" label="Description *" outlined dense autogrow class="q-mb-md" :rules="[v => !!v || 'Required']" />
            <q-input v-model="form.claim_date" label="Date *" type="date" outlined dense class="q-mb-md" :rules="[v => !!v || 'Required']" />
            <div class="flex justify-end gap-3">
              <q-btn flat label="Cancel" v-close-popup />
              <q-btn color="black" :label="editingId ? 'Update' : 'Submit'" type="submit" :loading="saving" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';
import type { TravelClaim } from 'src/types/models';

const $q = useQuasar();
const authStore = useAuthStore();

const loading = ref(false);
const saving = ref(false);
const claims = ref<TravelClaim[]>([]);
const dialog = ref(false);
const editingId = ref<string | null>(null);

const claimTypes = ['Travel', 'Meal', 'Equipment', 'Training', 'Medical', 'Other'];

const form = reactive({
  claim_type: '',
  amount: 0,
  description: '',
  claim_date: new Date().toISOString().split('T')[0],
});

const columns = [
  { name: 'date', label: 'Date', field: 'claim_date', align: 'left' as const },
  { name: 'type', label: 'Type', field: 'claim_type', align: 'left' as const },
  { name: 'description', label: 'Description', field: 'description', align: 'left' as const },
  { name: 'amount', label: 'Amount', field: 'amount', align: 'right' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

const getStatusColor = (status: string) => ({ pending: 'warning', approved: 'positive', rejected: 'negative', paid: 'blue' }[status] || 'grey');
const formatCurrency = (amount: number) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount || 0);

const fetchData = async () => {
  const employeeId = authStore.profile?.id;
  if (!employeeId) return;

  loading.value = true;
  const { data } = await supabase.from('travel_claims').select('*').eq('employee_id', employeeId).order('created_at', { ascending: false });
  claims.value = (data as TravelClaim[]) || [];
  loading.value = false;
};

const openDialog = (item?: TravelClaim) => {
  editingId.value = item?.id || null;
  form.claim_type = item?.claim_type || '';
  form.amount = item?.amount || 0;
  form.description = item?.description || '';
  form.claim_date = item?.claim_date || new Date().toISOString().split('T')[0];
  dialog.value = true;
};

const saveClaim = async () => {
  const employeeId = authStore.profile?.id;
  const companyId = authStore.company?.id;
  if (!employeeId || !companyId) return;

  saving.value = true;
  try {
    if (editingId.value) {
      await supabase.from('travel_claims').update({
        claim_type: form.claim_type,
        amount: form.amount,
        description: form.description,
        claim_date: form.claim_date,
      } as never).eq('id', editingId.value);
      $q.notify({ type: 'positive', message: 'Claim updated' });
    } else {
      await supabase.from('travel_claims').insert({
        claim_type: form.claim_type,
        amount: form.amount,
        description: form.description,
        claim_date: form.claim_date,
        employee_id: employeeId,
        company_id: companyId,
        status: 'pending',
      } as never);
      $q.notify({ type: 'positive', message: 'Claim submitted' });
    }
    dialog.value = false;
    void fetchData();
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to save claim' });
  } finally {
    saving.value = false;
  }
};

const deleteClaim = (item: TravelClaim) => {
  $q.dialog({ title: 'Withdraw Claim', message: 'Are you sure you want to withdraw this claim?', cancel: true }).onOk(() => {
    void supabase.from('travel_claims').delete().eq('id', item.id);
    $q.notify({ type: 'positive', message: 'Claim withdrawn' });
    void fetchData();
  });
};

onMounted(() => {
  void fetchData();
});
</script>

<style lang="scss" scoped>
.page-class { padding: var(--spacing-5); }
.page-header { display: flex; justify-content: space-between; margin-bottom: var(--spacing-5); }
.page-title { font-size: 28px; font-weight: 700; margin: 0 0 var(--spacing-1); }
.page-subtitle { font-size: 14px; color: var(--color-gray-500); margin: 0; }
.table-card { border-radius: var(--radius-lg); }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--spacing-6); color: var(--color-gray-400); }
.dialog-card { min-width: 400px; border-radius: var(--radius-xl); }
.dialog-header { border-bottom: 1px solid var(--color-gray-100); }
</style>
