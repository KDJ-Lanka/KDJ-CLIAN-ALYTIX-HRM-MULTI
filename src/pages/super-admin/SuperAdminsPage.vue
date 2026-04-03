<template>
  <q-page class="super-admins-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Super Admins</h1>
        <p class="page-subtitle">Manage platform administrators</p>
      </div>
      <q-btn label="Add Admin" icon="add" color="black" no-caps @click="openDialog()" />
    </div>

    <!-- Admins Table -->
    <q-card class="table-card">
      <q-card-section class="q-pa-none">
        <q-table :rows="admins" :columns="columns" row-key="id" flat :loading="loading">
          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div class="admin-cell">
                <q-avatar size="36px" color="grey-4" text-color="grey-8">
                  {{ getInitials(props.row.full_name || props.row.email) }}
                </q-avatar>
                <div class="admin-info">
                  <span class="admin-name">{{ props.row.full_name || 'No Name' }}</span>
                  <span class="admin-email">{{ props.row.email }}</span>
                </div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-role="props">
            <q-td :props="props">
              <q-badge :color="getRoleColor(props.row.role)" :label="capitalize(props.row.role)" />
            </q-td>
          </template>

          <template v-slot:body-cell-is_active="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.is_active ? 'positive' : 'grey'"
                :label="props.row.is_active ? 'Active' : 'Inactive'"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-last_login="props">
            <q-td :props="props">
              {{ props.row.last_login_at ? formatDate(props.row.last_login_at) : 'Never' }}
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn flat dense round icon="more_vert">
                <q-menu>
                  <q-list style="min-width: 160px">
                    <q-item clickable v-close-popup @click="openDialog(props.row)">
                      <q-item-section avatar><q-icon name="edit" /></q-item-section>
                      <q-item-section>Edit</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="resetPassword(props.row)">
                      <q-item-section avatar><q-icon name="lock_reset" /></q-item-section>
                      <q-item-section>Reset Password</q-item-section>
                    </q-item>
                    <q-separator />
                    <q-item
                      clickable
                      v-close-popup
                      @click="toggleActive(props.row)"
                      :class="props.row.is_active ? 'text-warning' : 'text-positive'"
                    >
                      <q-item-section avatar>
                        <q-icon :name="props.row.is_active ? 'block' : 'check_circle'" />
                      </q-item-section>
                      <q-item-section>{{ props.row.is_active ? 'Deactivate' : 'Activate' }}</q-item-section>
                    </q-item>
                    <q-item
                      v-if="props.row.id !== currentAdminId"
                      clickable
                      v-close-popup
                      @click="deleteAdmin(props.row)"
                      class="text-negative"
                    >
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
              <q-icon name="admin_panel_settings" size="48px" color="grey-4" />
              <p>No super admins found</p>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Add/Edit Dialog -->
    <q-dialog v-model="dialog.show">
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h6">{{ dialog.mode === 'create' ? 'Add Super Admin' : 'Edit Super Admin' }}</div>
          <q-btn flat dense round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-md">
          <q-form @submit="saveAdmin" class="q-gutter-md">
            <q-input
              v-model="dialog.email"
              label="Email"
              type="email"
              outlined
              dense
              :rules="[(v) => !!v || 'Email is required']"
              :disable="dialog.mode === 'edit'"
            />

            <q-input
              v-model="dialog.full_name"
              label="Full Name"
              outlined
              dense
              :rules="[(v) => !!v || 'Name is required']"
            />

            <q-select
              v-model="dialog.role"
              :options="roleOptions"
              label="Role"
              outlined
              dense
              emit-value
              map-options
              :rules="[(v) => !!v || 'Role is required']"
            />

            <q-toggle v-model="dialog.is_active" label="Active" color="positive" />

            <div v-if="dialog.mode === 'create'" class="q-gutter-sm">
              <div class="text-caption text-grey-7">Password (leave empty to auto-generate)</div>
              <q-input
                v-model="dialog.password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                outlined
                dense
              >
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn unelevated label="Save" color="black" @click="saveAdmin" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/boot/supabase';

