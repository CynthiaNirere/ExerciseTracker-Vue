<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import Utils from '../config/utils';
import athleteServices from '../services/athleteServices';

const router = useRouter();
const user = ref(null);
const goals = ref([]);
const availableExercises = ref([]);
const loading = ref(true);
const showCreateDialog = ref(false);
const showDeleteDialog = ref(false);
const goalToDelete = ref(null);

const newGoal = ref({
  exerciseId: null,
  planId: null,
  title: '',
  description: '',
  targetValue: null,
  unit: 'reps',
  startDate: new Date().toISOString().split('T')[0],
  endDate: null
});

const units = ['reps', 'lbs', 'kg', 'miles', 'km', 'minutes', 'seconds', 'count'];

// Load goals
const loadGoals = async () => {
  try {
    loading.value = true;
    const response = await athleteServices.getGoals();
    goals.value = response.data;
  } catch (error) {
    console.error('Error loading goals:', error);
  } finally {
    loading.value = false;
  }
};

// ✨ Load exercises from assigned plans
const loadAssignedPlanExercises = async () => {
  try {
    console.log('📋 Loading exercises from assigned plans...');
    const response = await athleteServices.getAssignedPlanExercises();
    availableExercises.value = response.data;
    console.log(`✅ Loaded ${availableExercises.value.length} exercises`);
  } catch (error) {
    console.error('❌ Error loading exercises:', error);
    availableExercises.value = [];
  }
};

// Open create dialog
const openCreateDialog = () => {
  newGoal.value = {
    exerciseId: null,
    planId: null,
    title: '',
    description: '',
    targetValue: null,
    unit: 'reps',
    startDate: new Date().toISOString().split('T')[0],
    endDate: null
  };
  showCreateDialog.value = true;
};

// Auto-fill title when exercise is selected
const onExerciseSelected = () => {
  const selectedExercise = availableExercises.value.find(
    e => e.exerciseId === newGoal.value.exerciseId
  );
  
  if (selectedExercise) {
    newGoal.value.planId = selectedExercise.planId;
    // Auto-suggest title
    if (!newGoal.value.title) {
      newGoal.value.title = `Improve ${selectedExercise.exerciseName}`;
    }
  }
};

// Create goal
const createGoal = async () => {
  if (!newGoal.value.exerciseId || !newGoal.value.title || !newGoal.value.targetValue) {
    return;
  }

  try {
    await athleteServices.createGoal(newGoal.value);
    showCreateDialog.value = false;
    await loadGoals();
  } catch (error) {
    console.error('Error creating goal:', error);
  }
};

// Confirm delete
const confirmDelete = (goal) => {
  goalToDelete.value = goal;
  showDeleteDialog.value = true;
};

// Delete goal
const deleteGoal = async () => {
  if (!goalToDelete.value) return;

  try {
    await athleteServices.deleteGoal(goalToDelete.value.id);
    showDeleteDialog.value = false;
    goalToDelete.value = null;
    await loadGoals();
  } catch (error) {
    console.error('Error deleting goal:', error);
  }
};

// ✅ FIXED: Calculate progress percentage with proper number conversion
const getProgress = (goal) => {
  const target = parseFloat(goal.targetValue) || 0;
  const current = parseFloat(goal.currentValue) || 0;
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
};

// Get progress color
const getProgressColor = (progress) => {
  if (progress >= 100) return 'success';
  if (progress >= 75) return 'info';
  if (progress >= 50) return 'warning';
  return 'error';
};

// ✅ FIXED: Format numbers safely
const formatNumber = (value) => {
  const num = parseFloat(value) || 0;
  return num.toFixed(1);
};

// Format creator name
const getCreatorName = (goal) => {
  if (!goal.creator) return 'You';
  if (goal.createdBy === user.value?.userId) return 'You';
  return `${goal.creator.fName} ${goal.creator.lName}`;
};

const cancel = () => {
  router.push({ name: 'athleteDashboard' });
};

onMounted(async () => {
  user.value = Utils.getStore('user');
  await Promise.all([
    loadGoals(),
    loadAssignedPlanExercises()
  ]);
});
</script>

