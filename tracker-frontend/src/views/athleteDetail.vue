<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const store = useStore()

// Get athlete ID from route params
const athleteId = computed(() => route.params.id)

// Initialize with empty data
const athlete = ref({
  id: null,
  fName: '',
  lName: '',
  email: '',
  age: null,
  height: '',
  weight: '',
  totalWorkouts: 0,
  bio: '',
  trainingGoals: '',
  injuries: ''
})

// Tab management
const activeTab = ref('goals')

// Goals data
const goals = ref([])

// Workout Results data
const workoutResults = ref([])

// Loading states
const loading = ref(true)
const error = ref(null)

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
  'Running',
  'Lunges',
  'Plank',
  'Burpees',
  'Box Jumps'
])

// Fetch athlete data from API
const fetchAthleteData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await axios.get(`http://localhost:3021/tracker-t1/api/athletes/${athleteId.value}`)
    athlete.value = response.data
    
  } catch (err) {
    console.error('Error fetching athlete data:', err)
    error.value = 'Failed to load athlete data'
  } finally {
    loading.value = false
  }
}

// Fetch athlete goals
const fetchAthleteGoals = async () => {
  try {
    const response = await axios.get(`http://localhost:3021/tracker-t1/api/athletes/${athleteId.value}/goals`)
    goals.value = response.data
    console.log('✅ Goals loaded:', goals.value)
  } catch (err) {
    console.error('Error fetching goals:', err)
  }
}

// Fetch athlete workout results
const fetchAthleteResults = async () => {
  try {
    const response = await axios.get(`http://localhost:3021/tracker-t1/api/athletes/${athleteId.value}/results`)
    workoutResults.value = response.data
  } catch (err) {
    console.error('Error fetching results:', err)
  }
}

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

const createGoal = async () => {
  try {
    console.log('Creating goal:', newGoal.value)
    
    // Call API to create goal
    const response = await axios.post('http://localhost:3021/tracker-t1/api/goals', {
      user_id: athleteId.value,
      exercise: newGoal.value.exercise,
      goal_type: newGoal.value.type,
      current_value: newGoal.value.currentValue || 0,
      target_value: newGoal.value.targetValue,
      deadline: newGoal.value.deadline
    })
    
    console.log('✅ Goal created:', response.data)
    
    // Refresh goals list
    await fetchAthleteGoals()
    
    closeAddGoalDialog()
    
    alert('Goal created successfully!')
    
  } catch (err) {
    console.error('❌ Error creating goal:', err)
    alert('Failed to create goal: ' + (err.response?.data?.message || err.message))
  }
}

const deleteGoal = async (goalId) => {
  if (confirm('Are you sure you want to delete this goal?')) {
    try {
      await axios.delete(`http://localhost:3021/tracker-t1/api/goals/${goalId}`)
      console.log('✅ Goal deleted')
      
      // Refresh goals list
      await fetchAthleteGoals()
      
      alert('Goal deleted successfully!')
      
    } catch (err) {
      console.error('❌ Error deleting goal:', err)
      alert('Failed to delete goal: ' + (err.response?.data?.message || err.message))
    }
  }
}

const getProgressColor = (progress) => {
  if (progress >= 75) return 'success'
  if (progress >= 50) return 'warning'
  return 'error'
}

