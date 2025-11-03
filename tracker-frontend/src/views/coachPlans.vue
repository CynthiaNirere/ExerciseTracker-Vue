<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Utils from '../config/utils'
import axios from 'axios'

const router = useRouter()
const store = useStore()

const user = ref(null)
const currentUser = computed(() => store.state.currentUser || store.state.loginUser)

// Active tab
const activeTab = ref('plans')

// Statistics
const athleteCount = ref(2)
const activeGoals = ref(3)
const recentActivity = ref(5)

// Plans data
const plans = ref([])
const loading = ref(true)

// Dialog state
const showCreateDialog = ref(false)
const newPlan = ref({
  name: '',
  description: '',
  duration: '',
  assignTo: 'template',
  exercises: []
})

// Available exercises
const availableExercises = ref([])
const selectedExercise = ref(null)

// Computed
const trainingPlansCount = computed(() => plans.value.length)

const changeTab = (tab) => {
  if (tab === 'athletes') {
    router.push({ name: 'coachDashboard' })
  } else if (tab === 'exercises') {
    router.push({ name: 'coach-exercises' })
  } else if (tab === 'plans') {
    router.push({ name: 'coach-plans' })
  }
}

const loadPlans = async () => {
  try {
    loading.value = true
    const token = user.value?.token
    
    const response = await axios.get('http://localhost:3021/tracker-t1/api/plans', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    plans.value = response.data
  } catch (error) {
    console.error('Error loading plans:', error)
    alert('Failed to load plans')
  } finally {
    loading.value = false
  }
}

const loadExercises = async () => {
  try {
    const token = user.value?.token
    
    const response = await axios.get('http://localhost:3021/tracker-t1/api/exercises', {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    availableExercises.value = response.data
  } catch (error) {
    console.error('Error loading exercises:', error)
  }
}

const openCreateDialog = () => {
  showCreateDialog.value = true
  loadExercises()
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  newPlan.value = {
    name: '',
    description: '',
    duration: '',
    assignTo: 'template',
    exercises: []
  }
  selectedExercise.value = null
}

const addExercise = () => {
  if (selectedExercise.value && !newPlan.value.exercises.includes(selectedExercise.value)) {
    newPlan.value.exercises.push(selectedExercise.value)
    selectedExercise.value = null
  }
}

const removeExercise = (exerciseId) => {
  newPlan.value.exercises = newPlan.value.exercises.filter(id => id !== exerciseId)
}

const getExerciseName = (exerciseId) => {
  const exercise = availableExercises.value.find(ex => ex.id === exerciseId)
  return exercise ? exercise.name : 'Unknown Exercise'
}

const savePlan = async () => {
  if (!newPlan.value.name || !newPlan.value.description) {
    alert('Please fill in plan name and description')
    return
  }

  try {
    const token = user.value?.token
    
    const response = await axios.post(
      'http://localhost:3021/tracker-t1/api/plans',
      newPlan.value,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    
    plans.value.push(response.data)
    closeCreateDialog()
  } catch (error) {
    console.error('Error creating plan:', error)
    alert('Failed to create plan')
  }
}

const deletePlan = async (plan) => {
  if (confirm(`Delete ${plan.name}?`)) {
    try {
      const token = user.value?.token
      
      await axios.delete(
        `http://localhost:3021/tracker-t1/api/plans/${plan.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      plans.value = plans.value.filter(p => p.id !== plan.id)
    } catch (error) {
      console.error('Error deleting plan:', error)
      alert('Failed to delete plan')
    }
  }
}

onMounted(() => {
  user.value = Utils.getStore("user") || currentUser.value
  
  if (!user.value) {
    router.push('/')
  } else if (user.value.role !== 'coach') {
    alert('Access denied. Coach role required.')
    router.push('/')
  } else {
    loadPlans()
  }
})
</script>

<template>
  <v-container>
    <v-alert type="info">
      Welcome, Coach {{ currentUser?.first_name || currentUser?.fName }}!
    </v-alert>
    
    <br />

    <!-- Statistics Cards -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card color="primary" dark>
          <v-card-text>
            <div class="text-h6">My Athletes</div>
            <div class="text-h3 font-weight-bold">{{ athleteCount }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="success" dark>
          <v-card-text>
            <div class="text-h6">Active Goals</div>
            <div class="text-h3 font-weight-bold">{{ activeGoals }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="info" dark>
          <v-card-text>
            <div class="text-h6">Recent Activity</div>
            <div class="text-h3 font-weight-bold">{{ recentActivity }}</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="warning" dark>
          <v-card-text>
            <div class="text-h6">Training Plans</div>
            <div class="text-h3 font-weight-bold">{{ trainingPlansCount }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <br />

    <!-- Tab Navigation -->
    <v-card>
      <v-tabs
        v-model="activeTab"
        bg-color="white"
        color="primary"
      >
        <v-tab value="athletes" @click="changeTab('athletes')">Athletes</v-tab>
        <v-tab value="exercises" @click="changeTab('exercises')">Exercises</v-tab>
        <v-tab value="plans" @click="changeTab('plans')">Plans</v-tab>
      </v-tabs>

      <!-- Plans Content -->
      <v-card-text>
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <div class="text-h5 font-weight-bold">Training Plans</div>
            <div class="text-caption text-grey">Create and manage training programs</div>
          </div>
          <v-btn color="black" @click="openCreateDialog">
            <v-icon left>mdi-plus</v-icon>
            Create Plan
          </v-btn>
        </div>

        <!-- Loading -->
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
          class="my-8"
        ></v-progress-circular>

        <!-- Plans Grid -->
        <v-row v-else>
          <v-col v-for="plan in plans" :key="plan.id" cols="12" md="4">
            <v-card elevation="1" hover>
              <v-card-text>
                <div class="text-h6 font-weight-bold mb-2">{{ plan.name }}</div>
                <div class="text-caption text-grey mb-4">{{ plan.description }}</div>
                
                <v-divider class="my-3"></v-divider>
                
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">Duration</span>
                  <span class="font-weight-bold">{{ plan.duration }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">Athletes</span>
                  <span class="font-weight-bold">{{ plan.assignedAthletes }}</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2">Exercises</span>
                  <span class="font-weight-bold">{{ plan.exercises }}</span>
                </div>
              </v-card-text>
              
              <v-card-actions>
                <v-btn variant="text" color="primary">Edit</v-btn>
                <v-btn variant="text" color="error" @click="deletePlan(plan)">Delete</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- Empty State -->
        <v-alert v-if="!loading && plans.length === 0" type="info" class="mt-4">
          No training plans yet. Create your first plan to get started!
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Create Plan Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="700px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <div>
            <div class="text-h5">Create New Plan</div>
            <div class="text-caption text-grey">Design a custom training plan</div>
          </div>
          <v-btn icon variant="text" @click="closeCreateDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newPlan.name"
                  label="Plan Name"
                  variant="outlined"
                  density="comfortable"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newPlan.assignTo"
                  label="Assign To"
                  :items="[
                    { value: 'template', title: 'Template (No Athlete)' }
                  ]"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>

            <v-textarea
              v-model="newPlan.description"
              label="Description"
              variant="outlined"
              density="comfortable"
              rows="3"
              class="mb-3"
              required
            ></v-textarea>

            <v-text-field
              v-model="newPlan.duration"
              label="Duration (e.g., 8 weeks)"
              variant="outlined"
              density="comfortable"
              class="mb-4"
            ></v-text-field>

            <div class="text-h6 mb-3">Exercises</div>
            
            <div class="d-flex gap-2 mb-4">
              <v-select
                v-model="selectedExercise"
                label="Select exercise to add"
                :items="availableExercises"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="comfortable"
                class="flex-grow-1"
              ></v-select>
              <v-btn color="black" @click="addExercise">
                <v-icon left>mdi-plus</v-icon>
                Add
              </v-btn>
            </div>

            <!-- Selected Exercises -->
            <div v-if="newPlan.exercises.length > 0" class="mb-4">
              <v-chip
                v-for="exerciseId in newPlan.exercises"
                :key="exerciseId"
                closable
                @click:close="removeExercise(exerciseId)"
                class="ma-1"
              >
                {{ getExerciseName(exerciseId) }}
              </v-chip>
            </div>
            <div v-else class="text-center text-grey py-4">
              No exercises added yet. Select an exercise above to get started.
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeCreateDialog">
            Cancel
          </v-btn>
          <v-btn color="black" @click="savePlan">
            Save Plan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-2px);
}
</style>