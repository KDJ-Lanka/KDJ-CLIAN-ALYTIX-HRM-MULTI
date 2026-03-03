<template>
  <q-page class="settings-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Platform Settings</h1>
        <p class="page-subtitle">Configure platform-wide settings and preferences</p>
      </div>
      <q-btn
        unelevated
        label="Save Changes"
        icon="save"
        class="save-btn"
        :loading="saving"
        @click="saveSettings"
      />
    </div>

    <!-- Settings Sections -->
    <div v-if="superAdminStore.settingsLoading" class="loading-container">
      <q-spinner size="48px" color="black" />
    </div>

    <div v-else class="settings-grid">
      <!-- General Settings -->
      <q-card flat class="settings-card">
        <q-card-section class="card-header">
          <q-icon name="settings" size="24px" />
          <span class="card-title">General</span>
        </q-card-section>
        <q-separator />
        <q-card-section class="card-body">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Platform Name</span>
              <span class="setting-desc">Display name for the platform</span>
            </div>
            <q-input
              v-model="settings.platform_name"
              dense
              outlined
              class="setting-input"
            />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Support Email</span>
              <span class="setting-desc">Email address for support inquiries</span>
            </div>
            <q-input
              v-model="settings.platform_support_email"
              dense
              outlined
              type="email"
              class="setting-input"
            />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Default Timezone</span>
              <span class="setting-desc">Default timezone for new companies</span>
            </div>
            <q-select
              v-model="settings.platform_default_timezone"
              :options="timezoneOptions"
              dense
              outlined
              emit-value
              map-options
              class="setting-input"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Security Settings -->
      <q-card flat class="settings-card">
        <q-card-section class="card-header">
          <q-icon name="security" size="24px" />
          <span class="card-title">Security</span>
        </q-card-section>
        <q-separator />
        <q-card-section class="card-body">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Session Timeout</span>
              <span class="setting-desc">Session timeout in minutes</span>
            </div>
            <q-input
              v-model.number="settings.session_timeout_minutes"
              dense
              outlined
              type="number"
              min="5"
              max="1440"
              class="setting-input-small"
            />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Minimum Password Length</span>
              <span class="setting-desc">Minimum characters required</span>
            </div>
            <q-input
              v-model.number="settings.password_min_length"
              dense
              outlined
              type="number"
              min="6"
              max="32"
              class="setting-input-small"
            />
          </div>
          <div class="setting-item toggle-item">
            <div class="setting-info">
              <span class="setting-label">Require Uppercase</span>
              <span class="setting-desc">Password must contain uppercase letters</span>
            </div>
            <q-toggle v-model="settings.password_require_uppercase" />
          </div>
          <div class="setting-item toggle-item">
            <div class="setting-info">
              <span class="setting-label">Require Numbers</span>
              <span class="setting-desc">Password must contain numbers</span>
            </div>
            <q-toggle v-model="settings.password_require_numbers" />
          </div>
          <div class="setting-item toggle-item">
            <div class="setting-info">
              <span class="setting-label">Require Special Characters</span>
              <span class="setting-desc">Password must contain special characters</span>
            </div>
            <q-toggle v-model="settings.password_require_special" />
          </div>
          <div class="setting-item toggle-item">
            <div class="setting-info">
              <span class="setting-label">Require Two-Factor Auth</span>
              <span class="setting-desc">Force 2FA for all users</span>
            </div>
            <q-toggle v-model="settings.require_2fa" />
          </div>
        </q-card-section>
      </q-card>

      <!-- Feature Flags -->
      <q-card flat class="settings-card">
        <q-card-section class="card-header">
          <q-icon name="toggle_on" size="24px" />
          <span class="card-title">Features</span>
        </q-card-section>
        <q-separator />
        <q-card-section class="card-body">
          <div class="setting-item toggle-item">
            <div class="setting-info">
              <span class="setting-label">Analytics Module</span>
              <span class="setting-desc">Enable analytics for all companies</span>
            </div>
            <q-toggle v-model="settings.feature_analytics_enabled" />
          </div>
          <div class="setting-item toggle-item">
            <div class="setting-info">
              <span class="setting-label">Billing Module</span>
              <span class="setting-desc">Enable billing and subscription management</span>
            </div>
            <q-toggle v-model="settings.feature_billing_enabled" />
          </div>
          <div class="setting-item toggle-item">
            <div class="setting-info">
              <span class="setting-label">Support Tickets</span>
              <span class="setting-desc">Enable support ticket system</span>
            </div>
            <q-toggle v-model="settings.feature_support_enabled" />
          </div>
          <div class="setting-item toggle-item">
            <div class="setting-info">
              <span class="setting-label">API Access</span>
              <span class="setting-desc">Allow companies to use API</span>
            </div>
            <q-toggle v-model="settings.feature_api_access_enabled" />
          </div>
        </q-card-section>
      </q-card>

      <!-- Limits -->
      <q-card flat class="settings-card">
        <q-card-section class="card-header">
          <q-icon name="speed" size="24px" />
          <span class="card-title">Limits</span>
        </q-card-section>
        <q-separator />
        <q-card-section class="card-body">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Maximum Companies</span>
              <span class="setting-desc">Maximum companies on platform</span>
            </div>
            <q-input
              v-model.number="settings.max_companies"
              dense
              outlined
              type="number"
              min="1"
              class="setting-input-small"
            />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Max Employees per Company</span>
              <span class="setting-desc">Default employee limit per company</span>
            </div>
            <q-input
              v-model.number="settings.max_employees_per_company"
              dense
              outlined
              type="number"
              min="1"
              class="setting-input-small"
            />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Max Storage (MB)</span>
              <span class="setting-desc">Default storage limit per company</span>
            </div>
            <q-input
              v-model.number="settings.max_storage_per_company_mb"
              dense
              outlined
              type="number"
              min="100"
              class="setting-input-small"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Maintenance Mode -->
      <q-card flat class="settings-card">
        <q-card-section class="card-header">
          <q-icon name="build" size="24px" />
          <span class="card-title">Maintenance</span>
        </q-card-section>
        <q-separator />
        <q-card-section class="card-body">
          <div class="setting-item toggle-item">
            <div class="setting-info">
              <span class="setting-label">Maintenance Mode</span>
              <span class="setting-desc">Put platform in maintenance mode</span>
            </div>
            <q-toggle
              v-model="settings.maintenance_mode"
              :false-value="false"
              :true-value="true"
              color="warning"
            />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Maintenance Message</span>
              <span class="setting-desc">Message shown during maintenance</span>
            </div>
            <q-input
              v-model="settings.maintenance_message"
              dense
              outlined
              type="textarea"
              rows="2"
              class="setting-input"
            />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">Allowed IPs</span>
              <span class="setting-desc">IPs that bypass maintenance mode</span>
            </div>
            <q-input
              v-model="allowedIpsString"
              dense
              outlined
              placeholder="127.0.0.1, 192.168.1.1"
              class="setting-input"
              @blur="updateAllowedIps"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useSuperAdminStore } from 'src/stores/superAdmin';

