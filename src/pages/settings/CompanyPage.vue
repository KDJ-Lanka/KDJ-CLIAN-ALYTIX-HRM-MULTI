<template>
  <q-page class="page-class">
    <div class="page-header">
      <div>
        <h1 class="page-title">Company Settings</h1>
        <p class="page-subtitle">Manage your organization details</p>
      </div>
    </div>

    <q-card class="settings-card">
      <q-card-section>
        <q-form @submit="saveCompany">
          <div class="section-title">Basic Information</div>
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-6">
              <q-input v-model="form.name" label="Company Name *" outlined dense :rules="[v => !!v || 'Required']" />
            </div>
            <div class="col-6">
              <q-input v-model="form.slug" label="Slug" outlined dense hint="URL-friendly identifier" />
            </div>
          </div>
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-6">
              <q-input v-model="form.email" label="Email *" type="email" outlined dense :rules="[v => !!v || 'Required']" />
            </div>
            <div class="col-6">
              <q-input v-model="form.phone" label="Phone" outlined dense />
            </div>
          </div>
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <q-input v-model="form.website" label="Website" outlined dense />
            </div>
          </div>

          <q-separator class="q-my-lg" />

          <div class="section-title">Address</div>
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12">
              <q-input v-model="form.address" label="Address" outlined dense autogrow />
            </div>
          </div>
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-4">
              <q-input v-model="form.city" label="City" outlined dense />
            </div>
            <div class="col-4">
              <q-input v-model="form.state" label="State/Province" outlined dense />
            </div>
            <div class="col-4">
              <q-input v-model="form.country" label="Country" outlined dense />
            </div>
          </div>
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-4">
              <q-input v-model="form.postal_code" label="Postal Code" outlined dense />
            </div>
          </div>

          <q-separator class="q-my-lg" />

          <div class="section-title">Work Settings</div>
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-4">
              <q-input v-model="form.work_start_time" label="Work Start Time" type="time" outlined dense />
            </div>
            <div class="col-4">
              <q-input v-model="form.work_end_time" label="Work End Time" type="time" outlined dense />
            </div>
            <div class="col-4">
              <q-input v-model.number="form.working_days" label="Working Days/Week" type="number" outlined dense min="1" max="7" />
            </div>
          </div>

          <q-separator class="q-my-lg" />

          <div class="section-title">Currency & Locale</div>
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-4">
              <q-select v-model="form.currency" :options="currencyOptions" label="Currency" outlined dense emit-value map-options />
            </div>
            <div class="col-4">
              <q-select v-model="form.timezone" :options="timezoneOptions" label="Timezone" outlined dense emit-value map-options />
            </div>
            <div class="col-4">
              <q-select v-model="form.date_format" :options="dateFormatOptions" label="Date Format" outlined dense emit-value map-options />
            </div>
          </div>

          <div class="flex justify-end">
            <q-btn label="Save Changes" color="black" type="submit" :loading="saving" no-caps />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';

const $q = useQuasar();
const authStore = useAuthStore();

const saving = ref(false);

const form = reactive({
  name: '',
  slug: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
  currency: 'USD',
  timezone: 'UTC',
  date_format: 'MM/DD/YYYY',
  work_start_time: '09:00',
  work_end_time: '18:00',
  working_days: 5,
});

const currencyOptions = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
  { label: 'INR (₹)', value: 'INR' },
];

const timezoneOptions = [
  { label: 'UTC', value: 'UTC' },
  { label: 'Eastern Time (ET)', value: 'America/New_York' },
  { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
  { label: 'Central Time (CT)', value: 'America/Chicago' },
];

const dateFormatOptions = [
  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
];

const fetchCompany = () => {
  const company = authStore.company as Record<string, unknown> | null;
  if (!company) return;

  Object.assign(form, {
    name: company.name || '',
    slug: company.slug || '',
    email: company.email || '',
    phone: company.phone || '',
    website: company.website || '',
    address: company.address || '',
    city: company.city || '',
    state: company.state || '',
    country: company.country || '',
    postal_code: company.postal_code || '',
    currency: company.currency || 'USD',
    timezone: company.timezone || 'UTC',
    date_format: company.date_format || 'MM/DD/YYYY',
    work_start_time: company.work_start_time || '09:00',
    work_end_time: company.work_end_time || '18:00',
    working_days: company.working_days || 5,
  });
};

const saveCompany = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;

  saving.value = true;
  try {
    await supabase.from('companies').update(form as never).eq('id', companyId);
    await authStore.fetchProfile();
    $q.notify({ type: 'positive', message: 'Company settings saved' });
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to save settings' });
  } finally {
    saving.value = false;
  }
};

onMounted(fetchCompany);
</script>

<style lang="scss" scoped>
.page-class { padding: var(--spacing-5); }
.page-header { margin-bottom: var(--spacing-5); }
.page-title { font-size: 28px; font-weight: 700; margin: 0 0 var(--spacing-1); }
.page-subtitle { font-size: 14px; color: var(--color-gray-500); margin: 0; }
.settings-card { border-radius: var(--radius-lg); }
.section-title { font-weight: 600; font-size: 16px; margin-bottom: var(--spacing-4); }
</style>
