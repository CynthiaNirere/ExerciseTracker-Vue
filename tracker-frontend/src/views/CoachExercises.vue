<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Utils from '../config/utils'
import exerciseServices from '../services/exerciseServices'

const router = useRouter()
const store = useStore()

const user = ref(null)
const currentUser = computed(() => store.state.currentUser || store.state.loginUser)

// Active tab
const activeTab = ref('exercises')

// Statistics (will be loaded from API later)
const athleteCount = ref(0)
const activeGoals = ref(0)
const recentActivity = ref(0)
const trainingPlans = ref(0)

// Exercise management
const exercises = ref([])
const loading = ref(true)
const searchQuery = ref('')
const showAddDialog = ref(false)
const newExercise = ref({
  name: '',
  description: '',
  category: '',
  muscleGroups: '',
  equipment: ''
})

const filteredExercises = computed(() => {
  if (!searchQuery.value) return exercises.value
  
  const query = searchQuery.value.toLowerCase()
  return exercises.value.filter(exercise => 
    exercise.name.toLowerCase().includes(query) ||
    exercise.description.toLowerCase().includes(query) ||
    exercise.category.toLowerCase().includes(query)
  )
})

const changeTab = (tab) => {
  if (tab === 'athletes') {
    router.push({ name: 'coachDashboard' })
  } else if (tab === 'exercises') {
    activeTab.value = 'exercises'
  } else if (tab === 'plans') {
    router.push({ name: 'coach-plans' })
  }
}

const loadExercises = async () => {
  try {
    loading.value = true
    const response = await exerciseServices.getAllExercises()
    exercises.value = response.data
  } catch (error) {
    console.error('Error loading exercises:', error)
    
    if (error.response?.status === 401) {
      alert('Session expired. Please log in again.')
      router.push('/')
    } else {
      alert('Failed to load exercises')
    }
  } finally {
    loading.value = false
  }
}

const saveExercise = async () => {
  if (!newExercise.value.name || !newExercise.value.description) {
    alert('Please fill in all required fields')
    return
  }

  try {
    const response = await exerciseServices.createExercise(newExercise.value)
    exercises.value.push(response.data)
    closeAddDialog()
    alert('Exercise created successfully!')
  } catch (error) {
    console.error('Error creating exercise:', error)
    
    if (error.response?.status === 401) {
      alert('Session expired. Please log in again.')
      router.push('/')
    } else {
      alert('Failed to create exercise: ' + (error.response?.data?.message || error.message))
    }
  }
}

const deleteExercise = async (item) => {
  if (confirm(`Delete "${item.name}"?`)) {
    try {
      await exerciseServices.deleteExercise(item.id)
      exercises.value = exercises.value.filter(e => e.id !== item.id)
      alert('Exercise deleted successfully!')
    } catch (error) {
      console.error('Error deleting exercise:', error)
      
      if (error.response?.status === 401) {
        alert('Session expired. Please log in again.')
        router.push('/')
      } else {
        alert('Failed to delete exercise')
      }
    }
  }
}

const openAddDialog = () => {
  showAddDialog.value = true
}

const closeAddDialog = () => {
  showAddDialog.value = false
  newExercise.value = {
    name: '',
    description: '',
    category: '',
    muscleGroups: '',
    equipment: ''
  }
}

onMounted(async () => {
  user.value = Utils.getStore("user") || currentUser.value
  
  if (!user.value) {
    console.log('❌ No user found, redirecting to login')
    router.push('/')
  } else if (user.value.role !== 'coach') {
    console.log('❌ User is not a coach:', user.value.role)
    alert('Access denied. Coach role required.')
    router.push('/')
  } else {
    console.log('✅ User is coach, loading exercises')
    await loadExercises()
  }
})
</script>

<template>
  <v-container>
    <v-toolbar color="primary" dark>
      <v-toolbar-title>Coach Dashboard - Exercises</v-toolbar-title>
    </v-toolbar>

    <br />

    <v-alert type="info">
      Welcome, Coach {{ user?.first_name || user?.fName }}!
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
            <div class="text-h3 font-weight-bold">{{ trainingPlans }}</div>
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

      <!-- Exercise Library Content -->
      <v-card-text>
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <div class="text-h5 font-weight-bold">Exercise Library</div>
            <div class="text-caption text-grey">Manage exercises for your training programs</div>
          </div>
          <v-btn color="primary" @click="openAddDialog">
            <v-icon left>mdi-plus</v-icon>
            Add Exercise
          </v-btn>
        </div>

        <!-- Search Bar -->
        <v-text-field
          v-model="searchQuery"
          prepend-inner-icon="mdi-magnify"
          label="Search exercises..."
          variant="outlined"
          density="compact"
          class="mb-4"
          clearable
        ></v-text-field>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-4">Loading exercises...</p>
        </div>

        <!-- Exercise Cards -->
        <v-row v-else-if="filteredExercises.length > 0">
          <v-col v-for="exercise in filteredExercises" :key="exercise.id" cols="12" md="6">
            <v-card elevation="2" hover>
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-3">
                  <div>
                    <div class="text-h6 font-weight-bold">{{ exercise.name }}</div>
                    <v-chip size="small" color="primary" class="mt-1">{{ exercise.category }}</v-chip>
                  </div>
                  <v-btn 
                    icon 
                    size="small" 
                    color="error" 
                    variant="text"
                    @click="deleteExercise(exercise)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>

                <div class="text-body-2 text-grey mb-3">{{ exercise.description }}</div>

                <v-divider class="my-3"></v-divider>

                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">Muscle Groups</span>
                  <span class="font-weight-bold text-body-2">{{ exercise.muscleGroups || exercise.muscle_groups || '-' }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">Equipment</span>
                  <span class="font-weight-bold text-body-2">{{ exercise.equipment || '-' }}</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2">Type</span>
                  <v-chip size="x-small" :color="exercise.type === 'Custom' ? 'secondary' : 'default'">
                    {{ exercise.type || 'Standard' }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Empty State -->
        <v-alert v-else type="info" variant="tonal">
          <span v-if="searchQuery">No exercises found matching "{{ searchQuery }}"</span>
          <span v-else>No exercises available. Add your first exercise to get started!</span>
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Add Exercise Dialog -->
    <v-dialog v-model="showAddDialog" max-width="600px">
      <v-card>
        <v-card-title class="bg-primary">
          <span class="text-h5">Add New Exercise</span>
        </v-card-title>

        <v-card-subtitle class="pt-2">
          Create a custom exercise
        </v-card-subtitle>

        <v-card-text class="pt-4">
          <v-form>
            <v-text-field
              v-model="newExercise.name"
              label="Exercise Name *"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              required
            ></v-text-field>

            <v-textarea
              v-model="newExercise.description"
              label="Description *"
              variant="outlined"
              density="comfortable"
              rows="3"
              class="mb-3"
              required
            ></v-textarea>

            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="newExercise.category"
                  label="Category"
                  placeholder="e.g., Strength, Cardio"
                  variant="outlined"
                  density="comfortable"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="newExercise.equipment"
                  label="Equipment"
                  placeholder="e.g., Barbell, Dumbbells"
                  variant="outlined"
                  density="comfortable"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-text-field
              v-model="newExercise.muscleGroups"
              label="Muscle Groups"
              placeholder="e.g., Chest, Triceps"
              variant="outlined"
              density="comfortable"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeAddDialog">
            Cancel
          </v-btn>
          <v-btn 
            color="primary" 
            @click="saveExercise"
            :disabled="!newExercise.name || !newExercise.description"
          >
            Save Exercise
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>