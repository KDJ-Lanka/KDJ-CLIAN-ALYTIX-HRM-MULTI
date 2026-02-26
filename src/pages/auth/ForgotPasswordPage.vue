<template>
  <div class="forgot-password-page">
    <!-- Header -->
    <div class="auth-header">
      <h2 class="auth-title">Reset password</h2>
      <p class="auth-subtitle">
        Enter your email and we'll send you a link to reset your password
      </p>
    </div>

    <!-- Success State -->
    <div v-if="emailSent" class="success-state">
      <div class="success-icon">
        <q-icon name="mark_email_read" size="48px" />
      </div>
      <h3 class="success-title">Check your email</h3>
      <p class="success-message">
        We've sent a password reset link to <strong>{{ form.email }}</strong>
      </p>
      <q-btn
        label="Back to Sign In"
        color="black"
        flat
        to="/auth/login"
        class="back-btn"
        no-caps
      />
    </div>

    <!-- Form -->
    <q-form v-else @submit="handleResetPassword" class="auth-form">
      <div class="form-group">
        <label class="form-label">Email</label>
        <q-input
          v-model="form.email"
          type="email"
          placeholder="Enter your email"
          outlined
          dense
          :error="!!errors.email"
          :error-message="errors.email"
        >
          <template v-slot:prepend>
            <q-icon name="email" size="20px" />
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

      <q-btn
        type="submit"
        label="Send Reset Link"
        color="black"
        class="full-width-btn"
        :loading="loading"
        no-caps
      />
    </q-form>

    <!-- Back to Login -->
    <div v-if="!emailSent" class="auth-footer-link">
      <router-link to="/auth/login" class="link">
        <q-icon name="arrow_back" size="16px" class="q-mr-xs" />
        Back to sign in
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth';

const $q = useQuasar();
const authStore = useAuthStore();

const form = reactive({
  email: '',
});

const errors = reactive({
  email: '',
});

const loading = ref(false);
const errorMessage = ref('');
const emailSent = ref(false);

const handleResetPassword = async () => {
  errors.email = '';
  errorMessage.value = '';

  if (!form.email.trim()) {
    errors.email = 'Email is required';
    return;
  }

  loading.value = true;

  try {
    const result = await authStore.resetPassword(form.email);

    if (result.success) {
      emailSent.value = true;
      $q.notify({
        type: 'positive',
        message: 'Reset link sent to your email',
        position: 'top',
      });
    } else {
      errorMessage.value = result.error || 'Failed to send reset link';
    }
  } catch {
    errorMessage.value = 'An unexpected error occurred';
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.forgot-password-page {
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

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-black);
}

.full-width-btn {
  width: 100%;
  height: 44px;
  font-weight: 600;
  border-radius: var(--radius-md);
}

.error-banner {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.success-state {
  text-align: center;
}

.success-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background-color: var(--color-gray-100);
  border-radius: 50%;
  margin-bottom: var(--spacing-4);
  color: var(--color-black);
}

.success-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-black);
  margin: 0 0 var(--spacing-2);
}

.success-message {
  font-size: 14px;
  color: var(--color-gray-500);
  margin: 0 0 var(--spacing-5);

  strong {
    color: var(--color-black);
    font-weight: 500;
  }
}

.back-btn {
  font-weight: 500;
}

.auth-footer-link {
  text-align: center;
  margin-top: var(--spacing-5);

  .link {
    display: inline-flex;
    align-items: center;
    font-size: 14px;
    color: var(--color-gray-600);
    text-decoration: none;

    &:hover {
      color: var(--color-black);
    }
  }
}
</style>
