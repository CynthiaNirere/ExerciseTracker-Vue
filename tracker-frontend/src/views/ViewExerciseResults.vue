<script setup>

import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import ExerciseServices from "../services/exerciseServices";
import Utils from "../config/utils";

const router = useRouter();
const user = ref(null);
const exerciseResults = ref([]);
const search = ref("");
const message = ref("");

// Table headers
const headers = [
  { title: 'Date', key: 'date' },
  { title: 'Exercise', key: 'exerciseName' },
  { title: 'Duration (min)', key: 'duration' },
  { title: 'Sets', key: 'sets' },
  { title: 'Reps', key: 'reps' },
  { title: 'Weight (lbs)', key: 'weight' },
  { title: 'Distance (mi)', key: 'distance' },
  { title: 'Notes', key: 'notes' }
];

// Load exercise results
const fetchExerciseResults = async () => {
  try {
    const response = await ExerciseServices.getExerciseResultsByAthlete(user.value.id);
    // Sort by date descending
    exerciseResults.value = response.data.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    message.value = "Exercise results loaded successfully";
  } catch (error) {
    message.value = "Error loading exercise results: " + error.message;
    console.error("Error fetching exercise results:", error);
  }
};

const cancel = () => {
  router.push({ name: "athleteDashboard" });
};

onMounted(() => {
  user.value = Utils.getStore("user");
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
    </v-toolbar>

    <br />

    <!-- Message Display -->
    <v-alert
      v-if="message"
      :type="message.includes('Error') ? 'error' : 'success'"
      closable
      @click:close="message = ''"
    >
      {{ message }}
    </v-alert>

    <!-- Exercise Results Table -->
    <v-card>
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
        <template v-slot:item.date="{ item }">
          {{ new Date((item.raw || item).date).toLocaleDateString() }}
        </template>

        <!-- Notes Column - Truncate long notes -->
        <template v-slot:item.notes="{ item }">
          <span v-if="(item.raw || item).notes">
            {{ (item.raw || item).notes.substring(0, 50) }}{{ (item.raw || item).notes.length > 50 ? '...' : '' }}
          </span>
        </template>
      </v-data-table>
    </v-card>

    <!-- Summary Statistics -->
    <v-row class="mt-4">
      <v-col cols="12" md="3">
        <v-card color="info" dark>
          <v-card-text>
            <div class="text-h6">Total Workouts</div>
            <div class="text-h4">{{ exerciseResults.length }}</div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="success" dark>
          <v-card-text>
            <div class="text-h6">This Month</div>
            <div class="text-h4">
              {{ exerciseResults.filter(e => {
                const date = new Date(e.date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="warning" dark>
          <v-card-text>
            <div class="text-h6">This Week</div>
            <div class="text-h4">
              {{ exerciseResults.filter(e => {
                const date = new Date(e.date);
                const now = new Date();
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return date >= weekAgo;
              }).length }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card color="error" dark>
          <v-card-text>
            <div class="text-h6">Most Recent</div>
            <div class="text-subtitle-1">
              {{ exerciseResults.length > 0 ? new Date(exerciseResults[0].date).toLocaleDateString() : 'N/A' }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>