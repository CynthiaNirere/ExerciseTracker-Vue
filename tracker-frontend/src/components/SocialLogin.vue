<script setup>
import { ref, onMounted } from "vue";
import AuthServices from "../services/authServices.js";
import Utils from "../config/utils.js";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const router = useRouter();
const store = useStore();
const fName = ref("");
const lName = ref("");
const user = ref({});

const loginWithGoogle = () => {
  // Set up global callback for Google
  window.handleCredentialResponse = handleCredentialResponse;
  
  // Get Google Client ID from environment variables
  const client = import.meta.env.VITE_APP_CLIENT_ID;
  console.log(' Google Client ID:', client);
  
  // Initialize Google Sign-In
  window.google.accounts.id.initialize({
    client_id: client,
    cancel_on_tap_outside: false,
    auto_select: true,
    callback: window.handleCredentialResponse,
  });
  
  // Render the Google Sign-In button
  window.google.accounts.id.renderButton(document.getElementById("parent_id"), {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "signup_with",
    width: 400,
  });
};

const handleCredentialResponse = async (response) => {
  console.log(' Google sign-in response received');
  
  let token = {
    credential: response.credential,
  };
  
  await AuthServices.loginUser(token)
    .then((response) => {
      console.log(' Backend response:', response.data);
      
      // Store user data
      user.value = response.data;
      Utils.setStore("user", user.value);
      fName.value = user.value.fName;
      lName.value = user.value.lName;
      
      // Create user object matching database structure
      const userData = {
        user_id: user.value.user_id || user.value.id,
        first_name: user.value.fName || user.value.first_name,
        last_name: user.value.lName || user.value.last_name,
        email: user.value.email,
        role: user.value.role || 'athlete',
        created_at: user.value.created_at || new Date().toISOString().split('T')[0]
      };
      
      console.log(' User data prepared:', userData);
      
      // Update Vuex store with user data
      store.commit('setLoginUser', userData);
      store.commit('setCurrentUser', userData);
      
      console.log(' User stored in Vuex');
      console.log(' Redirecting based on role:', userData.role);
      
      if (userData.role === 'coach') {
        console.log(' Redirecting to coach-dashboard');
        router.push({ name: 'coach-dashboard' });
      } else {
        // For now, redirect everyone to coach-dashboard since other routes don't exist yet
        console.log(' Redirecting to coach-dashboard (fallback - other routes not yet implemented)');
        router.push({ name: 'coach-dashboard' });
      }
      
      //  UNCOMMENT THESE WHEN YOU CREATE THE OTHER DASHBOARDS:
      // else if (userData.role === 'athlete') {
      //   console.log(' Redirecting to athlete-dashboard');
      //   router.push({ name: 'athlete-dashboard' });
      // } else if (userData.role === 'admin') {
      //   console.log(' Redirecting to admin dashboard');
      //   router.push({ name: 'dashboard' });
      // } else {
      //   console.log(' Redirecting to tutorials (fallback)');
      //   router.push({ name: 'tutorials' });
      // }
    })
    .catch((error) => {
      console.error(" Login error:", error);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'An unknown error occurred';
      
      alert('Login failed: ' + errorMessage);
    });
};

onMounted(() => {
  // Check if Google API is loaded
  if (window.google) {
    loginWithGoogle();
  } else {
    console.error('Google Identity Services not loaded');
    alert('Google Sign-In is not available. Please refresh the page.');
  }
});
</script>

<template>
  <div class="signup-buttons">
    <v-row justify="center">
      <div display="flex" id="parent_id"></div>
    </v-row>
  </div>
</template>