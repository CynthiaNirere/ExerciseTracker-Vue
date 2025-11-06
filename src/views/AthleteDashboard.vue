<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Utils from "../config/utils";

const router = useRouter();
const user = ref(null);

onMounted(() => {
  user.value = Utils.getStore("user");
});
</script>

<template>
  <v-container>
    <v-toolbar color="success" dark>
      <v-toolbar-title>Athlete Dashboard</v-toolbar-title>
    </v-toolbar>
    <br />
    <v-alert type="info">
      Welcome, {{ user?.fName }} {{ user?.lName }}!
    </v-alert>
    <br />
    <v-row>
      <v-col cols="12" md="4">
        <v-card @click="router.push({ name: 'athleteProfile' })" hover>
          <v-card-title class="text-h5">
            <v-icon left>mdi-account-edit</v-icon>
            Edit Profile
          </v-card-title>
          <v-card-text>Update your personal information</v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card @click="router.push({ name: 'recordExercise' })" hover>
          <v-card-title class="text-h5">
            <v-icon left>mdi-dumbbell</v-icon>
            Record Exercise
          </v-card-title>
          <v-card-text>Log your workout results</v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card @click="router.push({ name: 'athleteGoals' })" hover>
          <v-card-title class="text-h5">
            <v-icon left>mdi-target</v-icon>
            Manage Goals
          </v-card-title>
          <v-card-text>Add, edit, or delete your goals</v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card @click="router.push({ name: 'viewExerciseResults' })" hover>
          <v-card-title class="text-h5">
            <v-icon left>mdi-chart-line</v-icon>
            Exercise Results
          </v-card-title>
          <v-card-text>View your workout history</v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card @click="router.push({ name: 'viewProgress' })" hover>
          <v-card-title class="text-h5">
            <v-icon left>mdi-progress-check</v-icon>
            Goal Progress
          </v-card-title>
          <v-card-text>Track your progress towards goals</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-5px);
}
</style>