<template>
  <q-page class="analytics-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Analytics</h1>
        <p class="page-subtitle">Platform performance and growth metrics</p>
      </div>
      <q-btn
        flat
        label="Refresh"
        icon="refresh"
        class="refresh-btn"
        :loading="superAdminStore.analyticsLoading"
        @click="loadAnalytics"
      />
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <q-card flat class="stat-card">
        <q-card-section>
          <div class="stat-icon companies">
            <q-icon name="business" size="24px" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ superAdminStore.stats?.totalCompanies || 0 }}</span>
            <span class="stat-label">Total Companies</span>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat class="stat-card">
        <q-card-section>
          <div class="stat-icon active">
            <q-icon name="check_circle" size="24px" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ superAdminStore.stats?.activeCompanies || 0 }}</span>
            <span class="stat-label">Active Companies</span>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat class="stat-card">
        <q-card-section>
          <div class="stat-icon employees">
            <q-icon name="people" size="24px" />
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ formatNumber(superAdminStore.stats?.totalEmployees || 0) }}</span>
            <span class="stat-label">Total Employees</span>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat class="stat-card">
        <q-card-section>
          <div class="stat-icon revenue">
            <q-icon name="attach_money" size="24px" />
          </div>
          <div class="stat-content">
            <span class="stat-value">Rs {{ formatNumber(superAdminStore.stats?.totalRevenue || 0) }}</span>
            <span class="stat-label">Monthly Revenue</span>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Charts Section -->
    <div v-if="superAdminStore.analyticsLoading" class="loading-container">
      <q-spinner size="48px" color="black" />
    </div>

    <div v-else class="charts-grid">
      <!-- Growth Chart -->
      <q-card flat class="chart-card full-width">
        <q-card-section class="card-header">
          <span class="card-title">Monthly Growth Trends</span>
        </q-card-section>
        <q-separator />
        <q-card-section class="card-body">
          <div v-if="growthData.length === 0" class="no-data">
            <q-icon name="show_chart" size="48px" color="grey-4" />
            <p>No growth data available</p>
          </div>
          <div v-else class="growth-chart">
            <div class="chart-container">
              <div class="chart-y-axis">
                <span class="y-label">{{ maxValue }}</span>
                <span class="y-label">{{ Math.round(maxValue / 2) }}</span>
                <span class="y-label">0</span>
              </div>
              <div class="chart-bars">
                <div
                  v-for="(data, index) in growthData"
                  :key="index"
                  class="bar-group"
                >
                  <div class="bar-container">
                    <div
                      class="bar companies"
                      :style="{ height: getBarHeight(data.companies, maxValue) }"
                    >
                      <q-tooltip>{{ data.month }}: {{ data.companies }} companies</q-tooltip>
                    </div>
                    <div
                      class="bar employees"
                      :style="{ height: getBarHeight(data.employees, maxValue) }"
                    >
                      <q-tooltip>{{ data.month }}: {{ data.employees }} employees</q-tooltip>
                    </div>
                  </div>
                  <span class="x-label">{{ data.month }}</span>
                </div>
              </div>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color companies"></div>
                <span>Companies</span>
              </div>
              <div class="legend-item">
                <div class="legend-color employees"></div>
                <span>Employees</span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Top Companies -->
      <q-card flat class="chart-card">
        <q-card-section class="card-header">
          <span class="card-title">Top Companies by Employees</span>
        </q-card-section>
        <q-separator />
        <q-card-section class="card-body">
          <div v-if="topCompanies.length === 0" class="no-data">
            <q-icon name="bar_chart" size="48px" color="grey-4" />
            <p>No company data available</p>
          </div>
          <div v-else class="company-list">
            <div
              v-for="(company, index) in topCompanies"
              :key="company.name"
              class="company-item"
            >
              <div class="company-rank">{{ index + 1 }}</div>
              <div class="company-info">
                <span class="company-name">{{ company.name }}</span>
                <div class="employee-bar-container">
                  <div
                    class="employee-bar"
                    :style="{ width: getBarWidth(company.employees) }"
                  ></div>
                </div>
              </div>
              <div class="employee-count">{{ company.employees }} employees</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Subscription Distribution -->
      <q-card flat class="chart-card">
        <q-card-section class="card-header">
          <span class="card-title">Subscription Distribution</span>
        </q-card-section>
        <q-separator />
        <q-card-section class="card-body">
          <div v-if="subscriptionDistribution.length === 0" class="no-data">
            <q-icon name="pie_chart" size="48px" color="grey-4" />
            <p>No subscription data available</p>
          </div>
          <div v-else class="subscription-list">
            <div
              v-for="sub in subscriptionDistribution"
              :key="sub.plan"
              class="subscription-item"
            >
              <div class="subscription-info">
                <div class="subscription-color" :class="`plan-${sub.plan}`"></div>
                <span class="subscription-name">{{ capitalize(sub.plan) }}</span>
              </div>
              <div class="subscription-stats">
                <span class="subscription-count">{{ sub.count }}</span>
                <span class="subscription-percent">
                  {{ getPercentage(sub.count) }}%
                </span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Quick Stats -->
      <q-card flat class="chart-card full-width">
        <q-card-section class="card-header">
          <span class="card-title">Platform Overview</span>
        </q-card-section>
        <q-separator />
        <q-card-section class="card-body">
          <div class="overview-grid">
            <div class="overview-item">
              <q-icon name="trending_up" size="32px" color="positive" />
              <div class="overview-info">
                <span class="overview-value">{{ activeRate }}%</span>
                <span class="overview-label">Company Active Rate</span>
              </div>
            </div>
            <div class="overview-item">
              <q-icon name="group_add" size="32px" color="primary" />
              <div class="overview-info">
                <span class="overview-value">{{ avgEmployeesPerCompany }}</span>
                <span class="overview-label">Avg Employees/Company</span>
              </div>
            </div>
            <div class="overview-item">
              <q-icon name="workspace_premium" size="32px" color="warning" />
              <div class="overview-info">
                <span class="overview-value">{{ paidCompanies }}</span>
                <span class="overview-label">Paid Subscriptions</span>
              </div>
            </div>
            <div class="overview-item">
              <q-icon name="schedule" size="32px" color="info" />
              <div class="overview-info">
                <span class="overview-value">{{ freeCompanies }}</span>
                <span class="overview-label">Free Tier Companies</span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useSuperAdminStore } from 'src/stores/superAdmin';