const getUnitLabel = (type) => {
  const units = {
    weight: 'lbs',
    reps: 'reps',
    time: 'seconds',
    distance: 'meters'
  }
  return units[type] || ''
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

onMounted(async () => {
  await fetchAthleteData()
  await fetchAthleteGoals()
  await fetchAthleteResults()
})
</script>

<template>
  <v-container>
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <p class="mt-4">Loading athlete data...</p>
    </div>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" class="mb-4">
      {{ error }}
    </v-alert>

    <!-- Content -->
    <div v-else>
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
                <div class="text-h5 font-weight-bold">{{ athlete.age || '-' }}</div>
              </div>
            </v-col>
            <v-col cols="6" sm="3">
              <div class="text-center pa-4 bg-grey-lighten-4 rounded">
                <div class="text-caption text-grey-darken-1">Height</div>
                <div class="text-h5 font-weight-bold">{{ athlete.height || '-' }}</div>
              </div>
            </v-col>
            <v-col cols="6" sm="3">
              <div class="text-center pa-4 bg-grey-lighten-4 rounded">
                <div class="text-caption text-grey-darken-1">Weight</div>
                <div class="text-h5 font-weight-bold">{{ athlete.weight || '-' }}</div>
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
                          Target: {{ goal.targetValue }} {{ getUnitLabel(goal.type) }} by {{ formatDate(goal.deadline) }}
                        </p>
                      </div>
                      <div class="d-flex align-center ga-2">
                        <v-chip size="small" :color="goal.status === 'active' ? 'success' : 'grey'">
                          {{ goal.status }}
                        </v-chip>
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

            <!-- Results Tab -->
            <v-window-item value="results">
              <div class="mb-4">
                <h3 class="text-h6 font-weight-bold">Workout Results</h3>
                <p class="text-caption text-grey">Complete workout history</p>
              </div>

              <!-- Results Table -->
              <v-table v-if="workoutResults.length > 0">
                <thead>
                  <tr>
                    <th class="text-left font-weight-bold">Date</th>
                    <th class="text-left font-weight-bold">Exercise</th>
                    <th class="text-left font-weight-bold">Sets</th>
                    <th class="text-left font-weight-bold">Best Set</th>
                    <th class="text-left font-weight-bold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="result in workoutResults" :key="result.id">
                    <td>{{ formatDate(result.date) }}</td>
                    <td>{{ result.exercise }}</td>
                    <td>{{ result.sets }}</td>
                    <td>{{ result.bestSet }}</td>
                    <td>{{ result.notes || '-' }}</td>
                  </tr>
                </tbody>
              </v-table>

              <v-alert v-else type="info" variant="tonal">
                No workout results yet.
              </v-alert>
            </v-window-item>

            <!-- Profile Tab -->
            <v-window-item value="profile">
              <div class="mb-4">
                <h3 class="text-h6 font-weight-bold">Athlete Profile</h3>
                <p class="text-caption text-grey">Personal information and training notes</p>
              </div>

              <!-- Profile Information -->
              <v-row>
                <!-- Left Column -->
                <v-col cols="12" md="6">
                  <div class="profile-section mb-6">
                    <div class="profile-label text-body-2 font-weight-bold mb-1">Age</div>
                    <div class="profile-value text-body-1">{{ athlete.age || '-' }}</div>
                  </div>

                  <div class="profile-section mb-6">
                    <div class="profile-label text-body-2 font-weight-bold mb-1">Weight</div>
                    <div class="profile-value text-body-1">{{ athlete.weight || '-' }}</div>
                  </div>

                  <div class="profile-section mb-6">
                    <div class="profile-label text-body-2 font-weight-bold mb-1">Bio</div>
                    <div class="profile-value text-body-1">{{ athlete.bio || '-' }}</div>
                  </div>

                  <div class="profile-section mb-6">
                    <div class="profile-label text-body-2 font-weight-bold mb-1">Training Goals</div>
                    <div class="profile-value text-body-1">{{ athlete.trainingGoals || '-' }}</div>
                  </div>

                  <div class="profile-section mb-6">
                    <div class="profile-label text-body-2 font-weight-bold mb-1">Injuries / Notes</div>
                    <div class="profile-value text-body-1">{{ athlete.injuries || '-' }}</div>
                  </div>
                </v-col>

                <!-- Right Column -->
                <v-col cols="12" md="6">
                  <div class="profile-section mb-6">
                    <div class="profile-label text-body-2 font-weight-bold mb-1">Height</div>
                    <div class="profile-value text-body-1">{{ athlete.height || '-' }}</div>
                  </div>
                </v-col>
              </v-row>
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
    </div>
  </v-container>
</template>

<style scoped>
.bg-grey-lighten-4 {
  background-color: #f5f5f5;
}

.profile-section {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
}

.profile-label {
  color: #616161;
}

.profile-value {
  color: #212121;
}
</style>