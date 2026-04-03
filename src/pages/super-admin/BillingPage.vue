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
              <span class="revenue-value">Rs {{ formatCurrency(billing?.mrr || 0) }}</span>
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
              <span class="revenue-value">Rs {{ formatCurrency(billing?.totalRevenue || 0) }}</span>
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
          <q-btn
            flat
            label="Manage Plans"
            icon="edit"
            color="black"
            no-caps
            @click="openPlansManager"
          />
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
                  {{ formatPlanCurrency(parseFloat(plan.price_monthly), plan.currency) }}
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

    <!-- Plan Manager Dialog -->
    <q-dialog v-model="planDialog.show" maximized>
      <q-card class="plan-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">Manage Subscription Plans</div>
          <q-btn flat dense round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-md">
          <div class="row q-col-gutter-md justify-end">
            <div class="col-12 text-right">
              <q-btn
                unelevated
                label="Add New Plan"
                icon="add"
                color="black"
                @click="openPlanEditor"
              />
            </div>
          </div>

          <q-table
            :rows="billing?.plans || []"
            :columns="planColumns"
            row-key="id"
            flat
            :loading="superAdminStore.billingLoading"
            class="q-mt-md"
          >
            <template v-slot:body-cell-price_monthly="props">
              <q-td :props="props">
                Rs {{ parseFloat(props.row.price_monthly).toFixed(0) }}/mo
              </q-td>
            </template>
            <template v-slot:body-cell-is_active="props">
              <q-td :props="props">
                <q-badge
                  :color="props.row.is_active ? 'positive' : 'grey'"
                  :label="props.row.is_active ? 'Active' : 'Inactive'"
                />
              </q-td>
            </template>
            <template v-slot:body-cell-is_popular="props">
              <q-td :props="props">
                <q-badge v-if="props.row.is_popular" color="orange" label="Popular" />
              </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn flat dense round icon="more_vert">
                  <q-menu>
                    <q-list style="min-width: 160px">
                      <q-item clickable v-close-popup @click="openPlanEditor(props.row)">
                        <q-item-section avatar><q-icon name="edit" /></q-item-section>
                        <q-item-section>Edit</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="togglePlanActive(props.row)">
                        <q-item-section avatar>
                          <q-icon :name="props.row.is_active ? 'block' : 'check_circle'" />
                        </q-item-section>
                        <q-item-section>{{ props.row.is_active ? 'Deactivate' : 'Activate' }}</q-item-section>
                      </q-item>
                      <q-item
                        v-if="!props.row.is_popular"
                        clickable
                        v-close-popup
                        @click="setPopularPlan(props.row)"
                      >
                        <q-item-section avatar><q-icon name="star" /></q-item-section>
                        <q-item-section>Set as Popular</q-item-section>
                      </q-item>
                      <q-item
                        v-else
                        clickable
                        v-close-popup
                        @click="unsetPopularPlan(props.row)"
                      >
                        <q-item-section avatar><q-icon name="star_border" /></q-item-section>
                        <q-item-section>Unset Popular</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Plan Editor Dialog -->
    <q-dialog v-model="planEditor.show">
      <q-card class="plan-editor-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">{{ planEditor.mode === 'create' ? 'Add Plan' : 'Edit Plan' }}</div>
          <q-btn flat dense round icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-md">
          <q-form @submit="savePlan" class="q-gutter-md">
            <q-input
              v-model="planEditor.name"
              label="Plan Name (internal)"
              outlined
              dense
              hint="e.g., starter, professional, enterprise"
              :rules="[(v) => !!v || 'Name is required']"
            />

            <q-input
              v-model="planEditor.display_name"
              label="Display Name"
              outlined
              dense
              hint="e.g., Starter Plan, Professional Plan"
              :rules="[(v) => !!v || 'Display name is required']"
            />

            <q-input
              v-model="planEditor.description"
              label="Description"
              outlined
              dense
              type="textarea"
              rows="2"
            />

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  v-model.number="planEditor.price_monthly"
                  label="Monthly Price (LKR)"
                  outlined
                  dense
                  type="number"
                  min="0"
                  :rules="[(v) => v !== undefined && v >= 0 || 'Price is required']"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model.number="planEditor.price_yearly"
                  label="Yearly Price (LKR)"
                  outlined
                  dense
                  type="number"
                  min="0"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  v-model.number="planEditor.max_employees"
                  label="Max Employees"
                  outlined
                  dense
                  type="number"
                  min="1"
                  :rules="[(v) => v && v > 0 || 'Required']"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model.number="planEditor.max_storage_mb"
                  label="Storage (MB)"
                  outlined
                  dense
                  type="number"
                  min="1"
                  :rules="[(v) => v && v > 0 || 'Required']"
                />
              </div>
            </div>

            <div class="row q-col-gutter-md items-center">
              <div class="col-6">
                <q-input
                  v-model.number="planEditor.sort_order"
                  label="Sort Order"
                  outlined
                  dense
                  type="number"
                  min="0"
                />
              </div>
              <div class="col-6">
                <q-toggle v-model="planEditor.is_active" label="Active" color="positive" />
                <q-toggle v-model="planEditor.is_popular" label="Popular Plan" color="orange" class="q-ml-md" />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn unelevated label="Save" color="black" @click="savePlan" :loading="planEditor.saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useSuperAdminStore, type BillingData } from 'src/stores/superAdmin';
import { supabase } from 'src/boot/supabase';

const $q = useQuasar();
const superAdminStore = useSuperAdminStore();

const billing = computed<BillingData | null>(() => superAdminStore.billing);

