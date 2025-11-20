import apiClient from "./services";

export default {
  // ========================================
  // Coach-Athlete Management
  // ========================================
  
  // Get all athletes for a specific coach
  getAthletesByCoach(coachId) {
    return apiClient.get(`/coach/${coachId}/athletes`);  // ✅ FIXED
  },
  
  // Get specific athlete details
  getAthleteById(athleteId) {
    return apiClient.get(`/coach/athlete/${athleteId}`);  // ✅ FIXED
  },
  
  // Create new athlete (by coach)
  createAthlete(data) {
    return apiClient.post("/coach/athletes", data);
  },
  
  // Update athlete profile
  updateAthlete(athleteId, data) {
    return apiClient.put(`/athletes/${athleteId}`, data);  // ✅ FIXED
  },
  
  // Delete athlete
  deleteAthlete(athleteId) {
    return apiClient.delete(`/athletes/${athleteId}`);  // ✅ FIXED
  },
  
  // Assign athlete to coach
  assignAthleteToCoach(athleteEmail, coachId, notes) {
    return apiClient.post("/coach/athletes/assign", {
      athleteEmail,
      coachId,
      notes
    });
  },
  
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
  }
};