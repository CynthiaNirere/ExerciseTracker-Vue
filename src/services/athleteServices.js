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
    return apiClient.get(`/coach/athlete/${athleteId}`);  // ✅ FIXED
  },
  
  // Create new athlete (by coach)
  createAthlete(data) {
    return apiClient.post("/coach/athletes", data);  // ✅ FIXED
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