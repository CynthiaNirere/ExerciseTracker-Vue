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
const activeTab = ref('athletes')

// Statistics
const athleteCount = ref(0)
const activeGoals = ref(0)
const recentActivity = ref(0)
const trainingPlans = ref(0)

// Athletes data
const athletes = ref([])

// Loading state
const loading = ref(true)
const error = ref(null)

// Add Athlete Dialog
const showAddAthleteDialog = ref(false)
const newAthlete = ref({
  first_name: '',
  last_name: '',
  email: '',
  age: null,
  height: '',
  weight: '',
  bio: '',
  training_goals: '',
  injuries: ''
})

// Fetch athletes from API
const fetchAthletes = async () => {
  try {
    loading.value = true
    error.value = null
    
    const coachId = user.value?.user_id || currentUser.value?.user_id
    
    console.log('🔍 Fetching athletes...')
    console.log('🆔 Coach ID:', coachId)
    
    if (!coachId) {
      console.error('❌ No coach ID found!')
      error.value = 'Coach ID not found. Please log in again.'
      loading.value = false
      return
    }
    
    const url = `http://localhost:3021/tracker-t1/api/coach/${coachId}/athletes`
    console.log('📡 Fetching from URL:', url)
    
    const response = await axios.get(url)
    console.log('✅ Response:', response.data)
    
    athletes.value = response.data
    
    // Update athlete count
    athleteCount.value = athletes.value.length
    
    // Calculate total active goals
    activeGoals.value = athletes.value.reduce((sum, athlete) => sum + (athlete.activeGoals || 0), 0)
    
    // Calculate recent activity
    recentActivity.value = athletes.value.reduce((sum, athlete) => sum + athlete.totalWorkouts, 0)
    
  } catch (err) {
    console.error('❌ Error fetching athletes:', err)
    console.error('Error details:', err.response)
    error.value = 'Failed to load athletes'
  } finally {
    loading.value = false
  }
}

const openAddAthleteDialog = () => {
  showAddAthleteDialog.value = true
}

const closeAddAthleteDialog = () => {
  showAddAthleteDialog.value = false
  newAthlete.value = {
    first_name: '',
    last_name: '',
    email: '',
    age: null,
    height: '',
    weight: '',
    bio: '',
    training_goals: '',
    injuries: ''
  }
}

const createAthlete = async () => {
  try {
    console.log('Creating athlete:', newAthlete.value)
    
    // Use the new athlete endpoint with auto-generated password
    const response = await axios.post('http://localhost:3021/tracker-t1/api/athletes', {
      first_name: newAthlete.value.first_name,
      last_name: newAthlete.value.last_name,
      email: newAthlete.value.email,
      password: 'TempPass123!',  // Auto-generated temporary password
      age: newAthlete.value.age,
      height: newAthlete.value.height,
      weight: newAthlete.value.weight,
      bio: newAthlete.value.bio,
      training_goals: newAthlete.value.training_goals,
      injuries: newAthlete.value.injuries
    })
    
    console.log('✅ Athlete created:', response.data)
    
    // Refresh athletes list
    await fetchAthletes()
    
    closeAddAthleteDialog()
    
    alert('Athlete added successfully!\n\nTemporary Password: TempPass123!\n\nPlease share this with the athlete so they can log in.')
    
  } catch (err) {
    console.error('❌ Error creating athlete:', err)
    alert('Failed to create athlete: ' + (err.response?.data?.message || err.message))
  }
}

const changeTab = (tab) => {
  console.log('🔄 Tab clicked:', tab)
  if (tab === 'athletes') {
    router.push({ name: 'coachDashboard' })
  } else if (tab === 'exercises') {
    router.push({ name: 'coach-exercises' })
  } else if (tab === 'plans') {
    router.push({ name: 'coach-plans' })
  }
}

const goToAthleteDetail = (athleteId) => {
  console.log('🏃 Going to athlete detail:', athleteId)
  router.push({ name: 'athleteDetail', params: { id: athleteId } })
}