interface SuperAdmin {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: string;
  permissions: string[];
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

const $q = useQuasar();

const loading = ref(false);
const saving = ref(false);
const showPassword = ref(false);
const admins = ref<SuperAdmin[]>([]);

const currentAdminId = ref<string | null>(null);

const dialog = ref<{
  show: boolean;
  mode: 'create' | 'edit';
  id?: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  password: string;
}>({
  show: false,
  mode: 'create',
  email: '',
  full_name: '',
  role: 'support',
  is_active: true,
  password: '',
});

const columns = [
  { name: 'name', label: 'Admin', field: 'full_name', align: 'left' as const, sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const, sortable: true },
  { name: 'role', label: 'Role', field: 'role', align: 'left' as const, sortable: true },
  { name: 'is_active', label: 'Status', field: 'is_active', align: 'center' as const },
  { name: 'last_login', label: 'Last Login', field: 'last_login_at', align: 'left' as const },
  { name: 'actions', label: '', field: '', align: 'right' as const },
];

const roleOptions = [
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Support', value: 'support' },
  { label: 'Billing', value: 'billing' },
];

const fetchAdmins = async () => {
  loading.value = true;
  try {
    const { data, error } = await supabase
      .from('super_admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      admins.value = data as SuperAdmin[];
    }
  } finally {
    loading.value = false;
  }
};

const openDialog = (admin?: SuperAdmin) => {
  if (admin) {
    dialog.value = {
      show: true,
      mode: 'edit',
      id: admin.id,
      email: admin.email,
      full_name: admin.full_name || '',
      role: admin.role,
      is_active: admin.is_active,
      password: '',
    };
  } else {
    dialog.value = {
      show: true,
      mode: 'create',
      email: '',
      full_name: '',
      role: 'support',
      is_active: true,
      password: '',
    };
  }
};

const saveAdmin = async () => {
  if (!dialog.value.email || !dialog.value.role) {
    $q.notify({ type: 'warning', message: 'Please fill in all required fields' });
    return;
  }

  saving.value = true;
  try {
    if (dialog.value.mode === 'create') {
      // Create auth user first
      const password = dialog.value.password || generatePassword();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dialog.value.email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Create super admin record
      const { error: dbError } = await supabase.from('super_admins').insert({
        user_id: authData.user.id,
        email: dialog.value.email,
        full_name: dialog.value.full_name,
        role: dialog.value.role,
        permissions: dialog.value.role === 'super_admin' ? ['all'] : [],
        is_active: dialog.value.is_active,
      } as never);

      if (dbError) throw dbError;

      $q.notify({
        type: 'positive',
        message: `Super admin created. Password: ${password}`,
        timeout: 5000,
      });
    } else {
      // Update existing
      const { error } = await supabase
        .from('super_admins')
        .update({
          full_name: dialog.value.full_name,
          role: dialog.value.role,
          is_active: dialog.value.is_active,
        } as never)
        .eq('id', dialog.value.id!);

      if (error) throw error;
      $q.notify({ type: 'positive', message: 'Super admin updated' });
    }

    dialog.value.show = false;
    await fetchAdmins();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Operation failed';
    $q.notify({ type: 'negative', message });
  } finally {
    saving.value = false;
  }
};

const resetPassword = async (admin: SuperAdmin) => {
  const newPassword = generatePassword();

  try {
    // Update auth user password (requires admin privileges)
    const { error } = await (supabase.rpc as any)('update_user_password', {
      user_id: admin.user_id,
      new_password: newPassword,
    });

    if (error) {
      // Fallback: send reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(admin.email);
      if (resetError) throw resetError;
      $q.notify({
        type: 'info',
        message: 'Password reset email sent',
      });
    } else {
      $q.notify({
        type: 'positive',
        message: `New password: ${newPassword}`,
        timeout: 5000,
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Reset failed';
    $q.notify({ type: 'negative', message });
  }
};

const toggleActive = async (admin: SuperAdmin) => {
  try {
    const { error } = await supabase
      .from('super_admins')
      .update({ is_active: !admin.is_active } as never)
      .eq('id', admin.id);

    if (error) throw error;
    await fetchAdmins();
    $q.notify({ type: 'positive', message: `Admin ${admin.is_active ? 'deactivated' : 'activated'}` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Update failed';
    $q.notify({ type: 'negative', message });
  }
};

const deleteAdmin = (admin: SuperAdmin) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete ${admin.email}?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        // Delete from super_admins
        const { error: dbError } = await supabase.from('super_admins').delete().eq('id', admin.id);
        if (dbError) throw dbError;

        // Delete from auth
        const { error: authError } = await (supabase.rpc as any)('admin_delete_user', { user_id: admin.user_id });
        if (authError) throw authError;

        await fetchAdmins();
        $q.notify({ type: 'positive', message: 'Admin deleted' });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Delete failed';
        $q.notify({ type: 'negative', message });
      }
    })();
  });
};

const generatePassword = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    super_admin: 'red',
    support: 'blue',
    billing: 'green',
  };
  return colors[role] || 'grey';
};

const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(async () => {
  // Get current admin
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    const { data } = await supabase
      .from('super_admins')
      .select('id')
      .eq('user_id', session.user.id)
      .single();
    if (data) currentAdminId.value = (data as { id: string }).id;
  }
  await fetchAdmins();
});
</script>

<style lang="scss" scoped>
.super-admins-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  color: #000000;
}

.page-subtitle {
  color: #737373;
  margin: 4px 0 0 0;
}

.table-card {
  border: 1px solid #e5e5e5;
  border-radius: 12px;
}

.admin-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-info {
  display: flex;
  flex-direction: column;
}

.admin-name {
  font-weight: 600;
  color: #000000;
}

.admin-email {
  font-size: 12px;
  color: #737373;
}

.dialog-card {
  min-width: 400px;
  border-radius: 16px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  padding: 48px;
  text-align: center;
  color: #737373;
}
</style>