<template>
  <v-container>
    <v-toolbar color="success">
      <v-btn icon @click="cancel">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="text-white">My Goals</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon color="white" @click="openCreateDialog">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-toolbar>

    <br />

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="success"></v-progress-circular>
      <p class="mt-4">Loading goals...</p>
    </div>

    <!-- Goals List -->
    <v-row v-else-if="goals.length > 0">
      <v-col v-for="goal in goals" :key="goal.id" cols="12" md="6">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center mb-2">
              <div class="text-h6 font-weight-bold">{{ goal.title }}</div>
              <v-chip
                :color="goal.status === 'completed' ? 'success' : 'primary'"
                size="small"
              >
                {{ goal.status }}
              </v-chip>
            </div>

            <div v-if="goal.description" class="text-body-2 text-grey mb-3">
              {{ goal.description }}
            </div>

            <!-- Exercise Info -->
            <div v-if="goal.exercise" class="mb-3">
              <v-chip size="small" color="info" variant="tonal">
                <v-icon left size="small">mdi-dumbbell</v-icon>
                {{ goal.exercise.name }}
              </v-chip>
            </div>

            <!-- Progress -->
            <div class="mb-3">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-caption">Progress</span>
                <span class="text-caption font-weight-bold">
                  {{ formatNumber(goal.currentValue) }} / {{ formatNumber(goal.targetValue) }} {{ goal.unit }}
                </span>
              </div>
              <v-progress-linear
                :model-value="getProgress(goal)"
                :color="getProgressColor(getProgress(goal))"
                height="8"
                rounded
              ></v-progress-linear>
              <div class="text-center text-caption mt-1">
                {{ getProgress(goal).toFixed(0) }}% Complete
              </div>
            </div>

            <!-- Dates -->
            <div class="d-flex justify-space-between text-caption text-grey mb-2">
              <div v-if="goal.startDate">
                <v-icon size="small">mdi-calendar-start</v-icon>
                Start: {{ new Date(goal.startDate).toLocaleDateString() }}
              </div>
              <div v-if="goal.endDate">
                <v-icon size="small">mdi-calendar-end</v-icon>
                Target: {{ new Date(goal.endDate).toLocaleDateString() }}
              </div>
            </div>

            <!-- Creator -->
            <div class="text-caption text-grey">
              <v-icon size="small">mdi-account</v-icon>
              Created by: {{ getCreatorName(goal) }}
            </div>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              icon
              size="small"
              color="error"
              @click="confirmDelete(goal)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-card v-else>
      <v-card-text class="text-center py-8">
        <v-icon size="64" color="grey">mdi-target</v-icon>
        <p class="text-h6 mt-4">No goals yet!</p>
        <p class="text-body-2 text-grey">Create your first goal from exercises in your assigned plans.</p>
        <v-btn color="success" class="mt-4" @click="openCreateDialog">
          <v-icon left>mdi-plus</v-icon>
          Create Goal
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Create Goal Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="bg-success text-white">
          <v-icon left color="white">mdi-target</v-icon>
          Create New Goal
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form>
            <!-- Exercise Selection -->
            <v-select
              v-model="newGoal.exerciseId"
              :items="availableExercises"
              item-title="exerciseName"
              item-value="exerciseId"
              label="Exercise *"
              hint="Select from your assigned plan exercises"
              persistent-hint
              variant="outlined"
              @update:model-value="onExerciseSelected"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-icon>mdi-dumbbell</v-icon>
                  </template>
                  <template #subtitle>
                    <span class="text-caption">
                      From plan: {{ item.raw.planName }} | 
                      {{ item.raw.muscleGroup }}
                    </span>
                  </template>
                </v-list-item>
              </template>
            </v-select>

            <!-- Show message if no exercises available -->
            <v-alert
              v-if="availableExercises.length === 0"
              type="info"
              variant="tonal"
              density="compact"
              class="mb-4"
            >
              <strong>No exercises available.</strong> 
              You need to have an assigned training plan first. Ask your coach to assign you a plan!
            </v-alert>

            <!-- Goal Title -->
            <v-text-field
              v-model="newGoal.title"
              label="Goal Title *"
              placeholder="e.g., Do 50 push-ups"
              variant="outlined"
              :disabled="!newGoal.exerciseId"
            ></v-text-field>

            <!-- Description -->
            <v-textarea
              v-model="newGoal.description"
              label="Description (Optional)"
              placeholder="Add any notes about this goal..."
              variant="outlined"
              rows="2"
              :disabled="!newGoal.exerciseId"
            ></v-textarea>

            <!-- Target Value and Unit -->
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model.number="newGoal.targetValue"
                  label="Target Value *"
                  type="number"
                  variant="outlined"
                  :disabled="!newGoal.exerciseId"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="newGoal.unit"
                  :items="units"
                  label="Unit *"
                  variant="outlined"
                  :disabled="!newGoal.exerciseId"
                ></v-select>
              </v-col>
            </v-row>

            <!-- Dates -->
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="newGoal.startDate"
                  label="Start Date"
                  type="date"
                  variant="outlined"
                  :disabled="!newGoal.exerciseId"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="newGoal.endDate"
                  label="Target Date (Optional)"
                  type="date"
                  variant="outlined"
                  :disabled="!newGoal.exerciseId"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Info Alert -->
            <v-alert type="success" variant="tonal" density="compact">
              <small>
                <strong>💡 Tip:</strong> Your progress will update automatically when you record workouts for this exercise!
              </small>
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showCreateDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="success"
            @click="createGoal"
            :disabled="!newGoal.exerciseId || !newGoal.title || !newGoal.targetValue"
          >
            <v-icon left>mdi-check</v-icon>
            Create Goal
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="bg-error text-white">
          <v-icon left color="white">mdi-alert</v-icon>
          Delete Goal?
        </v-card-title>

        <v-card-text class="pt-4">
          <p v-if="goalToDelete">
            Are you sure you want to delete the goal 
            <strong>"{{ goalToDelete.title }}"</strong>?
          </p>
          <p class="text-caption text-grey mt-2">
            This action cannot be undone.
          </p>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDeleteDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" @click="deleteGoal">
            <v-icon left>mdi-delete</v-icon>
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>