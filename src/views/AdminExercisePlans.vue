<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import ExerciseServices from "../services/exerciseServices";
import ExercisePlanServices from "../services/exercisePlanServices";
import Utils from "../config/utils";

const router = useRouter();
const user = ref(null);
const plans = ref([]);
const availableExercises = ref([]);
const loading = ref(true);
const showPlanModal = ref(false);
const planToDelete = ref(null);
const isEditing = ref(false);
const selectedExerciseId = ref('');
const message = ref('');
const messageType = ref('success');

const currentPlan = ref({
  id: null,
  name: '',
  description: ''
});

const planExercises = ref([]);

// Fetch plans
const fetchPlans = async () => {
  try {
    loading.value = true;
    const response = await ExercisePlanServices.getAllExercisePlans();
    
    console.log('📦 Raw plans response:', response.data);
    
    plans.value = response.data || [];
    console.log(' Plans loaded:', plans.value);
    message.value = '';
  } catch (error) {
    console.error('Error fetching exercise plans:', error);
    showMessage('Failed to load exercise plans', 'error');
  } finally {
    loading.value = false;
  }
};

// Fetch all exercises
const fetchExercises = async () => {
  try {
    const response = await ExerciseServices.getAllExercises();
    availableExercises.value = response.data || [];
    console.log(' Loaded exercises:', availableExercises.value.length);
    if (availableExercises.value.length > 0) {
      console.log('First exercise structure:', availableExercises.value[0]);
    }
  } catch (error) {
    console.error('Error fetching exercises:', error);
    showMessage('Failed to load exercises', 'error');
  }
};

// Show message
const showMessage = (msg, type = 'success') => {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
};

// Open modal to add new plan
const openAddPlanModal = () => {
  isEditing.value = false;
  currentPlan.value = {
    id: null,
    name: '',
    description: ''
  };
  planExercises.value = [];
  selectedExerciseId.value = '';
  showPlanModal.value = true;
  message.value = '';
};

// Edit existing plan
const editPlan = async (plan) => {
  try {
    isEditing.value = true;
    currentPlan.value = { 
      id: plan.id,
      name: plan.name,
      description: plan.description
    };
    
    // Fetch plan details with exercises
    const response = await ExercisePlanServices.getExercisePlanDetails(plan.id);
    console.log(' Plan details:', response.data);
    
    let exercisesArray = [];
    if (Array.isArray(response.data.exerciseList)) {
      exercisesArray = response.data.exerciseList;
    } else if (Array.isArray(response.data.exercises)) {
      exercisesArray = response.data.exercises;
    }
    
    console.log(' Using exercises array:', exercisesArray);
    
    // Map the backend response correctly
    planExercises.value = exercisesArray.map(exercise => {
      console.log('Mapping exercise:', exercise);
      
      // Get the actual exercise_id
      const exerciseId = exercise.exercise_id || exercise.id;
      
      return {
        exercise_id: exerciseId,
        sets: exercise.ExercisePlanItem?.sets || 3,
        reps: parseInt(exercise.ExercisePlanItem?.reps) || 10,
        weight: parseFloat(exercise.ExercisePlanItem?.weight) || 0,
        duration_seconds: exercise.ExercisePlanItem?.durationSeconds || null, 
        rest_seconds: exercise.ExercisePlanItem?.restSeconds || 60, 
        order: exercise.ExercisePlanItem?.orderIndex || 0  
      };
    });
    
    console.log(' Mapped exercises:', planExercises.value);
    showPlanModal.value = true;
    message.value = '';
  } catch (error) {
    console.error('Error loading plan details:', error);
    showMessage('Failed to load plan details', 'error');
  }
};

// Confirm delete
const confirmDelete = (plan) => {
  planToDelete.value = { 
    id: plan.id,
    name: plan.name 
  };
};

// Close modal
const closeModal = () => {
  showPlanModal.value = false;
  message.value = '';
};

// Add exercise to plan
const addExerciseToPlan = () => {
  if (!selectedExerciseId.value) return;
  
  const alreadyAdded = planExercises.value.some(
    item => item.exercise_id === parseInt(selectedExerciseId.value)
  );
  
  if (alreadyAdded) {
    showMessage('This exercise is already in the plan', 'warning');
    return;
  }
  
  planExercises.value.push({
    exercise_id: parseInt(selectedExerciseId.value),
    sets: 3,
    reps: 10,
    weight: 0,
    duration_seconds: null,
    rest_seconds: 60
  });
  
  selectedExerciseId.value = '';
};

// Remove exercise from plan
const removeExercise = (index) => {
  planExercises.value.splice(index, 1);
};

