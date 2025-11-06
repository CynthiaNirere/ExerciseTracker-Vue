<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Utils from '../config/utils'
import axios from 'axios'

const router = useRouter()
const store = useStore()

const user = ref(null)
const currentUser = computed(() => {
  try {
    return store?.state?.currentUser || store?.state?.loginUser || null
  } catch (e) {
    return null
  }
})

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
  gender: '',
  team: '',
  sport_type: '',
  bio: ''
})

// Get auth token from storage
const getAuthToken = () => {
  // First try to get token directly
  let token = Utils.getStore("token")
  
  // If not found, try to get it from user object
  if (!token) {
    const userData = Utils.getStore("user")
    token = userData?.token
  }
  
  if (!token) {
    console.error('❌ No auth token found!')
    router.push('/')
    return null
  }
  
  console.log('✅ Token found:', token.substring(0, 20) + '...')
  return token
}

// Configure axios headers with auth token
const getAxiosConfig = () => {
  const token = getAuthToken()
  if (!token) return null
  
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
}

// Fetch athletes from API
const fetchAthletes = async () => {
  try {
    loading.value = true
    error.value = null
    
    const coachId = user.value?.userId || user.value?.user_id || currentUser.value?.userId || currentUser.value?.user_id
    
    console.log('🔍 Fetching athletes...')
    console.log('🆔 Coach ID:', coachId)
    
    if (!coachId) {
      console.error('❌ No coach ID found!')
      error.value = 'Coach ID not found. Please log in again.'
      loading.value = false
      return
    }

    const config = getAxiosConfig()
    if (!config) return
    
    const url = `http://localhost:3021/tracker-t1/api/coach/${coachId}/athletes`
    console.log('📡 Fetching from URL:', url)
    
    const response = await axios.get(url, config)
    console.log('✅ Response:', response.data)
    console.log('📊 First athlete:', response.data[0])
    
    athletes.value = response.data
    
    // Update athlete count
    athleteCount.value = athletes.value.length
    
    // Calculate total active goals
    activeGoals.value = athletes.value.reduce((sum, athlete) => sum + (athlete.activeGoals || 0), 0)
    
    // Calculate recent activity
    recentActivity.value = athletes.value.reduce((sum, athlete) => sum + (athlete.totalWorkouts || 0), 0)
    
  } catch (err) {
    console.error('❌ Error fetching athletes:', err)
    console.error('Error details:', err.response)
    
    if (err.response?.status === 401) {
      error.value = 'Session expired. Please log in again.'
      setTimeout(() => router.push('/'), 2000)
    } else {
      error.value = 'Failed to load athletes'
    }
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
    gender: '',
    team: '',
    sport_type: '',
    bio: ''
  }
}

const createAthlete = async () => {
  try {
    console.log('Creating athlete:', newAthlete.value)
    
    const config = getAxiosConfig()
    if (!config) return

    const coachId = user.value?.userId || user.value?.user_id || currentUser.value?.userId || currentUser.value?.user_id
    
    const response = await axios.post('http://localhost:3021/tracker-t1/api/athletes', {
      first_name: newAthlete.value.first_name,
      last_name: newAthlete.value.last_name,
      email: newAthlete.value.email,
      role: 'athlete',
      coach_id: coachId,
      age: newAthlete.value.age,
      gender: newAthlete.value.gender,
      team: newAthlete.value.team,
      sport_type: newAthlete.value.sport_type,
      bio: newAthlete.value.bio
    }, config)
    
    console.log('✅ Athlete created:', response.data)
    
    // Refresh athletes list
    await fetchAthletes()
    
    closeAddAthleteDialog()
    
    alert('Athlete added successfully!')
    
  } catch (err) {
    console.error('❌ Error creating athlete:', err)
    
    if (err.response?.status === 401) {
      alert('Session expired. Please log in again.')
      router.push('/')
    } else {
      alert('Failed to create athlete: ' + (err.response?.data?.message || err.message))
    }
  }
}

const changeTab = (tab) => {
  console.log('🔄 Tab clicked:', tab)
  if (tab === 'athletes') {
    activeTab.value = 'athletes'
  } else if (tab === 'exercises') {
    router.push({ name: 'coach-exercises' })
  } else if (tab === 'plans') {
    router.push({ name: 'coach-plans' })
  }
}

const goToAthleteDetail = (athleteId) => {
  console.log('🏃 Going to athlete detail:', athleteId)
  
  if (!athleteId) {
    console.error('❌ No athlete ID provided')
    alert('Cannot view athlete details - invalid athlete ID')
    return
  }
  
  // Navigate to athlete detail page where coach can:
  // - View athlete profile
  // - Add/Edit/Delete athlete exercise goals
  // - View athlete exercise results
  // - View athlete progress on goals
  router.push({ 
    name: 'athleteDetail', 
    params: { id: athleteId } 
  })
}

