import apiClient from "./services";

export default {
  // ========================================
  // Coach-Athlete Management
  // ========================================
  
  // Get all athletes for a specific coach
  getAthletesByCoach(coachId) {
    return apiClient.get(`/coach/${coachId}/athletes`);
  },
  
  // Get specific athlete details
  getAthleteById(athleteId) {
    return apiClient.get(`/coach/athlete/${athleteId}`);
  },
  
  // Create new athlete (by coach)
  createAthlete(data) {
    return apiClient.post("/coach/athletes", data);
  },
  
  // Update athlete profile
  updateAthlete(athleteId, data) {
    return apiClient.put(`/athletes/${athleteId}`, data);
  },
  
  // Delete athlete
  deleteAthlete(athleteId) {
    return apiClient.delete(`/athletes/${athleteId}`);
  },
  
  // Assign athlete to coach
  assignAthleteToCoach(athleteEmail, coachId, notes) {
    return apiClient.post("/coach/athletes/assign", {
      athleteEmail,
      coachId,
      notes
    });
  },
  
  // ========================================
  // Athlete Profile
  // ========================================
  
  getAthleteProfile() {
    return apiClient.get(`/athletes/profile`);
  },
  
  updateAthleteProfile(profileData) {
    return apiClient.put(`/athletes/profile`, profileData);
  },
  
  createAthleteProfile(profileData) {
    return apiClient.put(`/athletes/profile`, profileData);
  },
  
  getAthleteWorkoutHistory(athleteId) {
    return apiClient.get(`/athletes/${athleteId}/workouts`);
  },
  
  // ========================================
  // Goals
  // ========================================
  
  getGoals() {
    return apiClient.get(`/athletes/goals`);
  },
  
  createGoal(goalData) {
    return apiClient.post(`/athletes/goals`, goalData);
  },
  
  updateGoal(goalId, goalData) {
    return apiClient.put(`/athletes/goals/${goalId}`, goalData);
  },
  
  deleteGoal(goalId) {
    return apiClient.delete(`/athletes/goals/${goalId}`);
  },
  
  // ✨ NEW: Get exercises from assigned plans
  getAssignedPlanExercises() {
    return apiClient.get(`/athletes/assigned-plan-exercises`);
  },
  
  // ========================================
  // Exercise Results
  // ========================================
  
  getExerciseResults() {
    return apiClient.get(`/athletes/results`);
  },
  
  recordExerciseResult(resultData) {
    return apiClient.post(`/athletes/results`, resultData);
  },
  
  // ========================================
  // Statistics & Progress
  // ========================================
  
  getStatistics() {
    return apiClient.get(`/athletes/statistics`);
  },
  
  getProgress() {
    return apiClient.get(`/athletes/progress`);
  }
};