<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Utils from '../config/utils'
import exercisePlanServices from '../services/exercisePlanServices'

const router = useRouter()
const store = useStore()

const user = ref(null)
const currentUser = computed(() => store.state.currentUser || store.state.loginUser)

const assignedPlans = ref([])
const loading = ref(true)
const selectedPlan = ref(null)
const showPlanDialog = ref(false)

// Fetch assigned plans
const fetchAssignedPlans = async () => {
  try {
    loading.value = true
    
    const athleteId = user.value?.userId || user.value?.user_id

    const response = await exercisePlanServices.getPlansByAthlete(athleteId)
    assignedPlans.value = response.data
    
    console.log('✅ Assigned plans loaded:', assignedPlans.value)
  } catch (err) {
    console.error('❌ Error fetching assigned plans:', err)
    
    if (err.response?.status === 401) {
      router.push('/')
    }
  } finally {
    loading.value = false
  }
}

const viewPlanDetails = (plan) => {
  selectedPlan.value = plan
  showPlanDialog.value = true
}

const closePlanDialog = () => {
  showPlanDialog.value = false
  selectedPlan.value = null
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

const goBack = () => {
  router.push({ name: 'athleteDashboard' })
}

onMounted(async () => {
  user.value = Utils.getStore("user") || currentUser.value
  
  if (!user.value) {
    console.log('❌ No user found')
    router.push('/')
  } else {
    await fetchAssignedPlans()
  }
})
</script>

<template>
  <v-container>
    <v-toolbar color="success" dark>
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>My Training Plans</v-toolbar-title>
    </v-toolbar>

    <br />

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="success"></v-progress-circular>
      <p class="mt-4">Loading training plans...</p>
    </div>

    <!-- Plans List -->
    <v-row v-else-if="assignedPlans.length > 0">
      <v-col v-for="assignment in assignedPlans" :key="assignment.assignmentId" cols="12" md="6">
        <v-card elevation="2" hover>
          <v-card-text>
            <div class="d-flex justify-space-between align-center mb-3">
              <div>
                <div class="text-h6 font-weight-bold">{{ assignment.plan.name }}</div>
                <v-chip size="small" :color="assignment.status === 'active' ? 'success' : 'grey'" class="mt-1">
                  {{ assignment.status }}
                </v-chip>
              </div>
            </div>

            <p class="text-body-2 text-grey mb-3">{{ assignment.plan.description || 'No description' }}</p>

            <v-divider class="my-3"></v-divider>

            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-2">Assigned Date</span>
              <span class="font-weight-bold">{{ formatDate(assignment.assignedDate) }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-2">Duration</span>
              <span class="font-weight-bold">{{ assignment.plan.duration || '-' }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-2">Difficulty</span>
              <span class="font-weight-bold">{{ assignment.plan.difficulty || '-' }}</span>
            </div>
            <div class="d-flex justify-space-between">
              <span class="text-body-2">Exercises</span>
              <span class="font-weight-bold">{{ assignment.plan.exerciseCount || 0 }}</span>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-btn color="success" variant="text" @click="viewPlanDetails(assignment.plan)">
              <v-icon left>mdi-eye</v-icon>
              View Exercises
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-alert v-else type="info" variant="tonal">
      No training plans assigned yet. Your coach will assign plans for you.
    </v-alert>

    <!-- Plan Details Dialog -->
    <v-dialog v-model="showPlanDialog" max-width="700px">
      <v-card v-if="selectedPlan">
        <v-card-title class="bg-success">
          <div class="d-flex justify-space-between align-center">
            <span class="text-h5">{{ selectedPlan.name }}</span>
            <v-btn icon variant="text" @click="closePlanDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <v-card-text class="pt-4">
          <p class="text-body-1 mb-4">{{ selectedPlan.description }}</p>

          <div class="text-h6 mb-3">Exercises</div>
          
          <v-list>
            <v-list-item 
              v-for="(exercise, index) in selectedPlan.exercises" 
              :key="exercise.id"
              class="mb-2"
            >
              <template v-slot:prepend>
                <v-avatar color="success" size="40">
                  <span class="text-white">{{ index + 1 }}</span>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-bold">
                {{ exercise.name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                <span v-if="exercise.ExercisePlanItem">
                  {{ exercise.ExercisePlanItem.sets }} sets × {{ exercise.ExercisePlanItem.reps }} reps
                </span>
                <span v-if="exercise.muscleGroup"> • {{ exercise.muscleGroup }}</span>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>