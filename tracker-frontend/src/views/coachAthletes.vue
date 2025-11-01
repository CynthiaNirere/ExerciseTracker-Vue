<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import Utils from '../config/utils'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const store = useStore()

const currentUser = computed(() => store.state.currentUser || store.state.loginUser)
const user = ref(null)

const athletes = ref([])
const loading = ref(true)
const showAddAthleteModal = ref(false)
const newAthlete = ref({
  email: '',
  notes: ''
})
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const loadAthletes = async () => {
  try {
    loading.value = true
    
    // Get token from user object in localStorage
    const user = Utils.getStore("user")
    const token = user?.token // ← Get token from user object
    
    if (!token) {
      console.log('❌ No token found')
      router.push('/')
      return
    }

    console.log('🔄 Loading athletes with token...')
    const response = await axios.get('http://localhost:3021/tracker-t1/api/coach/athletes', { // ← Also fix the port!
      headers: { Authorization: `Bearer ${token}` }
    })

    athletes.value = response.data
    loading.value = false
    console.log('✅ Athletes loaded:', athletes.value.length)
  } catch (error) {
    console.error('❌ Error loading athletes:', error)
    loading.value = false
  }
}

const openAddAthleteModal = () => {
  console.log('✅ MODAL OPENING - showAddAthleteModal set to TRUE')
  showAddAthleteModal.value = true
}

const closeAddAthleteModal = () => {
  console.log('❌ MODAL CLOSING')
  showAddAthleteModal.value = false
  newAthlete.value = { email: '', notes: '' }
  errorMessage.value = ''
  successMessage.value = ''
  
  if (route.query.action === 'add') {
    router.replace({ path: route.path, query: {} })
  }
}

const handleAddAthlete = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  submitting.value = true

  try {
    const user = Utils.getStore("user") // ← Add this
    const token = user?.token // ← Get token from user
    
    await axios.post(
      'http://localhost:3021/tracker-t1/api/coach/athletes/assign',
      {
        athleteEmail: newAthlete.value.email,
        notes: newAthlete.value.notes
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    successMessage.value = 'Athlete added successfully!'
    await loadAthletes()

    setTimeout(() => {
      closeAddAthleteModal()
    }, 1500)

  } catch (error) {
    console.error('Error adding athlete:', error)
    errorMessage.value = error.response?.data?.message || 'Failed to add athlete. Please try again.'
  } finally {
    submitting.value = false
  }
}

const getInitials = (name) => {
  if (!name) return 'A'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

const goToDashboard = () => {
  router.push({ name: 'coachDashboard' }) 
}

const logout = () => {
  store.commit('setCurrentUser', null)
  store.commit('setLoginUser', null)
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/')
}

onMounted(() => {
  user.value = Utils.getStore("user") || currentUser.value

  console.log('🎯 CoachAthletes mounted')
  console.log('👤 Current user:', user.value)
  console.log('📍 Route query:', route.query)

  if (!user.value) {
    console.log('❌ No user found, redirecting to login')
    router.push('/')
  } else if (user.value.role !== 'coach') {
    console.log('❌ User is not a coach:', user.value.role)
    alert('Access denied. Coach role required.')
    router.push('/')
  } else {
    console.log('✅ Coach authenticated successfully!')
    loadAthletes()
    
    // Check for query parameter
    console.log('🔍 Checking for action query param...')
    if (route.query.action === 'add') {
      console.log('🎯 FOUND action=add - AUTO-OPENING MODAL!')
      setTimeout(() => {
        showAddAthleteModal.value = true
        console.log('✅ Modal value set to:', showAddAthleteModal.value)
      }, 100)
    } else {
      console.log('ℹ️ No action query param found')
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Simple Header -->
    <header class="bg-white border-b border-gray-200 py-4">
      <div class="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <h1 class="text-xl font-bold">Athletes Management</h1>
        <div class="flex items-center space-x-4">
          <button @click="goToDashboard" class="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Dashboard
          </button>
          <button @click="logout" class="text-sm text-red-600 hover:text-red-700">
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8">
      <div class="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">My Athletes</h2>
            <p class="text-gray-500 mt-1">Manage your athletes</p>
          </div>
          <button
            @click="openAddAthleteModal"
            class="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="font-semibold">Add Athlete</span>
          </button>
        </div>

        <!-- Debug Info -->
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p class="text-xs text-blue-800">
            <strong>Debug:</strong> Modal State = {{ showAddAthleteModal ? 'OPEN' : 'CLOSED' }} | 
            Route Query = {{ JSON.stringify(route.query) }}
          </p>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600">Loading...</p>
        </div>

        <!-- Athletes List -->
        <div v-else-if="athletes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="athlete in athletes"
            :key="athlete.id"
            class="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold">
                {{ getInitials(athlete.name || athlete.email) }}
              </div>
              <div>
                <h3 class="font-bold text-gray-900">{{ athlete.name || 'Athlete' }}</h3>
                <p class="text-sm text-gray-500">{{ athlete.email }}</p>
              </div>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Active Goals:</span>
                <span class="font-semibold">{{ athlete.activeGoals || 0 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Workouts:</span>
                <span class="font-semibold">{{ athlete.totalWorkouts || 0 }}</span>
              </div>
              <div class="pt-2 border-t border-gray-200">
                <p class="text-xs text-gray-400">Last: {{ formatDate(athlete.lastActivity) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <h3 class="text-lg font-semibold text-gray-900">No athletes yet</h3>
          <p class="mt-2 text-gray-500">Add your first athlete to get started</p>
          <button
            @click="openAddAthleteModal"
            class="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Add First Athlete
          </button>
        </div>
      </div>
    </main>

    <!-- MODAL -->
    <div
      v-if="showAddAthleteModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeAddAthleteModal"
    >
      <div class="bg-white rounded-2xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold">Add Athlete</h3>
          <button @click="closeAddAthleteModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleAddAthlete">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Athlete Email *</label>
              <input
                v-model="newAthlete.email"
                type="email"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="athlete@example.com"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                v-model="newAthlete.notes"
                rows="3"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add notes..."
              ></textarea>
            </div>
          </div>

          <div v-if="errorMessage" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ errorMessage }}</p>
          </div>

          <div v-if="successMessage" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-sm text-green-600">{{ successMessage }}</p>
          </div>

          <div class="mt-6 flex space-x-3">
            <button
              type="button"
              @click="closeAddAthleteModal"
              class="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {{ submitting ? 'Adding...' : 'Add Athlete' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>