interface PlatformSettings {
  platform_name: string;
  platform_support_email: string;
  platform_default_timezone: string;
  session_timeout_minutes: number;
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_numbers: boolean;
  password_require_special: boolean;
  require_2fa: boolean;
  feature_analytics_enabled: boolean;
  feature_billing_enabled: boolean;
  feature_support_enabled: boolean;
  feature_api_access_enabled: boolean;
  max_companies: number;
  max_employees_per_company: number;
  max_storage_per_company_mb: number;
  maintenance_mode: boolean;
  maintenance_message: string;
  maintenance_allowed_ips: string[];
}

const $q = useQuasar();
const superAdminStore = useSuperAdminStore();

const saving = ref(false);

// Local settings state with defaults
const settings = ref<PlatformSettings>({
  platform_name: 'Anlytix HRM',
  platform_support_email: 'support@anlytix.com',
  platform_default_timezone: 'UTC',
  session_timeout_minutes: 60,
  password_min_length: 8,
  password_require_uppercase: true,
  password_require_numbers: true,
  password_require_special: true,
  require_2fa: false,
  feature_analytics_enabled: true,
  feature_billing_enabled: true,
  feature_support_enabled: true,
  feature_api_access_enabled: true,
  max_companies: 1000,
  max_employees_per_company: 500,
  max_storage_per_company_mb: 10240,
  maintenance_mode: false,
  maintenance_message: 'System is under maintenance. Please try again later.',
  maintenance_allowed_ips: [],
});

