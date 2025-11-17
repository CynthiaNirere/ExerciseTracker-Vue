<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Utils from '../config/utils'
import exercisePlanServices from '../services/exercisePlanServices'
import exerciseServices from '../services/exerciseServices'

const router = useRouter()
const store = useStore()

const user = ref(null)
const currentUser = computed(() => store.state.currentUser || store.state.loginUser)

// Active tab
const activeTab = ref('plans')

const athleteCount = computed(() => {
  const stored = Utils.getStore('athleteCount')
  return stored !== null && stored !== undefined ? stored : 0
})

const exerciseCount = computed(() => {
  const stored = Utils.getStore('exerciseCount')
  return stored !== null && stored !== undefined ? stored : 0
})

const trainingPlans = computed(() => {
  const stored = Utils.getStore('trainingPlans')
  return stored !== null && stored !== undefined ? stored : 0
})

// Plans data
const plans = ref([])
const loading = ref(true)

// Dialog state
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingPlan = ref(null)
const newPlan = ref({
  name: '',
  description: '',
  duration: '',
  difficulty: 'Intermediate',
  exercises: []
})

// Available exercises
const availableExercises = ref([])
const selectedExercise = ref(null)

// Computed
const trainingPlansCount = computed(() => trainingPlans.value)

const changeTab = (tab) => {
  if (tab === 'athletes') {
    router.push({ name: 'coachDashboard' })
  } else if (tab === 'exercises') {
    router.push({ name: 'coach-exercises' })
  } else if (tab === 'plans') {
    activeTab.value = 'plans'
  }
}

const loadPlans = async () => {
  try {
    loading.value = true
    const response = await exercisePlanServices.getAllExercisePlans()
    plans.value = response.data
    
    // Persist training plans count to localStorage
    Utils.setStore('trainingPlans', plans.value.length)
  } catch (error) {
    console.error('Error loading plans:', error)
    
    if (error.response?.status === 401) {
      alert('Session expired. Please log in again.')
      router.push('/')
    } else {
      alert('Failed to load plans')
    }
  } finally {
    loading.value = false
  }
}

const loadExercises = async () => {
  try {
    const response = await exerciseServices.getAllExercises()
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
    difficulty: 'Intermediate',
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

  if (newPlan.value.exercises.length === 0) {
    alert('Please add at least one exercise to the plan')
    return
  }

  try {
    const response = await exercisePlanServices.createExercisePlan(newPlan.value)
    plans.value.push(response.data)
    
    // Update training plans count in localStorage
    Utils.setStore('trainingPlans', plans.value.length)
    
    closeCreateDialog()
    alert('Training plan created successfully!')
  } catch (error) {
    console.error('Error creating plan:', error)
    
    if (error.response?.status === 401) {
      alert('Session expired. Please log in again.')
      router.push('/')
    } else {
      alert('Failed to create plan: ' + (error.response?.data?.message || error.message))
    }
  }
}
const openEditDialog = (plan) => {
  console.log('📝 Opening edit dialog for plan:', plan)
  console.log('📊 Plan exercises:', plan.exercises, typeof plan.exercises)
  
  // Deep copy and ensure exercises is an array
  editingPlan.value = { 
    ...plan,
    exercises: Array.isArray(plan.exercises) 
      ? [...plan.exercises] 
      : (typeof plan.exercises === 'string' 
        ? JSON.parse(plan.exercises) 
        : [])
  }
  
  console.log('✅ Editing plan exercises:', editingPlan.value.exercises)
  
  showEditDialog.value = true
  loadExercises()
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editingPlan.value = null
}

const updatePlan = async () => {
  if (!editingPlan.value.name || !editingPlan.value.description) {
    alert('Please fill in plan name and description')
    return
  }

  if (editingPlan.value.exercises.length === 0) {
    alert('Please add at least one exercise to the plan')
    return
  }

  try {
    const response = await exercisePlanServices.updateExercisePlan(editingPlan.value.id, editingPlan.value)
    const index = plans.value.findIndex(p => p.id === editingPlan.value.id)
    if (index !== -1) {
      plans.value[index] = response.data
    }
    
    // Update localStorage count
    Utils.setStore('trainingPlans', plans.value.length)
    
    closeEditDialog()
    alert('Training plan updated successfully!')
  } catch (error) {
    console.error('Error updating plan:', error)
    
    if (error.response?.status === 401) {
      alert('Session expired. Please log in again.')
      router.push('/')
    } else {
      alert('Failed to update plan: ' + (error.response?.data?.message || error.message))
    }
  }
}

const addExerciseToEdit = () => {
  if (!editingPlan.value.exercises) {
    editingPlan.value.exercises = []
  }
  
  if (selectedExercise.value && !editingPlan.value.exercises.includes(selectedExercise.value)) {
    editingPlan.value.exercises.push(selectedExercise.value)
    selectedExercise.value = null
  }
}

const removeExerciseFromEdit = (exerciseId) => {
  if (!editingPlan.value.exercises) {
    editingPlan.value.exercises = []
  }
  editingPlan.value.exercises = editingPlan.value.exercises.filter(id => id !== exerciseId)
}
const deletePlan = async (plan) => {
  if (confirm(`Delete "${plan.name}"?`)) {
    try {
      await exercisePlanServices.deleteExercisePlan(plan.id)
      plans.value = plans.value.filter(p => p.id !== plan.id)
      
      // Update training plans count in localStorage
      Utils.setStore('trainingPlans', plans.value.length)
      
      alert('Plan deleted successfully!')
    } catch (error) {
      console.error('Error deleting plan:', error)
      
      if (error.response?.status === 401) {
        alert('Session expired. Please log in again.')
        router.push('/')
      } else {
        alert('Failed to delete plan')
      }
    }
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
    console.log('✅ User is coach, loading plans')
    await loadPlans()
  }
})
</script>

