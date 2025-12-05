<script setup>
import { ref, onMounted } from "vue";
import ExerciseServices from "../services/exerciseServices";
import { useRouter } from "vue-router";

const router = useRouter();
const valid = ref(true);
const exercises = ref([]);
const search = ref("");
const newExercise = ref({
  name: "",
  muscleGroups: "",  
  equipment: "",
  description: "",
});
const selectedExercise = ref(null);
const showAddDialog = ref(false);
const showEditDialog = ref(false);

// ✨ NEW: Beautiful confirmation and notification
const showDeleteDialog = ref(false);
const exerciseToDelete = ref(null);
const snackbar = ref(false);
const snackbarMessage = ref("");
const snackbarColor = ref("success");

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Muscle Groups', key: 'muscleGroup' },
  { title: 'Equipment', key: 'equipmentNeeded' },
  { title: 'Actions', key: 'actions', sortable: false }
];

// ✨ Show notification snackbar
const showNotification = (message, color = "success") => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
};

// Load all exercises
const fetchExercises = async () => {
  try {
    const response = await ExerciseServices.getAllExercises();
    exercises.value = response.data;
  } catch (error) {
    showNotification("Error loading exercises: " + error.message, "error");
    console.error("Error fetching exercises:", error);
  }
};

// Create exercise
const saveExercise = async () => {
  try {
    await ExerciseServices.createExercise(newExercise.value);
    showNotification("Exercise created successfully!");
    newExercise.value = { 
      name: "", 
      muscleGroups: "", 
      equipment: "", 
      description: ""
    };
    showAddDialog.value = false;
    fetchExercises();
  } catch (error) {
    showNotification(
      "Error creating exercise: " + (error.response?.data?.message || error.message),
      "error"
    );
  }
};

// Select exercise to edit
const editExercise = (item) => {
  const exercise = item.raw || item;
  
  selectedExercise.value = { 
    id: exercise.id,
    name: exercise.name || "",
    muscleGroups: exercise.muscleGroup || "",
    equipment: exercise.equipmentNeeded || "",
    description: exercise.description || ""
  };
  
  showEditDialog.value = true;
};

// Update exercise
const updateExercise = async () => {
  try {
    await ExerciseServices.updateExercise(selectedExercise.value.id, selectedExercise.value);
    showNotification("Exercise updated successfully!");
    showEditDialog.value = false;
    selectedExercise.value = null;
    fetchExercises();
  } catch (error) {
    showNotification(
      "Error updating exercise: " + (error.response?.data?.message || error.message),
      "error"
    );
  }
};

// ✨ NEW: Confirm delete with beautiful dialog
const confirmDeleteExercise = (item) => {
  const exercise = item.raw || item;
  exerciseToDelete.value = exercise;
  showDeleteDialog.value = true;
};

// ✨ NEW: Execute delete
const deleteExercise = async () => {
  if (!exerciseToDelete.value) return;

  try {
    await ExerciseServices.deleteExercise(exerciseToDelete.value.id);
    showNotification("Exercise deleted successfully!");
    showDeleteDialog.value = false;
    exerciseToDelete.value = null;
    fetchExercises();
  } catch (error) {
    showNotification(
      "Error deleting exercise: " + (error.response?.data?.message || error.message),
      "error"
    );
    showDeleteDialog.value = false;
    exerciseToDelete.value = null;
  }
};

const cancelAdd = () => {
  newExercise.value = { 
    name: "", 
    muscleGroups: "", 
    equipment: "", 
    description: ""
  };
  showAddDialog.value = false;
};

const cancelEdit = () => {
  selectedExercise.value = null;
  showEditDialog.value = false;
};

const cancelDelete = () => {
  exerciseToDelete.value = null;
  showDeleteDialog.value = false;
};

onMounted(() => {
  fetchExercises();
});
</script>

