<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import Utils from '../config/utils'

const router = useRouter()
const route = useRoute()
const store = useStore()

const user = ref(null)
const currentUser = computed(() => store.state.currentUser || store.state.loginUser)

// Active tab
const activeTab = ref('plans')

// Sample data
const athleteCount = ref(2)
const activeGoals = ref(3)
const recentActivity = ref(5)
const trainingPlans = ref(1)

const plans = ref([
  {
    id: 1,
    name: 'Strength Foundation',
    description: '8-week beginner strength program',
    duration: '8 weeks',
    assignedAthletes: 2,
    exercises: 12
  }
])

const changeTab = (tab) => {
  if (tab === 'athletes') {
    router.push({ name: 'coachDashboard' })
  } else if (tab === 'exercises') {
    router.push({ name: 'coach-exercises' })
  } else if (tab === 'plans') {
    router.push({ name: 'coach-plans' })
  }
}

onMounted(() => {
  user.value = Utils.getStore("user") || currentUser.value
  
  if (!user.value) {
    router.push('/')
  } else if (user.value.role !== 'coach') {
    alert('Access denied. Coach role required.')
    router.push('/')
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
          <v-btn color="black">
            <v-icon left>mdi-plus</v-icon>
            Create Plan
          </v-btn>
        </div>

        <!-- Plans Grid -->
        <v-row>
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
                <v-btn variant="text" color="error">Delete</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
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