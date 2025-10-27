<script setup>
import { ref, onMounted } from "vue";
import GoalServices from "../services/goalServices";
import Utils from "../config/utils";
import { useRouter } from "vue-router";

const router = useRouter();
const valid = ref(true);
const user = ref(null);
const goals = ref([]);
const search = ref("");
const newGoal = ref({
  title: "",
  description: "",
  targetValue: null,
  currentValue: 0,
  unit: "",
  targetDate: "",
  status: "in_progress"
});
const selectedGoal = ref(null);
const message = ref("");
const showAddDialog = ref(false);
const showEditDialog = ref(false);

// Status options
const statusOptions = [
  { title: "In Progress", value: "in_progress" },
  { title: "Completed", value: "completed" },
  { title: "Paused", value: "paused" }
];

// Table headers
const headers = [
  { title: 'Title', key: 'title' },
  { title: 'Description', key: 'description' },
  { title: 'Target', key: 'targetValue' },
  { title: 'Current', key: 'currentValue' },
  { title: 'Unit', key: 'unit' },
  { title: 'Target Date', key: 'targetDate' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false }
];

// Load all goals for athlete
const fetchGoals = async () => {
  try {
    const response = await GoalServices.getGoalsByAthlete(user.value.id);
    goals.value = response.data;
    message.value = "Goals loaded successfully";
  } catch (error) {
    message.value = "Error loading goals: " + error.message;
    console.error("Error fetching goals:", error);
  }
};

// Create goal
const saveGoal = async () => {
  try {
    const data = {
      ...newGoal.value,
      athleteId: user.value.id
    };
    await GoalServices.createGoal(data);
    message.value = "Goal created successfully";
    newGoal.value = {
      title: "",
      description: "",
      targetValue: null,
      currentValue: 0,
      unit: "",
      targetDate: "",
      status: "in_progress"
    };
    showAddDialog.value = false;
    fetchGoals();
  } catch (error) {
    message.value = "Error creating goal: " + (error.response?.data?.message || error.message);
  }
};

// Select goal to edit
const editGoal = (goal) => {
  selectedGoal.value = { ...goal };
  showEditDialog.value = true;
};

// Update goal
const updateGoal = async () => {
  try {
    await GoalServices.updateGoal(selectedGoal.value.id, selectedGoal.value);
    message.value = "Goal updated successfully";
    showEditDialog.value = false;
    selectedGoal.value = null;
    fetchGoals();
  } catch (error) {
    message.value = "Error updating goal: " + (error.response?.data?.message || error.message);
  }
};

// Delete goal
const deleteGoal = async (id) => {
  if (confirm("Are you sure you want to delete this goal?")) {
    try {
      await GoalServices.deleteGoal(id);
      message.value = "Goal deleted successfully";
      fetchGoals();
    } catch (error) {
      message.value = "Error deleting goal: " + (error.response?.data?.message || error.message);
    }
  }
};

// Cancel actions
const cancelAdd = () => {
  newGoal.value = {
    title: "",
    description: "",
    targetValue: null,
    currentValue: 0,
    unit: "",
    targetDate: "",
    status: "in_progress"
  };
  showAddDialog.value = false;
};

const cancelEdit = () => {
  selectedGoal.value = null;
  showEditDialog.value = false;
};

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
      <v-toolbar-title class="text-white">Manage Goals</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="white" variant="elevated" @click="showAddDialog = true">
        <v-icon color="success">mdi-plus</v-icon>
        Add Goal
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

    <!-- Goals Table -->
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
        :items="goals"
        :search="search"
        class="elevation-1"
      >
        <!-- Status Column -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="
              (item.raw || item).status === 'completed' ? 'success' : 
              (item.raw || item).status === 'paused' ? 'warning' : 
              'info'
            "
            size="small"
          >
            {{ (item.raw || item).status }}
          </v-chip>
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <v-btn
            color="primary"
            size="small"
            class="mr-2"
            @click="editGoal(item.raw || item)"
          >
            <v-icon size="small">mdi-pencil</v-icon>
            Edit
          </v-btn>
          <v-btn
            color="error"
            size="small"
            @click="deleteGoal((item.raw || item).id)"
          >
            <v-icon size="small">mdi-delete</v-icon>
            Delete
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add Goal Dialog -->
    <v-dialog v-model="showAddDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Add New Goal</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid">
            <v-text-field
              v-model="newGoal.title"
              label="Title"
              :counter="100"
              required
            ></v-text-field>
            <v-textarea
              v-model="newGoal.description"
              label="Description"
              rows="3"
            ></v-textarea>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model.number="newGoal.targetValue"
                  label="Target Value"
                  type="number"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="newGoal.currentValue"
                  label="Current Value"
                  type="number"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-text-field
              v-model="newGoal.unit"
              label="Unit (e.g., lbs, miles, reps)"
              required
            ></v-text-field>
            <v-text-field
              v-model="newGoal.targetDate"
              label="Target Date"
              type="date"
              required
            ></v-text-field>
            <v-select
              v-model="newGoal.status"
              :items="statusOptions"
              item-title="title"
              item-value="value"
              label="Status"
              required
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="cancelAdd">Cancel</v-btn>
          <v-btn
            color="success"
            :disabled="!valid"
            @click="saveGoal"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Goal Dialog -->
    <v-dialog v-model="showEditDialog" max-width="600px">
      <v-card v-if="selectedGoal">
        <v-card-title>
          <span class="text-h5">Edit Goal</span>
        </v-card-title>
        <v-card-text>
          <v-form v-model="valid">
            <v-text-field
              v-model="selectedGoal.title"
              label="Title"
              :counter="100"
              required
            ></v-text-field>
            <v-textarea
              v-model="selectedGoal.description"
              label="Description"
              rows="3"
            ></v-textarea>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model.number="selectedGoal.targetValue"
                  label="Target Value"
                  type="number"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="selectedGoal.currentValue"
                  label="Current Value"
                  type="number"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-text-field
              v-model="selectedGoal.unit"
              label="Unit (e.g., lbs, miles, reps)"
              required
            ></v-text-field>
            <v-text-field
              v-model="selectedGoal.targetDate"
              label="Target Date"
              type="date"
              required
            ></v-text-field>
            <v-select
              v-model="selectedGoal.status"
              :items="statusOptions"
              item-title="title"
              item-value="value"
              label="Status"
              required
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="cancelEdit">Cancel</v-btn>
          <v-btn
            color="success"
            :disabled="!valid"
            @click="updateGoal"
          >
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>