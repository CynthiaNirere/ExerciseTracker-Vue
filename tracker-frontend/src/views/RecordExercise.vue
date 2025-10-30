<script setup>
import { ref, onMounted } from "vue";
import ExerciseServices from "../services/exerciseServices";
import Utils from "../config/utils";
import { useRouter } from "vue-router";

const router = useRouter();
const valid = ref(true);
const user = ref(null);
const exercises = ref([]);
const loading = ref(true);
const exerciseResult = ref({
  exerciseId: null,
  performedDate: new Date().toISOString().split('T')[0],
  durationMinutes: null,
  repsDone: null,
  setsDone: null,
  weightUsed: null,
  notes: "",
});
const message = ref("");

// Validation rules
const exerciseRules = [
  v => !!v || 'Exercise is required'
];

const dateRules = [
  v => !!v || 'Date is required'
];

// Load exercises from database
const fetchExercises = async () => {
  try {
    loading.value = true;
    const response = await ExerciseServices.getAllExercises();
    console.log("Fetched exercises:", response.data);
    
    exercises.value = response.data || [];
    
    if (exercises.value.length === 0) {
      message.value = "No exercises found in database. Please add exercises first.";
    }
    
    loading.value = false;
  } catch (error) {
    console.error("Error fetching exercises:", error);
    message.value = "Error loading exercises: " + (error.response?.data?.message || error.message);
    loading.value = false;
  }
};

// Save exercise result
const saveExercise = async () => {
  if (!user.value || !user.value.userId) {
    message.value = "Error: User not logged in";
    return;
  }

  // Validate required fields
  if (!exerciseResult.value.exerciseId) {
    message.value = "Error: Please select an exercise";
    return;
  }

  if (!exerciseResult.value.performedDate) {
    message.value = "Error: Please select a date";
    return;
  }

  try {
    // Transform frontend data to match backend expectations
    const data = {
      athleteId: user.value.userId,
      exerciseId: exerciseResult.value.exerciseId,
      performedDate: exerciseResult.value.performedDate,
      setsDone: exerciseResult.value.setsDone || null,
      repsDone: exerciseResult.value.repsDone || null,
      weightUsed: exerciseResult.value.weightUsed || null,
      durationSeconds: exerciseResult.value.durationMinutes ? exerciseResult.value.durationMinutes * 60 : null,
      notes: exerciseResult.value.notes || null,
      athletePlanId: null
    };

    console.log("Sending exercise data:", data);
    
    await ExerciseServices.recordExerciseResult(data);
    
    message.value = "Exercise result recorded successfully!";
    
    // Reset form
    exerciseResult.value = {
      exerciseId: null,
      performedDate: new Date().toISOString().split('T')[0],
      durationMinutes: null,
      repsDone: null,
      setsDone: null,
      weightUsed: null,
      notes: "",
    };

    // Scroll to top to see success message
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
  } catch (error) {
    console.error("Error recording exercise:", error);
    console.error("Error details:", error.response?.data);
    message.value = "Error recording exercise: " + (error.response?.data?.message || error.message);
  }
};

// Get selected exercise details
const getSelectedExercise = () => {
  if (!exerciseResult.value.exerciseId) return null;
  return exercises.value.find(ex => ex.id === exerciseResult.value.exerciseId);
};

const cancel = () => {
  router.push({ name: "athleteDashboard" });
};

const viewResults = () => {
  router.push({ name: "exerciseResults" });
};

onMounted(() => {
  user.value = Utils.getStore("user");
  console.log("User loaded:", user.value);
  fetchExercises();
});
</script>