<template>
  <v-container>
    <v-toolbar color="primary" dark>
      <v-toolbar-title>Coach Dashboard - Training Plans</v-toolbar-title>
    </v-toolbar>

    <br />

    <v-alert type="info">
      Welcome, Coach {{ user?.first_name || user?.fName }}!
    </v-alert>
    
    <br />

   <v-row>
  <v-col cols="12" sm="6" md="4">
    <v-card color="primary" dark>
      <v-card-text>
        <div class="text-h6">My Athletes</div>
        <div class="text-h3 font-weight-bold">{{ athleteCount }}</div>
      </v-card-text>
    </v-card>
  </v-col>

  <v-col cols="12" sm="6" md="4">
    <v-card color="info" dark>
      <v-card-text>
        <div class="text-h6">Exercises</div>
        <div class="text-h3 font-weight-bold">{{ exerciseCount }}</div>
      </v-card-text>
    </v-card>
  </v-col>

  <v-col cols="12" sm="6" md="4">
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

      <!-- Plans Content -->
      <v-card-text>
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <div class="text-h5 font-weight-bold">Training Plans</div>
            <div class="text-caption text-grey">Create and manage training programs</div>
          </div>
          <v-btn color="primary" @click="openCreateDialog">
            <v-icon left>mdi-plus</v-icon>
            Create Plan
          </v-btn>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-4">Loading plans...</p>
        </div>

        <!-- Plans Grid -->
        <v-row v-else-if="plans.length > 0">
          <v-col v-for="plan in plans" :key="plan.id" cols="12" md="4">
            <v-card elevation="2" hover>
              <v-card-text>
                <div class="text-h6 font-weight-bold mb-2">{{ plan.name }}</div>
                <div class="text-caption text-grey mb-4">{{ plan.description }}</div>
                
                <v-divider class="my-3"></v-divider>
                
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">Duration</span>
                  <span class="font-weight-bold">{{ plan.duration || '-' }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">Difficulty</span>
                  <span class="font-weight-bold">{{ plan.difficulty || '-' }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">Athletes</span>
                  <span class="font-weight-bold">{{ plan.assignedAthletes || 0 }}</span>
                </div>
                <div class="d-flex justify-space-between">
                  <span class="text-body-2">Exercises</span>
                  <span class="font-weight-bold">{{ plan.exercises || 0 }}</span>
                </div>
              </v-card-text>
              
              <v-card-actions>
                <v-btn variant="text" color="primary" @click="openEditDialog(plan)">Edit</v-btn>
                <v-btn variant="text" color="error" @click="deletePlan(plan)">Delete</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- Empty State -->
        <v-alert v-else type="info" variant="tonal">
          No training plans yet. Create your first plan to get started!
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- Create Plan Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="700px">
      <v-card>
        <v-card-title class="bg-primary">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h5">Create New Plan</div>
              <div class="text-caption">Design a custom training plan</div>
            </div>
            <v-btn icon variant="text" @click="closeCreateDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form>
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="newPlan.name"
                  label="Plan Name *"
                  variant="outlined"
                  density="comfortable"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="newPlan.difficulty"
                  label="Difficulty"
                  :items="['Beginner', 'Intermediate', 'Advanced']"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>

            <v-textarea
              v-model="newPlan.description"
              label="Description *"
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
            
            <div class="d-flex mb-4">
              <v-select
                v-model="selectedExercise"
                label="Select exercise to add"
                :items="availableExercises"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="comfortable"
                class="flex-grow-1 mr-2"
              ></v-select>
              <v-btn color="primary" @click="addExercise">
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
            <v-alert v-else type="info" density="compact">
              No exercises added yet. Select an exercise above to get started.
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeCreateDialog">
            Cancel
          </v-btn>
          <v-btn 
            color="primary" 
            @click="savePlan"
            :disabled="!newPlan.name || !newPlan.description || newPlan.exercises.length === 0"
          >
            Save Plan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Edit Plan Dialog -->
<v-dialog v-model="showEditDialog" max-width="700px">
  <v-card>
    <v-card-title class="bg-primary">
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-h5">Edit Plan</div>
          <div class="text-caption">Update training plan details</div>
        </div>
        <v-btn icon variant="text" @click="closeEditDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text class="pt-4" v-if="editingPlan">
      <v-form>
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="editingPlan.name"
              label="Plan Name *"
              variant="outlined"
              density="comfortable"
              required
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="editingPlan.difficulty"
              label="Difficulty"
              :items="['Beginner', 'Intermediate', 'Advanced']"
              variant="outlined"
              density="comfortable"
            ></v-select>
          </v-col>
        </v-row>

        <v-textarea
          v-model="editingPlan.description"
          label="Description *"
          variant="outlined"
          density="comfortable"
          rows="3"
          class="mb-3"
          required
        ></v-textarea>

        <v-text-field
          v-model="editingPlan.duration"
          label="Duration (e.g., 8 weeks)"
          variant="outlined"
          density="comfortable"
          class="mb-4"
        ></v-text-field>

        <div class="text-h6 mb-3">Exercises</div>
        
        <div class="d-flex mb-4">
          <v-select
            v-model="selectedExercise"
            label="Select exercise to add"
            :items="availableExercises"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            class="flex-grow-1 mr-2"
          ></v-select>
          <v-btn color="primary" @click="addExerciseToEdit">
            <v-icon left>mdi-plus</v-icon>
            Add
          </v-btn>
        </div>

        <!-- Selected Exercises -->
        <div v-if="editingPlan.exercises && editingPlan.exercises.length > 0" class="mb-4">
          <v-chip
            v-for="exerciseId in editingPlan.exercises"
            :key="exerciseId"
            closable
            @click:close="removeExerciseFromEdit(exerciseId)"
            class="ma-1"
          >
            {{ getExerciseName(exerciseId) }}
          </v-chip>
        </div>
        <v-alert v-else type="info" density="compact">
          No exercises added yet. Select an exercise above to get started.
        </v-alert>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn variant="text" @click="closeEditDialog">
        Cancel
      </v-btn>
      <v-btn 
        color="primary" 
        @click="updatePlan"
        :disabled="!editingPlan || !editingPlan.name || !editingPlan.description || !editingPlan.exercises || editingPlan.exercises.length === 0"
      >
        Update Plan
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
  </v-container>
</template>