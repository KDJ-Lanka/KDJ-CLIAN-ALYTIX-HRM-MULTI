<template>
  <q-page class="report-page">
    <div class="page-header">
      <h1 class="page-title">Attendance Report</h1>
      <p class="page-subtitle">View attendance history</p>
    </div>
    <q-card class="table-card">
      <q-card-section>
        <div class="filters-row q-mb-md">
          <q-input v-model="startDate" type="date" label="Start Date" outlined dense />
          <q-input v-model="endDate" type="date" label="End Date" outlined dense />
          <q-btn label="Filter" color="black" @click="fetchAttendance" no-caps />
        </div>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <q-table :rows="attendance" :columns="columns" row-key="id" flat :loading="loading">
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.status)" :label="props.row.status" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';
import type { Attendance } from 'src/types/models';

const authStore = useAuthStore();
const loading = ref(false);
const attendance = ref<Attendance[]>([]);
const startDate = ref(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
const endDate = ref(new Date().toISOString().split('T')[0]);

const columns = [
  { name: 'date', label: 'Date', field: 'attendance_date', align: 'left' as const },
  { name: 'check_in', label: 'Check In', field: 'check_in_time', align: 'left' as const, format: (v: string) => v ? new Date(v).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-' },
  { name: 'check_out', label: 'Check Out', field: 'check_out_time', align: 'left' as const, format: (v: string) => v ? new Date(v).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-' },
  { name: 'hours', label: 'Hours', field: 'total_work_hours', align: 'left' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const },
];

const getStatusColor = (status: string) => ({ present: 'positive', late: 'warning', absent: 'negative' }[status] || 'grey');

const fetchAttendance = async () => {
  const employeeId = authStore.profile?.id;
  if (!employeeId) return;
  loading.value = true;
  const { data } = await supabase.from('attendance').select('*').eq('employee_id', employeeId).gte('attendance_date', startDate.value).lte('attendance_date', endDate.value).order('attendance_date', { ascending: false });
  attendance.value = data || [];
  loading.value = false;
};

onMounted(fetchAttendance);
</script>

<style lang="scss" scoped>
.report-page { padding: var(--spacing-5); }
.page-header { margin-bottom: var(--spacing-5); }
.page-title { font-size: 28px; font-weight: 700; margin: 0 0 var(--spacing-1); }
.page-subtitle { font-size: 14px; color: var(--color-gray-500); margin: 0; }
.table-card { border-radius: var(--radius-lg); }
.filters-row { display: flex; gap: var(--spacing-3); align-items: flex-end; }
</style>
