import apiClient from "./services";

export default {
  // Create a new exercise result
  createExerciseResult(data) {
    return apiClient.post("/exercises", data);
  },

  // Get all exercise results
  getAllExerciseResults() {
    return apiClient.get("/exercises");
  },

  // Get exercise results by athlete ID
  getExerciseResultsByAthlete(athleteId) {
    return apiClient.get(`/exercises/athlete/${athleteId}`);
  },

  // Get a single exercise result by ID
  getExerciseResultById(id) {
    return apiClient.get(`/exercises/${id}`);
  },

  // Update an exercise result
  updateExerciseResult(id, data) {
    return apiClient.put(`/exercises/${id}`, data);
  },

  // Delete an exercise result
  deleteExerciseResult(id) {
    return apiClient.delete(`/exercises/${id}`);
  },

  // Get exercise results by date range
  getExerciseResultsByDateRange(athleteId, startDate, endDate) {
    return apiClient.get(`/exercises/athlete/${athleteId}/daterange`, {
      params: { startDate, endDate }
    });
  },

  // Get exercise statistics for an athlete
  getExerciseStatistics(athleteId) {
    return apiClient.get(`/exercises/athlete/${athleteId}/statistics`);
  }
};