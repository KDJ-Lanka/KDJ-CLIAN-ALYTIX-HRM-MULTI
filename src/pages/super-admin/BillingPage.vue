<template>
  <q-page class="billing-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Billing</h1>
        <p class="page-subtitle">Revenue and subscription management</p>
      </div>
    </div>

    <!-- Revenue Cards -->
    <div v-if="superAdminStore.billingLoading" class="loading-container">
      <q-spinner size="48px" color="black" />
    </div>

    <template v-else>
      <div class="revenue-grid">
        <q-card flat class="revenue-card">
          <q-card-section>
            <div class="revenue-icon mrr">
              <q-icon name="payments" size="24px" />
            </div>
            <div class="revenue-content">
              <span class="revenue-value">${{ formatCurrency(billing?.mrr || 0) }}</span>
              <span class="revenue-label">Monthly Recurring Revenue</span>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat class="revenue-card">
          <q-card-section>
            <div class="revenue-icon annual">
              <q-icon name="trending_up" size="24px" />
            </div>
            <div class="revenue-content">
              <span class="revenue-value">${{ formatCurrency(billing?.totalRevenue || 0) }}</span>
              <span class="revenue-label">Annual Revenue (Projected)</span>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat class="revenue-card">
          <q-card-section>
            <div class="revenue-icon subscriptions">
              <q-icon name="workspace_premium" size="24px" />
            </div>
            <div class="revenue-content">
              <span class="revenue-value">{{ billing?.activeSubscriptions || 0 }}</span>
              <span class="revenue-label">Active Subscriptions</span>
            </div>
          </q-card-section>
        </q-card>

        <q-card flat class="revenue-card">
          <q-card-section>
            <div class="revenue-icon companies">
              <q-icon name="business" size="24px" />
            </div>
            <div class="revenue-content">
              <span class="revenue-value">{{ superAdminStore.stats?.totalCompanies || 0 }}</span>
              <span class="revenue-label">Total Companies</span>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Subscription Plans -->
      <q-card flat class="plans-card">
        <q-card-section class="card-header">
          <span class="card-title">Subscription Plans</span>
        </q-card-section>
        <q-separator />
        <q-card-section class="card-body">
          <div class="plans-grid">
            <div
              v-for="plan in billing?.plans"
              :key="plan.id"
              class="plan-card"
              :class="{ popular: plan.is_popular }"
            >
              <div v-if="plan.is_popular" class="popular-badge">Most Popular</div>
              <div class="plan-header">
                <span class="plan-name">{{ plan.display_name }}</span>
                <span class="plan-price">
                  ${{ plan.price_monthly }}
                  <span class="price-period">/month</span>
                </span>
              </div>
              <div class="plan-description">{{ plan.description }}</div>
              <div class="plan-features">
                <div class="feature-item">
                  <q-icon name="people" size="16px" />
                  <span>Up to {{ plan.max_employees }} employees</span>
                </div>
                <div class="feature-item">
                  <q-icon name="storage" size="16px" />
                  <span>{{ plan.max_storage_mb }}MB storage</span>
                </div>
              </div>
              <div class="plan-stats">
                <span class="companies-count">
                  {{ getCompaniesCount(plan.name) }} companies
                </span>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Companies by Plan -->
      <q-card flat class="distribution-card">
        <q-card-section class="card-header">
          <span class="card-title">Companies by Subscription</span>
        </q-card-section>
        <q-separator />
        <q-card-section class="card-body">
          <div v-if="billing?.companiesByPlan?.length === 0" class="no-data">
            <q-icon name="pie_chart" size="48px" color="grey-4" />
            <p>No subscription data available</p>
          </div>
          <div v-else class="distribution-list">
            <div
              v-for="item in billing?.companiesByPlan"
              :key="item.plan"
              class="distribution-item"
            >
              <div class="distribution-info">
                <div class="plan-indicator" :class="`plan-${item.plan}`"></div>
                <span class="plan-label">{{ capitalize(item.plan) }}</span>
              </div>
              <div class="distribution-bar-container">
                <div
                  class="distribution-bar"
                  :class="`plan-${item.plan}`"
                  :style="{ width: getDistributionWidth(item.count) }"
                ></div>
              </div>
              <span class="distribution-count">{{ item.count }}</span>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useSuperAdminStore, type BillingData } from 'src/stores/superAdmin';

const superAdminStore = useSuperAdminStore();

const billing = computed<BillingData | null>(() => superAdminStore.billing);

const totalCompanies = computed(() => {
  return billing.value?.companiesByPlan?.reduce((sum, item) => sum + item.count, 0) || 0;
});

const loadBillingData = async () => {
  await Promise.all([
    superAdminStore.fetchStats(),
    superAdminStore.fetchBillingData(),
  ]);
};

const getCompaniesCount = (planName: string): number => {
  const item = billing.value?.companiesByPlan?.find((c) => c.plan === planName);
  return item?.count || 0;
};

const getDistributionWidth = (count: number): string => {
  if (totalCompanies.value === 0) return '0%';
  return `${(count / totalCompanies.value) * 100}%`;
};

const formatCurrency = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toFixed(0);
};

const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

onMounted(() => {
  void loadBillingData();
});
</script>

<style lang="scss" scoped>
.billing-page {
  padding: 24px;
}

.page-header {
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

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.revenue-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1024px) {
  .revenue-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .revenue-grid {
    grid-template-columns: 1fr;
  }
}

.revenue-card {
  border: 1px solid #e5e5e5;
  border-radius: 12px;

  .q-card__section {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.revenue-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  &.mrr {
    background: #e8f5e9;
    color: #2e7d32;
  }
  &.annual {
    background: #e3f2fd;
    color: #1976d2;
  }
  &.subscriptions {
    background: #fff3e0;
    color: #f57c00;
  }
  &.companies {
    background: #fce4ec;
    color: #c2185b;
  }
}

.revenue-content {
  display: flex;
  flex-direction: column;
}

.revenue-value {
  font-size: 24px;
  font-weight: 700;
  color: #000000;
}

.revenue-label {
  font-size: 13px;
  color: #737373;
}

.plans-card,
.distribution-card {
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  margin-bottom: 24px;
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

.plans-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1200px) {
  .plans-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }
}

.plan-card {
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 20px;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    border-color: #000000;
  }

  &.popular {
    border-color: #000000;
    border-width: 2px;
  }
}

.popular-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #000000;
  color: #ffffff;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 12px;
  text-transform: uppercase;
}

.plan-header {
  margin-bottom: 8px;
}

.plan-name {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #000000;
}

.plan-price {
  font-size: 28px;
  font-weight: 700;
  color: #000000;
}

.price-period {
  font-size: 14px;
  font-weight: 400;
  color: #737373;
}

.plan-description {
  font-size: 13px;
  color: #737373;
  margin-bottom: 16px;
}

.plan-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #404040;
}

.plan-stats {
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.companies-count {
  font-size: 13px;
  color: #737373;
}

.no-data {
  padding: 48px;
  text-align: center;
  color: #737373;
}

.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.distribution-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.plan-indicator {
  width: 12px;
  height: 12px;
  border-radius: 3px;

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

.plan-label {
  font-weight: 500;
  color: #000000;
}

.distribution-bar-container {
  flex: 1;
  height: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.distribution-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;

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

.distribution-count {
  font-weight: 600;
  color: #000000;
  min-width: 40px;
  text-align: right;
}
</style>
