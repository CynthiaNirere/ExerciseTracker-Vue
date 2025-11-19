<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import Utils from '../config/utils'
import athleteServices from '../services/athleteServices'
import goalServices from '../services/goalServices'
import exerciseServices from '../services/exerciseServices'
import exercisePlanServices from '../services/exercisePlanServices'  // ← ADD THIS IMPORT

const router = useRouter()
const route = useRoute()
const store = useStore()

const user = ref(null)
const currentUser = computed(() => store.state.currentUser || store.state.loginUser)

// Get athlete ID from route params
const athleteId = computed(() => route.params.id)

// Initialize with empty data
const athlete = ref({
  user_id: null,
  first_name: '',
  last_name: '',
  email: '',
  age: null,
  gender: '',
  team: '',
  sport_type: '',
  totalWorkouts: 0,
  bio: ''
})

// Tab management
const activeTab = ref('goals')

// Goals data
const goals = ref([])

// Workout Results data
const workoutResults = ref([])

// ========================================
// NEW: Plan Assignment Variables
// ========================================
const athleteAssignedPlans = ref([])
const availablePlans = ref([])
const showAssignPlanDialog = ref(false)
const selectedPlanId = ref(null)

// Loading states
const loading = ref(true)
const error = ref(null)

// Add Goal Dialog
const showAddGoalDialog = ref(false)
const newGoal = ref({
  title: '',
  description: '',
  targetValue: null,
  currentValue: 0,
  unit: 'count',
  targetDate: ''
})

// Goal unit options
const goalUnits = [
  { title: 'Count', value: 'count' },
  { title: 'Weight (lbs)', value: 'lbs' },
  { title: 'Weight (kg)', value: 'kg' },
  { title: 'Time (seconds)', value: 'seconds' },
  { title: 'Distance (meters)', value: 'meters' },
  { title: 'Distance (miles)', value: 'miles' }
]

// Available exercises (for reference)
const exercises = ref([])

// Fetch athlete data from API
const fetchAthleteData = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await athleteServices.getAthleteById(athleteId.value)
    athlete.value = response.data
    
  } catch (err) {
    console.error('Error fetching athlete data:', err)
    
    if (err.response?.status === 401) {
      error.value = 'Session expired. Please log in again.'
      setTimeout(() => router.push('/'), 2000)
    } else {
      error.value = 'Failed to load athlete data'
    }
  } finally {
    loading.value = false
  }
}

// Fetch athlete goals
const fetchAthleteGoals = async () => {
  try {
    const response = await goalServices.getGoalsByAthlete(athleteId.value)
    goals.value = response.data
    console.log('✅ Goals loaded:', goals.value)
  } catch (err) {
    console.error('Error fetching goals:', err)
    
    if (err.response?.status === 401) {
      router.push('/')
    }
  }
}

// Fetch athlete workout results
const fetchAthleteResults = async () => {
  try {
    const response = await exerciseServices.getAthleteResultsForCoach(athleteId.value)
    workoutResults.value = response.data
  } catch (err) {
    console.error('Error fetching results:', err)
    
    if (err.response?.status === 401) {
      router.push('/')
    }
  }
}

// Load available exercises
const loadExercises = async () => {
  try {
    const response = await exerciseServices.getAllExercises()
    exercises.value = response.data
  } catch (err) {
    console.error('Error loading exercises:', err)
  }
}

// ========================================
// NEW: Plan Assignment Functions
// ========================================
const fetchAthleteAssignedPlans = async () => {
  try {
    const response = await exercisePlanServices.getPlansByAthlete(athleteId.value)
    athleteAssignedPlans.value = response.data
    console.log('✅ Assigned plans loaded:', athleteAssignedPlans.value)
  } catch (err) {
    console.error('Error fetching assigned plans:', err)
  }
}

const loadAvailablePlans = async () => {
  try {
    const response = await exercisePlanServices.getAllExercisePlans()
    availablePlans.value = response.data
  } catch (err) {
    console.error('Error loading plans:', err)
  }
}

const openAssignPlanDialog = () => {
  loadAvailablePlans()
  showAssignPlanDialog.value = true
}

const closeAssignPlanDialog = () => {
  showAssignPlanDialog.value = false
  selectedPlanId.value = null
}

const assignPlan = async () => {
  if (!selectedPlanId.value) {
    alert('Please select a plan')
    return
  }

  try {
    await exercisePlanServices.assignPlanToAthlete(selectedPlanId.value, athleteId.value)
    alert('Plan assigned successfully!')
    await fetchAthleteAssignedPlans()
    closeAssignPlanDialog()
  } catch (err) {
    console.error('Error assigning plan:', err)
    alert('Failed to assign plan: ' + (err.response?.data?.message || err.message))
  }
}

