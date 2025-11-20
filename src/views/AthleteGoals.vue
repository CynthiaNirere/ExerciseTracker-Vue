<script setup>
import { ref, onMounted, computed } from "vue";
import GoalServices from "../services/goalServices";
import Utils from "../config/utils";
import { useRouter } from "vue-router";

const router = useRouter();
const valid = ref(true);
const editValid = ref(true);
const user = ref(null);
const goals = ref([]);
const loading = ref(true);
const search = ref("");
const newGoal = ref({
  title: "",
  description: "",
  targetValue: null,
  currentValue: 0,
  unit: "count",
  targetDate: "",
  status: "active"  // ✅ FIXED: Changed from 'in_progress' to 'active'
});
const selectedGoal = ref(null);
const message = ref("");
const showAddDialog = ref(false);
const showEditDialog = ref(false);

// Unit options for dropdown
const unitOptions = [
  { title: "Count (reps/sessions)", value: "count" },
  { title: "Pounds (lbs)", value: "lbs" },
  { title: "Kilograms (kg)", value: "kg" },
  { title: "Miles", value: "miles" },
  { title: "Kilometers (km)", value: "km" },
  { title: "Minutes", value: "minutes" },
  { title: "Hours", value: "hours" },
  { title: "Percentage (%)", value: "percentage" }
];

// Status options - ✅ FIXED: Updated status values
const statusOptions = [
  { title: "Active", value: "active" },
  { title: "Completed", value: "completed" },
  { title: "Paused", value: "paused" }
];

// Validation rules
const titleRules = [
  v => !!v || 'Title is required',
  v => (v && v.length <= 100) || 'Title must be less than 100 characters'
];

const targetValueRules = [
  v => v !== null && v !== '' || 'Target value is required',
  v => v > 0 || 'Target value must be greater than 0'
];

const currentValueRules = [
  v => v !== null && v !== '' || 'Current value is required',
  v => v >= 0 || 'Current value must be 0 or greater'
];

const unitRules = [
  v => !!v || 'Unit is required'
];

const targetDateRules = [
  v => !!v || 'Target date is required',
  v => {
    const selectedDate = new Date(v);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today || 'Target date must be today or in the future';
  }
];

// Edit validation rules (no date restriction)
const editTargetDateRules = [
  v => !!v || 'Target date is required'
];

// Table headers
const headers = [
  { title: 'Title', key: 'title' },
  { title: 'Description', key: 'description' },
  { title: 'Target', key: 'targetValue' },
  { title: 'Current', key: 'currentValue' },
  { title: 'Unit', key: 'unit' },
  { title: 'Target Date', key: 'endDate' },  // ✅ FIXED: Changed from targetDate to endDate
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false }
];

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

// Get minimum date for date picker (today)
const minDate = computed(() => {
  const today = new Date();
  return today.toISOString().split('T')[0];
});

// Load all goals for athlete
const fetchGoals = async () => {
  if (!user.value || !user.value.userId) {
    message.value = "Error: User not logged in";
    router.push({ name: "login" });
    return;
  }
  
  try {
    loading.value = true;
    const response = await GoalServices.getGoalsByAthlete(user.value.userId);
    
    // ✅ FIXED: Map endDate to targetDate for display
    goals.value = (response.data || []).map(goal => ({
      ...goal,
      targetDate: goal.endDate ? goal.endDate.split('T')[0] : null,
      unit: goal.unit || 'count'
    }));
    
    message.value = "";
    loading.value = false;
  } catch (error) {
    message.value = "Error loading goals: " + (error.response?.data?.message || error.message);
    console.error("Error fetching goals:", error);
    loading.value = false;
  }
};

