<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const route = useRoute()
const store = useStore()

// Get athlete ID from route params
const athleteId = computed(() => route.params.id)

// Athlete data - replace with API call
const athlete = ref({
  id: 1,
  fName: 'Sarah',
  lName: 'Williams',
  email: 'athlete@example.com',
  age: 28,
  height: '168 cm',
  weight: '62 kg',
  totalWorkouts: 4
})

// Tab management
const activeTab = ref('goals')

// Goals data
const goals = ref([
  {
    id: 1,
    exercise: 'Barbell Squat',
    type: 'weight',
    currentValue: 115,
    targetValue: 150,
    deadline: '12/30/2024',
    status: 'active',
    progress: 77
  },
  {
    id: 2,
    exercise: 'Pull-ups',
    type: 'reps',
    currentValue: 8,
    targetValue: 15,
    deadline: '9/29/2024',
    status: 'active',
    progress: 53
  }
])

// Add Goal Dialog
const showAddGoalDialog = ref(false)
const newGoal = ref({
  exercise: '',
  type: '',
  currentValue: null,
  targetValue: null,
  deadline: ''
})

// Goal type options
const goalTypes = [
  { title: 'Weight', value: 'weight' },
  { title: 'Reps', value: 'reps' },
  { title: 'Time', value: 'time' },
  { title: 'Distance', value: 'distance' }
]

// Exercise options - replace with API call
const exercises = ref([
  'Barbell Squat',
  'Deadlift',
  'Bench Press',
  'Pull-ups',
  'Push-ups',
  'Running'
])

const goBack = () => {
  router.push({ name: 'coachDashboard' })  
}

const openAddGoalDialog = () => {
  showAddGoalDialog.value = true
}

const closeAddGoalDialog = () => {
  showAddGoalDialog.value = false
  newGoal.value = {
    exercise: '',
    type: '',
    currentValue: null,
    targetValue: null,
    deadline: ''
  }
}

const createGoal = () => {
  // TODO: Add API call to create goal
  console.log('Creating goal:', newGoal.value)
  
  // Add to goals list (temporary - replace with API)
  const calculatedProgress = Math.round((newGoal.value.currentValue / newGoal.value.targetValue) * 100)
  
  goals.value.push({
    id: goals.value.length + 1,
    exercise: newGoal.value.exercise,
    type: newGoal.value.type,
    currentValue: newGoal.value.currentValue,
    targetValue: newGoal.value.targetValue,
    deadline: newGoal.value.deadline,
    status: 'active',
    progress: calculatedProgress
  })
  
  closeAddGoalDialog()
}

const deleteGoal = (goalId) => {
  if (confirm('Are you sure you want to delete this goal?')) {
    // TODO: Add API call to delete goal
    goals.value = goals.value.filter(g => g.id !== goalId)
    console.log('Deleted goal:', goalId)
  }
}

const getProgressColor = (progress) => {
  if (progress >= 75) return 'success'
  if (progress >= 50) return 'warning'
  return 'error'
}

const getUnitLabel = (type) => {
  const units = {
    weight: 'weight',
    reps: 'reps',
    time: 'seconds',
    distance: 'meters'
  }
  return units[type] || ''
}

onMounted(() => {
  // TODO: Fetch athlete data from API using athleteId
  console.log('Loading athlete:', athleteId.value)
})
</script>

