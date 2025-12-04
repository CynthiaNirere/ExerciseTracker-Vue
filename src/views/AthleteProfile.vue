<script setup>
import { ref, onMounted } from "vue";
import athleteServices from "../services/athleteServices";
import Utils from "../config/utils";
import { useRouter } from "vue-router";

const router = useRouter();
const valid = ref(true);
const user = ref(null);
const loading = ref(true);
const debugInfo = ref("");

const profile = ref({
  fName: "",
  lName: "",
  email: "",
  bio: ""
});

const message = ref("");
const showDebug = ref(false);

// Load current user profile
const loadProfile = async () => {
  try {
    user.value = Utils.getStore("user");
    debugInfo.value += ` User from localStorage: ${JSON.stringify(user.value)}\n`;
    
    if (!user.value || !user.value.userId) {
      message.value = "Error: User not logged in";
      router.push({ name: "login" });
      return;
    }
    
    // Load user basic info
    profile.value.fName = user.value.fName || "";
    profile.value.lName = user.value.lName || "";
    profile.value.email = user.value.email || "";
    
    debugInfo.value += `Loading profile for athlete ID: ${user.value.userId}\n`;
    
    // Load athlete profile (bio)
    try {
      const athleteResponse = await athleteServices.getAthleteProfile();
      debugInfo.value += ` Profile API response: ${JSON.stringify(athleteResponse.data)}\n`;
      
      if (athleteResponse.data) {
        profile.value.bio = athleteResponse.data.bio || "";
        debugInfo.value += ` Bio loaded successfully: "${profile.value.bio}"\n`;
      } else {
        debugInfo.value += ` No profile data returned\n`;
        message.value = "Profile exists but no data returned.";
      }
    } catch (athleteError) {
      debugInfo.value += ` Profile API error: ${athleteError.message}\n`;
      debugInfo.value += ` Status: ${athleteError.response?.status}\n`;
      debugInfo.value += ` Response: ${JSON.stringify(athleteError.response?.data)}\n`;
      
      if (athleteError.response?.status === 404) {
        message.value = "No profile found yet. Create one by saving your bio below.";
      } else {
        message.value = `Error loading profile: ${athleteError.response?.data?.message || athleteError.message}`;
      }
    }
    
    loading.value = false;
  } catch (error) {
    debugInfo.value += ` General error: ${error.message}\n`;
    message.value = "Error loading profile: " + error.message;
    loading.value = false;
  }
};

// Update profile
const updateProfile = async () => {
  if (!user.value || !user.value.userId) {
    message.value = "Error: User not found";
    return;
  }
  
  try {
    debugInfo.value += `\n Attempting to update bio...\n`;
    debugInfo.value += `New bio: "${profile.value.bio}"\n`;
    
    const athleteUpdate = { bio: profile.value.bio };
    
    const response = await athleteServices.updateAthleteProfile(athleteUpdate);
    debugInfo.value += ` Update response: ${JSON.stringify(response.data)}\n`;
    
    message.value = "Bio updated successfully!";
    
    // Reload to verify
    setTimeout(async () => {
      await loadProfile();
    }, 1000);
    
  } catch (error) {
    debugInfo.value += `Update error: ${error.message}\n`;
    debugInfo.value += ` Response: ${JSON.stringify(error.response?.data)}\n`;
    
    message.value = "Error updating profile: " + (error.response?.data?.message || error.message);
  }
};

const cancel = () => {
  router.push({ name: "athleteDashboard" });
};

onMounted(() => {
  loadProfile();
});
</script>

<template>
  <v-container>
    <v-toolbar color="success">
      <v-btn icon @click="cancel">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="text-white">Edit Profile</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    
    <br />
    
    <!-- Debug Panel -->
    <v-card v-if="showDebug" class="mb-4" color="grey-lighten-4">
      <v-card-title class="text-h6 bg-warning">
         Debug Information
      </v-card-title>
      <v-card-text>
        <pre style="white-space: pre-wrap; font-family: monospace; font-size: 11px; max-height: 400px; overflow-y: auto;">{{ debugInfo }}</pre>
      </v-card-text>
      <v-card-actions>
        <v-btn size="small" color="primary" @click="loadProfile">
          <v-icon left>mdi-refresh</v-icon>
          Reload Profile
        </v-btn>
        <v-btn size="small" @click="debugInfo = ''">
          <v-icon left>mdi-delete</v-icon>
          Clear Logs
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn size="small" @click="showDebug = false">Close</v-btn>
      </v-card-actions>
    </v-card>
    
    <!-- Message Display -->
    <v-alert
      v-if="message"
      :type="message.includes('Error') ? 'error' : message.includes('successfully') ? 'success' : 'info'"
      closable
      @click:close="message = ''"
    >
      {{ message }}
    </v-alert>
    
    <!-- Loading State -->
    <v-card v-if="loading">
      <v-card-text class="text-center">
        <v-progress-circular indeterminate color="success"></v-progress-circular>
        <p class="mt-4">Loading profile...</p>
      </v-card-text>
    </v-card>
    
    <!-- Profile Form -->
    <v-card v-else>
      <v-card-text>
        <v-form v-model="valid">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="profile.fName"
                label="First Name"
                :counter="50"
                readonly
                hint="Contact your coach or admin to change"
                persistent-hint
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="profile.lName"
                label="Last Name"
                :counter="50"
                readonly
                hint="Contact your coach or admin to change"
                persistent-hint
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-text-field
            v-model="profile.email"
            label="Email"
            type="email"
            readonly
            hint="Contact your coach or admin to change"
            persistent-hint
            class="mb-4"
          ></v-text-field>
          
          <v-textarea
            v-model="profile.bio"
            label="Bio"
            rows="4"
            hint="Tell us about yourself, your fitness goals, or training history"
            persistent-hint
            :placeholder="profile.bio ? '' : 'Enter your bio here...'"
          ></v-textarea>
        
        </v-form>
      </v-card-text>
      
      <v-card-actions>
       
        <v-spacer></v-spacer>
        <v-btn color="error" @click="cancel">Cancel</v-btn>
        <v-btn
          color="success"
          :disabled="!valid"
          @click="updateProfile"
        >
          <v-icon left>mdi-content-save</v-icon>
          Save Bio
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>