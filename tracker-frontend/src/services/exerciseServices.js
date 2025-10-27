import apiClient from "./services.js";

export default {
  // Get all exercises
  getAllExercises() {
    return apiClient.get("/exercises");
  },
  
  // Get exercise by ID
  getExercise(id) {
    return apiClient.get(`/exercises/${id}`);
  },
  
  // Get exercises by category
  getExercisesByCategory(category) {
    return apiClient.get(`/exercises/category/${category}`);
  },
  
  // Create new exercise
  createExercise(exercise) {
    return apiClient.post("/exercises", exercise);
  },
  
  // Update exercise
  updateExercise(id, exercise) {
    return apiClient.put(`/exercises/${id}`, exercise);
  },
  
  // Delete exercise
  deleteExercise(id) {
    return apiClient.delete(`/exercises/${id}`);
  }
};