const unassignPlan = async (assignmentId, planId) => {
  if (confirm('Remove this plan from the athlete?')) {
    try {
      await exercisePlanServices.unassignPlanFromAthlete(planId, athleteId.value)
      alert('Plan unassigned successfully!')
      await fetchAthleteAssignedPlans()
    } catch (err) {
      console.error('Error unassigning plan:', err)
      alert('Failed to unassign plan')
    }
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
    title: '',
    description: '',
    targetValue: null,
    currentValue: 0,
    unit: 'count',
    targetDate: ''
  }
}

const createGoal = async () => {
  try {
    console.log('Creating goal:', newGoal.value)
    
    // Use goalServices to create goal
    const response = await goalServices.createGoalForAthlete(athleteId.value, {
      title: newGoal.value.title,
      description: newGoal.value.description,
      targetValue: newGoal.value.targetValue,
      currentValue: newGoal.value.currentValue,
      unit: newGoal.value.unit,
      targetDate: newGoal.value.targetDate
    })
    
    console.log('✅ Goal created:', response.data)
    
    // Refresh goals list
    await fetchAthleteGoals()
    
    closeAddGoalDialog()
    
    alert('Goal created successfully!')
    
  } catch (err) {
    console.error('❌ Error creating goal:', err)
    
    if (err.response?.status === 401) {
      alert('Session expired. Please log in again.')
      router.push('/')
    } else {
      alert('Failed to create goal: ' + (err.response?.data?.message || err.message))
    }
  }
}

const deleteGoal = async (goalId) => {
  if (confirm('Are you sure you want to delete this goal?')) {
    try {
      await goalServices.deleteGoal(goalId)
      console.log('✅ Goal deleted')
      
      // Refresh goals list
      await fetchAthleteGoals()
      
      alert('Goal deleted successfully!')
      
    } catch (err) {
      console.error('❌ Error deleting goal:', err)
      
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.')
        router.push('/')
      } else {
        alert('Failed to delete goal: ' + (err.response?.data?.message || err.message))
      }
    }
  }
}

const getProgressColor = (progress) => {
  if (progress >= 75) return 'success'
  if (progress >= 50) return 'warning'
  return 'error'
}

