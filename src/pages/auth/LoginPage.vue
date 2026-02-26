<template>
  <div class="login-page">
    <!-- Header -->
    <div class="auth-header">
      <h2 class="auth-title">Welcome back</h2>
      <p class="auth-subtitle">Sign in to your account to continue</p>
    </div>

    <!-- Form -->
    <q-form @submit="handleLogin" class="auth-form">
      <!-- Email -->
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
          :rules="[(val) => !!val || 'Email is required']"
        >
          <template v-slot:prepend>
            <q-icon name="email" size="20px" />
          </template>
        </q-input>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label class="form-label">Password</label>
        <q-input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Enter your password"
          outlined
          dense
          :error="!!errors.password"
          :error-message="errors.password"
          :rules="[(val) => !!val || 'Password is required']"
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

      <!-- Remember & Forgot -->
      <div class="form-row">
        <q-checkbox v-model="form.remember" label="Remember me" dense />
        <router-link to="/auth/forgot-password" class="forgot-link">
          Forgot password?
        </router-link>
      </div>

      <!-- Error Message -->
      <q-banner
        v-if="errorMessage"
        class="error-banner"
        dense
        rounded
        :class="{ 'q-mb-md': true }"
      >
        <template v-slot:avatar>
          <q-icon name="error_outline" color="negative" />
        </template>
        {{ errorMessage }}
      </q-banner>

      <!-- Submit Button -->
      <q-btn
        type="submit"
        label="Sign In"
        color="black"
        class="full-width-btn"
        :loading="loading"
        no-caps
      />
    </q-form>

    <!-- Divider -->
    <div class="auth-divider">
      <span>or</span>
    </div>

    <!-- Register Link -->
    <div class="auth-footer-link">
      <span>Don't have an account?</span>
      <router-link to="/auth/register" class="link"> Create account </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth';

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();

const form = reactive({
  email: '',
  password: '',
  remember: false,
});

const errors = reactive({
  email: '',
  password: '',
});

const showPassword = ref(false);
const errorMessage = ref('');
const loading = ref(false);

const handleLogin = async () => {
  // Reset errors
  errors.email = '';
  errors.password = '';
  errorMessage.value = '';

  // Validate
  if (!form.email) {
    errors.email = 'Email is required';
    return;
  }
  if (!form.password) {
    errors.password = 'Password is required';
    return;
  }

  loading.value = true;

  try {
    const result = await authStore.login({
      email: form.email,
      password: form.password,
    });

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Welcome back!',
        position: 'top',
      });
      void router.push('/dashboard');
    } else {
      errorMessage.value = result.error || 'Login failed';
    }
  } catch {
    errorMessage.value = 'An unexpected error occurred';
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-page {
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

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.forgot-link {
  font-size: 14px;
  color: var(--color-gray-600);
  text-decoration: none;

  &:hover {
    color: var(--color-black);
    text-decoration: underline;
  }
}

.error-banner {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.full-width-btn {
  width: 100%;
  height: 44px;
  font-weight: 600;
  border-radius: var(--radius-md);
}

.auth-divider {
  display: flex;
  align-items: center;
  margin: var(--spacing-5) 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: var(--color-gray-200);
  }

  span {
    padding: 0 var(--spacing-3);
    font-size: 14px;
    color: var(--color-gray-500);
  }
}

.auth-footer-link {
  text-align: center;
  font-size: 14px;
  color: var(--color-gray-500);

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
