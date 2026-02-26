<template>
  <q-page class="dashboard-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome back, {{ userName }}</p>
      </div>
      <div class="page-actions">
        <q-btn
          v-if="isAdmin"
          label="Add Employee"
          icon="person_add"
          color="black"
          to="/employees/new"
          no-caps
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon employees">
          <q-icon name="people" size="24px" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalEmployees }}</div>
          <div class="stat-label">Total Employees</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon present">
          <q-icon name="check_circle" size="24px" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.presentToday }}</div>
          <div class="stat-label">Present Today</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon pending">
          <q-icon name="pending" size="24px" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.pendingLeaves }}</div>
          <div class="stat-label">Pending Leaves</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon claims">
          <q-icon name="receipt_long" size="24px" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.pendingClaims }}</div>
          <div class="stat-label">Pending Claims</div>
        </div>
      </div>
    </div>

    <!-- Content Grid -->
    <div class="content-grid">
      <!-- Recent Activity -->
      <q-card class="content-card">
        <q-card-section class="card-header">
          <div class="card-title">Recent Activity</div>
        </q-card-section>
        <q-card-section class="card-body">
          <div v-if="recentActivity.length === 0" class="empty-state">
            <q-icon name="history" size="48px" color="gray-4" />
            <p>No recent activity</p>
          </div>
          <q-list v-else class="activity-list">
            <q-item v-for="activity in recentActivity" :key="activity.id">
              <q-item-section avatar>
                <q-avatar
                  :color="getActivityColor(activity.type)"
                  text-color="white"
                  size="36px"
                >
                  <q-icon :name="getActivityIcon(activity.type)" size="18px" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ activity.title }}</q-item-label>
                <q-item-label caption>{{ activity.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label caption>{{ activity.time }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Quick Actions -->
      <q-card class="content-card">
        <q-card-section class="card-header">
          <div class="card-title">Quick Actions</div>
        </q-card-section>
        <q-card-section class="card-body">
          <div class="quick-actions">
            <q-btn
              flat
              class="quick-action-btn"
              to="/attendance"
            >
              <q-icon name="schedule" size="24px" />
              <span>Mark Attendance</span>
            </q-btn>
            <q-btn
              flat
              class="quick-action-btn"
              to="/leave"
            >
              <q-icon name="event" size="24px" />
              <span>Apply Leave</span>
            </q-btn>
            <q-btn
              flat
              class="quick-action-btn"
              to="/claims"
            >
              <q-icon name="receipt_long" size="24px" />
              <span>Submit Claim</span>
            </q-btn>
            <q-btn
              flat
              class="quick-action-btn"
              to="/payroll"
            >
              <q-icon name="payments" size="24px" />
              <span>View Payslips</span>
            </q-btn>
          </div>
        </q-card-section>
      </q-card>

      <!-- Upcoming Holidays -->
      <q-card class="content-card">
        <q-card-section class="card-header">
          <div class="card-title">Upcoming Holidays</div>
        </q-card-section>
        <q-card-section class="card-body">
          <div v-if="upcomingHolidays.length === 0" class="empty-state">
            <q-icon name="celebration" size="48px" color="gray-4" />
            <p>No upcoming holidays</p>
          </div>
          <q-list v-else class="holiday-list">
            <q-item v-for="holiday in upcomingHolidays" :key="holiday.id">
              <q-item-section avatar>
                <div class="holiday-date">
                  <div class="holiday-day">{{ holiday.day }}</div>
                  <div class="holiday-month">{{ holiday.month }}</div>
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ holiday.name }}</q-item-label>
                <q-item-label caption>{{ holiday.type }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- Leave Balance -->
      <q-card class="content-card">
        <q-card-section class="card-header">
          <div class="card-title">Leave Balance</div>
        </q-card-section>
        <q-card-section class="card-body">
          <div v-if="leaveBalances.length === 0" class="empty-state">
            <q-icon name="event_busy" size="48px" color="gray-4" />
            <p>No leave balance data</p>
          </div>
          <div v-else class="leave-balances">
            <div
              v-for="balance in leaveBalances"
              :key="balance.id"
              class="balance-item"
            >
              <div class="balance-header">
                <span class="balance-name">{{ balance.name }}</span>
                <span class="balance-value"
                  >{{ balance.available }} / {{ balance.total }}</span
                >
              </div>
              <q-linear-progress
                :value="balance.percentage"
                color="black"
                class="balance-progress"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { supabase } from 'src/boot/supabase';

const authStore = useAuthStore();

const userName = computed(() => authStore.userName);
const isAdmin = computed(() => authStore.isAdmin);

// Stats
const stats = ref({
  totalEmployees: 0,
  presentToday: 0,
  pendingLeaves: 0,
  pendingClaims: 0,
});

// Recent Activity (placeholder)
const recentActivity = ref<Array<{
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
}>>([]);

// Upcoming Holidays (placeholder)
const upcomingHolidays = ref<Array<{
  id: string;
  name: string;
  type: string;
  day: string;
  month: string;
}>>([]);

// Leave Balances (placeholder)
const leaveBalances = ref<Array<{
  id: string;
  name: string;
  available: number;
  total: number;
  percentage: number;
}>>([]);

// Fetch dashboard data
const fetchDashboardData = async () => {
  const companyId = authStore.company?.id;
  if (!companyId) return;

  try {
    // Fetch employee count
    const { count: employeeCount } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'active');

    stats.value.totalEmployees = employeeCount || 0;

    // Fetch today's attendance
    const today = new Date().toISOString().split('T')[0];
    const { count: presentCount } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('attendance_date', today as string)
      .in('status', ['present', 'late']);

    stats.value.presentToday = presentCount || 0;

    // Fetch pending leaves
    const { count: leaveCount } = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'pending');

    stats.value.pendingLeaves = leaveCount || 0;

    // Fetch pending claims
    const { count: claimCount } = await supabase
      .from('travel_claims')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'pending_manager');

    stats.value.pendingClaims = claimCount || 0;

    // Fetch upcoming holidays
    const { data: holidays } = await supabase
      .from('holidays')
      .select('*')
      .eq('company_id', companyId)
      .gte('holiday_date', today)
      .eq('is_active', true)
      .order('holiday_date', { ascending: true })
      .limit(5);

    if (holidays) {
      upcomingHolidays.value = (holidays as Array<{ id: string; name: string; holiday_date: string; is_paid: boolean }>).map((h) => {
        const date = new Date(h.holiday_date);
        return {
          id: h.id,
          name: h.name,
          type: h.is_paid ? 'Paid Holiday' : 'Holiday',
          day: date.getDate().toString(),
          month: date.toLocaleString('default', { month: 'short' }),
        };
      });
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

// Helper functions
const getActivityIcon = (type: string) => {
  const icons: Record<string, string> = {
    leave: 'event',
    attendance: 'schedule',
    claim: 'receipt_long',
    employee: 'person',
    default: 'info',
  };
  return icons[type] || icons.default;
};

const getActivityColor = (type: string) => {
  const colors: Record<string, string> = {
    leave: 'blue',
    attendance: 'green',
    claim: 'orange',
    employee: 'purple',
    default: 'grey',
  };
  return colors[type] || colors.default;
};

onMounted(() => {
  void fetchDashboardData();
});
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: var(--spacing-5);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-5);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-black);
  margin: 0 0 var(--spacing-1);
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-gray-500);
  margin: 0;
}