import { supabase } from 'src/boot/supabase';

const superAdminStore = useSuperAdminStore();
const growthData = ref<Array<{ month: string; companies: number; employees: number }>>([]);

const loadAnalytics = async () => {
  await Promise.all([
    superAdminStore.fetchStats(),
    superAdminStore.fetchAnalytics(),
    superAdminStore.fetchCompanies(),
  ]);
  await loadGrowthData();
};

const loadGrowthData = async () => {
  // Get company growth by month
  const { data: companyGrowth } = await supabase
    .from('companies')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

  // Get employee growth by month
  const { data: employeeGrowth } = await supabase
    .from('employees')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

  // Group by month
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
  }

  growthData.value = months.map(month => {
    const monthStart = new Date(month);
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

    const companies = (companyGrowth || []).filter(c => {
      const date = new Date(c.created_at);
      return date >= monthStart && date <= monthEnd;
    }).length;

    const employees = (employeeGrowth || []).filter(e => {
      const date = new Date(e.created_at);
      return date >= monthStart && date <= monthEnd;
    }).length;

    return { month, companies, employees };
  });
};

// Computed properties
const topCompanies = computed(() => {
  return superAdminStore.analytics?.topCompanies || [];
});

const subscriptionDistribution = computed(() => {
  return superAdminStore.analytics?.subscriptionDistribution || [];
});

const totalInDistribution = computed(() => {
  return subscriptionDistribution.value.reduce((sum, s) => sum + s.count, 0);
});

const activeRate = computed(() => {
  const total = superAdminStore.stats?.totalCompanies || 0;
  const active = superAdminStore.stats?.activeCompanies || 0;
  if (total === 0) return 0;
  return Math.round((active / total) * 100);
});

const avgEmployeesPerCompany = computed(() => {
  const total = superAdminStore.stats?.totalCompanies || 0;
  const employees = superAdminStore.stats?.totalEmployees || 0;
  if (total === 0) return 0;
  return Math.round(employees / total);
});

