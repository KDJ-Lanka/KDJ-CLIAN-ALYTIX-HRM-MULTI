<template>
  <q-page class="ticket-detail-page">
    <!-- Loading State -->
    <div v-if="superAdminStore.ticketsLoading" class="loading-container">
      <q-spinner size="48px" color="black" />
    </div>

    <template v-else-if="ticket">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <q-btn flat dense round icon="arrow_back" @click="goBack" class="back-btn" />
          <div class="header-info">
            <span class="ticket-id">#{{ ticket.id.slice(0, 8).toUpperCase() }}</span>
            <h1 class="page-title">{{ ticket.subject }}</h1>
          </div>
        </div>
        <div class="header-actions">
          <q-select
            v-model="selectedStatus"
            :options="statusOptions"
            dense
            outlined
            label="Status"
            emit-value
            map-options
            @update:model-value="updateStatus"
          />
        </div>
      </div>

      <!-- Ticket Info -->
      <div class="content-grid">
        <div class="main-content">
          <!-- Description -->
          <q-card flat class="info-card">
            <q-card-section class="card-header">
              <span class="card-title">Description</span>
            </q-card-section>
            <q-separator />
            <q-card-section class="card-body">
              <p class="description-text">{{ ticket.description || 'No description provided.' }}</p>
            </q-card-section>
          </q-card>

          <!-- Conversation -->
          <q-card flat class="info-card">
            <q-card-section class="card-header">
              <span class="card-title">Conversation</span>
            </q-card-section>
            <q-separator />
            <q-card-section class="card-body messages-section">
              <div v-if="messages.length === 0" class="no-messages">
                <q-icon name="chat_bubble_outline" size="48px" color="grey-4" />
                <p>No messages yet</p>
              </div>
              <div v-else class="messages-list">
                <div
                  v-for="message in messages"
                  :key="message.id"
                  class="message-item"
                  :class="{ 'is-admin': message.sender_type === 'super_admin' }"
                >
                  <div class="message-avatar">
                    <q-avatar size="36px" :color="message.sender_type === 'super_admin' ? 'black' : 'grey-4'" :text-color="message.sender_type === 'super_admin' ? 'white' : 'grey-8'">
                      {{ getInitials(message.sender_name || 'U') }}
                    </q-avatar>
                  </div>
                  <div class="message-content">
                    <div class="message-header">
                      <span class="message-sender">{{ message.sender_name }}</span>
                      <span class="message-time">{{ formatDateTime(message.created_at) }}</span>
                    </div>
                    <div class="message-text">{{ message.message }}</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Reply -->
          <q-card flat class="info-card">
            <q-card-section class="card-body">
              <q-input
                v-model="replyText"
                type="textarea"
                outlined
                label="Write a reply..."
                rows="4"
                :disable="sendingReply"
              />
              <div class="reply-actions">
                <q-btn
                  unelevated
                  label="Send Reply"
                  icon="send"
                  class="send-btn"
                  :loading="sendingReply"
                  :disable="!replyText.trim()"
                  @click="sendReply"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Sidebar -->
        <div class="sidebar">
          <q-card flat class="sidebar-card">
            <q-card-section>
              <div class="detail-item">
                <span class="detail-label">Status</span>
                <q-badge
                  :color="getStatusColor(ticket.status)"
                  :label="formatStatus(ticket.status)"
                />
              </div>
              <div class="detail-item">
                <span class="detail-label">Priority</span>
                <q-badge
                  :color="getPriorityColor(ticket.priority)"
                  :label="ticket.priority"
                />
              </div>
              <div class="detail-item">
                <span class="detail-label">Company</span>
                <span class="detail-value">{{ ticket.company_name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Reporter</span>
                <span class="detail-value">{{ ticket.reporter_name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Created</span>
                <span class="detail-value">{{ formatDateTime(ticket.created_at) }}</span>
              </div>
              <div v-if="ticket.assigned_to_name" class="detail-item">
                <span class="detail-label">Assigned To</span>
                <span class="detail-value">{{ ticket.assigned_to_name }}</span>
              </div>
              <div v-if="ticket.resolved_at" class="detail-item">
                <span class="detail-label">Resolved</span>
                <span class="detail-value">{{ formatDateTime(ticket.resolved_at) }}</span>
              </div>
            </q-card-section>
          </q-card>

          <!-- Quick Actions -->
          <q-card flat class="sidebar-card">
            <q-card-section class="card-header">
              <span class="card-title">Quick Actions</span>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <q-btn
                flat
                label="Mark as Resolved"
                icon="check_circle"
                class="action-btn full-width"
                :disable="ticket.status === 'resolved' || ticket.status === 'closed'"
                @click="resolveTicket"
              />
              <q-btn
                flat
                label="Mark as Closed"
                icon="cancel"
                class="action-btn full-width"
                :disable="ticket.status === 'closed'"
                @click="closeTicket"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </template>

    <!-- Not Found -->
    <div v-else class="not-found">
      <q-icon name="error_outline" size="64px" color="grey-4" />
      <h2>Ticket not found</h2>
      <q-btn flat label="Go Back" icon="arrow_back" @click="goBack" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useSuperAdminStore, type SupportTicket, type TicketMessage } from 'src/stores/superAdmin';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const superAdminStore = useSuperAdminStore();

const selectedStatus = ref<string>('');
const replyText = ref('');
const sendingReply = ref(false);

const ticket = computed<SupportTicket | null>(() => superAdminStore.selectedTicket);
const messages = computed<TicketMessage[]>(() => superAdminStore.ticketMessages);

const statusOptions = [
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
];

const loadTicket = () => {
  const ticketId = route.params.id;
  if (!ticketId || typeof ticketId !== 'string') return;
  void superAdminStore.fetchTicketDetails(ticketId).then(() => {
    if (ticket.value) {
      selectedStatus.value = ticket.value.status;
    }
  });
};

const goBack = () => {
  void router.push('/super-admin/support');
};

const updateStatus = async (status: string) => {
  if (!ticket.value) return;
  const result = await superAdminStore.updateTicketStatus(
    ticket.value.id,
    status as 'open' | 'in_progress' | 'resolved' | 'closed'
  );
  if (result.success) {
    $q.notify({ type: 'positive', message: 'Status updated' });
  } else {
    $q.notify({ type: 'negative', message: 'Failed to update status' });
  }
};

const sendReply = async () => {
  if (!ticket.value || !replyText.value.trim()) return;
  sendingReply.value = true;
  try {
    const result = await superAdminStore.createTicketReply(ticket.value.id, replyText.value.trim());
    if (result.success) {
      $q.notify({ type: 'positive', message: 'Reply sent' });
      replyText.value = '';
    } else {
      $q.notify({ type: 'negative', message: 'Failed to send reply' });
    }
  } finally {
    sendingReply.value = false;
  }
};

const resolveTicket = () => {
  if (!ticket.value) return;
  void updateStatus('resolved');
};

const closeTicket = () => {
  if (!ticket.value) return;
  void updateStatus('closed');
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    open: 'blue',
    in_progress: 'orange',
    resolved: 'positive',
    closed: 'grey',
  };
  return colors[status] || 'grey';
};

const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: 'grey',
    medium: 'blue',
    high: 'orange',
    urgent: 'negative',
  };
  return colors[priority] || 'grey';
};

