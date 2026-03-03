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
          <!-- Logo Upload Section -->
          <div class="section-title">Company Logo</div>
          <div class="logo-section q-mb-lg">
            <div class="logo-preview" :class="{ 'has-logo': form.logo_url }">
              <img v-if="form.logo_url" :src="form.logo_url" alt="Company Logo" class="logo-image" />
              <div v-else class="logo-placeholder">
                <q-icon name="business" size="48px" color="grey-5" />
                <span class="text-grey-6">No logo uploaded</span>
              </div>
            </div>
            <div class="logo-actions">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />
              <q-btn
                outline
                color="black"
                :label="form.logo_url ? 'Change Logo' : 'Upload Logo'"
                icon="upload"
                no-caps
                @click="triggerFileInput"
                :loading="uploading"
                class="q-mr-sm"
              />
              <q-btn
                v-if="form.logo_url"
                flat
                color="negative"
                label="Remove"
                icon="delete"
                no-caps
                @click="removeLogo"
                :loading="removing"
              />
              <div class="text-caption text-grey-6 q-mt-sm">
                Recommended: Square image, at least 200x200px. Max file size: 2MB.
                <br />Supported formats: PNG, JPG, SVG
              </div>
            </div>
          </div>

          <q-separator class="q-my-lg" />

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
const uploading = ref(false);
const removing = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const form = reactive({
  name: '',
  slug: '',
  logo_url: '' as string | null,
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
    logo_url: company.logo_url || null,
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

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    void uploadLogo(file);
  }
  // Reset input so same file can be selected again
  target.value = '';
};

const uploadLogo = async (file: File) => {
  const companyId = authStore.company?.id;
  if (!companyId) return;

  // Validate file type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    $q.notify({
      type: 'negative',
      message: 'Invalid file type. Please upload PNG, JPG, SVG, or WebP.',
    });
    return;
  }

  // Validate file size (2MB max)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    $q.notify({
      type: 'negative',
      message: 'File size exceeds 2MB. Please upload a smaller image.',
    });
    return;
  }

  uploading.value = true;
  try {
    // Create unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${companyId}/logo-${Date.now()}.${fileExt}`;

    // Delete old logo if exists
    if (form.logo_url) {
      const oldPath = form.logo_url.split('/company-logos/')[1];
      if (oldPath) {
        await supabase.storage.from('company-logos').remove([oldPath]);
      }
    }

    // Upload new logo
    const { error: uploadError } = await supabase.storage
      .from('company-logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage.from('company-logos').getPublicUrl(fileName);

    const logoUrl = urlData.publicUrl;

    // Update company record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase
      .from('companies') as any)
      .update({ logo_url: logoUrl })
      .eq('id', companyId);

    if (updateError) throw updateError;

    // Update local state
    form.logo_url = logoUrl;
    await authStore.fetchProfile();

    $q.notify({
      type: 'positive',
      message: 'Logo uploaded successfully',
    });
  } catch (error) {
    console.error('Upload error:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to upload logo. Please try again.',
    });
  } finally {
    uploading.value = false;
  }
};

const removeLogo = async () => {
  const companyId = authStore.company?.id;
  if (!companyId || !form.logo_url) return;

  removing.value = true;
  try {
    // Delete from storage
    const oldPath = form.logo_url.split('/company-logos/')[1];
    if (oldPath) {
      await supabase.storage.from('company-logos').remove([oldPath]);
    }

    // Update company record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase
      .from('companies') as any)
      .update({ logo_url: null })
      .eq('id', companyId);

    if (updateError) throw updateError;

    // Update local state
    form.logo_url = null;
    await authStore.fetchProfile();

    $q.notify({
      type: 'positive',
      message: 'Logo removed successfully',
    });
  } catch (error) {
    console.error('Remove error:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to remove logo. Please try again.',
    });
  } finally {
    removing.value = false;
  }
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

.logo-section {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-5);
}

.logo-preview {
  width: 120px;
  height: 120px;
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-gray-50);

  &.has-logo {
    border-style: solid;
    border-color: var(--color-gray-200);
  }
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
}

.logo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  text-align: center;

  span {
    font-size: 12px;
  }
}

.logo-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-top: var(--spacing-2);
}

@media (max-width: 600px) {
  .logo-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .logo-actions {
    align-items: center;
  }
}
</style>
