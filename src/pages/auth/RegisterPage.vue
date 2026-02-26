<template>
  <div class="register-page">
    <!-- Header -->
    <div class="auth-header">
      <h2 class="auth-title">Create account</h2>
      <p class="auth-subtitle">Set up your company and admin account</p>
    </div>

    <!-- Form -->
    <q-form @submit="handleRegister" class="auth-form">
      <!-- Step Indicator -->
      <div class="step-indicator">
        <div
          class="step"
          :class="{ active: currentStep >= 1, completed: currentStep > 1 }"
        >
          <span class="step-number">1</span>
          <span class="step-label">Company</span>
        </div>
        <div class="step-line" :class="{ active: currentStep > 1 }"></div>
        <div class="step" :class="{ active: currentStep >= 2 }">
          <span class="step-number">2</span>
          <span class="step-label">Admin</span>
        </div>
      </div>

      <!-- Step 1: Company Info -->
      <div v-if="currentStep === 1" class="form-step">
        <div class="form-group">
          <label class="form-label">Company Name *</label>
          <q-input
            v-model="form.companyName"
            placeholder="Your company name"
            outlined
            dense
            :error="!!errors.companyName"
            :error-message="errors.companyName"
          >
            <template v-slot:prepend>
              <q-icon name="business" size="20px" />
            </template>
          </q-input>
        </div>

        <div class="form-group">
          <label class="form-label">Company Slug *</label>
          <q-input
            v-model="form.companySlug"
            placeholder="company-slug"
            outlined
            dense
            hint="Used in URLs, lowercase letters and hyphens only"
            :error="!!errors.companySlug"
            :error-message="errors.companySlug"
          >
            <template v-slot:prepend>
              <q-icon name="link" size="20px" />
            </template>
          </q-input>
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label class="form-label">Company Email *</label>
            <q-input
              v-model="form.companyEmail"
              type="email"
              placeholder="company@example.com"
              outlined
              dense
              :error="!!errors.companyEmail"
              :error-message="errors.companyEmail"
            >
              <template v-slot:prepend>
                <q-icon name="email" size="20px" />
              </template>
            </q-input>
          </div>

          <div class="form-group half">
            <label class="form-label">Phone</label>
            <q-input
              v-model="form.companyPhone"
              placeholder="+94 77 123 4567"
              outlined
              dense
            >
              <template v-slot:prepend>
                <q-icon name="phone" size="20px" />
              </template>
            </q-input>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Address</label>
          <q-input
            v-model="form.companyAddress"
            placeholder="Company address"
            outlined
            dense
            autogrow
          >
            <template v-slot:prepend>
              <q-icon name="location_on" size="20px" />
            </template>
          </q-input>
        </div>

        <q-btn
          label="Continue"
          color="black"
          class="full-width-btn"
          @click="nextStep"
          no-caps
        />
      </div>

      <!-- Step 2: Admin Info -->
      <div v-if="currentStep === 2" class="form-step">
        <div class="form-row">
          <div class="form-group half">
            <label class="form-label">First Name *</label>
            <q-input
              v-model="form.firstName"
              placeholder="John"
              outlined
              dense
              :error="!!errors.firstName"
              :error-message="errors.firstName"
            />
          </div>

          <div class="form-group half">
            <label class="form-label">Last Name</label>
            <q-input
              v-model="form.lastName"
              placeholder="Doe"
              outlined
              dense
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email *</label>
          <q-input
            v-model="form.email"
            type="email"
            placeholder="admin@example.com"
            outlined
            dense
            hint="This will be your login email"
            :error="!!errors.email"
            :error-message="errors.email"
          >
            <template v-slot:prepend>
              <q-icon name="email" size="20px" />
            </template>
          </q-input>
        </div>

        <div class="form-group">
          <label class="form-label">Phone</label>
          <q-input
            v-model="form.phone"
            placeholder="+94 77 123 4567"
            outlined
            dense
          >
            <template v-slot:prepend>
              <q-icon name="phone" size="20px" />
            </template>
          </q-input>
        </div>

        <div class="form-group">
          <label class="form-label">Password *</label>
          <q-input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Create a strong password"
            outlined
            dense
            hint="At least 8 characters"
            :error="!!errors.password"
            :error-message="errors.password"
          >
            <template v-slot:prepend>
              <q-icon name="lock" size="20px" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                size="20px"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
        </div>

        <div class="form-group">
          <label class="form-label">Confirm Password *</label>
          <q-input
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Confirm your password"
            outlined
            dense
            :error="!!errors.confirmPassword"
            :error-message="errors.confirmPassword"
          >
            <template v-slot:prepend>
              <q-icon name="lock" size="20px" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                size="20px"
                class="cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>
        </div>

        <!-- Error Message -->
        <q-banner
          v-if="errorMessage"
          class="error-banner q-mb-md"
          dense
          rounded
        >
          <template v-slot:avatar>
            <q-icon name="error_outline" color="negative" />
          </template>
          {{ errorMessage }}
        </q-banner>

        <div class="form-actions">
          <q-btn
            label="Back"
            flat
            color="black"
            @click="prevStep"
            no-caps
            class="back-btn"
          />
          <q-btn
            type="submit"
            label="Create Account"
            color="black"
            :loading="loading"
            no-caps
            class="submit-btn"
          />
        </div>
      </div>
    </q-form>

    <!-- Login Link -->
    <div class="auth-footer-link">
      <span>Already have an account?</span>
      <router-link to="/auth/login" class="link"> Sign in </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const currentStep = ref(1);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const form = reactive({
  // Company
  companyName: '',
  companySlug: '',
  companyEmail: '',
  companyPhone: '',
  companyAddress: '',
  // Admin
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
});

