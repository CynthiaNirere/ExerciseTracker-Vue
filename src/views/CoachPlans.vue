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
  exercises: []
})

// Available exercises
const availableExercises = ref([])
const selectedExercise = ref(null)

// Exercise details for plan
const planExercises = ref([])
const editPlanExercises = ref([])

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
    
    console.log(' Plans loaded:', plans.value)
    
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
    console.log(' Loaded exercises:', availableExercises.value.length)
  } catch (error) {
    console.error('Error loading exercises:', error)
  }
}

const openCreateDialog = () => {
  showCreateDialog.value = true
  planExercises.value = []
  newPlan.value = {
    name: '',
    description: '',
    exercises: []
  }
  loadExercises()
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
  newPlan.value = {
    name: '',
    description: '',
    exercises: []
  }
  planExercises.value = []
  selectedExercise.value = null
}

const addExercise = () => {
  if (!selectedExercise.value) return
  
  const alreadyAdded = planExercises.value.some(
    item => item.exercise_id === parseInt(selectedExercise.value)
  )
  
  if (alreadyAdded) {
    alert('This exercise is already in the plan')
    return
  }
  
  planExercises.value.push({
    exercise_id: parseInt(selectedExercise.value),
    sets: 3,
    reps: 10,
    weight: 0,
    duration_seconds: null,
    rest_seconds: 60
  })
  
  selectedExercise.value = null
}

const removeExercise = (index) => {
  planExercises.value.splice(index, 1)
}

const getExerciseName = (exerciseId) => {
  const exercise = availableExercises.value.find(ex => 
    ex.id === parseInt(exerciseId) || ex.exercise_id === parseInt(exerciseId)
  )
  return exercise ? exercise.name : 'Unknown Exercise'
}

const getExerciseMuscleGroup = (exerciseId) => {
  const exercise = availableExercises.value.find(ex => 
    ex.id === parseInt(exerciseId) || ex.exercise_id === parseInt(exerciseId)
  )
  return exercise ? (exercise.muscle_group || exercise.muscleGroup) : ''
}

const savePlan = async () => {
  if (!newPlan.value.name || !newPlan.value.description) {
    alert('Please fill in plan name and description')
    return
  }

  if (planExercises.value.length === 0) {
    alert('Please add at least one exercise to the plan')
    return
  }

  try {
    const planData = {
      name: newPlan.value.name,
      description: newPlan.value.description,
      exercises: planExercises.value.map((item, index) => ({
        exercise_id: item.exercise_id,
        sets: item.sets,
        reps: item.reps,
        weight: item.weight || 0,
        duration_seconds: item.duration_seconds,
        rest_seconds: item.rest_seconds,
        order: index
      }))
    }
    
    console.log(' Creating plan:', planData)
    
    const response = await exercisePlanServices.createExercisePlan(planData)
    plans.value.push(response.data)
    
    Utils.setStore('trainingPlans', plans.value.length)
    
    closeCreateDialog()
    alert('Training plan created successfully!')
  } catch (error) {
    console.error('Error creating plan:', error)
    console.error('Error response:', error.response?.data)
    
    if (error.response?.status === 401) {
      alert('Session expired. Please log in again.')
      router.push('/')
    } else {
      alert('Failed to create plan: ' + (error.response?.data?.message || error.message))
    }
  }
}

const openEditDialog = async (plan) => {
  try {
    console.log(' Opening edit dialog for plan:', plan)
    
    // Fetch full plan details
    const response = await exercisePlanServices.getExercisePlanDetails(plan.id)
    console.log(' Plan details:', response.data)
    
    editingPlan.value = {
      id: plan.id,
      name: plan.name,
      description: plan.description
    }
    
    let exercisesArray = []
    if (Array.isArray(response.data.exerciseList)) {
      exercisesArray = response.data.exerciseList
    } else if (Array.isArray(response.data.exercises)) {
      exercisesArray = response.data.exercises
    }
    
    console.log(' Using exercises array:', exercisesArray)
    
    // Map the backend response correctly
    editPlanExercises.value = exercisesArray.map(exercise => {
      const exerciseId = exercise.exercise_id || exercise.id
      
      return {
        exercise_id: exerciseId,
        sets: exercise.ExercisePlanItem?.sets || 3,
        reps: parseInt(exercise.ExercisePlanItem?.reps) || 10,
        weight: parseFloat(exercise.ExercisePlanItem?.weight) || 0,
        duration_seconds: exercise.ExercisePlanItem?.durationSeconds || null,
        rest_seconds: exercise.ExercisePlanItem?.restSeconds || 60
      }
    })
    
    console.log(' Mapped exercises:', editPlanExercises.value)
    
    showEditDialog.value = true
    loadExercises()
  } catch (error) {
    console.error('Error loading plan details:', error)
    alert('Failed to load plan details')
  }
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editingPlan.value = null
  editPlanExercises.value = []
}

