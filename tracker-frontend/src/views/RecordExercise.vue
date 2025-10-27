<script setup>
import { ref, onMounted } from "vue";
import ExerciseServices from "../services/exerciseServices";
import Utils from "../config/utils";
import { useRouter } from "vue-router";

const router = useRouter();
const valid = ref(true);
const user = ref(null);
const exerciseResult = ref({
  exerciseName: "",
  date: new Date().toISOString().substr(0, 10),
  duration: null,
  reps: null,
  sets: null,
  weight: null,
  distance: null,
  notes: "",
});
const message = ref("");

// Exercise type options
const exerciseTypes = [
  "Running",
  "Cycling",
  "Swimming",
  "Weightlifting",
  "Cardio",
  "Yoga",
  "Other"
];

// Save exercise result
const saveExercise = async () => {
  try {
    const data = {
      ...exerciseResult.value,
      athleteId: user.value.id
    };
    await ExerciseServices.createExerciseResult(data);
    message.value = "Exercise result recorded successfully";
    // Reset form
    exerciseResult.value = {
      exerciseName: "",
      date: new Date().toISOString().substr(0, 10),
      duration: null,
      reps: null,
      sets: null,
      weight: null,
      distance: null,
      notes: "",
    };
  } catch (error) {
    message.value = "Error recording exercise: " + (error.response?.data?.message || error.message);
  }
};

const cancel = () => {
  router.push({ name: "athleteDashboard" });
};

onMounted(() => {
  user.value = Utils.getStore("user");
});
</script>

<template>
  <v-container>
    <v-toolbar color="success">
      <v-btn icon @click="cancel">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title class="text-white">Record Exercise Results</v-toolbar-title>
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

    <!-- Exercise Form -->
    <v-card>
      <v-card-text>
        <v-form v-model="valid">
          <v-select
            v-model="exerciseResult.exerciseName"
            :items="exerciseTypes"
            label="Exercise Type"
            required
          ></v-select>

          <v-text-field
            v-model="exerciseResult.date"
            label="Date"
            type="date"
            required
          ></v-text-field>

          <v-text-field
            v-model.number="exerciseResult.duration"
            label="Duration (minutes)"
            type="number"
            min="0"
          ></v-text-field>

          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model.number="exerciseResult.sets"
                label="Sets"
                type="number"
                min="0"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.number="exerciseResult.reps"
                label="Reps"
                type="number"
                min="0"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-text-field
            v-model.number="exerciseResult.weight"
            label="Weight (lbs)"
            type="number"
            min="0"
            step="0.1"
          ></v-text-field>

          <v-text-field
            v-model.number="exerciseResult.distance"
            label="Distance (miles)"
            type="number"
            min="0"
            step="0.1"
          ></v-text-field>

          <v-textarea
            v-model="exerciseResult.notes"
            label="Notes"
            rows="3"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" @click="cancel">Cancel</v-btn>
        <v-btn
          color="success"
          :disabled="!valid"
          @click="saveExercise"
        >
          Save Exercise
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>