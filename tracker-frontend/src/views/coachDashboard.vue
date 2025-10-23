<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Utils from '../config/utils'

const router = useRouter()
const store = useStore()

const currentUser = computed(() => store.state.currentUser || store.state.loginUser)

const logout = () => {
  console.log('🚪 Logging out from Coach Dashboard...')
  
  // Clear all user data
  store.commit('setCurrentUser', null)
  store.commit('setLoginUser', null)
  Utils.removeItem('user')
  
  console.log(' User data cleared, redirecting to login')
  router.push('/')
}

onMounted(() => {
  console.log(' CoachDashboard mounted')
  console.log(' Current user:', currentUser.value)
  
  if (!currentUser.value) {
    console.log(' No user found, redirecting to login')
    router.push('/')
  } else if (currentUser.value.role !== 'coach') {
    console.log(' User is not a coach:', currentUser.value.role)
    alert('Access denied. Coach role required.')
    router.push('/')
  } else {
    console.log(' Coach authenticated successfully!')
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    
    <main class="max-w-7xl mx-auto px-6 py-8">
      <div class="bg-white rounded-lg border border-gray-200 p-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">
           Welcome, Coach {{ currentUser?.first_name || currentUser?.fName }}!
        </h2>
        <p class="text-gray-600 mb-4">
          You have successfully logged in to the Coach Dashboard.
        </p>
        
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="text-sm text-green-800 space-y-1">
            <p><strong>Name:</strong> {{ currentUser?.first_name || currentUser?.fName }} {{ currentUser?.last_name || currentUser?.lName }}</p>
            <p><strong>Email:</strong> {{ currentUser?.email }}</p>
            <p><strong>Role:</strong> {{ currentUser?.role }}</p>
            <p><strong>User ID:</strong> {{ currentUser?.user_id || currentUser?.id }}</p>
          </div>
        </div>
 
      </div>
    </main>
  </div>
</template>