// Get exercise name by ID
const getExerciseName = (exerciseId) => {
  const exercise = availableExercises.value.find(ex => 
    ex.id === parseInt(exerciseId) || ex.exercise_id === parseInt(exerciseId)
  );
  
  const name = exercise ? exercise.name : 'Unknown Exercise';
  if (!exercise) {
    console.warn(`Exercise ${exerciseId} not found in availableExercises`);
  }
  return name;
};

// Get exercise muscle group
const getExerciseMuscleGroup = (exerciseId) => {
  const exercise = availableExercises.value.find(ex => 
    ex.id === parseInt(exerciseId) || ex.exercise_id === parseInt(exerciseId)
  );
  return exercise ? (exercise.muscle_group || exercise.muscleGroup) : '';
};

// Save plan
const savePlan = async () => {
  try {
    if (!currentPlan.value.name.trim()) {
      showMessage('Plan name is required', 'error');
      return;
    }

    const planData = {
      name: currentPlan.value.name,
      description: currentPlan.value.description,
      exercises: planExercises.value.map((item, index) => ({  
        exercise_id: item.exercise_id,
        sets: item.sets,
        reps: item.reps,
        weight: item.weight || 0,
        duration_seconds: item.duration_seconds,
        rest_seconds: item.rest_seconds,
        order: index  
      }))
    };
    
    console.log(' Saving plan data:', planData);
    
    if (isEditing.value) {
      await ExercisePlanServices.updateExercisePlan(currentPlan.value.id, planData);
      showMessage('Plan updated successfully', 'success');
    } else {
      await ExercisePlanServices.createExercisePlan(planData);
      showMessage('Plan created successfully', 'success');
    }
    
    showPlanModal.value = false;
    await fetchPlans();
  } catch (error) {
    console.error('Error saving plan:', error);
    console.error('Error response:', error.response?.data);
    showMessage(`Failed to ${isEditing.value ? 'update' : 'create'} plan`, 'error');
  }
};

// Delete plan
const deletePlan = async () => {
  try {
    await ExercisePlanServices.deleteExercisePlan(planToDelete.value.id);
    showMessage('Plan deleted successfully', 'success');
    planToDelete.value = null;
    await fetchPlans();
  } catch (error) {
    console.error('Error deleting plan:', error);
    showMessage('Failed to delete plan', 'error');
  }
};

// Cancel and go back
const cancel = () => {
  router.push({ name: "adminDashboard" });
};

onMounted(async () => {
  user.value = Utils.getStore("user");
  if (!user.value || !user.value.userId) {
    showMessage("User not logged in", 'error');
    router.push({ name: "login" });
    return;
  }
  await fetchExercises();
  await fetchPlans();
});
</script>

