<script setup>
import { ref, onMounted, computed } from "vue";
import GoalServices from "../services/goalServices";
import Utils from "../config/utils";
import { useRouter } from "vue-router";

const router = useRouter();
const user = ref(null);
const goals = ref([]);
const message = ref("");
const loading = ref(true);

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'No target date';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

// Calculate progress percentage
const calculateProgress = (goal) => {
  if (!goal.targetValue || goal.targetValue === 0) return 0;
  const progress = (goal.currentValue / goal.targetValue) * 100;
  return Math.min(Math.round(progress), 100);
};

// Get progress color
const getProgressColor = (progress) => {
  if (progress >= 100) return "success";
  if (progress >= 75) return "info";
  if (progress >= 50) return "warning";
  return "error";
};

// Get days remaining
const getDaysRemaining = (targetDate) => {
  if (!targetDate) return null;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const target = new Date(targetDate);
    if (isNaN(target.getTime())) return null;
    
    target.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    console.error('Error calculating days remaining:', error);
    return null;
  }
};

// Format days remaining display
const formatDaysRemaining = (targetDate) => {
  const days = getDaysRemaining(targetDate);
  
  if (days === null) return 'No target date';
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return '1 day remaining';
  return `${days} days remaining`;
};

// Get status color
const getStatusColor = (status) => {
  switch(status) {
    case 'completed': return 'success';
    case 'paused': return 'warning';
    case 'in_progress': return 'info';
    default: return 'grey';
  }
};

// Load goals with progress
const fetchGoals = async () => {
  if (!user.value || !user.value.userId) {
    message.value = "Error: User not logged in";
    router.push({ name: "login" });
    return;
  }

  try {
    loading.value = true;
    const response = await GoalServices.getGoalsByAthlete(user.value.userId);
    
    console.log('Raw goals response:', response.data);
    
    // Map backend fields to frontend fields
    goals.value = (response.data || []).map(goal => ({
      ...goal,
      targetDate: goal.endDate || goal.targetDate, // Map endDate to targetDate
      unit: goal.unit || 'count'
    }));
    
    console.log('Mapped goals:', goals.value);
    
    message.value = goals.value.length > 0 ? "" : "No goals found. Create your first goal!";
    loading.value = false;
  } catch (error) {
    message.value = "Error loading goals: " + (error.response?.data?.message || error.message);
    console.error("Error fetching goals:", error);
    goals.value = [];
    loading.value = false;
  }
};

// Statistics
const statistics = computed(() => {
  const total = goals.value.length;
  const completed = goals.value.filter(g => g.status === 'completed').length;
  const inProgress = goals.value.filter(g => g.status === 'in_progress').length;
  const paused = goals.value.filter(g => g.status === 'paused').length;
  const avgProgress = total > 0 
    ? Math.round(goals.value.reduce((sum, g) => sum + calculateProgress(g), 0) / total)
    : 0;

  return { total, completed, inProgress, paused, avgProgress };
});

const cancel = () => {
  router.push({ name: "athleteDashboard" });
};

onMounted(() => {
  user.value = Utils.getStore("user");
  fetchGoals();
});
</script>

<template>
  <v-container>
    <v-toolbar color="success">
      <v-btn icon @click="cancel">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="text-white">Goal Progress</v-toolbar-title>
    </v-toolbar>

    <br />

    <!-- Message Display -->
    <v-alert
      v-if="message"
      :type="message.includes('Error') ? 'error' : 'info'"
      closable
      @click:close="message = ''"
    >
      {{ message }}
    </v-alert>

    <!-- Loading State -->
    <v-card v-if="loading">
      <v-card-text class="text-center">
        <v-progress-circular indeterminate color="success"></v-progress-circular>
        <p class="mt-4">Loading goals...</p>
      </v-card-text>
    </v-card>

    <template v-else>
      <!-- Statistics Summary -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-card color="primary" dark>
            <v-card-text>
              <div class="text-h6">Total Goals</div>
              <div class="text-h3">{{ statistics.total }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card color="success" dark>
            <v-card-text>
              <div class="text-h6">Completed</div>
              <div class="text-h3">{{ statistics.completed }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card color="info" dark>
            <v-card-text>
              <div class="text-h6">In Progress</div>
              <div class="text-h3">{{ statistics.inProgress }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card color="warning" dark>
            <v-card-text>
              <div class="text-h6">Avg Progress</div>
              <div class="text-h3">{{ statistics.avgProgress }}%</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Goals Progress Cards -->
      <v-row v-if="goals.length > 0">
        <v-col 
          v-for="goal in goals" 
          :key="goal.id" 
          cols="12" 
          md="6"
        >
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              <span>{{ goal.title }}</span>
              <v-chip 
                :color="getStatusColor(goal.status)"
                size="small"
              >
                {{ goal.status.replace('_', ' ') }}
              </v-chip>
            </v-card-title>
            
            <v-card-text>
              <p class="mb-2">{{ goal.description || 'No description' }}</p>
              
              <v-row class="mb-2">
                <v-col cols="6">
                  <div class="text-subtitle-2">Current Value</div>
                  <div class="text-h6">{{ goal.currentValue }} {{ goal.unit }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-subtitle-2">Target Value</div>
                  <div class="text-h6">{{ goal.targetValue }} {{ goal.unit }}</div>
                </v-col>
              </v-row>

              <div class="mb-2">
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-subtitle-2">Progress</span>
                  <span class="text-subtitle-2 font-weight-bold">
                    {{ calculateProgress(goal) }}%
                  </span>
                </div>
                <v-progress-linear
                  :model-value="calculateProgress(goal)"
                  :color="getProgressColor(calculateProgress(goal))"
                  height="20"
                  rounded
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.ceil(value) }}%</strong>
                  </template>
                </v-progress-linear>
              </div>

              <v-divider class="my-3"></v-divider>

              <v-row>
                <v-col cols="6">
                  <div class="text-subtitle-2">Target Date</div>
                  <div>{{ formatDate(goal.targetDate) }}</div>
                </v-col>
                <v-col cols="6">
                  <div class="text-subtitle-2">Days Remaining</div>
                  <div :class="getDaysRemaining(goal.targetDate) !== null && getDaysRemaining(goal.targetDate) < 0 ? 'text-error' : ''">
                    {{ formatDaysRemaining(goal.targetDate) }}
                  </div>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                v-if="goal.status === 'completed'"
                color="success"
                variant="text"
                prepend-icon="mdi-check-circle"
              >
                Goal Achieved!
              </v-btn>
              <v-btn
                v-else-if="calculateProgress(goal) >= 100"
                color="warning"
                variant="text"
                prepend-icon="mdi-alert"
                @click="router.push({ name: 'athleteGoals' })"
              >
                Mark as Complete
              </v-btn>
              <v-btn
                v-else
                color="primary"
                variant="text"
                prepend-icon="mdi-chart-line"
              >
                Keep Going!
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Empty State -->
      <v-row v-else>
        <v-col cols="12">
          <v-card class="text-center pa-8">
            <v-icon size="64" color="grey">mdi-target</v-icon>
            <div class="text-h5 mt-4 mb-2">No Goals Yet</div>
            <div class="text-subtitle-1 mb-4">Start by creating your first goal!</div>
            <v-btn 
              color="success" 
              @click="router.push({ name: 'athleteGoals' })"
            >
              Create Goal
            </v-btn>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<style scoped>
.text-error {
  color: rgb(var(--v-theme-error));
}
</style>