<template>
  <v-container>
    <!-- Back Button -->
    <v-btn @click="goBack" variant="text" class="mb-4">
      <v-icon left>mdi-arrow-left</v-icon>
      Back to Athletes
    </v-btn>

    <!-- Athlete Header -->
    <v-card class="mb-4">
      <v-card-text>
        <div class="d-flex align-center mb-4">
          <v-avatar color="grey-lighten-1" size="64" class="mr-4">
            <span class="text-h5">{{ athlete.fName[0] }}{{ athlete.lName[0] }}</span>
          </v-avatar>
          <div>
            <h2 class="text-h4 font-weight-bold">{{ athlete.fName }} {{ athlete.lName }}</h2>
            <p class="text-grey">{{ athlete.email }}</p>
          </div>
        </div>

        <!-- Stats Row -->
        <v-row>
          <v-col cols="6" sm="3">
            <div class="text-center pa-4 bg-grey-lighten-4 rounded">
              <div class="text-caption text-grey-darken-1">Age</div>
              <div class="text-h5 font-weight-bold">{{ athlete.age }}</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="text-center pa-4 bg-grey-lighten-4 rounded">
              <div class="text-caption text-grey-darken-1">Height</div>
              <div class="text-h5 font-weight-bold">{{ athlete.height }}</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="text-center pa-4 bg-grey-lighten-4 rounded">
              <div class="text-caption text-grey-darken-1">Weight</div>
              <div class="text-h5 font-weight-bold">{{ athlete.weight }}</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="text-center pa-4 bg-grey-lighten-4 rounded">
              <div class="text-caption text-grey-darken-1">Total Workouts</div>
              <div class="text-h5 font-weight-bold">{{ athlete.totalWorkouts }}</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabs -->
    <v-card>
      <v-tabs v-model="activeTab" bg-color="grey-lighten-4">
        <v-tab value="goals">Goals</v-tab>
        <v-tab value="progress">Progress</v-tab>
        <v-tab value="results">Results</v-tab>
        <v-tab value="profile">Profile</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="activeTab">
          <!-- Goals Tab -->
          <v-window-item value="goals">
            <div class="d-flex justify-space-between align-center mb-4">
              <div>
                <h3 class="text-h6 font-weight-bold">Training Goals</h3>
                <p class="text-caption text-grey">Set and track athlete goals</p>
              </div>
              <v-btn color="black" @click="openAddGoalDialog">
                <v-icon left>mdi-plus</v-icon>
                Add Goal
              </v-btn>
            </div>

            <!-- Goals List -->
            <v-row v-if="goals.length > 0">
              <v-col v-for="goal in goals" :key="goal.id" cols="12">
                <v-card elevation="1" class="pa-4">
                  <div class="d-flex justify-space-between align-center mb-3">
                    <div>
                      <h4 class="text-h6 font-weight-bold">{{ goal.exercise }}</h4>
                      <p class="text-caption text-grey">
                        Target: {{ goal.targetValue }} {{ getUnitLabel(goal.type) }} by {{ goal.deadline }}
                      </p>
                    </div>
                    <div class="d-flex align-center ga-2">
                      <v-chip size="small" color="success">{{ goal.status }}</v-chip>
                      <v-btn icon size="small" color="error" @click="deleteGoal(goal.id)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>

                  <div class="mb-2">
                    <div class="d-flex justify-space-between text-caption mb-1">
                      <span>Current: {{ goal.currentValue }} {{ getUnitLabel(goal.type) }}</span>
                      <span class="font-weight-bold">{{ goal.progress }}%</span>
                    </div>
                    <v-progress-linear
                      :model-value="goal.progress"
                      :color="getProgressColor(goal.progress)"
                      height="8"
                      rounded
                    ></v-progress-linear>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <v-alert v-else type="info" variant="tonal">
              No goals set yet. Click "Add Goal" to create one.
            </v-alert>
          </v-window-item>

          <!-- Progress Tab -->
          <v-window-item value="progress">
            <v-alert type="info">Progress tracking coming soon...</v-alert>
          </v-window-item>

          <!-- Results Tab -->
          <v-window-item value="results">
            <v-alert type="info">Results history coming soon...</v-alert>
          </v-window-item>

          <!-- Profile Tab -->
          <v-window-item value="profile">
            <v-alert type="info">Profile details coming soon...</v-alert>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <!-- Add Goal Dialog -->
    <v-dialog v-model="showAddGoalDialog" max-width="500px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h5">Create New Goal</span>
          <v-btn icon variant="text" @click="closeAddGoalDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <p class="text-caption text-grey mb-4">
            Set a new training goal for {{ athlete.fName }} {{ athlete.lName }}
          </p>

          <v-form>
            <v-select
              v-model="newGoal.exercise"
              :items="exercises"
              label="Exercise"
              variant="outlined"
              class="mb-3"
            ></v-select>

            <v-select
              v-model="newGoal.type"
              :items="goalTypes"
              item-title="title"
              item-value="value"
              label="Goal Type"
              variant="outlined"
              class="mb-3"
            ></v-select>

            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model.number="newGoal.currentValue"
                  label="Current Value"
                  type="number"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="newGoal.targetValue"
                  label="Target Value"
                  type="number"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-text-field
              v-model="newGoal.deadline"
              label="Deadline"
              type="date"
              variant="outlined"
              class="mb-3"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeAddGoalDialog">
            Cancel
          </v-btn>
          <v-btn 
            color="black" 
            @click="createGoal"
            :disabled="!newGoal.exercise || !newGoal.type || !newGoal.targetValue || !newGoal.deadline"
          >
            Create Goal
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.bg-grey-lighten-4 {
  background-color: #f5f5f5;
}
</style>