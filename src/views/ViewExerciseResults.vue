<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import ExerciseServices from "../services/exerciseServices";
import Utils from "../config/utils";

const router = useRouter();
const user = ref(null);
const exerciseResults = ref([]);
const search = ref("");
const message = ref("");
const loading = ref(true);

// Table headers - Updated to match backend field names
const headers = [
  { title: 'Date', key: 'performedDate', sortable: true },
  { title: 'Exercise', key: 'exerciseName', sortable: true },
  { title: 'Sets', key: 'setsDone', sortable: true },
  { title: 'Reps', key: 'repsDone', sortable: true },
  { title: 'Weight (lbs)', key: 'weightUsed', sortable: true },
  { title: 'Duration (min)', key: 'durationSeconds', sortable: true },
  { title: 'Notes', key: 'notes', sortable: false }
];

// Statistics computed properties
const totalWorkouts = computed(() => exerciseResults.value.length);

const thisMonth = computed(() => {
  return exerciseResults.value.filter(e => {
    const date = new Date(e.performedDate);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
});

const thisWeek = computed(() => {
  return exerciseResults.value.filter(e => {
    const date = new Date(e.performedDate);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
  }).length;
});

const mostRecent = computed(() => {
  if (exerciseResults.value.length === 0) return 'N/A';
  return new Date(exerciseResults.value[0].performedDate).toLocaleDateString();
});

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
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

// Format duration from seconds to minutes
const formatDuration = (seconds) => {
  if (!seconds) return '-';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
};

// Load exercise results
const fetchExerciseResults = async () => {
  if (!user.value || !user.value.userId) {
    message.value = "Error: User not logged in";
    router.push({ name: "login" });
    return;
  }

  try {
    loading.value = true;
    console.log("Fetching exercise results for user:", user.value.userId);
    
    // Pass the athleteId to the service
    const response = await ExerciseServices.getExerciseResultsByAthlete(user.value.userId);
    console.log("Exercise results raw response:", response.data);
    
    // Check if response has data
    if (!response.data || !Array.isArray(response.data)) {
      exerciseResults.value = [];
      message.value = "No exercise results found";
      loading.value = false;
      return;
    }
    
    // Map the data - backend uses snake_case, frontend uses camelCase
    exerciseResults.value = response.data.map(result => ({
      id: result.id,
      performedDate: result.performed_date || result.performedDate,
      exerciseName: result.exercise?.name || 'Unknown Exercise',
      setsDone: result.sets_done || result.setsDone,
      repsDone: result.reps_done || result.repsDone,
      weightUsed: result.weight_used || result.weightUsed,
      durationSeconds: result.duration_seconds || result.durationSeconds,
      notes: result.notes
    })).sort((a, b) => 
      new Date(b.performedDate) - new Date(a.performedDate)
    );
    
    console.log("Mapped exercise results:", exerciseResults.value);
    
    if (exerciseResults.value.length === 0) {
      message.value = "No exercise results found. Start recording your workouts!";
    } else {
      message.value = "";
    }
    
    loading.value = false;
  } catch (error) {
    message.value = "Error loading exercise results: " + (error.response?.data?.message || error.message);
    console.error("Error fetching exercise results:", error);
    console.error("Error details:", error.response?.data);
    exerciseResults.value = [];
    loading.value = false;
  }
};

const cancel = () => {
  router.push({ name: "athleteDashboard" });
};

onMounted(() => {
  user.value = Utils.getStore("user");
  console.log("Logged in user:", user.value);
  fetchExerciseResults();
});
</script>

<template>
  <v-container>
    <v-toolbar color="success">
      <v-btn icon @click="cancel">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="text-white">Exercise Results</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn 
        color="white" 
        variant="elevated"
        @click="router.push({ name: 'recordExercise' })"
      >
        <v-icon color="success">mdi-plus</v-icon>
        Record Exercise
      </v-btn>
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
        <p class="mt-4">Loading exercise results...</p>
      </v-card-text>
    </v-card>

    <!-- Exercise Results Table -->
    <v-card v-else>
      <v-card-title>
        <v-text-field
          v-model="search"
          append-inner-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="exerciseResults"
        :search="search"
        class="elevation-1"
      >
        <!-- Date Column - Format date -->
        <template v-slot:item.performedDate="{ item }">
          {{ formatDate((item.raw || item).performedDate) }}
        </template>

        <!-- Duration - Format as mm:ss -->
        <template v-slot:item.durationSeconds="{ item }">
          {{ formatDuration((item.raw || item).durationSeconds) }}
        </template>

        <!-- Weight - Show with 2 decimals or dash -->
        <template v-slot:item.weightUsed="{ item }">
          <span v-if="(item.raw || item).weightUsed">
            {{ parseFloat((item.raw || item).weightUsed).toFixed(2) }}
          </span>
          <span v-else>-</span>
        </template>

        <!-- Sets - Show or dash -->
        <template v-slot:item.setsDone="{ item }">
          {{ (item.raw || item).setsDone || '-' }}
        </template>

        <!-- Reps - Show or dash -->
        <template v-slot:item.repsDone="{ item }">
          {{ (item.raw || item).repsDone || '-' }}
        </template>

        <!-- Notes Column - Truncate long notes -->
        <template v-slot:item.notes="{ item }">
          <v-tooltip v-if="(item.raw || item).notes && (item.raw || item).notes.length > 50" location="top">
            <template v-slot:activator="{ props }">
              <span v-bind="props">
                {{ (item.raw || item).notes.substring(0, 50) }}...
              </span>
            </template>
            <span>{{ (item.raw || item).notes }}</span>
          </v-tooltip>
          <span v-else-if="(item.raw || item).notes">
            {{ (item.raw || item).notes }}
          </span>
          <span v-else>-</span>
        </template>

        <!-- Empty state -->
        <template v-slot:no-data>
          <v-alert type="info" class="ma-4">
            No exercise results found. Start recording your workouts!
          </v-alert>
        </template>
      </v-data-table>
    </v-card>

    <!-- Summary Statistics -->
    <v-row class="mt-4">
      <v-col cols="12" md="3">
        <v-card color="primary" dark>
          <v-card-text>
            <div class="text-h6">Total Workouts</div>
            <div class="text-h4">{{ totalWorkouts }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="success" dark>
          <v-card-text>
            <div class="text-h6">This Month</div>
            <div class="text-h4">{{ thisMonth }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="warning" dark>
          <v-card-text>
            <div class="text-h6">This Week</div>
            <div class="text-h4">{{ thisWeek }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="error" dark>
          <v-card-text>
            <div class="text-h6">Most Recent</div>
            <div class="text-subtitle-1">{{ mostRecent }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-data-table {
  background-color: white;
}
</style>