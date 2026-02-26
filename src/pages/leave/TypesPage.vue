<template>
  <q-page class="page-class">
    <div class="page-header">
      <div>
        <h1 class="page-title">Leave Types</h1>
        <p class="page-subtitle">Configure leave categories</p>
      </div>
      <q-btn label="Add Type" icon="add" color="black" no-caps @click="openDialog()" />
    </div>

    <q-card class="table-card">
      <q-card-section class="q-pa-none">
        <q-table :rows="leaveTypes" :columns="columns" row-key="id" flat :loading="loading">
          <template v-slot:body-cell-is_active="props">
            <q-td :props="props">
              <q-badge :color="props.row.is_active ? 'positive' : 'gray'" :label="props.row.is_active ? 'Active' : 'Inactive'" />
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense round icon="more_vert">
                <q-menu>
                  <q-list>
                    <q-item clickable v-close-popup @click="openDialog(props.row)">
                      <q-item-section avatar><q-icon name="edit" /></q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="deleteType(props.row)" class="text-negative">
                      <q-item-section avatar><q-icon name="delete" /></q-item-section>
                      <q-item-section>Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-td>
          </template>
          <template v-slot:no-data>
            <div class="empty-state">
              <q-icon name="category" size="48px" color="gray-4" />
              <p>No leave types configured</p>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialog">
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h6">{{ editingId ? 'Edit' : 'Add' }} Leave Type</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveType">
            <q-input v-model="form.name" label="Name *" outlined dense class="q-mb-md" :rules="[v => !!v || 'Required']" />
            <q-input v-model="form.code" label="Code" outlined dense class="q-mb-md" />
            <q-input v-model="form.description" label="Description" outlined dense autogrow class="q-mb-md" />
            <q-input v-model.number="form.max_days_per_year" label="Max Days per Year" type="number" outlined dense class="q-mb-md" />
            <q-checkbox v-model="form.is_paid" label="Paid Leave" class="q-mb-md" />
            <q-checkbox v-model="form.is_active" label="Active" class="q-mb-md" />
            <div class="flex justify-end gap-3">
              <q-btn flat label="Cancel" v-close-popup />
              <q-btn color="black" :label="editingId ? 'Update' : 'Create'" type="submit" :loading="saving" />
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
import type { LeaveType } from 'src/types/models';

const $q = useQuasar();
const authStore = useAuthStore();

const loading = ref(false);
const saving = ref(false);
const leaveTypes = ref<LeaveType[]>([]);
const dialog = ref(false);
const editingId = ref<string | null>(null);

const form = reactive({
  name: '',
  code: '',
  description: '',
  max_days_per_year: 0,
  is_paid: true,
  is_active: true,
});

const columns = [
  { name: 'name', label: 'Name', field: 'name', align: 'left' as const },
  { name: 'code', label: 'Code', field: 'code', align: 'left' as const },
  { name: 'max_days', label: 'Max Days/Year', field: 'max_days_per_year', align: 'center' as const },
  { name: 'paid', label: 'Paid', field: 'is_paid', align: 'center' as const, format: (v: boolean) => v ? 'Yes' : 'No' },
  { name: 'status', label: 'Status', field: 'is_active', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

const fetchData = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;
  loading.value = true;
  const { data } = await supabase.from('leave_types').select('*').eq('company_id', companyId).order('name');
  leaveTypes.value = (data as LeaveType[]) || [];
  loading.value = false;
};

const openDialog = (item?: LeaveType) => {
  editingId.value = item?.id || null;
  form.name = item?.name || '';
  form.code = item?.code || '';
  form.description = item?.description || '';
  form.max_days_per_year = item?.max_days_per_year || 0;
  form.is_paid = item?.is_paid ?? true;
  form.is_active = item?.is_active ?? true;
  dialog.value = true;
};

const saveType = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;
  saving.value = true;
  try {
    if (editingId.value) {
      await supabase.from('leave_types').update(form as never).eq('id', editingId.value);
      $q.notify({ type: 'positive', message: 'Leave type updated' });
    } else {
      await supabase.from('leave_types').insert({ ...form, company_id: companyId } as never);
      $q.notify({ type: 'positive', message: 'Leave type created' });
    }
    dialog.value = false;
    void fetchData();
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to save leave type' });
  } finally {
    saving.value = false;
  }
};

const deleteType = (item: LeaveType) => {
  $q.dialog({ title: 'Delete', message: `Delete ${item.name}?`, cancel: true }).onOk(() => {
    void supabase.from('leave_types').delete().eq('id', item.id);
    $q.notify({ type: 'positive', message: 'Deleted' });
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
