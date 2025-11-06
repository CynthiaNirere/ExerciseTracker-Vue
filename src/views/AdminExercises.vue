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
  category: "",
  muscleGroups: "",
  equipment: "",
  description: "",
  instructions: "",
  difficulty: "",
});
const selectedExercise = ref(null);
const message = ref("");
const showAddDialog = ref(false);
const showEditDialog = ref(false);

// Category options
const categories = [
  { title: "Strength", value: "Strength" },
  { title: "Cardio", value: "Cardio" },
  { title: "Plyometrics", value: "Plyometrics" },
  { title: "Flexibility", value: "Flexibility" },
  { title: "Balance", value: "Balance" },
];

// Difficulty options
const difficulties = [
  { title: "Beginner", value: "Beginner" },
  { title: "Intermediate", value: "Intermediate" },
  { title: "Advanced", value: "Advanced" },
];

// Table headers
const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Category', key: 'category' },
  { title: 'Muscle Groups', key: 'muscleGroup' },
  { title: 'Equipment', key: 'equipmentNeeded' },
  { title: 'Actions', key: 'actions', sortable: false }
];

// Load all exercises
const fetchExercises = async () => {
  try {
    const response = await ExerciseServices.getAllExercises();
    exercises.value = response.data;
  } catch (error) {
    message.value = "Error loading exercises: " + error.message;
    console.error("Error fetching exercises:", error);
  }
};

// Create exercise
const saveExercise = async () => {
  try {
    await ExerciseServices.createExercise(newExercise.value);
    message.value = "Exercise created successfully";
    newExercise.value = { 
      name: "", 
      category: "", 
      muscleGroups: "", 
      equipment: "", 
      description: "", 
      instructions: "", 
      difficulty: "" 
    };
    showAddDialog.value = false;
    fetchExercises();
  } catch (error) {
    message.value = "Error creating exercise: " + (error.response?.data?.message || error.message);
    console.error("Error creating exercise:", error);
  }
};

// Select exercise to edit
const editExercise = (item) => {
  const exercise = item.raw || item;
  
  selectedExercise.value = { 
    id: exercise.id,
    name: exercise.name || "",
    category: exercise.category || "",
    muscleGroups: exercise.muscleGroup || "",
    equipment: exercise.equipmentNeeded || "",
    description: exercise.description || "",
    instructions: exercise.instructions || "",
    difficulty: exercise.difficulty || ""
  };
  
  showEditDialog.value = true;
};

// Update exercise
const updateExercise = async () => {
  try {
    await ExerciseServices.updateExercise(selectedExercise.value.id, selectedExercise.value);
    message.value = "Exercise updated successfully";
    showEditDialog.value = false;
    selectedExercise.value = null;
    fetchExercises();
  } catch (error) {
    message.value = "Error updating exercise: " + (error.response?.data?.message || error.message);
    console.error("Error updating exercise:", error);
  }
};

// Delete exercise
const deleteExercise = async (item) => {
  const exercise = item.raw || item;
  const id = exercise.id;
  
  if (confirm("Are you sure you want to delete this exercise?")) {
    try {
      await ExerciseServices.deleteExercise(id);
      message.value = "Exercise deleted successfully";
      fetchExercises();
    } catch (error) {
      message.value = "Error deleting exercise: " + (error.response?.data?.message || error.message);
      console.error("Error deleting exercise:", error);
    }
  }
};

// Cancel actions
const cancelAdd = () => {
  newExercise.value = { 
    name: "", 
    category: "", 
    muscleGroups: "", 
    equipment: "", 
    description: "", 
    instructions: "", 
    difficulty: "" 
  };
  showAddDialog.value = false;
  message.value = "";
};

const cancelEdit = () => {
  selectedExercise.value = null;
  showEditDialog.value = false;
  message.value = "";
};

onMounted(() => {
  fetchExercises();
});
</script>

<template>
  <v-container>
    <v-card class="mx-auto" max-width="1200">
      <!-- Header Section -->
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

      <!-- Message Display -->
      <v-alert
        v-if="message"
        :type="message.includes('Error') ? 'error' : 'success'"
        closable
        @click:close="message = ''"
        class="ma-6"
      >
        {{ message }}
      </v-alert>

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
              class="mr-2"
              @click="editExercise(item)"
              prepend-icon="mdi-pencil"
            >
              Edit
            </v-btn>
            <v-btn
              color="error"
              size="small"
              @click="deleteExercise(item)"
              prepend-icon="mdi-delete"
            >
              Delete
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Add Exercise Dialog -->
    <v-dialog v-model="showAddDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Add New Exercise</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newExercise.name"
                  label="Exercise Name"
                  :counter="255"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newExercise.category"
                  :items="categories"
                  item-title="title"
                  item-value="value"
                  label="Category"
                ></v-select>
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newExercise.muscleGroups"
                  label="Muscle Groups"
                  hint="e.g., Quadriceps, Glutes, Hamstrings"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newExercise.equipment"
                  label="Required Equipment"
                  hint="e.g., Barbell, Squat Rack"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newExercise.difficulty"
                  :items="difficulties"
                  item-title="title"
                  item-value="value"
                  label="Difficulty Level"
                ></v-select>
              </v-col>
            </v-row>

            <v-textarea
              v-model="newExercise.description"
              label="Description"
              rows="3"
            ></v-textarea>

            <v-textarea
              v-model="newExercise.instructions"
              label="Instructions"
              rows="4"
              hint="Step-by-step instructions for performing the exercise"
              persistent-hint
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="cancelAdd">Cancel</v-btn>
          <v-btn color="success" @click="saveExercise">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Exercise Dialog -->
    <v-dialog v-model="showEditDialog" max-width="800px">
      <v-card v-if="selectedExercise">
        <v-card-title>
          <span class="text-h5">Edit Exercise</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="selectedExercise.name"
                  label="Exercise Name"
                  :counter="255"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedExercise.category"
                  :items="categories"
                  item-title="title"
                  item-value="value"
                  label="Category"
                ></v-select>
              </v-col>
            </v-row>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="selectedExercise.muscleGroups"
                  label="Muscle Groups"
                  hint="e.g., Quadriceps, Glutes, Hamstrings"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="selectedExercise.equipment"
                  label="Required Equipment"
                  hint="e.g., Barbell, Squat Rack"
                  persistent-hint
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedExercise.difficulty"
                  :items="difficulties"
                  item-title="title"
                  item-value="value"
                  label="Difficulty Level"
                ></v-select>
              </v-col>
            </v-row>

            <v-textarea
              v-model="selectedExercise.description"
              label="Description"
              rows="3"
            ></v-textarea>

            <v-textarea
              v-model="selectedExercise.instructions"
              label="Instructions"
              rows="4"
              hint="Step-by-step instructions for performing the exercise"
              persistent-hint
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="cancelEdit">Cancel</v-btn>
          <v-btn color="success" @click="updateExercise">Update</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>