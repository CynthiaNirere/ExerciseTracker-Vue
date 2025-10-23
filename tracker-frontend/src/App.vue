<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import MenuBar from "./components/MenuBar.vue";

const store = useStore()
const route = useRoute()

// Show MenuBar only when user is authenticated
const isAuthenticated = computed(() => store.state.currentUser || store.state.loginUser)
</script>

<template>
  <v-app>
    <MenuBar v-if="isAuthenticated" :key="route.fullPath" />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>