const calculateProgress = (currentValue, targetValue) => {
  if (!targetValue || targetValue === 0) return 0
  return Math.min(Math.round((currentValue / targetValue) * 100), 100)
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

const getInitials = (firstName, lastName) => {
  if (!firstName || !lastName) return '??'
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

onMounted(async () => {
  user.value = Utils.getStore("user") || currentUser.value
  
  if (!user.value) {
    console.log('❌ No user found, redirecting to login')
    router.push('/')
  } else if (user.value.role !== 'coach') {
    console.log('❌ User is not a coach')
    alert('Access denied. Coach role required.')
    router.push('/')
  } else {
    console.log('✅ Loading athlete details')
    await fetchAthleteData()
    await fetchAthleteGoals()
    await fetchAthleteResults()
    await loadExercises()
    await fetchAthleteAssignedPlans()  // ← ADD THIS
  }
})
</script>

<template>
  <v-container>
    <v-toolbar color="primary" dark class="mb-4">
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>Athlete Details</v-toolbar-title>
    </v-toolbar>

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
      <!-- Athlete Header -->
      <v-card class="mb-4" elevation="2">
        <v-card-text>
          <div class="d-flex align-center mb-4">
            <v-avatar color="primary" size="64" class="mr-4">
              <span class="text-h5">{{ getInitials(athlete.first_name, athlete.last_name) }}</span>
            </v-avatar>
            <div>
              <h2 class="text-h4 font-weight-bold">{{ athlete.first_name }} {{ athlete.last_name }}</h2>
              <p class="text-grey">{{ athlete.email }}</p>
            </div>
          </div>

          <!-- Stats Row -->
          <v-row>
            <v-col cols="6" sm="3">
              <v-card color="grey-lighten-4">
                <v-card-text class="text-center">
                  <div class="text-caption text-grey-darken-1">Age</div>
                  <div class="text-h5 font-weight-bold">{{ athlete.age || '-' }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" sm="3">
              <v-card color="grey-lighten-4">
                <v-card-text class="text-center">
                  <div class="text-caption text-grey-darken-1">Gender</div>
                  <div class="text-h5 font-weight-bold">{{ athlete.gender || '-' }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" sm="3">
              <v-card color="grey-lighten-4">
                <v-card-text class="text-center">
                  <div class="text-caption text-grey-darken-1">Sport</div>
                  <div class="text-h5 font-weight-bold">{{ athlete.sport_type || '-' }}</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6" sm="3">
              <v-card color="grey-lighten-4">
                <v-card-text class="text-center">
                  <div class="text-caption text-grey-darken-1">Total Workouts</div>
                  <div class="text-h5 font-weight-bold">{{ athlete.totalWorkouts || 0 }}</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Tabs -->
      <v-card elevation="2">
        <v-tabs v-model="activeTab" bg-color="primary" dark>
          <v-tab value="goals">Goals</v-tab>
          <v-tab value="results">Results</v-tab>
          <v-tab value="plans">Plans</v-tab>  <!-- ← ADDED THIS TAB -->
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
                <v-btn color="primary" @click="openAddGoalDialog">
                  <v-icon left>mdi-plus</v-icon>
                  Add Goal
                </v-btn>
              </div>

              <!-- Goals List -->
              <v-row v-if="goals.length > 0">
                <v-col v-for="goal in goals" :key="goal.id" cols="12">
                  <v-card elevation="1">
                    <v-card-text>
                      <div class="d-flex justify-space-between align-center mb-3">
                        <div>
                          <h4 class="text-h6 font-weight-bold">{{ goal.title }}</h4>
                          <p class="text-caption text-grey">
                            Target: {{ goal.targetValue }} {{ goal.unit }} by {{ formatDate(goal.endDate) }}
                          </p>
                          <p class="text-body-2 mt-2">{{ goal.description }}</p>
                        </div>
                        <div class="d-flex align-center">
                          <v-chip size="small" :color="goal.status === 'in_progress' ? 'success' : 'grey'" class="mr-2">
                            {{ goal.status }}
                          </v-chip>
                          <v-btn icon size="small" color="error" @click="deleteGoal(goal.id)">
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </div>

                      <div class="mb-2">
                        <div class="d-flex justify-space-between text-caption mb-1">
                          <span>Current: {{ goal.currentValue }} {{ goal.unit }}</span>
                          <span class="font-weight-bold">{{ calculateProgress(goal.currentValue, goal.targetValue) }}%</span>
                        </div>
                        <v-progress-linear
                          :model-value="calculateProgress(goal.currentValue, goal.targetValue)"
                          :color="getProgressColor(calculateProgress(goal.currentValue, goal.targetValue))"
                          height="8"
                          rounded
                        ></v-progress-linear>
                      </div>
                    </v-card-text>
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
                    <th class="text-left font-weight-bold">Reps</th>
                    <th class="text-left font-weight-bold">Weight</th>
                    <th class="text-left font-weight-bold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="result in workoutResults" :key="result.id">
                    <td>{{ formatDate(result.performedDate) }}</td>
                    <td>{{ result.exerciseName }}</td>
                    <td>{{ result.setsDone || '-' }}</td>
                    <td>{{ result.repsDone || '-' }}</td>
                    <td>{{ result.weightUsed || '-' }}</td>
                    <td>{{ result.notes || '-' }}</td>
                  </tr>
                </tbody>
              </v-table>

              <v-alert v-else type="info" variant="tonal">
                No workout results yet.
              </v-alert>
            </v-window-item>

            <!-- ========================================
                 NEW: Plans Tab
                 ======================================== -->
            <v-window-item value="plans">
              <div class="d-flex justify-space-between align-center mb-4">
                <div>
                  <h3 class="text-h6 font-weight-bold">Assigned Training Plans</h3>
                  <p class="text-caption text-grey">Manage athlete's training programs</p>
                </div>
                <v-btn color="primary" @click="openAssignPlanDialog">
                  <v-icon left>mdi-plus</v-icon>
                  Assign Plan
                </v-btn>
              </div>

              <!-- Assigned Plans List -->
              <v-row v-if="athleteAssignedPlans.length > 0">
                <v-col v-for="assignment in athleteAssignedPlans" :key="assignment.assignmentId" cols="12">
                  <v-card elevation="1">
                    <v-card-text>
                      <div class="d-flex justify-space-between align-center">
                        <div class="flex-grow-1">
                          <div class="d-flex align-center mb-2">
                            <h4 class="text-h6 font-weight-bold mr-3">{{ assignment.plan.name }}</h4>
                            <v-chip size="small" :color="assignment.status === 'active' ? 'success' : 'grey'">
                              {{ assignment.status }}
                            </v-chip>
                          </div>
                          <p class="text-caption text-grey">
                            Assigned: {{ formatDate(assignment.assignedDate) }} • 
                            {{ assignment.plan.exerciseCount }} exercises
                          </p>
                          <p class="text-body-2 mt-2">{{ assignment.plan.description || 'No description' }}</p>
                          
                          <v-divider class="my-3"></v-divider>
                          
                          <div class="d-flex justify-space-between">
                            <div>
                              <span class="text-caption text-grey">Duration: </span>
                              <span class="font-weight-bold">{{ assignment.plan.duration || '-' }}</span>
                            </div>
                            <div>
                              <span class="text-caption text-grey">Difficulty: </span>
                              <span class="font-weight-bold">{{ assignment.plan.difficulty || '-' }}</span>
                            </div>
                          </div>
                        </div>
                        <v-btn 
                          icon 
                          size="small" 
                          color="error" 
                          @click="unassignPlan(assignment.assignmentId, assignment.plan.id)"
                          class="ml-4"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-alert v-else type="info" variant="tonal">
                No plans assigned yet. Click "Assign Plan" to get started.
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
                <v-col cols="12" md="6">
                  <v-list>
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">Age</v-list-item-title>
                      <v-list-item-subtitle>{{ athlete.age || '-' }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-divider></v-divider>
                    
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">Gender</v-list-item-title>
                      <v-list-item-subtitle>{{ athlete.gender || '-' }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-divider></v-divider>
                    
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">Sport Type</v-list-item-title>
                      <v-list-item-subtitle>{{ athlete.sport_type || '-' }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-divider></v-divider>
                    
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">Team</v-list-item-title>
                      <v-list-item-subtitle>{{ athlete.team || '-' }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>

                <v-col cols="12" md="6">
                  <v-list>
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold">Bio</v-list-item-title>
                      <v-list-item-subtitle>{{ athlete.bio || '-' }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>

      <!-- Add Goal Dialog -->
      <v-dialog v-model="showAddGoalDialog" max-width="600px">
        <v-card>
          <v-card-title class="bg-primary">
            <div class="d-flex justify-space-between align-center">
              <span class="text-h5">Create New Goal</span>
              <v-btn icon variant="text" @click="closeAddGoalDialog">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text class="pt-4">
            <p class="text-caption text-grey mb-4">
              Set a new training goal for {{ athlete.first_name }} {{ athlete.last_name }}
            </p>

            <v-form>
              <v-text-field
                v-model="newGoal.title"
                label="Goal Title *"
                variant="outlined"
                class="mb-3"
                placeholder="e.g., Bench Press 225 lbs"
              ></v-text-field>

              <v-textarea
                v-model="newGoal.description"
                label="Description"
                variant="outlined"
                rows="2"
                class="mb-3"
              ></v-textarea>

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
                    label="Target Value *"
                    type="number"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="6">
                  <v-select
                    v-model="newGoal.unit"
                    :items="goalUnits"
                    item-title="title"
                    item-value="value"
                    label="Unit"
                    variant="outlined"
                  ></v-select>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="newGoal.targetDate"
                    label="Target Date *"
                    type="date"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="closeAddGoalDialog">
              Cancel
            </v-btn>
            <v-btn 
              color="primary" 
              @click="createGoal"
              :disabled="!newGoal.title || !newGoal.targetValue || !newGoal.targetDate"
            >
              Create Goal
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- ========================================
           NEW: Assign Plan Dialog
           ======================================== -->
      <v-dialog v-model="showAssignPlanDialog" max-width="600px">
        <v-card>
          <v-card-title class="bg-primary">
            <div class="d-flex justify-space-between align-center">
              <span class="text-h5">Assign Training Plan</span>
              <v-btn icon variant="text" @click="closeAssignPlanDialog">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </v-card-title>

          <v-card-text class="pt-4">
            <p class="text-caption text-grey mb-4">
              Select a training plan to assign to {{ athlete.first_name }} {{ athlete.last_name }}
            </p>

            <v-select
              v-model="selectedPlanId"
              :items="availablePlans"
              item-title="name"
              item-value="id"
              label="Training Plan *"
              variant="outlined"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:subtitle>
                    <small>{{ item.raw.difficulty }} • {{ item.raw.exercises }} exercises</small>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="closeAssignPlanDialog">Cancel</v-btn>
            <v-btn color="primary" @click="assignPlan" :disabled="!selectedPlanId">Assign Plan</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>