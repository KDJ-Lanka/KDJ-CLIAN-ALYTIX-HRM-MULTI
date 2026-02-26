<template>
  <q-page class="designations-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Designations</h1>
        <p class="page-subtitle">Manage job titles and designations</p>
      </div>
      <q-btn label="Add Designation" icon="add" color="black" no-caps @click="openDialog()" />
    </div>

    <q-card class="table-card">
      <q-card-section class="q-pa-none">
        <q-table :rows="designations" :columns="columns" row-key="id" flat :loading="loading">
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense round icon="more_vert">
                <q-menu>
                  <q-list>
                    <q-item clickable v-close-popup @click="openDialog(props.row)">
                      <q-item-section avatar><q-icon name="edit" /></q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="deleteDesignation(props.row)" class="text-negative">
                      <q-item-section avatar><q-icon name="delete" /></q-item-section>
                      <q-item-section>Delete</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-td>
          </template>
          <template v-slot:no-data>
            <div class="empty-state"><q-icon name="badge" size="48px" color="gray-4" /><p>No designations found</p></div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialog">
      <q-card class="dialog-card">
        <q-card-section class="dialog-header"><div class="text-h6">{{ editingId ? 'Edit' : 'Add' }} Designation</div></q-card-section>
        <q-card-section>
          <q-form @submit="saveDesignation">
            <q-input v-model="form.title" label="Title *" outlined dense class="q-mb-md" :rules="[v => !!v || 'Required']" />
            <q-input v-model="form.code" label="Code" outlined dense class="q-mb-md" />
            <q-input v-model="form.description" label="Description" outlined dense autogrow class="q-mb-md" />
            <q-select v-model="form.department_id" :options="departmentOptions" label="Department" outlined dense emit-value map-options class="q-mb-md" />
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
import { ref, reactive, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';
import type { Designation, Department } from 'src/types/models';

const $q = useQuasar();
const authStore = useAuthStore();

const loading = ref(false);
const saving = ref(false);
const designations = ref<Designation[]>([]);
const departments = ref<Department[]>([]);
const dialog = ref(false);
const editingId = ref<string | null>(null);

const form = reactive({ title: '', code: '', description: '', department_id: '' });

const departmentOptions = computed(() => departments.value.map(d => ({ label: d.name, value: d.id })));

const columns = [
  { name: 'title', label: 'Title', field: 'title', align: 'left' as const },
  { name: 'code', label: 'Code', field: 'code', align: 'left' as const },
  { name: 'department', label: 'Department', field: 'department_id', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

const fetchData = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;
  loading.value = true;
  const [{ data: des }, { data: dep }] = await Promise.all([
    supabase.from('designations').select('*').eq('company_id', companyId).order('title'),
    supabase.from('departments').select('*').eq('company_id', companyId).eq('is_active', true),
  ]);
  designations.value = (des as Designation[]) || [];
  departments.value = (dep as Department[]) || [];
  loading.value = false;
};

const openDialog = (item?: Designation) => {
  editingId.value = item?.id || null;
  form.title = item?.title || '';
  form.code = item?.code || '';
  form.description = item?.description || '';
  form.department_id = item?.department_id || '';
  dialog.value = true;
};

const saveDesignation = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;
  saving.value = true;
  try {
    if (editingId.value) {
      await supabase.from('designations').update({
        title: form.title,
        code: form.code,
        description: form.description,
        department_id: form.department_id,
      } as never).eq('id', editingId.value);
      $q.notify({ type: 'positive', message: 'Updated' });
    } else {
      await supabase.from('designations').insert({
        title: form.title,
        code: form.code,
        description: form.description,
        department_id: form.department_id,
        company_id: companyId,
      } as never);
      $q.notify({ type: 'positive', message: 'Created' });
    }
    dialog.value = false;
    void fetchData();
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to save' });
  } finally {
    saving.value = false;
  }
};

const deleteDesignation = (item: Designation) => {
  $q.dialog({ title: 'Delete', message: `Delete ${item.title}?`, cancel: true }).onOk(() => {
    void supabase.from('designations').delete().eq('id', item.id);
    $q.notify({ type: 'positive', message: 'Deleted' });
    void fetchData();
  });
};

onMounted(() => {
  void fetchData();
});
</script>

<style lang="scss" scoped>
.designations-page { padding: var(--spacing-5); }
.page-header { display: flex; justify-content: space-between; margin-bottom: var(--spacing-5); }
.page-title { font-size: 28px; font-weight: 700; margin: 0 0 var(--spacing-1); }
.page-subtitle { font-size: 14px; color: var(--color-gray-500); margin: 0; }
.table-card { border-radius: var(--radius-lg); }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--spacing-6); color: var(--color-gray-400); }
.dialog-card { min-width: 400px; border-radius: var(--radius-xl); }
.dialog-header { border-bottom: 1px solid var(--color-gray-100); }
</style>