const errors = reactive<Record<string, string>>({});

// Auto-generate slug from company name
watch(
  () => form.companyName,
  (name) => {
    if (currentStep.value === 1 && !form.companySlug) {
      form.companySlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
  }
);

const validateStep1 = () => {
  let valid = true;

  if (!form.companyName.trim()) {
    errors.companyName = 'Company name is required';
    valid = false;
  } else {
    errors.companyName = '';
  }

  if (!form.companySlug.trim()) {
    errors.companySlug = 'Company slug is required';
    valid = false;
  } else if (!/^[a-z0-9-]+$/.test(form.companySlug)) {
    errors.companySlug = 'Only lowercase letters, numbers, and hyphens allowed';
    valid = false;
  } else {
    errors.companySlug = '';
  }

  if (!form.companyEmail.trim()) {
    errors.companyEmail = 'Company email is required';
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.companyEmail)) {
    errors.companyEmail = 'Invalid email format';
    valid = false;
  } else {
    errors.companyEmail = '';
  }

  return valid;
};

const validateStep2 = () => {
  let valid = true;

  if (!form.firstName.trim()) {
    errors.firstName = 'First name is required';
    valid = false;
  } else {
    errors.firstName = '';
  }

  if (!form.email.trim()) {
    errors.email = 'Email is required';
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Invalid email format';
    valid = false;
  } else {
    errors.email = '';
  }

  if (!form.password) {
    errors.password = 'Password is required';
    valid = false;
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
    valid = false;
  } else {
    errors.password = '';
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
    valid = false;
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
    valid = false;
  } else {
    errors.confirmPassword = '';
  }

  return valid;
};

const nextStep = () => {
  if (validateStep1()) {
    currentStep.value = 2;
  }
};

const prevStep = () => {
  currentStep.value = 1;
};

const handleRegister = async () => {
  errorMessage.value = '';

  if (!validateStep2()) {
    return;
  }

  loading.value = true;

  try {
    const result = await authStore.register({
      companyName: form.companyName,
      companySlug: form.companySlug,
      companyEmail: form.companyEmail,
      companyPhone: form.companyPhone || undefined,
      companyAddress: form.companyAddress || undefined,
      firstName: form.firstName,
      lastName: form.lastName || undefined,
      email: form.email,
      password: form.password,
      phone: form.phone || undefined,
    } as Parameters<typeof authStore.register>[0]);

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Account created successfully!',
        position: 'top',
      });
      void router.push('/dashboard');
    } else {
      errorMessage.value = result.error || 'Registration failed';
    }
  } catch {
    errorMessage.value = 'An unexpected error occurred';
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.register-page {
  width: 100%;
}

.auth-header {
  text-align: center;
  margin-bottom: var(--spacing-5);
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-black);
  margin: 0 0 var(--spacing-1);
}

.auth-subtitle {
  font-size: 14px;
  color: var(--color-gray-500);
  margin: 0;
}

.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-5);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);

  .step-number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--color-gray-200);
    color: var(--color-gray-500);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    transition: all var(--transition-fast);
  }

  .step-label {
    font-size: 12px;
    color: var(--color-gray-500);
    transition: color var(--transition-fast);
  }

  &.active {
    .step-number {
      background-color: var(--color-black);
      color: var(--color-white);
    }

    .step-label {
      color: var(--color-black);
      font-weight: 500;
    }
  }
}

.step-line {
  width: 60px;
  height: 2px;
  background-color: var(--color-gray-200);
  margin: 0 var(--spacing-2);
  margin-bottom: 20px;
  transition: background-color var(--transition-fast);

  &.active {
    background-color: var(--color-black);
  }
}

.auth-form {
  display: flex;
  flex-direction: column;
}

.form-step {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);

  &.half {
    flex: 1;
  }
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-black);
}

.form-row {
  display: flex;
  gap: var(--spacing-3);
}

.form-actions {
  display: flex;
  gap: var(--spacing-3);
  margin-top: var(--spacing-2);
}

.back-btn {
  flex: 1;
}

.submit-btn {
  flex: 2;
  height: 44px;
  font-weight: 600;
}

.full-width-btn {
  width: 100%;
  height: 44px;
  font-weight: 600;
  border-radius: var(--radius-md);
  margin-top: var(--spacing-2);
}

.error-banner {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.auth-footer-link {
  text-align: center;
  font-size: 14px;
  color: var(--color-gray-500);
  margin-top: var(--spacing-5);

  .link {
    color: var(--color-black);
    font-weight: 500;
    text-decoration: none;
    margin-left: var(--spacing-1);

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