// Stats Grid
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-5);

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
  padding: var(--spacing-5);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);

  &.employees {
    background-color: rgba(0, 0, 0, 0.05);
    color: var(--color-black);
  }

  &.present {
    background-color: rgba(34, 197, 94, 0.1);
    color: var(--color-success);
  }

  &.pending {
    background-color: rgba(245, 158, 11, 0.1);
    color: var(--color-warning);
  }

  &.claims {
    background-color: rgba(59, 130, 246, 0.1);
    color: var(--color-info);
  }
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-black);
  line-height: 1;
  margin-bottom: var(--spacing-1);
}

.stat-label {
  font-size: 13px;
  color: var(--color-gray-500);
}

// Content Grid
.content-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.content-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
}

.card-header {
  padding: var(--spacing-4) var(--spacing-5);
  border-bottom: 1px solid var(--color-gray-100);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-black);
}

.card-body {
  padding: var(--spacing-4) var(--spacing-5);
}

// Empty State
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-6);
  color: var(--color-gray-400);

  p {
    margin: var(--spacing-3) 0 0;
    font-size: 14px;
  }
}

// Quick Actions
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-3);
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  color: var(--color-gray-600);

  &:hover {
    background-color: var(--color-gray-100);
    color: var(--color-black);
    border-color: var(--color-gray-300);
  }

  span {
    font-size: 13px;
    font-weight: 500;
  }
}

// Holiday List
.holiday-list {
  .q-item {
    padding-left: 0;
    padding-right: 0;
  }
}

.holiday-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background-color: var(--color-gray-100);
  border-radius: var(--radius-md);

  .holiday-day {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-black);
    line-height: 1;
  }

  .holiday-month {
    font-size: 11px;
    font-weight: 500;
    color: var(--color-gray-500);
    text-transform: uppercase;
  }
}

// Leave Balances
.leave-balances {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.balance-item {
  .balance-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-2);
  }

  .balance-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-black);
  }

  .balance-value {
    font-size: 14px;
    color: var(--color-gray-500);
  }

  .balance-progress {
    height: 6px;
    border-radius: var(--radius-full);
    background-color: var(--color-gray-200);
  }
}

// Activity List
.activity-list {
  .q-item {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
