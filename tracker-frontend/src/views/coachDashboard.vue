<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Utils from '../config/utils'

const router = useRouter()
const store = useStore()

const currentUser = computed(() => store.state.currentUser || store.state.loginUser)

const logout = () => {
  store.commit('setCurrentUser', null)
  store.commit('setLoginUser', null)
  Utils.removeItem('user')
  router.push('/')
}

onMounted(() => {
  if (!currentUser.value) {
    router.push('/')
  } else if (currentUser.value.role !== 'coach') {
    alert('Access denied. Coach role required.')
    router.push('/')
  }
})
</script>
<template>
  <div class="min-h-screen bg-gray-50">
    <div style="background: yellow; color: black; padding: 10px; font-weight: bold;">TEST: CoachDashboard.vue is rendering!</div>
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