// Allowed IPs as comma-separated string
const allowedIpsString = computed({
  get: () => {
    const ips = settings.value.maintenance_allowed_ips as string[] | undefined;
    return ips?.join(', ') || '';
  },
  set: () => {
    // Handled by updateAllowedIps
  },
});

const updateAllowedIps = () => {
  const input = (document.querySelector('.setting-input input') as HTMLInputElement)?.value || '';
  const ips = input
    .split(',')
    .map((ip) => ip.trim())
    .filter((ip) => ip.length > 0);
  settings.value.maintenance_allowed_ips = ips;
};

// Timezone options
const timezoneOptions = [
  { label: 'UTC', value: 'UTC' },
  { label: 'US/Eastern', value: 'US/Eastern' },
  { label: 'US/Pacific', value: 'US/Pacific' },
  { label: 'Europe/London', value: 'Europe/London' },
  { label: 'Asia/Dubai', value: 'Asia/Dubai' },
  { label: 'Asia/Kolkata', value: 'Asia/Kolkata' },
  { label: 'Asia/Singapore', value: 'Asia/Singapore' },
  { label: 'Australia/Sydney', value: 'Australia/Sydney' },
];

const loadSettings = async () => {
  await superAdminStore.fetchPlatformSettings();
  // Copy settings from store with type safety
  const storeSettings = superAdminStore.platformSettings;

  // Helper to extract string from potentially JSON-encoded values
  const getStringValue = (val: unknown, defaultVal: string): string => {
    if (val === null || val === undefined) return defaultVal;
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    return defaultVal;
  };

  settings.value = {
    platform_name: getStringValue(storeSettings.platform_name, 'Anlytix HRM'),
    platform_support_email: getStringValue(storeSettings.platform_support_email, 'support@anlytix.com'),
    platform_default_timezone: getStringValue(storeSettings.platform_default_timezone, 'UTC'),
    session_timeout_minutes: Number(storeSettings.session_timeout_minutes ?? 60),
    password_min_length: Number(storeSettings.password_min_length ?? 8),
    password_require_uppercase: Boolean(storeSettings.password_require_uppercase),
    password_require_numbers: Boolean(storeSettings.password_require_numbers),
    password_require_special: Boolean(storeSettings.password_require_special),
    require_2fa: Boolean(storeSettings.require_2fa),
    feature_analytics_enabled: Boolean(storeSettings.feature_analytics_enabled),
    feature_billing_enabled: Boolean(storeSettings.feature_billing_enabled),
    feature_support_enabled: Boolean(storeSettings.feature_support_enabled),
    feature_api_access_enabled: Boolean(storeSettings.feature_api_access_enabled),
    max_companies: Number(storeSettings.max_companies ?? 1000),
    max_employees_per_company: Number(storeSettings.max_employees_per_company ?? 500),
    max_storage_per_company_mb: Number(storeSettings.max_storage_per_company_mb ?? 10240),
    maintenance_mode: Boolean(storeSettings.maintenance_mode),
    maintenance_message: getStringValue(storeSettings.maintenance_message, ''),
    maintenance_allowed_ips: Array.isArray(storeSettings.maintenance_allowed_ips)
      ? storeSettings.maintenance_allowed_ips
      : [],
  };
};

const saveSettings = async () => {
  saving.value = true;
  try {
    const result = await superAdminStore.updateMultipleSettings(settings.value as Record<string, unknown>);
    if (result.success) {
      $q.notify({ type: 'positive', message: 'Settings saved successfully' });
    } else {
      $q.notify({ type: 'negative', message: 'Failed to save settings' });
    }
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  void loadSettings();
});
</script>

<style lang="scss" scoped>
.settings-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.save-btn {
  background: #000000;
  color: #ffffff;
  border-radius: 8px;
  padding: 8px 24px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.settings-grid {
  display: grid;
  gap: 24px;
}

@media (min-width: 1024px) {
  .settings-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.settings-card {
  border: 1px solid #e5e5e5;
  border-radius: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #000000;
}

.card-body {
  padding: 16px 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.toggle-item {
  .setting-info {
    flex: 1;
  }
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-right: 16px;
}

.setting-label {
  font-weight: 500;
  color: #000000;
  font-size: 14px;
}

.setting-desc {
  font-size: 12px;
  color: #737373;
}

.setting-input {
  width: 200px;
}

.setting-input-small {
  width: 100px;
}
</style>
