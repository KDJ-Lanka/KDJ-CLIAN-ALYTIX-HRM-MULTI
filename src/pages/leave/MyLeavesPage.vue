<template>
  <q-page class="page-class">
    <div class="page-header">
      <div>
        <h1 class="page-title">My Leaves</h1>
        <p class="page-subtitle">Manage your leave requests</p>
      </div>
      <q-btn label="Request Leave" icon="add" color="black" no-caps @click="openDialog()" />
    </div>

    <div class="leave-balance q-mb-lg">
      <q-card flat class="balance-card" v-for="balance in leaveBalances" :key="balance.type">
        <q-card-section class="text-center">
          <div class="balance-type">{{ balance.name }}</div>
          <div class="balance-value">{{ balance.remaining }} / {{ balance.total }}</div>
          <div class="balance-label">days remaining</div>
        </q-card-section>
      </q-card>
    </div>

    <q-card class="table-card">
      <q-card-section class="q-pa-none">
        <q-table :rows="leaves" :columns="columns" row-key="id" flat :loading="loading">
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.status)" :label="props.row.status" />
            </q-td>
          </template>
          <template v-slot:body-cell-date="props">
            <q-td :props="props">
              {{ formatDate(props.row.start_date) }} - {{ formatDate(props.row.end_date) }}
            </q-td>
          </template>
          <template v-slot:no-data>
            <div class="empty-state">
              <q-icon name="beach_access" size="48px" color="gray-4" />
              <p>No leave requests</p>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialog">
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h6">{{ editingId ? 'Edit' : 'Request' }} Leave</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveLeave">
            <q-select v-model="form.leave_type_id" :options="leaveTypeOptions" label="Leave Type *" outlined dense emit-value map-options class="q-mb-md" :rules="[v => !!v || 'Required']" />
            <div class="row q-col-gutter-md q-mb-md">
              <div class="col-6">
                <q-input v-model="form.start_date" label="Start Date *" type="date" outlined dense :rules="[v => !!v || 'Required']" />
              </div>
              <div class="col-6">
                <q-input v-model="form.end_date" label="End Date *" type="date" outlined dense :rules="[v => !!v || 'Required']" />
              </div>
            </div>
            <q-input v-model="form.reason" label="Reason" outlined dense autogrow class="q-mb-md" />
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
import { ref, reactive, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';
import type { LeaveRequest, LeaveType, LeaveBalance } from 'src/types/models';

const $q = useQuasar();
const authStore = useAuthStore();

const loading = ref(false);
const saving = ref(false);
const leaves = ref<LeaveRequest[]>([]);
const leaveTypes = ref<LeaveType[]>([]);
const leaveBalances = ref<LeaveBalance[]>([]);
const dialog = ref(false);
const editingId = ref<string | null>(null);

const form = reactive({
  leave_type_id: '',
  start_date: '',
  end_date: '',
  reason: '',
});

const leaveTypeOptions = computed(() => leaveTypes.value.map(lt => ({ label: lt.name, value: lt.id })));

const columns = [
  { name: 'type', label: 'Type', field: 'leave_type_id', align: 'left' as const },
  { name: 'date', label: 'Date Range', field: 'date', align: 'left' as const },
  { name: 'days', label: 'Days', field: 'total_days', align: 'center' as const },
  { name: 'reason', label: 'Reason', field: 'reason', align: 'left' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const },
];

const getStatusColor = (status: string) => ({ pending: 'warning', approved: 'positive', rejected: 'negative' }[status] || 'grey');
const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const fetchData = async () => {
  const employeeId = authStore.profile?.id;
  const companyId = authStore.company?.id;
  if (!employeeId || !companyId) return;

  loading.value = true;
  const [{ data: leaveData }, { data: typesData }] = await Promise.all([
    supabase.from('leave_requests').select('*, leave_types(name)').eq('employee_id', employeeId).order('created_at', { ascending: false }),
    supabase.from('leave_types').select('*').eq('company_id', companyId).eq('is_active', true),
  ]);

  leaves.value = (leaveData as LeaveRequest[]) || [];
  leaveTypes.value = (typesData as LeaveType[]) || [];

  // Calculate balances (simplified - would normally fetch from leave_balances table)
  leaveBalances.value = ((typesData || []) as Array<{ id: string; name: string; max_days_per_year?: number }>).map(lt => ({
    type: lt.id,
    name: lt.name,
    total: lt.max_days_per_year || 0,
    remaining: lt.max_days_per_year || 0,
  }));

  loading.value = false;
};

const openDialog = (item?: LeaveRequest) => {
  editingId.value = item?.id || null;
  form.leave_type_id = item?.leave_type_id || '';
  form.start_date = item?.start_date || '';
  form.end_date = item?.end_date || '';
  form.reason = item?.reason || '';
  dialog.value = true;
};

const saveLeave = async () => {
  const employeeId = authStore.profile?.id;
  const companyId = authStore.company?.id;
  if (!employeeId || !companyId) return;

  saving.value = true;
  try {
    const startDate = new Date(form.start_date);
    const endDate = new Date(form.end_date);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (editingId.value) {
      await supabase.from('leave_requests').update({ ...form, total_days: totalDays } as never).eq('id', editingId.value);
      $q.notify({ type: 'positive', message: 'Leave request updated' });
    } else {
      await supabase.from('leave_requests').insert({
        ...form,
        employee_id: employeeId,
        company_id: companyId,
        total_days: totalDays,
        status: 'pending',
      } as never);
      $q.notify({ type: 'positive', message: 'Leave request submitted' });
    }
    dialog.value = false;
    void fetchData();
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to save leave request' });
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  void fetchData();
});
</script>

<style lang="scss" scoped>
.page-class { padding: var(--spacing-5); }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-5); }
.page-title { font-size: 28px; font-weight: 700; margin: 0 0 var(--spacing-1); }
.page-subtitle { font-size: 14px; color: var(--color-gray-500); margin: 0; }
.table-card { border-radius: var(--radius-lg); }
.leave-balance { display: flex; gap: var(--spacing-4); flex-wrap: wrap; }
.balance-card { flex: 1; min-width: 150px; border: 1px solid var(--color-gray-200); border-radius: var(--radius-lg); }
.balance-type { font-size: 12px; color: var(--color-gray-500); text-transform: uppercase; letter-spacing: 0.5px; }
.balance-value { font-size: 24px; font-weight: 700; margin: var(--spacing-1) 0; }
.balance-label { font-size: 12px; color: var(--color-gray-400); }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--spacing-6); color: var(--color-gray-400); }
.dialog-card { min-width: 400px; border-radius: var(--radius-xl); }
.dialog-header { border-bottom: 1px solid var(--color-gray-100); }
</style>
