<template>
  <q-page class="departments-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Departments</h1>
        <p class="page-subtitle">Manage organization departments</p>
      </div>
      <q-btn label="Add Department" icon="add" color="black" no-caps @click="openDialog()" />
    </div>

    <q-card class="table-card">
      <q-card-section class="q-pa-none">
        <q-table :rows="departments" :columns="columns" row-key="id" flat :loading="loading">
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense round icon="more_vert">
                <q-menu>
                  <q-list>
                    <q-item clickable v-close-popup @click="openDialog(props.row)">
                      <q-item-section avatar><q-icon name="edit" /></q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="deleteDepartment(props.row)" class="text-negative">
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
              <q-icon name="corporate_fare" size="48px" color="gray-4" />
              <p>No departments found</p>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialog">
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h6">{{ editingId ? 'Edit' : 'Add' }} Department</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveDepartment">
            <q-input v-model="form.name" label="Name *" outlined dense class="q-mb-md" :rules="[v => !!v || 'Required']" />
            <q-input v-model="form.code" label="Code" outlined dense class="q-mb-md" />
            <q-input v-model="form.description" label="Description" outlined dense autogrow class="q-mb-md" />
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
import type { Department } from 'src/types/models';

const $q = useQuasar();
const authStore = useAuthStore();

const loading = ref(false);
const saving = ref(false);
const departments = ref<Department[]>([]);
const dialog = ref(false);
const editingId = ref<string | null>(null);

const form = reactive({ name: '', code: '', description: '' });

const columns = [
  { name: 'name', label: 'Name', field: 'name', align: 'left' as const },
  { name: 'code', label: 'Code', field: 'code', align: 'left' as const },
  { name: 'description', label: 'Description', field: 'description', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

const fetchDepartments = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;
  loading.value = true;
  const { data } = await supabase.from('departments').select('*').eq('company_id', companyId).order('name');
  departments.value = (data as Department[]) || [];
  loading.value = false;
};

const openDialog = (dept?: Department) => {
  editingId.value = dept?.id || null;
  form.name = dept?.name || '';
  form.code = dept?.code || '';
  form.description = dept?.description || '';
  dialog.value = true;
};

const saveDepartment = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;
  saving.value = true;

  try {
    if (editingId.value) {
      await supabase.from('departments').update({
        name: form.name,
        code: form.code,
        description: form.description,
      } as never).eq('id', editingId.value);
      $q.notify({ type: 'positive', message: 'Department updated' });
    } else {
      await supabase.from('departments').insert({
        name: form.name,
        code: form.code,
        description: form.description,
        company_id: companyId,
      } as never);
      $q.notify({ type: 'positive', message: 'Department created' });
    }
    dialog.value = false;
    void fetchDepartments();
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to save department' });
  } finally {
    saving.value = false;
  }
};

const deleteDepartment = (dept: Department) => {
  $q.dialog({ title: 'Delete', message: `Delete ${dept.name}?`, cancel: true }).onOk(() => {
    void supabase.from('departments').delete().eq('id', dept.id);
    $q.notify({ type: 'positive', message: 'Department deleted' });
    void fetchDepartments();
  });
};

onMounted(() => {
  void fetchDepartments();
});
</script>

<style lang="scss" scoped>
.departments-page { padding: var(--spacing-5); }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-5); }
.page-title { font-size: 28px; font-weight: 700; margin: 0 0 var(--spacing-1); }
.page-subtitle { font-size: 14px; color: var(--color-gray-500); margin: 0; }
.table-card { border-radius: var(--radius-lg); }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--spacing-6); color: var(--color-gray-400); }
.dialog-card { min-width: 400px; border-radius: var(--radius-xl); }
.dialog-header { border-bottom: 1px solid var(--color-gray-100); }
</style>