const planDialog = ref({ show: false });
const planEditor = ref({
  show: false,
  mode: 'create' as 'create' | 'edit',
  id: '',
  name: '',
  display_name: '',
  description: '',
  price_monthly: 0,
  price_yearly: 0,
  max_employees: 10,
  max_storage_mb: 1000,
  sort_order: 0,
  is_active: true,
  is_popular: false,
  saving: false,
});

const planColumns = [
  { name: 'display_name', label: 'Plan', field: 'display_name', align: 'left' as const, sortable: true },
  { name: 'price_monthly', label: 'Monthly Price', field: 'price_monthly', align: 'left' as const },
  { name: 'max_employees', label: 'Max Employees', field: 'max_employees', align: 'left' as const },
  { name: 'is_active', label: 'Status', field: 'is_active', align: 'center' as const },
  { name: 'is_popular', label: '', field: 'is_popular', align: 'center' as const },
  { name: 'actions', label: '', field: '', align: 'right' as const },
];

const totalCompanies = computed(() => {
  return billing.value?.companiesByPlan?.reduce((sum, item) => sum + item.count, 0) || 0;
});

const loadBillingData = async () => {
  await Promise.all([
    superAdminStore.fetchStats(),
    superAdminStore.fetchBillingData(),
  ]);
};

const openPlansManager = () => {
  planDialog.value.show = true;
};

const openPlanEditor = (plan?: any) => {
  if (plan) {
    planEditor.value = {
      show: true,
      mode: 'edit',
      id: plan.id,
      name: plan.name,
      display_name: plan.display_name,
      description: plan.description || '',
      price_monthly: parseFloat(plan.price_monthly),
      price_yearly: parseFloat(plan.price_yearly),
      max_employees: plan.max_employees,
      max_storage_mb: plan.max_storage_mb,
      sort_order: plan.sort_order,
      is_active: plan.is_active,
      is_popular: plan.is_popular,
      saving: false,
    };
  } else {
    planEditor.value = {
      show: true,
      mode: 'create',
      id: '',
      name: '',
      display_name: '',
      description: '',
      price_monthly: 0,
      price_yearly: 0,
      max_employees: 10,
      max_storage_mb: 1000,
      sort_order: 0,
      is_active: true,
      is_popular: false,
      saving: false,
    };
  }
};

const savePlan = async () => {
  if (!planEditor.value.name || !planEditor.value.display_name) {
    $q.notify({ type: 'warning', message: 'Please fill in required fields' });
    return;
  }

  planEditor.value.saving = true;
  try {
    if (planEditor.value.mode === 'create') {
      const { error } = await supabase.from('subscription_plans').insert({
        name: planEditor.value.name,
        display_name: planEditor.value.display_name,
        description: planEditor.value.description,
        price_monthly: planEditor.value.price_monthly,
        price_yearly: planEditor.value.price_yearly,
        currency: 'LKR',
        max_employees: planEditor.value.max_employees,
        max_storage_mb: planEditor.value.max_storage_mb,
        sort_order: planEditor.value.sort_order,
        is_active: planEditor.value.is_active,
        is_popular: planEditor.value.is_popular,
      } as never);

      if (error) throw error;
      $q.notify({ type: 'positive', message: 'Plan created' });
    } else {
      const { error } = await supabase
        .from('subscription_plans')
        .update({
          display_name: planEditor.value.display_name,
          description: planEditor.value.description,
          price_monthly: planEditor.value.price_monthly,
          price_yearly: planEditor.value.price_yearly,
          max_employees: planEditor.value.max_employees,
          max_storage_mb: planEditor.value.max_storage_mb,
          sort_order: planEditor.value.sort_order,
          is_active: planEditor.value.is_active,
          is_popular: planEditor.value.is_popular,
        } as never)
        .eq('id', planEditor.value.id);

      if (error) throw error;
      $q.notify({ type: 'positive', message: 'Plan updated' });
    }

    planEditor.value.show = false;
    await superAdminStore.fetchBillingData();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save plan';
    $q.notify({ type: 'negative', message });
  } finally {
    planEditor.value.saving = false;
  }
};

const togglePlanActive = async (plan: any) => {
  try {
    const { error } = await supabase
      .from('subscription_plans')
      .update({ is_active: !plan.is_active } as never)
      .eq('id', plan.id);

    if (error) throw error;
    await superAdminStore.fetchBillingData();
    $q.notify({ type: 'positive', message: `Plan ${plan.is_active ? 'deactivated' : 'activated'}` });
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to update plan' });
  }
};

const setPopularPlan = async (plan: any) => {
  try {
    // First, unset all popular flags
    await supabase.from('subscription_plans').update({ is_popular: false } as never).eq('is_popular', true);

    // Then set this one as popular
    const { error } = await supabase
      .from('subscription_plans')
      .update({ is_popular: true } as never)
      .eq('id', plan.id);

    if (error) throw error;
    await superAdminStore.fetchBillingData();
    $q.notify({ type: 'positive', message: 'Plan set as popular' });
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to update plan' });
  }
};

const unsetPopularPlan = async (plan: any) => {
  try {
    const { error } = await supabase
      .from('subscription_plans')
      .update({ is_popular: false } as never)
      .eq('id', plan.id);

    if (error) throw error;
    await superAdminStore.fetchBillingData();
    $q.notify({ type: 'positive', message: 'Popular plan unset' });
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to update plan' });
  }
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

const formatPlanCurrency = (amount: number, currency: string): string => {
  if (currency === 'LKR') {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0 }).format(amount);
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(amount);
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

// Dialog styles
.plan-dialog {
  min-width: 800px;
}

.plan-editor-dialog {
  min-width: 500px;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