const paidCompanies = computed(() => {
  return subscriptionDistribution.value
    .filter((s) => s.plan !== 'free')
    .reduce((sum, s) => sum + s.count, 0);
});

const freeCompanies = computed(() => {
  const free = subscriptionDistribution.value.find((s) => s.plan === 'free');
  return free?.count || 0;
});

// Helper methods
const getBarWidth = (employees: number): string => {
  const max = Math.max(...topCompanies.value.map((c) => c.employees), 1);
  return `${(employees / max) * 100}%`;
};

const getPercentage = (count: number): number => {
  if (totalInDistribution.value === 0) return 0;
  return Math.round((count / totalInDistribution.value) * 100);
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Chart helpers
const maxValue = computed(() => {
  const maxCompanies = Math.max(...growthData.value.map(d => d.companies), 1);
  const maxEmployees = Math.max(...growthData.value.map(d => d.employees), 1);
  return Math.max(maxCompanies, maxEmployees);
});

const getBarHeight = (value: number, max: number): string => {
  if (max === 0) return '0%';
  return `${(value / max) * 100}%`;
};

onMounted(() => {
  void loadAnalytics();
});
</script>

<style lang="scss" scoped>
.analytics-page {
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

.refresh-btn {
  color: #737373;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  border: 1px solid #e5e5e5;
  border-radius: 12px;

  .q-card__section {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.companies {
    background: #e3f2fd;
    color: #1976d2;
  }
  &.active {
    background: #e8f5e9;
    color: #2e7d32;
  }
  &.employees {
    background: #fff3e0;
    color: #f57c00;
  }
  &.revenue {
    background: #fce4ec;
    color: #c2185b;
  }
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
}

.stat-label {
  font-size: 13px;
  color: #737373;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  border: 1px solid #e5e5e5;
  border-radius: 12px;

  &.full-width {
    grid-column: 1 / -1;
  }
}

.card-header {
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

.no-data {
  padding: 48px;
  text-align: center;
  color: #737373;
}

.company-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.company-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.company-rank {
  width: 28px;
  height: 28px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: #000000;
}

.company-info {
  flex: 1;
  min-width: 0;
}

.company-name {
  display: block;
  font-weight: 500;
  color: #000000;
  margin-bottom: 4px;
}

.employee-bar-container {
  height: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.employee-bar {
  height: 100%;
  background: #000000;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.employee-count {
  font-size: 13px;
  color: #737373;
  white-space: nowrap;
}

.subscription-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subscription-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.subscription-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.subscription-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;

  &.plan-free {
    background: #e0e0e0;
  }
  &.plan-starter {
    background: #81c784;
  }
  &.plan-professional {
    background: #64b5f6;
  }
  &.plan-enterprise {
    background: #ba68c8;
  }
}

.subscription-name {
  font-weight: 500;
  color: #000000;
}

.subscription-stats {
  display: flex;
  align-items: center;
  gap: 12px;
}

.subscription-count {
  font-weight: 600;
  color: #000000;
}

.subscription-percent {
  font-size: 13px;
  color: #737373;
  min-width: 40px;
  text-align: right;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

@media (max-width: 1024px) {
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }
}

.overview-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 12px;
}

.overview-info {
  display: flex;
  flex-direction: column;
}

.overview-value {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
}

.overview-label {
  font-size: 13px;
  color: #737373;
}

.growth-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-container {
  display: flex;
  gap: 16px;
  min-height: 200px;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 8px;
}

.y-label {
  font-size: 12px;
  color: #737373;
}

.chart-bars {
  flex: 1;
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar-container {
  display: flex;
  gap: 2px;
  width: 100%;
  height: 160px;
  align-items: flex-end;
}

.bar {
  flex: 1;
  min-height: 4px;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;

  &.companies {
    background: #1976d2;
  }

  &.employees {
    background: #f57c00;
  }
}

.x-label {
  font-size: 11px;
  color: #737373;
  text-align: center;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;

  &.companies {
    background: #1976d2;
  }

  &.employees {
    background: #f57c00;
  }
}
</style>