const getInitials = (fName, lName) => {
  if (!fName || !lName) return '??'
  return `${fName[0]}${lName[0]}`
}

const formatDate = (date) => {
  if (!date) return 'Never'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

onMounted(async () => {
  console.log('🚀 Coach Dashboard mounted')
  
  user.value = Utils.getStore("user") || currentUser.value
  
  console.log('📦 User from storage:', Utils.getStore("user"))
  console.log('📦 Current user from store:', currentUser.value)
  console.log('📦 Final user value:', user.value)
  
  if (!user.value) {
    console.log('❌ No user found, redirecting to login')
    router.push('/')
  } else if (user.value.role !== 'coach') {
    console.log('❌ User is not a coach:', user.value.role)
    alert('Access denied. Coach role required.')
    router.push('/')
  } else {
    console.log('✅ User is coach, fetching athletes')
    await fetchAthletes()
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
        @update:model-value="changeTab"
      >
        <v-tab value="athletes">Athletes</v-tab>
        <v-tab value="exercises">Exercises</v-tab>
        <v-tab value="plans">Plans</v-tab>
      </v-tabs>

      <!-- Athletes Content -->
      <v-card-text v-if="activeTab === 'athletes'">
        <!-- Add Athlete Button -->
        <div class="d-flex justify-end mb-4">
          <v-btn color="black" @click="openAddAthleteDialog">
            <v-icon left>mdi-plus</v-icon>
            Add Athlete
          </v-btn>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-4">Loading athletes...</p>
        </div>

        <!-- Error State -->
        <v-alert v-else-if="error" type="error" class="mb-4">
          {{ error }}
          <div class="mt-2">
            <small>Check the browser console for more details.</small>
          </div>
        </v-alert>

        <!-- No Athletes -->
        <v-alert v-else-if="athletes.length === 0" type="info" variant="tonal">
          No athletes found. Start by adding athletes to your roster.
        </v-alert>

        <!-- Athletes List -->
        <v-row v-else>
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
                <span class="text-body-2">Age</span>
                <span class="font-weight-bold">{{ athlete.age || '-' }}</span>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span class="text-body-2">Total Workouts</span>
                <span class="font-weight-bold">{{ athlete.totalWorkouts }}</span>
              </div>

              <v-divider class="my-3"></v-divider>

              <div class="text-caption text-grey">
                Height: {{ athlete.height || '-' }} | Weight: {{ athlete.weight || '-' }}
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Add Athlete Dialog -->
    <v-dialog v-model="showAddAthleteDialog" max-width="600px">
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center">
          <span class="text-h5">Add New Athlete</span>
          <v-btn icon variant="text" @click="closeAddAthleteDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-form>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="newAthlete.first_name"
                  label="First Name"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="newAthlete.last_name"
                  label="Last Name"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-text-field
              v-model="newAthlete.email"
              label="Email"
              type="email"
              variant="outlined"
              required
              class="mb-3"
            ></v-text-field>

            <!-- PASSWORD FIELD REMOVED -->

            <v-row>
              <v-col cols="4">
                <v-text-field
                  v-model.number="newAthlete.age"
                  label="Age"
                  type="number"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="newAthlete.height"
                  label="Height (e.g., 180 cm)"
                  variant="outlined"
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="newAthlete.weight"
                  label="Weight (e.g., 75 kg)"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-textarea
              v-model="newAthlete.bio"
              label="Bio"
              variant="outlined"
              rows="2"
              class="mb-3"
            ></v-textarea>

            <v-textarea
              v-model="newAthlete.training_goals"
              label="Training Goals"
              variant="outlined"
              rows="2"
              class="mb-3"
            ></v-textarea>

            <v-textarea
              v-model="newAthlete.injuries"
              label="Injuries / Notes"
              variant="outlined"
              rows="2"
            ></v-textarea>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="closeAddAthleteDialog">
            Cancel
          </v-btn>
          <v-btn 
            color="black" 
            @click="createAthlete"
            :disabled="!newAthlete.first_name || !newAthlete.last_name || !newAthlete.email"
          >
            Add Athlete
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