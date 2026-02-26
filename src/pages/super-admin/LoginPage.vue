<template>
  <q-layout view="lHh Lpr lFf" class="super-admin-login-layout">
    <q-page-container>
      <q-page class="login-page">
        <div class="login-container">
          <div class="login-card">
            <!-- Header -->
            <div class="login-header">
              <q-icon name="admin_panel_settings" size="48px" color="black" />
              <h1 class="login-title">Super Admin Portal</h1>
              <p class="login-subtitle">Platform Administration Access</p>
            </div>

            <!-- Alert -->
            <q-banner v-if="errorMessage" class="error-banner q-mb-md" dense>
              <template v-slot:avatar>
                <q-icon name="error" color="negative" />
              </template>
              {{ errorMessage }}
            </q-banner>

            <!-- Form -->
            <q-form @submit="handleLogin" class="login-form">
              <q-input
                v-model="form.email"
                label="Email"
                type="email"
                outlined
                dense
                class="q-mb-md"
                :rules="[(v) => !!v || 'Email is required']"
                :disable="loading"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

              <q-input
                v-model="form.password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                outlined
                dense
                class="q-mb-md"
                :rules="[(v) => !!v || 'Password is required']"
                :disable="loading"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>

              <q-btn
                type="submit"
                label="Sign In"
                color="black"
                size="lg"
                class="full-width"
                :loading="loading"
                no-caps
              />
            </q-form>

            <!-- Footer -->
            <div class="login-footer">
              <p class="footer-text">Authorized personnel only</p>
              <p class="footer-text">
                <router-link to="/auth/login" class="back-link">
                  <q-icon name="arrow_back" size="14px" class="q-mr-xs" />
                  Back to Company Login
                </router-link>
              </p>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useSuperAdminStore } from 'src/stores/superAdmin';

const router = useRouter();
const $q = useQuasar();
const superAdminStore = useSuperAdminStore();

const loading = ref(false);
const showPassword = ref(false);
const errorMessage = ref('');

const form = reactive({
  email: '',
  password: '',
});

const handleLogin = async () => {
  errorMessage.value = '';
  loading.value = true;

  try {
    const result = await superAdminStore.login(form.email, form.password);

    if (result.success) {
      $q.notify({
        type: 'positive',
        message: 'Welcome, Super Admin!',
        position: 'top',
      });
      void router.push('/super-admin/dashboard');
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
.super-admin-login-layout {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-6);
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  margin: var(--spacing-3) 0 var(--spacing-1);
}

.login-subtitle {
  font-size: 14px;
  color: var(--color-gray-500);
  margin: 0;
}

.error-banner {
  background: var(--color-gray-100);
  border-radius: var(--radius-md);
}

.login-form {
  margin-bottom: var(--spacing-4);
}

.full-width {
  width: 100%;
}

.login-footer {
  text-align: center;
  margin-top: var(--spacing-6);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-gray-200);
}

.footer-text {
  font-size: 13px;
  color: var(--color-gray-500);
  margin: var(--spacing-1) 0;
}

.back-link {
  color: var(--color-gray-600);
  text-decoration: none;
  display: inline-flex;
  align-items: center;

  &:hover {
    color: var(--color-black);
  }
}
</style>