const updatePlan = async () => {
  if (!editingPlan.value.name || !editingPlan.value.description) {
    alert('Please fill in plan name and description')
    return
  }

  if (editPlanExercises.value.length === 0) {
    alert('Please add at least one exercise to the plan')
    return
  }

  try {
    const planData = {
      name: editingPlan.value.name,
      description: editingPlan.value.description,
      exercises: editPlanExercises.value.map((item, index) => ({
        exercise_id: item.exercise_id,
        sets: item.sets,
        reps: item.reps,
        weight: item.weight || 0,
        duration_seconds: item.duration_seconds,
        rest_seconds: item.rest_seconds,
        order: index
      }))
    }
    
    console.log(' Updating plan:', planData)
    
    const response = await exercisePlanServices.updateExercisePlan(editingPlan.value.id, planData)
    const index = plans.value.findIndex(p => p.id === editingPlan.value.id)
    if (index !== -1) {
      plans.value[index] = response.data
    }
    
    Utils.setStore('trainingPlans', plans.value.length)
    
    closeEditDialog()
    alert('Training plan updated successfully!')
  } catch (error) {
    console.error('Error updating plan:', error)
    console.error('Error response:', error.response?.data)
    
    if (error.response?.status === 401) {
      alert('Session expired. Please log in again.')
      router.push('/')
    } else {
      alert('Failed to update plan: ' + (error.response?.data?.message || error.message))
    }
  }
}

const addExerciseToEdit = () => {
  if (!selectedExercise.value) return
  
  const alreadyAdded = editPlanExercises.value.some(
    item => item.exercise_id === parseInt(selectedExercise.value)
  )
  
  if (alreadyAdded) {
    alert('This exercise is already in the plan')
    return
  }
  
  editPlanExercises.value.push({
    exercise_id: parseInt(selectedExercise.value),
    sets: 3,
    reps: 10,
    weight: 0,
    duration_seconds: null,
    rest_seconds: 60
  })
  
  selectedExercise.value = null
}

const removeExerciseFromEdit = (index) => {
  editPlanExercises.value.splice(index, 1)
}