const formatStatus = (status: string): string => {
  return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatDateTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  void loadTicket();
});
</script>

<style lang="scss" scoped>
.ticket-detail-page {
  padding: 24px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.back-btn {
  margin-top: 4px;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.ticket-id {
  font-family: monospace;
  font-size: 13px;
  color: #737373;
  margin-bottom: 4px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #000000;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card {
  border: 1px solid #e5e5e5;
  border-radius: 12px;
}

.card-header {
  padding: 16px 20px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-body {
  padding: 16px 20px;
}

.description-text {
  margin: 0;
  color: #404040;
  line-height: 1.6;
  white-space: pre-wrap;
}

.messages-section {
  max-height: 400px;
  overflow-y: auto;
}

.no-messages {
  padding: 48px;
  text-align: center;
  color: #737373;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 12px;

  &.is-admin {
    .message-content {
      background: #f5f5f5;
    }
  }
}

.message-content {
  flex: 1;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  padding: 12px 16px;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-sender {
  font-weight: 600;
  color: #000000;
}

.message-time {
  font-size: 12px;
  color: #737373;
}

.message-text {
  color: #404040;
  line-height: 1.5;
  white-space: pre-wrap;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.send-btn {
  background: #000000;
  color: #ffffff;
  border-radius: 8px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-card {
  border: 1px solid #e5e5e5;
  border-radius: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  font-size: 13px;
  color: #737373;
}

.detail-value {
  font-weight: 500;
  color: #000000;
}

.action-btn {
  justify-content: flex-start;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;

  h2 {
    margin: 16px 0;
    color: #737373;
  }
}
</style>
