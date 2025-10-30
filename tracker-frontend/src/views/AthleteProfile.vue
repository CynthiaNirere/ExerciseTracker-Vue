<script setup>
import { ref, onMounted } from "vue";
import UserServices from "../services/userServices";
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
    
    profile.value = {
      fName: user.value.fName || "",
      lName: user.value.lName || "",
      email: user.value.email || "",
    };
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
    await UserServices.updateUser(user.value.userId, profile.value);
    // Update local storage
    const updatedUser = { ...user.value, ...profile.value };
    Utils.setStore("user", updatedUser);
    user.value = updatedUser;
    message.value = "Profile updated successfully";
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
          <v-text-field
            v-model="profile.fName"
            label="First Name"
            :counter="50"
            required
          ></v-text-field>

          <v-text-field
            v-model="profile.lName"
            label="Last Name"
            :counter="50"
            required
          ></v-text-field>

          <v-text-field
            v-model="profile.email"
            label="Email"
            type="email"
            required
          ></v-text-field>
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
          Save Changes
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>