const deletePlan = async (plan) => {
  if (confirm(`Delete "${plan.name}"?`)) {
    try {
      await exercisePlanServices.deleteExercisePlan(plan.id)
      plans.value = plans.value.filter(p => p.id !== plan.id)
      
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
    console.log(' No user found, redirecting to login')
    router.push('/')
  } else if (user.value.role !== 'coach') {
    console.log(' User is not a coach:', user.value.role)
    alert('Access denied. Coach role required.')
    router.push('/')
  } else {
    console.log(' User is coach, loading plans')
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

    <!-- Statistics Cards -->
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
                
                <!-- ✅ FIXED: Use exerciseList -->
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">Exercises</span>
                  <span class="font-weight-bold">{{ plan.exerciseList?.length || 0 }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">Assigned Athletes</span>
                  <span class="font-weight-bold">{{ plan.assignedAthletes || 0 }}</span>
                </div>
                
                <!-- Show exercise list if available -->
                <div v-if="plan.exerciseList && plan.exerciseList.length > 0" class="mt-3">
                  <v-divider class="mb-2"></v-divider>
                  <div class="text-caption font-weight-bold mb-1">Exercises:</div>
                  <v-chip
                    v-for="(exercise, idx) in plan.exerciseList.slice(0, 3)"
                    :key="idx"
                    size="x-small"
                    class="ma-1"
                  >
                    {{ exercise.name }}
                  </v-chip>
                  <v-chip
                    v-if="plan.exerciseList.length > 3"
                    size="x-small"
                    class="ma-1"
                  >
                    +{{ plan.exerciseList.length - 3 }} more
                  </v-chip>
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
    <v-dialog v-model="showCreateDialog" max-width="800px" persistent>
      <v-card>
        <v-card-title class="bg-primary text-white">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h5">Create New Plan</div>
              <div class="text-caption">Design a custom training plan</div>
            </div>
            <v-btn icon variant="text" color="white" @click="closeCreateDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form>
            <v-text-field
              v-model="newPlan.name"
              label="Plan Name *"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              required
            ></v-text-field>

            <v-textarea
              v-model="newPlan.description"
              label="Description *"
              variant="outlined"
              density="comfortable"
              rows="3"
              class="mb-4"
              required
            ></v-textarea>

            <v-divider class="mb-4"></v-divider>

            <div class="text-h6 mb-3">Exercises</div>
            
            <v-row class="mb-4">
              <v-col cols="9">
                <v-select
                  v-model="selectedExercise"
                  label="Select exercise to add"
                  :items="availableExercises"
                  item-title="name"
                  :item-value="(item) => item.id || item.exercise_id"
                  variant="outlined"
                  density="comfortable"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:title>
                        {{ item.raw.name }} - {{ item.raw.muscleGroup || item.raw.muscle_group }}
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="3">
                <v-btn
                  color="primary"
                  block
                  height="56"
                  :disabled="!selectedExercise"
                  @click="addExercise"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Add
                </v-btn>
              </v-col>
            </v-row>

            <!-- Added Exercises -->
            <v-card variant="outlined" class="pa-4" min-height="200" max-height="400" style="overflow-y: auto;">
              <div v-if="planExercises.length === 0" class="text-center text-medium-emphasis py-8">
                No exercises added yet. Select an exercise above to get started.
              </div>
              <div v-else>
                <v-card
                  v-for="(item, index) in planExercises"
                  :key="index"
                  variant="flat"
                  class="mb-3 pa-3"
                  color="grey-lighten-4"
                >
                  <v-row align="center">
                    <v-col cols="12" sm="4">
                      <div class="font-weight-bold">{{ getExerciseName(item.exercise_id) }}</div>
                      <div class="text-caption text-medium-emphasis">{{ getExerciseMuscleGroup(item.exercise_id) }}</div>
                    </v-col>
                    <v-col cols="6" sm="2">
                      <v-text-field
                        v-model.number="item.sets"
                        label="Sets"
                        type="number"
                        min="1"
                        density="compact"
                        variant="outlined"
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" sm="2">
                      <v-text-field
                        v-model.number="item.reps"
                        label="Reps"
                        type="number"
                        min="1"
                        density="compact"
                        variant="outlined"
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" sm="2">
                      <v-text-field
                        v-model.number="item.weight"
                        label="Weight (lbs)"
                        type="number"
                        min="0"
                        step="5"
                        density="compact"
                        variant="outlined"
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" sm="2">
                      <v-text-field
                        v-model.number="item.rest_seconds"
                        label="Rest (sec)"
                        type="number"
                        min="0"
                        density="compact"
                        variant="outlined"
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="auto">
                      <v-btn icon variant="text" color="error" @click="removeExercise(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </div>
            </v-card>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeCreateDialog">Cancel</v-btn>
          <v-btn 
            color="primary" 
            @click="savePlan"
            :disabled="!newPlan.name || !newPlan.description || planExercises.length === 0"
          >
            Save Plan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Plan Dialog -->
    <v-dialog v-model="showEditDialog" max-width="800px" persistent>
      <v-card v-if="editingPlan">
        <v-card-title class="bg-primary text-white">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h5">Edit Plan</div>
              <div class="text-caption">Update training plan details</div>
            </div>
            <v-btn icon variant="text" color="white" @click="closeEditDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form>
            <v-text-field
              v-model="editingPlan.name"
              label="Plan Name *"
              variant="outlined"
              density="comfortable"
              class="mb-3"
              required
            ></v-text-field>

            <v-textarea
              v-model="editingPlan.description"
              label="Description *"
              variant="outlined"
              density="comfortable"
              rows="3"
              class="mb-4"
              required
            ></v-textarea>

            <v-divider class="mb-4"></v-divider>

            <div class="text-h6 mb-3">Exercises</div>
            
            <v-row class="mb-4">
              <v-col cols="9">
                <v-select
                  v-model="selectedExercise"
                  label="Select exercise to add"
                  :items="availableExercises"
                  item-title="name"
                  :item-value="(item) => item.id || item.exercise_id"
                  variant="outlined"
                  density="comfortable"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props">
                      <template v-slot:title>
                        {{ item.raw.name }} - {{ item.raw.muscleGroup || item.raw.muscle_group }}
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="3">
                <v-btn
                  color="primary"
                  block
                  height="56"
                  :disabled="!selectedExercise"
                  @click="addExerciseToEdit"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Add
                </v-btn>
              </v-col>
            </v-row>

            <!-- Editing Exercises -->
            <v-card variant="outlined" class="pa-4" min-height="200" max-height="400" style="overflow-y: auto;">
              <div v-if="editPlanExercises.length === 0" class="text-center text-medium-emphasis py-8">
                No exercises added yet. Select an exercise above to get started.
              </div>
              <div v-else>
                <v-card
                  v-for="(item, index) in editPlanExercises"
                  :key="index"
                  variant="flat"
                  class="mb-3 pa-3"
                  color="grey-lighten-4"
                >
                  <v-row align="center">
                    <v-col cols="12" sm="4">
                      <div class="font-weight-bold">{{ getExerciseName(item.exercise_id) }}</div>
                      <div class="text-caption text-medium-emphasis">{{ getExerciseMuscleGroup(item.exercise_id) }}</div>
                    </v-col>
                    <v-col cols="6" sm="2">
                      <v-text-field
                        v-model.number="item.sets"
                        label="Sets"
                        type="number"
                        min="1"
                        density="compact"
                        variant="outlined"
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" sm="2">
                      <v-text-field
                        v-model.number="item.reps"
                        label="Reps"
                        type="number"
                        min="1"
                        density="compact"
                        variant="outlined"
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" sm="2">
                      <v-text-field
                        v-model.number="item.weight"
                        label="Weight (lbs)"
                        type="number"
                        min="0"
                        step="5"
                        density="compact"
                        variant="outlined"
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6" sm="2">
                      <v-text-field
                        v-model.number="item.rest_seconds"
                        label="Rest (sec)"
                        type="number"
                        min="0"
                        density="compact"
                        variant="outlined"
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="auto">
                      <v-btn icon variant="text" color="error" @click="removeExerciseFromEdit(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </div>
            </v-card>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeEditDialog">Cancel</v-btn>
          <v-btn 
            color="primary" 
            @click="updatePlan"
            :disabled="!editingPlan.name || !editingPlan.description || editPlanExercises.length === 0"
          >
            Update Plan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>