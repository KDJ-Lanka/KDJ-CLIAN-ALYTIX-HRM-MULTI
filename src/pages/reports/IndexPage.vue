<template>
  <q-page class="reports-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Reports</h1>
        <p class="page-subtitle">Generate and download statutory reports and certificates</p>
      </div>
    </div>

    <div class="reports-grid">
      <q-card class="report-card" clickable @click="navigateTo('reports-t10-certificate')">
        <q-card-section class="report-card-section">
          <div class="report-icon">
            <q-icon name="description" size="48px" color="primary" />
          </div>
          <div class="report-info">
            <div class="report-title">T10 Certificate</div>
            <div class="report-description">APIT Deduction Certificate for Sri Lankan tax purposes</div>
          </div>
        </q-card-section>
        <q-card-section class="report-card-actions">
          <q-btn flat label="Generate" icon="arrow_forward" no-caps />
        </q-card-section>
      </q-card>

      <q-card class="report-card" clickable @click="navigateTo('reports-epf-etf')">
        <q-card-section class="report-card-section">
          <div class="report-icon">
            <q-icon name="folder_open" size="48px" color="secondary" />
          </div>
          <div class="report-info">
            <div class="report-title">EPF & ETF Forms</div>
            <div class="report-description">Employees' Provident Fund and Employees' Trust Fund statutory forms</div>
          </div>
        </q-card-section>
        <q-card-section class="report-card-actions">
          <q-btn flat label="Generate" icon="arrow_forward" no-caps />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateTo = (routeName: string) => {
  void router.push({ name: routeName });
};
</script>

<style lang="scss" scoped>
.reports-page { padding: var(--spacing-5); }
.page-header { margin-bottom: var(--spacing-5); }
.page-title { font-size: 28px; font-weight: 700; margin: 0 0 var(--spacing-1); }
.page-subtitle { font-size: 14px; color: var(--color-gray-500); margin: 0; }

.reports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-5);
}

.report-card {
  border-radius: var(--radius-lg);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.report-card-section {
  display: flex;
  gap: var(--spacing-4);
  align-items: flex-start;
}

.report-icon {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-50);
  border-radius: var(--radius-md);
}

.report-info {
  flex: 1;
}

.report-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: var(--spacing-1);
}

.report-description {
  font-size: 14px;
  color: var(--color-gray-500);
  line-height: 1.5;
}

.report-card-actions {
  padding-top: 0;
}

@media (max-width: 600px) {
  .reports-grid {
    grid-template-columns: 1fr;
  }
}
</style>
