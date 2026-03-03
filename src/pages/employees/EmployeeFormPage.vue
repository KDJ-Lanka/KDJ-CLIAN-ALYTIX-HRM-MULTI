<template>
  <q-page class="employee-form-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <q-btn flat icon="arrow_back" to="/employees" no-caps class="back-btn" />
        <h1 class="page-title">{{ isEdit ? 'Edit Employee' : 'Add Employee' }}</h1>
        <p class="page-subtitle">
          {{ isEdit ? 'Update employee information' : 'Create a new employee record' }}
        </p>
      </div>
    </div>

    <!-- Form -->
    <q-form @submit="handleSubmit" class="form-container">
      <div class="form-grid">
        <!-- Personal Information -->
        <q-card class="form-card">
          <q-card-section class="card-header">
            <div class="card-title">Personal Information</div>
          </q-card-section>
          <q-card-section class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">First Name *</label>
                <q-input
                  v-model="form.firstName"
                  outlined
                  dense
                  :error="!!errors.firstName"
                  :error-message="errors.firstName"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Last Name</label>
                <q-input v-model="form.lastName" outlined dense />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email *</label>
                <q-input
                  v-model="form.email"
                  type="email"
                  outlined
                  dense
                  :error="!!errors.email"
                  :error-message="errors.email"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Phone</label>
                <q-input v-model="form.phone" outlined dense />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Date of Birth</label>
                <q-input
                  v-model="form.dateOfBirth"
                  type="date"
                  outlined
                  dense
                />
              </div>
              <div class="form-group">
                <label class="form-label">Gender</label>
                <q-select
                  v-model="form.gender"
                  :options="genderOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">NIC Number</label>
              <q-input v-model="form.nicNumber" outlined dense />
            </div>

            <div class="form-group">
              <label class="form-label">Address</label>
              <q-input
                v-model="form.address"
                outlined
                dense
                autogrow
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Employment Details -->
        <q-card class="form-card">
          <q-card-section class="card-header">
            <div class="card-title">Employment Details</div>
          </q-card-section>
          <q-card-section class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Employee Code *</label>
                <q-input
                  v-model="form.employeeCode"
                  outlined
                  dense
                  :error="!!errors.employeeCode"
                  :error-message="errors.employeeCode"
                  :disable="isEdit"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Employment Type</label>
                <q-select
                  v-model="form.employmentType"
                  :options="employmentTypeOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Department *</label>
                <q-select
                  v-model="form.departmentId"
                  :options="departmentOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  :error="!!errors.departmentId"
                  :error-message="errors.departmentId"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Designation</label>
                <q-select
                  v-model="form.designationId"
                  :options="designationOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Branch</label>
                <q-select
                  v-model="form.branchId"
                  :options="branchOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
              <div class="form-group">
                <label class="form-label">Reporting Manager</label>
                <q-select
                  v-model="form.reportingManagerId"
                  :options="managerOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Date of Joining *</label>
                <q-input
                  v-model="form.dateOfJoining"
                  type="date"
                  outlined
                  dense
                  :error="!!errors.dateOfJoining"
                  :error-message="errors.dateOfJoining"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <q-select
                  v-model="form.status"
                  :options="statusOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
            </div>

            <q-separator class="q-my-md" />

            <div class="form-row">
              <div class="form-group full-width">
                <label class="form-label">System Role</label>
                <q-select
                  v-model="form.systemRole"
                  :options="systemRoleOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  :disable="isEdit && form.systemRole === 'owner'"
                >
                  <template v-slot:prepend>
                    <q-icon name="admin_panel_settings" size="xs" />
                  </template>
                </q-select>
                <div class="text-caption text-grey-6 q-mt-xs">
                  Assign system-level access permissions for this employee
                </div>
              </div>
            </div>

            <div v-if="form.systemRole && form.systemRole !== 'user'" class="form-row">
              <div class="form-group full-width">
                <label class="form-label">Permissions</label>
                <div class="permissions-grid">
                  <q-checkbox v-model="form.permissions.employees" label="Employees Management" dense />
                  <q-checkbox v-model="form.permissions.attendance" label="Attendance Management" dense />
                  <q-checkbox v-model="form.permissions.leave" label="Leave Management" dense />
                  <q-checkbox v-model="form.permissions.payroll" label="Payroll Management" dense />
                  <q-checkbox v-model="form.permissions.reports" label="Reports Access" dense />
                  <q-checkbox v-model="form.permissions.settings" label="Settings Management" dense />
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  Select which modules this role can access
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Bank Details -->
        <q-card class="form-card">
          <q-card-section class="card-header">
            <div class="card-title">Bank Details</div>
          </q-card-section>
          <q-card-section class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Bank Name</label>
                <q-input v-model="form.bankName" outlined dense />
              </div>
              <div class="form-group">
                <label class="form-label">Bank Branch</label>
                <q-input v-model="form.bankBranch" outlined dense />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Account Number</label>
                <q-input v-model="form.bankAccountNumber" outlined dense />
              </div>
              <div class="form-group">
                <label class="form-label">Account Name</label>
                <q-input v-model="form.bankAccountName" outlined dense />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <q-btn
          label="Cancel"
          flat
          color="black"
          to="/employees"
          no-caps
          class="cancel-btn"
        />
        <q-btn
          type="submit"
          :label="isEdit ? 'Update Employee' : 'Create Employee'"
          color="black"
          :loading="loading"
          no-caps
          class="submit-btn"
        />
      </div>
    </q-form>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const isEdit = computed(() => !!route.params.id);
