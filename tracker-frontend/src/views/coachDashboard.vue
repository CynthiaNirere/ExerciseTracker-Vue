<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Utils from '../config/utils'


const router = useRouter()
const store = useStore()

const user = ref(null)
const currentUser = computed(() => store.state.currentUser || store.state.loginUser)

// Sample data - replace with actual API calls later
const athleteCount = ref(2)
const activeGoals = ref(3)
const recentActivity = ref(5)
const trainingPlans = ref(1)

// Sample athletes data - replace with API call
const athletes = ref([
  {
    id: 1,
    fName: 'Sarah',
    lName: 'Williams',
    email: 'athlete@example.com',
    activeGoals: 2,
    totalWorkouts: 4,
    lastActivity: '10/14/2024'
  },
  {
    id: 2,
    fName: 'John',
    lName: 'Davis',
    email: 'john@example.com',
    activeGoals: 1,
    totalWorkouts: 1,
    lastActivity: '10/15/2024'
  }
])

const goToAthletes = () => {
  console.log('🏃 Navigating to Athletes page...')
  router.push('/coach/athletes')
}

const goToAddAthlete = () => {
  console.log(' Navigating to Add Athlete...')
  router.push({ path: '/coach/athletes', query: { action: 'add' } })
}

const goToAthleteDetail = (athleteId) => {
  console.log(' Navigating to athlete detail:', athleteId)
  router.push(`/coach/athlete/${athleteId}`)
}

const getInitials = (fName, lName) => {
  return `${fName[0]}${lName[0]}`
}

onMounted(() => {
  user.value = Utils.getStore("user") || currentUser.value
  
  console.log(' CoachDashboard mounted')
  console.log(' Current user:', user.value)
  
  if (!user.value) {
    console.log(' No user found, redirecting to login')
    router.push('/')
  } else if (user.value.role !== 'coach') {
    console.log(' User is not a coach:', user.value.role)
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

    <!-- Athletes List -->
    <v-card>
      <v-card-title class="text-h5">
        My Athletes
        <v-spacer></v-spacer>        
      </v-card-title>
      
      <v-card-text>
        <v-row>
          <!-- Dynamic Athlete Cards -->
          <v-col 
            v-for="athlete in athletes" 
            :key="athlete.id" 
            cols="12" 
            md="6"
          >
            <v-card 
              @click="goToAthleteDetail(athlete.id)" 
              hover 
              class="pa-4" 
              elevation="1"
            >
              <div class="d-flex align-center mb-4">
                <v-avatar color="grey-lighten-1" size="56" class="mr-4">
                  <span class="text-h6">{{ getInitials(athlete.fName, athlete.lName) }}</span>
                </v-avatar>
                <div>
                  <div class="text-h6 font-weight-bold">{{ athlete.fName }} {{ athlete.lName }}</div>
                  <div class="text-caption text-grey">{{ athlete.email }}</div>
                </div>
              </div>

              <v-divider class="my-3"></v-divider>

              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2">Active Goals</span>
                <span class="font-weight-bold">{{ athlete.activeGoals }}</span>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2">Total Workouts</span>
                <span class="font-weight-bold">{{ athlete.totalWorkouts }}</span>
              </div>

              <v-divider class="my-3"></v-divider>

              <div class="text-caption text-grey">
                Last activity: {{ athlete.lastActivity }}
              </div>
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