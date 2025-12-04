<script setup>
import { ref, onMounted, watch, computed } from "vue";
import ExerciseServices from "../services/exerciseServices";
import ExercisePlanServices from "../services/exercisePlanServices";
import Utils from "../config/utils";
import { useRouter } from "vue-router";

const router = useRouter();
const valid = ref(true);
const user = ref(null);
const assignedPlans = ref([]);
const planExercises = ref([]);
const loading = ref(true);
const loadingExercises = ref(false);
const selectedPlanId = ref(null);
const exerciseResult = ref({
  athletePlanId: null,
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
const planRules = [
  v => !!v || 'Please select a training plan'
];

const exerciseRules = [
  v => !!v || 'Please select an exercise'
];

const dateRules = [
  v => !!v || 'Date is required'
];

// Load athlete's assigned plans
const fetchAssignedPlans = async () => {
  if (!user.value || !user.value.userId) {
    message.value = "Error: User not logged in";
    router.push({ name: "login" });
    return;
  }

  try {
    loading.value = true;
    const athleteId = user.value.userId;
    const response = await ExercisePlanServices.getPlansByAthlete(athleteId);
    
    console.log("Fetched assigned plans:", response.data);
    
    // Format plans for dropdown
    assignedPlans.value = (response.data || []).map(assignment => ({
      value: assignment.assignmentId,
      title: assignment.plan.name,
      description: assignment.plan.description,
      exercises: assignment.plan.exercises || [],
      planId: assignment.plan.id
    }));
    
    if (assignedPlans.value.length === 0) {
      message.value = "No training plans assigned. Please contact your coach.";
    }
    
    loading.value = false;
  } catch (error) {
    console.error("Error fetching assigned plans:", error);
    message.value = "Error loading training plans: " + (error.response?.data?.message || error.message);
    loading.value = false;
  }
};

// Watch for plan selection changes
watch(selectedPlanId, async (newPlanId) => {
  if (!newPlanId) {
    planExercises.value = [];
    exerciseResult.value.athletePlanId = null;
    exerciseResult.value.exerciseId = null;
    return;
  }

  try {
    loadingExercises.value = true;
    exerciseResult.value.athletePlanId = newPlanId;
    exerciseResult.value.exerciseId = null;
    
    // Find selected plan and get its exercises
    const selectedPlan = assignedPlans.value.find(p => p.value === newPlanId);
    
    if (selectedPlan && selectedPlan.exercises) {
      planExercises.value = selectedPlan.exercises.map(ex => ({
        value: ex.id,
        title: ex.name,
        muscleGroup: ex.muscleGroup,
        description: ex.description,
        sets: ex.ExercisePlanItem?.sets || 3,
        reps: ex.ExercisePlanItem?.reps || 10
      }));
      
      console.log("Plan exercises:", planExercises.value);
    } else {
      planExercises.value = [];
      message.value = "No exercises found in this plan";
    }
    
    loadingExercises.value = false;
  } catch (error) {
    console.error("Error loading plan exercises:", error);
    message.value = "Error loading exercises: " + error.message;
    loadingExercises.value = false;
  }
});

// Get selected plan details
const getSelectedPlan = computed(() => {
  if (!selectedPlanId.value) return null;
  return assignedPlans.value.find(p => p.value === selectedPlanId.value);
});

// Get selected exercise details
const getSelectedExercise = computed(() => {
  if (!exerciseResult.value.exerciseId) return null;
  return planExercises.value.find(ex => ex.value === exerciseResult.value.exerciseId);
});

// Save exercise result
const saveExercise = async () => {
  if (!user.value || !user.value.userId) {
    message.value = "Error: User not logged in";
    return;
  }

  // Validate required fields
  if (!selectedPlanId.value) {
    message.value = "Error: Please select a training plan";
    return;
  }

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
      athletePlanId: exerciseResult.value.athletePlanId,
      exerciseId: exerciseResult.value.exerciseId,
      performedDate: exerciseResult.value.performedDate,
      setsDone: exerciseResult.value.setsDone || null,
      repsDone: exerciseResult.value.repsDone || null,
      weightUsed: exerciseResult.value.weightUsed || null,
      durationSeconds: exerciseResult.value.durationMinutes ? exerciseResult.value.durationMinutes * 60 : null,
      notes: exerciseResult.value.notes || null
    };

    console.log("Sending exercise data:", data);
    
    await ExerciseServices.recordExerciseResult(data);
    
    message.value = "Exercise result recorded successfully!";
    
    // Reset form (keep plan selected for easy consecutive entries)
    exerciseResult.value = {
      athletePlanId: exerciseResult.value.athletePlanId,
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

const cancel = () => {
  router.push({ name: "athleteDashboard" });
};

const viewResults = () => {
  router.push({ name: "viewExerciseResults" });
};

onMounted(() => {
  user.value = Utils.getStore("user");
  console.log("User loaded:", user.value);
  fetchAssignedPlans();
});
</script>

<template>
  <v-container>
    <v-toolbar color="success">
      <v-btn icon @click="cancel">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="text-white">Record Exercise from Plan</v-toolbar-title>
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
        <p class="mt-4">Loading training plans...</p>
      </v-card-text>
    </v-card>

    <!-- Exercise Form -->
    <v-card v-else>
      <v-card-title>
        Record Your Workout
      </v-card-title>
      
      <v-card-text>
        <v-form v-model="valid">
          <!-- Step 1: Select Training Plan -->
          <v-select
            v-model="selectedPlanId"
            :items="assignedPlans"
            item-title="title"
            item-value="value"
            label="Training Plan *"
            :rules="planRules"
            required
            hint="Select the training plan you're working on"
            persistent-hint
            class="mb-2"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:subtitle>
                  <small v-if="item.raw.description">{{ item.raw.description }}</small>
                  <small v-if="item.raw.exercises">
                    <br />{{ item.raw.exercises.length }} exercises
                  </small>
                </template>
              </v-list-item>
            </template>
          </v-select>

          <!-- Selected Plan Info -->
          <v-alert 
            v-if="getSelectedPlan" 
            type="info" 
            density="compact"
            class="mb-4"
          >
            <div><strong>{{ getSelectedPlan.title }}</strong></div>
            <div v-if="getSelectedPlan.description">
              <small>{{ getSelectedPlan.description }}</small>
            </div>
            <div>
              <small>{{ getSelectedPlan.exercises.length }} exercises available</small>
            </div>
          </v-alert>

          <!-- Step 2: Select Exercise from Plan -->
          <v-select
            v-model="exerciseResult.exerciseId"
            :items="planExercises"
            item-title="title"
            item-value="value"
            label="Exercise *"
            :rules="exerciseRules"
            :disabled="!selectedPlanId || loadingExercises"
            :loading="loadingExercises"
            required
            hint="Select the exercise you performed"
            persistent-hint
            class="mb-2"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:subtitle>
                  <small v-if="item.raw.muscleGroup">{{ item.raw.muscleGroup }}</small>
                  <small v-if="item.raw.sets && item.raw.reps">
                    • Recommended: {{ item.raw.sets }} sets × {{ item.raw.reps }} reps
                  </small>
                </template>
              </v-list-item>
            </template>
          </v-select>

          <!-- Selected Exercise Info -->
          <v-alert 
            v-if="getSelectedExercise" 
            type="success" 
            density="compact"
            class="mb-4"
          >
            <div><strong>{{ getSelectedExercise.title }}</strong></div>
            <div v-if="getSelectedExercise.muscleGroup">
              <small>Muscle Group: {{ getSelectedExercise.muscleGroup }}</small>
            </div>
            <div v-if="getSelectedExercise.sets && getSelectedExercise.reps">
              <small>Recommended: {{ getSelectedExercise.sets }} sets × {{ getSelectedExercise.reps }} reps</small>
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
                :hint="getSelectedExercise?.sets ? `Recommended: ${getSelectedExercise.sets}` : 'Number of sets (optional)'"
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
                :hint="getSelectedExercise?.reps ? `Recommended: ${getSelectedExercise.reps}` : 'Reps per set (optional)'"
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
          :disabled="!valid || !selectedPlanId || !exerciseResult.exerciseId || !exerciseResult.performedDate"
          @click="saveExercise"
        >
          <v-icon>mdi-content-save</v-icon>
          Save Exercise
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Help Card -->
    <v-card class="mt-4" v-if="!loading">
      <v-card-title>
        <v-icon class="mr-2" color="info">mdi-information-outline</v-icon>
        How to Record
      </v-card-title>
      <v-card-text>
        <v-list density="compact">
          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="success">mdi-numeric-1-circle</v-icon>
            </template>
            <v-list-item-title>Select your training plan</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="success">mdi-numeric-2-circle</v-icon>
            </template>
            <v-list-item-title>Choose the exercise you performed</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="success">mdi-numeric-3-circle</v-icon>
            </template>
            <v-list-item-title>Fill in your workout details</v-list-item-title>
          </v-list-item>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon color="success">mdi-numeric-4-circle</v-icon>
            </template>
            <v-list-item-title>Save and track your progress!</v-list-item-title>
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