const employeeId = computed(() => route.params.id as string);
const loading = ref(false);

// Form data
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  nicNumber: '',
  address: '',
  employeeCode: '',
  employmentType: 'full_time',
  departmentId: '',
  designationId: '',
  branchId: '',
  reportingManagerId: '',
  dateOfJoining: '',
  status: 'active',
  bankName: '',
  bankBranch: '',
  bankAccountNumber: '',
  bankAccountName: '',
  systemRole: 'user' as 'user' | 'admin' | 'owner',
  permissions: {
    employees: false,
    attendance: false,
    leave: false,
    payroll: false,
    reports: false,
    settings: false,
  },
});

const errors = reactive<Record<string, string>>({});

// Options
const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

const employmentTypeOptions = [
  { label: 'Full Time', value: 'full_time' },
  { label: 'Part Time', value: 'part_time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Intern', value: 'intern' },
];

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Pending', value: 'pending' },
];

const systemRoleOptions = [
  { label: 'User', value: 'user', description: 'No admin access - regular employee' },
  { label: 'Admin', value: 'admin', description: 'Full administrative access to all modules' },
  { label: 'Owner', value: 'owner', description: 'Full access + billing and company management' },
];

// Select options
const departmentOptions = ref<Array<{ label: string; value: string }>>([]);
const designationOptions = ref<Array<{ label: string; value: string }>>([]);
const branchOptions = ref<Array<{ label: string; value: string }>>([]);
const managerOptions = ref<Array<{ label: string; value: string }>>([]);

// Fetch dropdown options
const fetchOptions = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;

  try {
    // Departments
    const { data: departments } = await supabase
      .from('departments')
      .select('id, name')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');
    departmentOptions.value = ((departments || []) as Array<{ id: string; name: string }>).map((d) => ({
      label: d.name,
      value: d.id,
    }));

    // Designations
    const { data: designations } = await supabase
      .from('designations')
      .select('id, title')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('title');
    designationOptions.value = ((designations || []) as Array<{ id: string; title: string }>).map((d) => ({
      label: d.title,
      value: d.id,
    }));

    // Branches
    const { data: branches } = await supabase
      .from('branches')
      .select('id, name')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('name');
    branchOptions.value = ((branches || []) as Array<{ id: string; name: string }>).map((b) => ({
      label: b.name,
      value: b.id,
    }));

    // Managers (employees)
    const { data: managers } = await supabase
      .from('employees')
      .select(`id, profile:profiles(full_name)`)
      .eq('company_id', companyId)
      .eq('status', 'active')
      .is('deleted_at', null);
    managerOptions.value = ((managers || []) as Array<{ id: string; profile?: { full_name?: string } }>).map((m) => ({
      label: m.profile?.full_name || 'Unknown',
      value: m.id,
    }));
  } catch (error) {
    console.error('Error fetching options:', error);
  }
};

