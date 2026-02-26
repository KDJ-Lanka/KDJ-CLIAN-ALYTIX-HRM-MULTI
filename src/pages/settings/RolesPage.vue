<template>
  <q-page class="page-class">
    <div class="page-header">
      <div>
        <h1 class="page-title">Roles</h1>
        <p class="page-subtitle">Manage user roles and permissions</p>
      </div>
      <q-btn label="Add Role" icon="add" color="black" no-caps @click="openDialog()" />
    </div>

    <q-card class="table-card">
      <q-card-section class="q-pa-none">
        <q-table :rows="roles" :columns="columns" row-key="id" flat :loading="loading">
          <template v-slot:body-cell-is_system="props">
            <q-td :props="props">
              <q-badge v-if="props.row.is_system" color="gray" label="System" />
              <span v-else class="text-gray-400">Custom</span>
            </q-td>
          </template>
          <template v-slot:body-cell-permissions="props">
            <q-td :props="props">
              <div class="permission-chips">
                <q-chip v-for="perm in getPermissionList(props.row.permissions)" :key="perm" dense size="sm" color="gray-2" text-color="gray-7">{{ perm }}</q-chip>
                <span v-if="!props.row.permissions" class="text-gray-400">-</span>
              </div>
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense round icon="more_vert" :disable="props.row.is_system">
                <q-menu>
                  <q-list>
                    <q-item clickable v-close-popup @click="openDialog(props.row)">
                      <q-item-section avatar><q-icon name="edit" /></q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item v-if="!props.row.is_system" clickable v-close-popup @click="deleteRole(props.row)" class="text-negative">
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
              <q-icon name="admin_panel_settings" size="48px" color="gray-4" />
              <p>No roles found</p>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="dialog">
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h6">{{ editingId ? 'Edit' : 'Add' }} Role</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="saveRole">
            <q-input v-model="form.name" label="Role Name *" outlined dense class="q-mb-md" :rules="[v => !!v || 'Required']" />
            <q-input v-model="form.code" label="Code *" outlined dense class="q-mb-md" hint="e.g., admin, manager, employee" :rules="[v => !!v || 'Required']" />
            <q-input v-model="form.description" label="Description" outlined dense autogrow class="q-mb-md" />

            <div class="section-title q-mb-sm">Permissions</div>
            <div class="permission-grid q-mb-md">
              <q-checkbox v-for="perm in availablePermissions" :key="perm.value" v-model="form.permissions" :val="perm.value" :label="perm.label" dense />
            </div>

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
import type { Role } from 'src/types/models';

const $q = useQuasar();
const authStore = useAuthStore();

const loading = ref(false);
const saving = ref(false);
const roles = ref<Role[]>([]);
const dialog = ref(false);
const editingId = ref<string | null>(null);

const availablePermissions = [
  { value: 'employees.view', label: 'View Employees' },
  { value: 'employees.create', label: 'Create Employees' },
  { value: 'employees.edit', label: 'Edit Employees' },
  { value: 'employees.delete', label: 'Delete Employees' },
  { value: 'attendance.view', label: 'View Attendance' },
  { value: 'attendance.manage', label: 'Manage Attendance' },
  { value: 'leave.view', label: 'View Leave' },
  { value: 'leave.approve', label: 'Approve Leave' },
  { value: 'payroll.view', label: 'View Payroll' },
  { value: 'payroll.manage', label: 'Manage Payroll' },
  { value: 'claims.view', label: 'View Claims' },
  { value: 'claims.approve', label: 'Approve Claims' },
  { value: 'settings.manage', label: 'Manage Settings' },
];

const form = reactive({
  name: '',
  code: '',
  description: '',
  permissions: [] as string[],
});

const columns = [
  { name: 'name', label: 'Name', field: 'name', align: 'left' as const },
  { name: 'code', label: 'Code', field: 'code', align: 'left' as const },
  { name: 'description', label: 'Description', field: 'description', align: 'left' as const },
  { name: 'type', label: 'Type', field: 'is_system', align: 'left' as const },
  { name: 'permissions', label: 'Permissions', field: 'permissions', align: 'left' as const },
  { name: 'actions', label: '', field: 'actions', align: 'right' as const },
];

const getPermissionList = (permissions: string[] | undefined) => {
  if (!permissions) return [];
  if (Array.isArray(permissions)) return permissions.slice(0, 3);
  return [];
};

const fetchData = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;
  loading.value = true;
  const { data } = await supabase.from('roles').select('*').eq('company_id', companyId).order('name');
  roles.value = (data as Role[]) || [];
  loading.value = false;
};

const openDialog = (item?: Role) => {
  editingId.value = item?.id || null;
  form.name = item?.name || '';
  form.code = item?.code || '';
  form.description = item?.description || '';
  form.permissions = Array.isArray(item?.permissions) ? [...item.permissions] : [];
  dialog.value = true;
};

const saveRole = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;
  saving.value = true;
  try {
    if (editingId.value) {
      await supabase.from('roles').update(form as never).eq('id', editingId.value);
      $q.notify({ type: 'positive', message: 'Role updated' });
    } else {
      await supabase.from('roles').insert({ ...form, company_id: companyId } as never);
      $q.notify({ type: 'positive', message: 'Role created' });
    }
    dialog.value = false;
    void fetchData();
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to save role' });
  } finally {
    saving.value = false;
  }
};

const deleteRole = (item: Role) => {
  $q.dialog({ title: 'Delete', message: `Delete ${item.name}?`, cancel: true }).onOk(() => {
    void supabase.from('roles').delete().eq('id', item.id);
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
.permission-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: var(--spacing-6); color: var(--color-gray-400); }
.dialog-card { min-width: 500px; border-radius: var(--radius-xl); }
.dialog-header { border-bottom: 1px solid var(--color-gray-100); }
.section-title { font-weight: 600; font-size: 14px; }
.permission-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--spacing-2); }
</style>