<template>
  <v-container>
    <v-toolbar color="success">
      <v-btn icon @click="cancel">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="text-white">Record Exercise Results</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn 
        color="white" 
        variant="elevated"
        @click="viewResults"
      >
        <v-icon color="success">mdi-history</v-icon>
        View Results
      </v-btn>
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

    <!-- Loading State -->
    <v-card v-if="loading">
      <v-card-text class="text-center">
        <v-progress-circular indeterminate color="success"></v-progress-circular>
        <p class="mt-4">Loading exercises...</p>
      </v-card-text>
    </v-card>

    <!-- Exercise Form -->
    <v-card v-else>
      <v-card-title>
        Record Your Workout
      </v-card-title>
      
      <v-card-text>
        <v-form v-model="valid">
          <!-- Exercise Selection -->
          <v-select
            v-model="exerciseResult.exerciseId"
            :items="exercises"
            item-title="name"
            item-value="id"
            label="Exercise *"
            :rules="exerciseRules"
            required
            hint="Select the exercise you performed"
            persistent-hint
            class="mb-2"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:subtitle>
                  <small v-if="item.raw.muscleGroup">{{ item.raw.muscleGroup }}</small>
                  <small v-if="item.raw.description"> - {{ item.raw.description }}</small>
                </template>
              </v-list-item>
            </template>
          </v-select>

          <!-- Selected Exercise Info -->
          <v-alert 
            v-if="getSelectedExercise()" 
            type="info" 
            density="compact"
            class="mb-4"
          >
            <div><strong>{{ getSelectedExercise().name }}</strong></div>
            <div v-if="getSelectedExercise().muscleGroup">
              <small>Muscle Group: {{ getSelectedExercise().muscleGroup }}</small>
            </div>
            <div v-if="getSelectedExercise().description">
              <small>{{ getSelectedExercise().description }}</small>
            </div>
          </v-alert>

          <!-- Date -->
          <v-text-field
            v-model="exerciseResult.performedDate"
            label="Date *"
            type="date"
            :rules="dateRules"
            required
            hint="When did you perform this exercise?"
            persistent-hint
            class="mb-2"
          ></v-text-field>

          <v-divider class="my-4"></v-divider>

          <!-- Duration -->
          <v-text-field
            v-model.number="exerciseResult.durationMinutes"
            label="Duration (minutes)"
            type="number"
            min="0"
            step="1"
            hint="Total workout duration (optional)"
            persistent-hint
            class="mb-2"
            
          ></v-text-field>

          <!-- Sets and Reps -->
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model.number="exerciseResult.setsDone"
                label="Sets"
                type="number"
                min="0"
                step="1"
                hint="Number of sets (optional)"
                persistent-hint
                
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="exerciseResult.repsDone"
                label="Reps"
                type="number"
                min="0"
                step="1"
                hint="Reps per set (optional)"
                persistent-hint
               
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Weight -->
          <v-text-field
            v-model.number="exerciseResult.weightUsed"
            label="Weight (lbs)"
            type="number"
            min="0"
            step="0.5"
            hint="Weight used (optional)"
            persistent-hint
            class="mb-2"
            
          ></v-text-field>

          <!-- Notes -->
          <v-textarea
            v-model="exerciseResult.notes"
            label="Notes"
            rows="3"
            hint="Add any notes about your workout (optional)"
            persistent-hint
           
          ></v-textarea>

          <v-alert type="info" density="compact" class="mt-3">
            <small>* Required fields. All other fields are optional.</small>
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" variant="text" @click="cancel">
          <v-icon>mdi-close</v-icon>
          Cancel
        </v-btn>
        <v-btn
          color="success"
          :disabled="!valid || !exerciseResult.exerciseId || !exerciseResult.performedDate"
          @click="saveExercise"
        >
          <v-icon>mdi-content-save</v-icon>
          Save Exercise
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Quick Stats Card -->
    <v-card class="mt-4" v-if="!loading">
      <v-card-title>
        <v-icon class="mr-2" color="info">mdi-information-outline</v-icon>
        Tips
      </v-card-title>
      <v-card-text>
        <v-list density="compact">
          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="success">mdi-check-circle</v-icon>
            </template>
            <v-list-item-title>Select the exercise from the dropdown</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="success">mdi-check-circle</v-icon>
            </template>
            <v-list-item-title>Fill in the fields that apply to your workout</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="success">mdi-check-circle</v-icon>
            </template>
            <v-list-item-title>Add notes to track your progress over time</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.v-card {
  background-color: white;
}
</style>