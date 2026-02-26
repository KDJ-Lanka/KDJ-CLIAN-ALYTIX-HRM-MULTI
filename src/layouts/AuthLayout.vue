<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="auth-page">
        <div class="auth-container">
          <!-- Logo/Brand -->
          <div class="auth-brand">
            <div class="brand-logo">
              <q-icon name="business" size="32px" />
            </div>
            <h1 class="brand-title">Anlytix HRM</h1>
            <p class="brand-subtitle">Human Resource Management</p>
          </div>

          <!-- Auth Card -->
          <q-card class="auth-card">
            <router-view />
          </q-card>

          <!-- Footer -->
          <div class="auth-footer">
            <p>&copy; {{ currentYear }} Anlytix HRM. All rights reserved.</p>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-gray-100);
  padding: var(--spacing-5);
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-brand {
  text-align: center;
  margin-bottom: var(--spacing-6);
}

.brand-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background-color: var(--color-black);
  color: var(--color-white);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-4);
}

.brand-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-black);
  margin: 0 0 var(--spacing-1);
}

.brand-subtitle {
  font-size: 14px;
  color: var(--color-gray-500);
  margin: 0;
}

.auth-card {
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-gray-200);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-6);
}

.auth-footer {
  text-align: center;
  margin-top: var(--spacing-6);

  p {
    font-size: 12px;
    color: var(--color-gray-500);
    margin: 0;
  }
}
</style>
