<template>
  <q-page class="page-class">
    <div class="page-header">
      <div>
        <h1 class="page-title">Leave Requests</h1>
        <p class="page-subtitle">Approve or reject employee leave requests</p>
      </div>
    </div>

    <q-card class="table-card">
      <q-card-section class="q-pa-none">
        <q-table :rows="requests" :columns="columns" row-key="id" flat :loading="loading">
          <template v-slot:body-cell-employee="props">
            <q-td :props="props">
              <div class="employee-cell">
                <q-avatar size="32px" color="gray-3" text-color="gray-7">{{ getInitials(props.row.employee?.full_name) }}</q-avatar>
                <span class="q-ml-sm">{{ props.row.employee?.full_name || 'Unknown' }}</span>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-date="props">
            <q-td :props="props">
              {{ formatDate(props.row.start_date) }} - {{ formatDate(props.row.end_date) }}
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
                <q-btn flat dense color="positive" icon="check" @click="approveLeave(props.row)">
                  <q-tooltip>Approve</q-tooltip>
                </q-btn>
                <q-btn flat dense color="negative" icon="close" @click="rejectLeave(props.row)">
                  <q-tooltip>Reject</q-tooltip>
                </q-btn>
              </template>
              <span v-else class="text-gray-400">-</span>
            </q-td>
          </template>
          <template v-slot:no-data>
            <div class="empty-state">
              <q-icon name="inbox" size="48px" color="gray-4" />
              <p>No pending leave requests</p>
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
import type { LeaveRequest } from 'src/types/models';

const $q = useQuasar();
const authStore = useAuthStore();

const loading = ref(false);
const requests = ref<LeaveRequest[]>([]);

const columns = [
  { name: 'employee', label: 'Employee', field: 'employee', align: 'left' as const },
  { name: 'type', label: 'Type', field: 'leave_type', align: 'left' as const, format: (v: { name?: string }) => v?.name || '-' },
  { name: 'date', label: 'Date Range', field: 'date', align: 'left' as const },
  { name: 'days', label: 'Days', field: 'total_days', align: 'center' as const },
  { name: 'reason', label: 'Reason', field: 'reason', align: 'left' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

const getStatusColor = (status: string) => ({ pending: 'warning', approved: 'positive', rejected: 'negative' }[status] || 'grey');
const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const getInitials = (name: string) => name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?';

const fetchRequests = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;

  loading.value = true;
  const { data } = await supabase
    .from('leave_requests')
    .select('*, employee:employees(full_name), leave_type:leave_types(name)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
  requests.value = (data as LeaveRequest[]) || [];
  loading.value = false;
};

const approveLeave = async (item: LeaveRequest) => {
  try {
    await supabase.from('leave_requests').update({ status: 'approved', approved_by: authStore.profile?.id } as never).eq('id', item.id);
    $q.notify({ type: 'positive', message: 'Leave approved' });
    void fetchRequests();
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to approve leave' });
  }
};

const rejectLeave = (item: LeaveRequest) => {
  $q.dialog({ title: 'Reject Leave', message: 'Are you sure you want to reject this leave request?', cancel: true }).onOk(() => {
    void (async () => {
      try {
        await supabase.from('leave_requests').update({ status: 'rejected', approved_by: authStore.profile?.id } as never).eq('id', item.id);
        $q.notify({ type: 'positive', message: 'Leave rejected' });
        void fetchRequests();
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to reject leave' });
      }
    })();
  });
};

onMounted(() => {
  void fetchRequests();
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