// Fetch employee data for edit
const fetchEmployee = async () => {
  if (!employeeId.value) return;

  loading.value = true;

  try {
    const { data, error } = await supabase
      .from('employees')
      .select(`*, profile:profiles(*)`)
      .eq('id', employeeId.value)
      .single();

    if (error) throw error;

    if (data) {
      const typedData = data as { profile?: { first_name?: string; last_name?: string; email?: string; phone?: string; date_of_birth?: string; gender?: string; nic_number?: string; address?: string }; employee_code?: string; employment_type?: string; department_id?: string; designation_id?: string; branch_id?: string; reporting_manager_id?: string; date_of_joining?: string; status?: string; bank_name?: string; bank_branch?: string; bank_account_number?: string; bank_account_name?: string };
      const profile = typedData.profile;
      if (!profile) return;
      const emp = typedData;
      form.firstName = profile.first_name || '';
      form.lastName = profile.last_name || '';
      form.email = profile.email || '';
      form.phone = profile.phone || '';
      form.dateOfBirth = profile.date_of_birth || '';
      form.gender = profile.gender || '';
      form.nicNumber = profile.nic_number || '';
      form.address = profile.address || '';
      form.employeeCode = emp.employee_code || '';
      form.employmentType = emp.employment_type || 'full_time';
      form.departmentId = emp.department_id || '';
      form.designationId = emp.designation_id || '';
      form.branchId = emp.branch_id || '';
      form.reportingManagerId = emp.reporting_manager_id || '';
      form.dateOfJoining = emp.date_of_joining || '';
      form.status = emp.status || 'active';
      form.bankName = emp.bank_name || '';
      form.bankBranch = emp.bank_branch || '';
      form.bankAccountNumber = emp.bank_account_number || '';
      form.bankAccountName = emp.bank_account_name || '';
    }
  } catch (error) {
    console.error('Error fetching employee:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load employee data',
    });
    void router.push('/employees');
  } finally {
    loading.value = false;
  }
};

// Generate employee code
const generateEmployeeCode = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;

  try {
    const { data, error } = await supabase.rpc('generate_employee_code', {
      p_company_id: companyId,
      p_prefix: 'EMP',
    } as never);

    if (!error && data) {
      form.employeeCode = data;
    }
  } catch (error) {
    console.error('Error generating employee code:', error);
  }
};

// Validate form
const validateForm = () => {
  let valid = true;

  // Clear errors
  Object.keys(errors).forEach((key) => (errors[key] = ''));

  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required';
    valid = false;
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required';
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Invalid email format';
    valid = false;
  }

  if (!form.employeeCode.trim()) {
    errors.employeeCode = 'Employee code is required';
    valid = false;
  }

  if (!form.departmentId) {
    errors.departmentId = 'Department is required';
    valid = false;
  }

  if (!form.dateOfJoining) {
    errors.dateOfJoining = 'Date of joining is required';
    valid = false;
  }

  return valid;
};