<template>
  <v-container>
    <v-card class="mx-auto" max-width="1200">
      
      <v-card-title class="text-h4 font-weight-bold pa-6">
        Standard Exercises
        <v-spacer></v-spacer>
        <v-btn 
          color="primary" 
          size="large"
          @click="showAddDialog = true"
          prepend-icon="mdi-plus"
        >
          Add Exercise
        </v-btn>
      </v-card-title>
      
      <v-card-subtitle class="text-h6 pa-6 pt-0 text-grey">
        Manage the exercise library
      </v-card-subtitle>

      <!-- Exercises Table -->
      <v-card-text class="pa-6 pt-0">
        <v-data-table
          :headers="headers"
          :items="exercises"
          :search="search"
          class="elevation-1"
          :items-per-page="10"
        >
          <!-- Search -->
          <template v-slot:top>
            <v-text-field
              v-model="search"
              append-inner-icon="mdi-magnify"
              label="Search exercises"
              single-line
              hide-details
              class="mb-4"
            ></v-text-field>
          </template>

          <!-- Actions Column -->
          <template v-slot:item.actions="{ item }">
            <v-btn
              color="primary"
              size="small"
              variant="tonal"
              class="mr-2"
              @click="editExercise(item)"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              color="error"
              size="small"
              variant="tonal"
              @click="confirmDeleteExercise(item)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Add Exercise Dialog -->
    <v-dialog v-model="showAddDialog" max-width="800px" persistent>
      <v-card>
        <v-card-title class="bg-primary text-white">
          <v-icon left color="white">mdi-dumbbell</v-icon>
          Add New Exercise
        </v-card-title>
        <v-card-text class="pt-6">
          <v-form v-model="valid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newExercise.name"
                  label="Exercise Name *"
                  variant="outlined"
                  :counter="255"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newExercise.muscleGroups"
                  label="Muscle Groups"
                  variant="outlined"
                  hint="e.g., Quadriceps, Glutes, Hamstrings"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="newExercise.equipment"
                  label="Required Equipment"
                  variant="outlined"
                  hint="e.g., Barbell, Squat Rack"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>

            <v-textarea
              v-model="newExercise.description"
              label="Description"
              variant="outlined"
              rows="4"
              hint="Describe how to perform the exercise"
              persistent-hint
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-6">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cancelAdd">Cancel</v-btn>
          <v-btn 
            color="primary" 
            :disabled="!newExercise.name"
            @click="saveExercise"
          >
            <v-icon left>mdi-check</v-icon>
            Save Exercise
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Exercise Dialog -->
    <v-dialog v-model="showEditDialog" max-width="800px" persistent>
      <v-card v-if="selectedExercise">
        <v-card-title class="bg-primary text-white">
          <v-icon left color="white">mdi-pencil</v-icon>
          Edit Exercise
        </v-card-title>
        <v-card-text class="pt-6">
          <v-form v-model="valid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="selectedExercise.name"
                  label="Exercise Name *"
                  variant="outlined"
                  :counter="255"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="selectedExercise.muscleGroups"
                  label="Muscle Groups"
                  variant="outlined"
                  hint="e.g., Quadriceps, Glutes, Hamstrings"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="selectedExercise.equipment"
                  label="Required Equipment"
                  variant="outlined"
                  hint="e.g., Barbell, Squat Rack"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>

            <v-textarea
              v-model="selectedExercise.description"
              label="Description"
              variant="outlined"
              rows="4"
              hint="Describe how to perform the exercise"
              persistent-hint
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-6">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cancelEdit">Cancel</v-btn>
          <v-btn 
            color="primary" 
            :disabled="!valid"
            @click="updateExercise"
          >
            <v-icon left>mdi-check</v-icon>
            Update Exercise
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ✨ Beautiful Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="bg-error text-white">
          <v-icon left color="white">mdi-alert-circle</v-icon>
          Confirm Delete
        </v-card-title>

        <v-card-text class="pt-6">
          <div v-if="exerciseToDelete" class="text-center">
            <v-icon size="64" color="error" class="mb-4">mdi-dumbbell</v-icon>
            <p class="text-h6 mb-2">Are you sure you want to delete this exercise?</p>
            <v-card variant="tonal" color="grey-lighten-4" class="pa-4 my-4">
              <div class="text-body-1 font-weight-bold mb-2">
                {{ exerciseToDelete.name }}
              </div>
              <div class="text-caption text-grey mb-1">
                <v-icon size="small">mdi-arm-flex</v-icon>
                {{ exerciseToDelete.muscleGroup || 'No muscle group specified' }}
              </div>
              <div class="text-caption text-grey">
                <v-icon size="small">mdi-dumbbell</v-icon>
                {{ exerciseToDelete.equipmentNeeded || 'No equipment required' }}
              </div>
            </v-card>
            <v-alert type="warning" variant="tonal" density="compact">
              <strong>Warning:</strong> This action cannot be undone. All exercise data will be permanently removed from training plans.
            </v-alert>
          </div>
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cancelDelete">
            Cancel
          </v-btn>
          <v-btn color="error" @click="deleteExercise">
            <v-icon left>mdi-delete</v-icon>
            Delete Exercise
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ✨ Beautiful Snackbar Notification -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
      elevation="24"
    >
      <div class="d-flex align-center">
        <v-icon 
          :icon="snackbarColor === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'" 
          class="mr-3"
        ></v-icon>
        <span>{{ snackbarMessage }}</span>
      </div>
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<style scoped>
/* Custom styles if needed */
</style>