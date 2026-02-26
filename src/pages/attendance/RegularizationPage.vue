<template>
  <q-page class="page-class">
    <div class="page-header">
      <h1 class="page-title">Regularization</h1>
      <p class="page-subtitle">Request attendance corrections</p>
    </div>
    <q-card class="table-card">
      <q-card-section class="q-pa-none">
        <q-table :rows="requests" :columns="columns" row-key="id" flat :loading="loading">
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="({ pending: 'warning', approved: 'positive', rejected: 'negative' } as Record<string, string>)[props.row.status]" :label="props.row.status" />
            </q-td>
          </template>
          <template v-slot:no-data>
            <div class="empty-state"><p>No regularization requests</p></div>
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
import type { AttendanceRegularization } from 'src/types/models';

const authStore = useAuthStore();
const loading = ref(false);
const requests = ref<AttendanceRegularization[]>([]);

const columns = [
  { name: 'date', label: 'Date', field: 'request_date', align: 'left' as const },
  { name: 'type', label: 'Type', field: 'request_type', align: 'left' as const },
  { name: 'reason', label: 'Reason', field: 'reason', align: 'left' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const },
];

const fetchData = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;
  loading.value = true;
  const { data } = await supabase.from('attendance_regularizations').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
  requests.value = data || [];
  loading.value = false;
};

onMounted(fetchData);
</script>

<style lang="scss" scoped>
.page-class { padding: var(--spacing-5); }
.page-header { margin-bottom: var(--spacing-5); }
.page-title { font-size: 28px; font-weight: 700; margin: 0 0 var(--spacing-1); }
.page-subtitle { font-size: 14px; color: var(--color-gray-500); margin: 0; }
.table-card { border-radius: var(--radius-lg); }
.empty-state { padding: var(--spacing-6); text-align: center; color: var(--color-gray-400); }
</style>
