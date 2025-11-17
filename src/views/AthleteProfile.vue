<script setup>
import { ref, onMounted } from "vue";
import UserServices from "../services/userServices";
import AthleteServices from "../services/athleteServices";
import Utils from "../config/utils";
import { useRouter } from "vue-router";

const router = useRouter();
const valid = ref(true);
const user = ref(null);
const loading = ref(true);

const profile = ref({
  fName: "",
  lName: "",
  email: "",
  bio: ""
});

const message = ref("");

// Load current user profile
const loadProfile = async () => {
  try {
    user.value = Utils.getStore("user");
    if (!user.value || !user.value.userId) {
      message.value = "Error: User not logged in";
      router.push({ name: "login" });
      return;
    }
    
    // Load user basic info
    profile.value.fName = user.value.fName || "";
    profile.value.lName = user.value.lName || "";
    profile.value.email = user.value.email || "";
    
    // Load athlete profile data (just bio)
    try {
      const athleteResponse = await AthleteServices.getAthleteProfile();
      console.log("Athlete profile loaded:", athleteResponse.data);
      
      if (athleteResponse.data) {
        profile.value.bio = athleteResponse.data.bio || "";
      }
    } catch (athleteError) {
      console.log("No athlete profile found, will create on save");
    }
    
    loading.value = false;
  } catch (error) {
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
    // Just update bio in athlete profile
    const athleteUpdate = {
      bio: profile.value.bio
    };
    
    await AthleteServices.updateAthleteProfile(athleteUpdate);
    
    // Note: We're skipping user update (name/email) since the backend route has issues
    // Athletes can contact admin to update name/email
    
    message.value = "Bio updated successfully! Contact admin to update name/email.";
  } catch (error) {
    message.value = "Error updating profile: " + (error.response?.data?.message || error.message);
    console.error("Update error:", error);
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
    </v-toolbar>
    
    <br />
    
    <!-- Message Display -->
    <v-alert
      v-if="message"
      :type="message.includes('Error') ? 'error' : 'success'"
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
                hint="Contact admin to change"
                persistent-hint
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="profile.lName"
                label="Last Name"
                :counter="50"
                readonly
                hint="Contact admin to change"
                persistent-hint
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-text-field
            v-model="profile.email"
            label="Email"
            type="email"
            readonly
            hint="Contact admin to change"
            persistent-hint
            class="mb-4"
          ></v-text-field>
          
          <v-textarea
            v-model="profile.bio"
            label="Bio"
            rows="4"
            hint="Tell us about yourself (you can edit this)"
            persistent-hint
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
          Save 
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>