const getInitials = (athlete) => {
  // Try different possible field name variations
  const firstName = athlete?.first_name || athlete?.fName || athlete?.firstName
  const lastName = athlete?.last_name || athlete?.lName || athlete?.lastName
  
  console.log('Getting initials for athlete:', athlete)
  console.log('Extracted names:', { firstName, lastName })
  
  if (!firstName || !lastName) {
    console.warn('Missing name data for athlete:', athlete)
    // Try to use email as fallback
    if (athlete?.email) {
      const emailParts = athlete.email.split('@')[0].split('.')
      if (emailParts.length >= 2) {
        return `${emailParts[0][0]}${emailParts[1][0]}`.toUpperCase()
      }
    }
    return '??'
  }
  
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
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
    <v-toolbar color="primary" dark>
      <v-toolbar-title>Coach Dashboard</v-toolbar-title>
    </v-toolbar>
    
    <br />

    <v-alert type="info">
      Welcome, Coach {{ user?.first_name || user?.fName || 'Coach' }}!
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
          <v-btn color="primary" @click="openAddAthleteDialog">
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
        </v-alert>

        <!-- No Athletes -->
        <v-alert v-else-if="athletes.length === 0" type="info" variant="tonal">
          No athletes found. Start by adding athletes to your roster.
        </v-alert>

        <!-- Athletes List -->
        <v-row v-else>
          <v-col 
            v-for="athlete in athletes" 
            :key="athlete.user_id" 
            cols="12" 
            md="6"
          >
            <v-card 
              @click="goToAthleteDetail(athlete.user_id)" 
              hover
              class="cursor-pointer"
            >
              <v-card-text>
                <div class="d-flex align-center mb-4">
                  <v-avatar color="primary" size="56" class="mr-4">
                    <span class="text-h6">
                      {{ getInitials(athlete) }}
                    </span>
                  </v-avatar>
                  <div>
                    <div class="text-h6 font-weight-bold">
                      {{ athlete.first_name }} {{ athlete.last_name }}
                    </div>
                    <div class="text-caption text-grey">{{ athlete.email }}</div>
                  </div>
                </div>

                <v-divider class="my-3"></v-divider>

                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">Age</span>
                  <span class="font-weight-bold">{{ athlete.age || '-' }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">Sport</span>
                  <span class="font-weight-bold">{{ athlete.sport_type || '-' }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">Team</span>
                  <span class="font-weight-bold">{{ athlete.team || '-' }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2">
                  <span class="text-body-2">Total Workouts</span>
                  <span class="font-weight-bold">{{ athlete.totalWorkouts || 0 }}</span>
                </div>

                <v-divider class="my-3"></v-divider>

                <div class="text-caption text-grey">
                  Gender: {{ athlete.gender || '-' }}
                </div>
                
                <v-btn 
                  block 
                  color="primary" 
                  variant="text" 
                  class="mt-3"
                  @click.stop="goToAthleteDetail(athlete.user_id)"
                >
                  Manage Athlete Profile & Goals
                  <v-icon right>mdi-arrow-right</v-icon>
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Add Athlete Dialog -->
    <v-dialog v-model="showAddAthleteDialog" max-width="700px">
      <v-card>
        <v-card-title class="bg-primary text-white">
          <span class="text-h5">Add New Athlete</span>
          <v-spacer></v-spacer>
          <v-btn icon @click="closeAddAthleteDialog" variant="text" color="white">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="newAthlete.first_name"
                  label="First Name *"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="newAthlete.last_name"
                  label="Last Name *"
                  variant="outlined"
                  required
                ></v-text-field>
              </v-col>
            </v-row>

            <v-text-field
              v-model="newAthlete.email"
              label="Email *"
              type="email"
              variant="outlined"
              required
              class="mb-3"
            ></v-text-field>

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
                <v-select
                  v-model="newAthlete.gender"
                  label="Gender"
                  :items="['Male', 'Female', 'Other']"
                  variant="outlined"
                ></v-select>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="newAthlete.sport_type"
                  label="Sport Type"
                  variant="outlined"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-text-field
              v-model="newAthlete.team"
              label="Team"
              variant="outlined"
              class="mb-3"
            ></v-text-field>

            <v-textarea
              v-model="newAthlete.bio"
              label="Bio"
              variant="outlined"
              rows="3"
            ></v-textarea>
            
            <v-alert type="info" variant="tonal" class="mt-3">
              <strong>Note:</strong> Once added, you can manage this athlete's profile, exercise goals, and track their progress from the athlete detail page.
            </v-alert>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeAddAthleteDialog">
            Cancel
          </v-btn>
          <v-btn 
            color="primary" 
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
.cursor-pointer {
  cursor: pointer;
}
</style>