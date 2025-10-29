<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import Utils from '../config/utils'

const router = useRouter()
const route = useRoute()
const store = useStore()

const currentUser = computed(() => store.state.currentUser || store.state.loginUser)

const goToAthletes = () => {
  console.log('🏃 Navigating to Athletes page...')
  router.push('/coach/athletes')
}

const goToAddAthlete = () => {
  console.log('➕ Navigating to Add Athlete...')
  // Navigate to athletes page with a query parameter to auto-open modal
  router.push({ path: '/coach/athletes', query: { action: 'add' } })
}

const logout = () => {
  console.log('🚪 Logging out from Coach Dashboard...')
  
  // Clear all user data
  store.commit('setCurrentUser', null)
  store.commit('setLoginUser', null)
  Utils.removeItem('user')
  localStorage.removeItem('token')
  
  console.log('✅ User data cleared, redirecting to login')
  router.push('/')
}

onMounted(() => {
  console.log('🏠 CoachDashboard mounted')
  console.log('👤 Current user:', currentUser.value)
  
  if (!currentUser.value) {
    console.log('❌ No user found, redirecting to login')
    router.push('/')
  } else if (currentUser.value.role !== 'coach') {
    console.log('❌ User is not a coach:', currentUser.value.role)
    alert('Access denied. Coach role required.')
    router.push('/')
  } else {
    console.log('✅ Coach authenticated successfully!')
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <main class="max-w-7xl mx-auto px-6 py-8">
      <!-- Navigation Tabs -->
      <div class="mb-8">
        <div class="inline-flex bg-white rounded-full p-1 shadow-sm">
          <button
            @click="goToAthletes"
            class="px-6 py-2 rounded-full text-sm font-medium bg-white text-gray-900 shadow-sm"
          >
            Athletes
          </button>
          <button
            class="px-6 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700"
            disabled
          >
            Exercises
          </button>
          <button
            class="px-6 py-2 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700"
            disabled
          >
            Plans
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm relative">
        <!-- Header with Add Button -->
        <div class="mb-8">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">My Athletes</h2>
              <p class="text-gray-500 mt-1">View and manage your athletes</p>
            </div>
            <button
              @click="goToAddAthlete"
              class="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="font-semibold">Add Athlete</span>
            </button>
          </div>
        </div>

        <!-- Athletes Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Athlete Card 1 -->
          <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" @click="goToAthletes">
            <div class="flex items-center space-x-4 mb-6">
              <div class="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold text-lg">
                SW
              </div>
              <div>
                <h3 class="font-bold text-gray-900 text-lg">Sarah Williams</h3>
                <p class="text-gray-500 text-sm">athlete@example.com</p>
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Active Goals</span>
                <span class="text-gray-900 font-semibold">2</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Total Workouts</span>
                <span class="text-gray-900 font-semibold">4</span>
              </div>
            </div>
            
            <div class="mt-6 pt-4 border-t border-gray-200">
              <p class="text-gray-400 text-sm">Last activity: 10/14/2024</p>
            </div>
          </div>

          <!-- Athlete Card 2 -->
          <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" @click="goToAthletes">
            <div class="flex items-center space-x-4 mb-6">
              <div class="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold text-lg">
                JD
              </div>
              <div>
                <h3 class="font-bold text-gray-900 text-lg">John Davis</h3>
                <p class="text-gray-500 text-sm">john@example.com</p>
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Active Goals</span>
                <span class="text-gray-900 font-semibold">1</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Total Workouts</span>
                <span class="text-gray-900 font-semibold">1</span>
              </div>
            </div>
            
            <div class="mt-6 pt-4 border-t border-gray-200">
              <p class="text-gray-400 text-sm">Last activity: 10/15/2024</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>