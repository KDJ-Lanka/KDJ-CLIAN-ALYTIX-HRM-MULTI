<template>
  <q-page class="attendance-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Mark Attendance</h1>
        <p class="page-subtitle">Record your daily attendance</p>
      </div>
    </div>

    <div class="attendance-container">
      <q-card class="attendance-card">
        <q-card-section class="text-center q-py-lg">
          <div class="text-h4 q-mb-md">{{ currentTime }}</div>
          <div class="text-gray-500">{{ currentDate }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-py-lg text-center">
          <template v-if="!todayAttendance?.check_in_time">
            <q-btn label="Check In" color="black" size="lg" icon="login" @click="checkIn" :loading="loading" no-caps />
          </template>
          <template v-else-if="!todayAttendance?.check_out_time">
            <div class="q-mb-md">
              <div class="text-gray-500">Checked in at</div>
              <div class="text-h5">{{ formatTime(todayAttendance.check_in_time) }}</div>
            </div>
            <q-btn label="Check Out" color="black" size="lg" icon="logout" @click="checkOut" :loading="loading" no-caps />
          </template>
          <template v-else>
            <div class="q-mb-md">
              <q-icon name="check_circle" color="positive" size="48px" />
              <div class="text-h6 q-mt-md">Attendance Complete</div>
              <div class="text-gray-500">Check in: {{ formatTime(todayAttendance.check_in_time) }}</div>
              <div class="text-gray-500">Check out: {{ formatTime(todayAttendance.check_out_time) }}</div>
            </div>
          </template>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';
import type { Attendance } from 'src/types/models';

const $q = useQuasar();
const authStore = useAuthStore();

const loading = ref(false);
const todayAttendance = ref<Attendance | null>(null);
const currentTime = ref('');
const currentDate = computed(() => new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

let timer: ReturnType<typeof setInterval>;

const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const formatTime = (date: string) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

const fetchTodayAttendance = async () => {
  const employeeId = authStore.employee?.id;
  const companyId = authStore.company?.id;
  if (!employeeId || !companyId) return;

  const today = new Date().toISOString().split('T')[0] as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data }: any = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('attendance_date', today)
    .single();
  todayAttendance.value = data as Attendance | null;
};

const checkIn = async () => {
  loading.value = true;
  try {
    const employeeId = authStore.employee?.id;
    const companyId = authStore.company?.id;
    const today = new Date().toISOString().split('T')[0];

    if (!employeeId || !companyId) {
      $q.notify({ type: 'negative', message: 'Employee record not found' });
      return;
    }

    const { error } = await supabase.from('attendance').insert({
      employee_id: employeeId,
      company_id: companyId,
      attendance_date: today,
      check_in_time: new Date().toISOString(),
      status: 'present',
    } as never);

    if (error) throw error;
    $q.notify({ type: 'positive', message: 'Checked in successfully' });
    void fetchTodayAttendance();
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to check in' });
  } finally {
    loading.value = false;
  }
};

const checkOut = async () => {
  loading.value = true;
  try {
    const attendanceId = todayAttendance.value?.id;
    if (!attendanceId) {
      $q.notify({ type: 'negative', message: 'No attendance record found' });
      return;
    }

    const { error } = await supabase
      .from('attendance')
      .update({ check_out_time: new Date().toISOString() } as never)
      .eq('id', attendanceId);

    if (error) throw error;
    $q.notify({ type: 'positive', message: 'Checked out successfully' });
    void fetchTodayAttendance();
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to check out' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
  void fetchTodayAttendance();
});

onUnmounted(() => clearInterval(timer));
</script>

<style lang="scss" scoped>
.attendance-page { padding: var(--spacing-5); }
.page-header { margin-bottom: var(--spacing-5); }
.page-title { font-size: 28px; font-weight: 700; margin: 0 0 var(--spacing-1); }
.page-subtitle { font-size: 14px; color: var(--color-gray-500); margin: 0; }
.attendance-container { max-width: 480px; margin: 0 auto; }
.attendance-card { border-radius: var(--radius-xl); }
</style>