<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <v-row align="center" class="mb-6">
      <v-col cols="auto">
        <v-btn icon variant="outlined" @click="cancel">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <h1 class="text-h4 font-weight-bold">Exercise Plans</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Create and manage training programs</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="success" prepend-icon="mdi-plus" @click="openAddPlanModal">
          Create Plan
        </v-btn>
      </v-col>
    </v-row>

    <!-- Alert Message -->
    <v-alert
      v-if="message"
      :type="messageType"
      closable
      class="mb-4"
      @click:close="message = ''"
    >
      {{ message }}
    </v-alert>

    <!-- Loading State -->
    <v-row v-if="loading" justify="center" class="my-12">
      <v-col cols="auto">
        <v-progress-circular indeterminate color="success" size="64"></v-progress-circular>
        <p class="text-center mt-4">Loading exercise plans...</p>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else-if="plans.length === 0" justify="center" class="my-12">
      <v-col cols="12" md="6" class="text-center">
        <v-icon size="80" color="grey-lighten-2">mdi-clipboard-list-outline</v-icon>
        <h3 class="text-h6 mt-4">No exercise plans found</h3>
        <p class="text-subtitle-1 text-medium-emphasis">Create your first plan to get started!</p>
      </v-col>
    </v-row>

    <!-- Plans Grid -->
    <v-row v-else>
      <v-col v-for="plan in plans" :key="plan.id" cols="12" sm="6" md="4">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ plan.name }}</span>
            <v-chip v-if="plan.exerciseList && plan.exerciseList.length > 0" color="primary" size="small">
              {{ plan.exerciseList.length }} exercise{{ plan.exerciseList.length !== 1 ? 's' : '' }}
            </v-chip>
          </v-card-title>
          
          <v-card-text>
            <p v-if="plan.description" class="mb-3">{{ plan.description }}</p>
            <p v-else class="text-medium-emphasis font-italic mb-3">No description</p>
            
            <!-- ✅ FIXED: Use exerciseList -->
            <div v-if="plan.exerciseList && plan.exerciseList.length > 0">
              <v-divider class="mb-2"></v-divider>
              <p class="text-subtitle-2 font-weight-bold mb-2">Exercises:</p>
              <v-list density="compact" class="pa-0">
                <v-list-item 
                  v-for="(exercise, idx) in plan.exerciseList" 
                  :key="idx"
                  class="px-0"
                  min-height="32"
                >
                  <template v-slot:prepend>
                    <v-icon size="small" color="success">mdi-dumbbell</v-icon>
                  </template>
                  <v-list-item-title class="text-body-2">
                    {{ exercise.name }}
                  </v-list-item-title>
                  <template v-slot:append>
                    <span class="text-caption text-medium-emphasis">
                      {{ exercise.ExercisePlanItem?.sets || 3 }}x{{ exercise.ExercisePlanItem?.reps || 10 }}
                    </span>
                  </template>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" color="primary" prepend-icon="mdi-pencil" @click="editPlan(plan)">
              Edit
            </v-btn>
            <v-btn variant="text" color="error" prepend-icon="mdi-delete" @click="confirmDelete(plan)">
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Plan Dialog -->
    <v-dialog v-model="showPlanModal" max-width="800" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEditing ? 'Edit Plan' : 'Create New Plan' }}</span>
          <p class="text-subtitle-2 text-medium-emphasis">Design a custom training plan</p>
        </v-card-title>

        <v-card-text>
          <v-form @submit.prevent="savePlan">
            <v-text-field
              v-model="currentPlan.name"
              label="Plan Name *"
              placeholder="e.g., Beginner Full Body Workout"
              required
              variant="outlined"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="currentPlan.description"
              label="Description"
              placeholder="Describe the purpose and goals of this plan"
              rows="3"
              variant="outlined"
              class="mb-4"
            ></v-textarea>

            <v-divider class="mb-4"></v-divider>

            <h3 class="text-h6 mb-3">Exercises</h3>

            <!-- Add Exercise Row -->
            <v-row class="mb-4">
              <v-col cols="9">
                <v-select
                  v-model="selectedExerciseId"
                  :items="availableExercises"
                  item-title="name"
                  :item-value="(item) => item.id || item.exercise_id"
                  label="Select exercise to add"
                  variant="outlined"
                  density="comfortable"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:title>
                        {{ item.raw.name }} - {{ item.raw.muscle_group || item.raw.muscleGroup }}
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="3">
                <v-btn
                  color="success"
                  block
                  height="56"
                  :disabled="!selectedExerciseId"
                  @click="addExerciseToPlan"
                  prepend-icon="mdi-plus"
                >
                  Add
                </v-btn>
              </v-col>
            </v-row>

            <!-- Added Exercises List -->
            <v-card variant="outlined" class="pa-4" min-height="200" max-height="400" style="overflow-y: auto;">
              <div v-if="planExercises.length === 0" class="text-center text-medium-emphasis py-8">
                No exercises added yet. Select an exercise above to get started.
              </div>
              <div v-else>
                <v-card
                  v-for="(item, index) in planExercises"
                  :key="index"
                  variant="flat"
                  class="mb-3 pa-3"
                  color="grey-lighten-4"
                >
                  <v-row align="center">
                    <v-col cols="12" sm="4">
                      <div class="font-weight-bold">{{ getExerciseName(item.exercise_id) }}</div>
                      <div class="text-caption text-medium-emphasis">{{ getExerciseMuscleGroup(item.exercise_id) }}</div>
                    </v-col>
                    <v-col cols="6" sm="2">
                      <v-text-field
                        v-model.number="item.sets"
                        label="Sets"
                        type="number"
                        min="1"
                        density="compact"
                        variant="outlined"
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" sm="2">
                      <v-text-field
                        v-model.number="item.reps"
                        label="Reps"
                        type="number"
                        min="1"
                        density="compact"
                        variant="outlined"
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" sm="2">
                      <v-text-field
                        v-model.number="item.weight"
                        label="Weight (lbs)"
                        type="number"
                        min="0"
                        step="5"
                        density="compact"
                        variant="outlined"
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" sm="2">
                      <v-text-field
                        v-model.number="item.rest_seconds"
                        label="Rest (sec)"
                        type="number"
                        min="0"
                        density="compact"
                        variant="outlined"
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="auto">
                      <v-btn icon variant="text" color="error" @click="removeExercise(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </div>
            </v-card>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeModal">Cancel</v-btn>
          <v-btn color="success" variant="flat" @click="savePlan">
            {{ isEditing ? 'Update Plan' : 'Save Plan' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="planToDelete" max-width="500">
      <v-card v-if="planToDelete">
        <v-card-title>Delete Plan</v-card-title>
        <v-card-text>
          Are you sure you want to delete the plan <strong>"{{ planToDelete.name }}"</strong>?
          This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="planToDelete = null">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="deletePlan">Delete Plan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.v-card {
  transition: all 0.2s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
}
</style>