// Create goal
const saveGoal = async () => {
  if (!user.value || !user.value.userId) {
    message.value = "Error: User not found";
    return;
  }
  
  // Validate required fields
  if (!newGoal.value.title || !newGoal.value.targetValue || !newGoal.value.unit || !newGoal.value.targetDate) {
    message.value = "Error: Please fill in all required fields";
    return;
  }

  // Validate target value
  if (newGoal.value.targetValue <= 0) {
    message.value = "Error: Target value must be greater than 0";
    return;
  }

  // Validate current value
  if (newGoal.value.currentValue < 0) {
    message.value = "Error: Current value cannot be negative";
    return;
  }

  // Validate date
  const targetDate = new Date(newGoal.value.targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (targetDate < today) {
    message.value = "Error: Target date must be today or in the future";
    return;
  }
  
  try {
    const data = {
      ...newGoal.value,
      athleteId: user.value.userId
    };
    
    await GoalServices.createGoal(data);
    message.value = "Goal created successfully";
    
    // Reset form
    newGoal.value = {
      title: "",
      description: "",
      targetValue: null,
      currentValue: 0,
      unit: "count",
      targetDate: "",
      status: "active"  // ✅ FIXED
    };
    
    showAddDialog.value = false;
    fetchGoals();
  } catch (error) {
    message.value = "Error creating goal: " + (error.response?.data?.message || error.message);
    console.error("Create error:", error);
  }
};

// Select goal to edit
const editGoal = (goal) => {
  selectedGoal.value = { 
    ...goal,
    targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '',
    unit: goal.unit || 'count'
  };
  showEditDialog.value = true;
};

// Update goal
const updateGoal = async () => {
  if (!selectedGoal.value || !selectedGoal.value.id) {
    message.value = "Error: No goal selected";
    return;
  }

  // Basic validation for required fields
  if (!selectedGoal.value.title?.trim()) {
    message.value = "Error: Title is required";
    return;
  }

  if (selectedGoal.value.title.length > 100) {
    message.value = "Error: Title must be less than 100 characters";
    return;
  }

  if (selectedGoal.value.targetValue === null || selectedGoal.value.targetValue === '') {
    message.value = "Error: Target value is required";
    return;
  }

  if (selectedGoal.value.targetValue <= 0) {
    message.value = "Error: Target value must be greater than 0";
    return;
  }

  if (selectedGoal.value.currentValue === null || selectedGoal.value.currentValue === '') {
    message.value = "Error: Current value is required";
    return;
  }

  if (selectedGoal.value.currentValue < 0) {
    message.value = "Error: Current value cannot be negative";
    return;
  }

  if (!selectedGoal.value.unit) {
    message.value = "Error: Unit is required";
    return;
  }

  if (!selectedGoal.value.targetDate) {
    message.value = "Error: Target date is required";
    return;
  }
  
  try {
    await GoalServices.updateGoal(selectedGoal.value.id, selectedGoal.value);
    message.value = "Goal updated successfully";
    showEditDialog.value = false;
    selectedGoal.value = null;
    fetchGoals();
  } catch (error) {
    message.value = "Error updating goal: " + (error.response?.data?.message || error.message);
    console.error("Update error:", error);
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
      console.error("Delete error:", error);
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
    unit: "count",
    targetDate: "",
    status: "active"  
  };
  showAddDialog.value = false;
  message.value = "";
};

const cancelEdit = () => {
  selectedGoal.value = null;
  showEditDialog.value = false;
  message.value = "";
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

    <!-- Loading State -->
    <v-card v-if="loading">
      <v-card-text class="text-center">
        <v-progress-circular indeterminate color="success"></v-progress-circular>
        <p class="mt-4">Loading goals...</p>
      </v-card-text>
    </v-card>

    <!-- Goals Table -->
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
        :items="goals"
        :search="search"
        class="elevation-1"
      >
        <!-- Target Value Column -->
        <template v-slot:item.targetValue="{ item }">
          {{ (item.raw || item).targetValue }} {{ (item.raw || item).unit }}
        </template>

        <!-- Current Value Column -->
        <template v-slot:item.currentValue="{ item }">
          {{ (item.raw || item).currentValue }} {{ (item.raw || item).unit }}
        </template>

         <template v-slot:item.endDate="{ item }">
          {{ formatDate((item.raw || item).endDate || (item.raw || item).targetDate) }}
        </template>

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
              label="Title *"
              :rules="titleRules"
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
                  label="Target Value *"
                  type="number"
                  :rules="targetValueRules"
                  required
                  min="1"
                  step="0.01"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="newGoal.currentValue"
                  label="Current Value *"
                  type="number"
                  :rules="currentValueRules"
                  required
                  min="0"
                  step="0.01"
                ></v-text-field>
              </v-col>
            </v-row>
            
            <v-select
              v-model="newGoal.unit"
              :items="unitOptions"
              item-title="title"
              item-value="value"
              label="Unit *"
              :rules="unitRules"
              required
            ></v-select>
            
            <v-text-field
              v-model="newGoal.targetDate"
              label="Target Date *"
              type="date"
              :rules="targetDateRules"
              :min="minDate"
              required
            ></v-text-field>
            
            <v-select
              v-model="newGoal.status"
              :items="statusOptions"
              item-title="title"
              item-value="value"
              label="Status *"
              required
            ></v-select>
          </v-form>
          
          <v-alert type="info" density="compact" class="mt-3">
            <small>* Required fields</small>
          </v-alert>
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
          <v-form v-model="editValid">
            <v-text-field
              v-model="selectedGoal.title"
              label="Title *"
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
                  label="Target Value *"
                  type="number"
                  required
                  min="1"
                  step="0.01"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="selectedGoal.currentValue"
                  label="Current Value *"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                ></v-text-field>
              </v-col>
            </v-row>
            
            <v-select
              v-model="selectedGoal.unit"
              :items="unitOptions"
              item-title="title"
              item-value="value"
              label="Unit *"
              required
            ></v-select>
            
            <v-text-field
              v-model="selectedGoal.targetDate"
              label="Target Date *"
              type="date"
              required
            ></v-text-field>
            
            <v-select
              v-model="selectedGoal.status"
              :items="statusOptions"
              item-title="title"
              item-value="value"
              label="Status *"
              required
            ></v-select>
          </v-form>
          
          <v-alert type="info" density="compact" class="mt-3">
            <small>* Required fields</small>
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" @click="cancelEdit">Cancel</v-btn>
          <v-btn
            color="success"
            @click="updateGoal"
          >
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.v-data-table {
  background-color: white;
}
</style>