// Handle form submission
const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;

  try {
    const companyId = authStore.company?.id;
    if (!companyId) return;

    if (isEdit.value) {
      // Update existing employee
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: form.firstName,
          last_name: form.lastName || null,
          email: form.email,
          phone: form.phone || null,
          date_of_birth: form.dateOfBirth || null,
          gender: form.gender || null,
          nic_number: form.nicNumber || null,
          address: form.address || null,
        } as never)
        .eq('id', ((await supabase.from('employees').select('profile_id').eq('id', employeeId.value).single()).data as { profile_id: string } | null)?.profile_id as string);

      if (profileError) throw profileError;

      // Update employee
      const { error: employeeError } = await supabase
        .from('employees')
        .update({
          department_id: form.departmentId || null,
          designation_id: form.designationId || null,
          branch_id: form.branchId || null,
          reporting_manager_id: form.reportingManagerId || null,
          employment_type: form.employmentType,
          date_of_joining: form.dateOfJoining,
          status: form.status,
          bank_name: form.bankName || null,
          bank_branch: form.bankBranch || null,
          bank_account_number: form.bankAccountNumber || null,
          bank_account_name: form.bankAccountName || null,
        } as never)
        .eq('id', employeeId.value);

      if (employeeError) throw employeeError;

      $q.notify({
        type: 'positive',
        message: 'Employee updated successfully',
      });
    } else {
      // Create new employee
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: 'TempPass123!', // Temporary password, user will need to reset
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('User creation failed');

      // Create profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          company_id: companyId,
          first_name: form.firstName,
          last_name: form.lastName || null,
          email: form.email,
          phone: form.phone || null,
          date_of_birth: form.dateOfBirth || null,
          gender: form.gender || null,
          nic_number: form.nicNumber || null,
          address: form.address || null,
        } as never)
        .select('id')
        .single();

      if (profileError) throw profileError;

      // Create employee
      const { error: employeeError } = await supabase.from('employees').insert({
        profile_id: (profileData as { id: string }).id,
        company_id: companyId,
        employee_code: form.employeeCode,
        department_id: form.departmentId || null,
        designation_id: form.designationId || null,
        branch_id: form.branchId || null,
        reporting_manager_id: form.reportingManagerId || null,
        employment_type: form.employmentType,
        date_of_joining: form.dateOfJoining,
        status: form.status,
        bank_name: form.bankName || null,
        bank_branch: form.bankBranch || null,
        bank_account_number: form.bankAccountNumber || null,
        bank_account_name: form.bankAccountName || null,
      } as never);

      if (employeeError) throw employeeError;

      // Create company_admins record if role is admin or owner
      if (form.systemRole !== 'user') {
        const permissionsArray: string[] = [];
        if (form.permissions.employees) permissionsArray.push('employees.manage', 'employees.view');
        if (form.permissions.attendance) permissionsArray.push('attendance.manage', 'attendance.view');
        if (form.permissions.leave) permissionsArray.push('leave.manage', 'leave.view');
        if (form.permissions.payroll) permissionsArray.push('payroll.manage', 'payroll.view');
        if (form.permissions.reports) permissionsArray.push('reports.view');
        if (form.permissions.settings) permissionsArray.push('settings.manage');

        const { error: adminError } = await supabase.from('company_admins').insert({
          company_id: companyId,
          user_id: userId,
          role: form.systemRole,
          permissions: permissionsArray,
          is_active: true,
        } as never);

        if (adminError) throw adminError;
      }

      $q.notify({
        type: 'positive',
        message: 'Employee created successfully',
      });
    }

    void router.push('/employees');
  } catch (error: unknown) {
    console.error('Error saving employee:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Failed to save employee',
    });
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await fetchOptions();
  if (isEdit.value) {
    await fetchEmployee();
  } else {
    await generateEmployeeCode();
  }
});
</script>

<style lang="scss" scoped>
.employee-form-page {
  padding: var(--spacing-5);
}

.page-header {
  margin-bottom: var(--spacing-5);
}

.back-btn {
  margin-bottom: var(--spacing-2);
  padding-left: 0;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-black);
  margin: 0 0 var(--spacing-1);
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-gray-500);
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.form-card {
  border-radius: var(--radius-lg);
}

.card-header {
  padding: var(--spacing-4) var(--spacing-5);
  border-bottom: 1px solid var(--color-gray-100);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-black);
}

.card-body {
  padding: var(--spacing-5);
}

.form-row {
  display: flex;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);

  &:last-child {
    margin-bottom: 0;
  }
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-black);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  margin-top: var(--spacing-5);
}

.full-width {
  width: 100%;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
}

.cancel-btn {
  min-width: 100px;
}

.submit-btn {
  min-width: 160px;
}
</style>
