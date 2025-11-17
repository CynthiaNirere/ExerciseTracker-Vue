import apiClient from "./services";

export default {

  
  getExerciseResultsByAthlete(athleteId) {
    const userId = athleteId || JSON.parse(localStorage.getItem('user'))?.userId;
    if (!userId) {
      return Promise.reject(new Error('User ID not found'));
    }
    return apiClient.get(`/exercises/athlete/${userId}`);
  },

  recordExerciseResult(data) {
    const payload = {
      athleteId: data.athleteId,
      exerciseId: data.exerciseId,
      performedDate: data.performedDate,
      setsDone: data.setsDone || null,
      repsDone: data.repsDone || null,
      weightUsed: data.weightUsed || null,
      durationSeconds: data.durationMinutes ? data.durationMinutes * 60 : null,
      notes: data.notes || null
    };
    
    console.log('Recording exercise result:', payload);
    return apiClient.post("/exercises", payload);
  },

  getAthleteStatistics(athleteId) {
    const userId = athleteId || JSON.parse(localStorage.getItem('user'))?.userId;
    if (!userId) {
      return Promise.reject(new Error('User ID not found'));
    }
    return apiClient.get(`/exercises/athlete/${userId}/statistics`);
  },

  
  
  getAllExercises() {
    return apiClient.get("/exercises/list");
  },

  getExerciseById(id) {
    return apiClient.get(`/exercises/exercise/${id}`);
  },

  createExercise(data) {
    return apiClient.post("/exercises/manage", data);
  },

  updateExercise(id, data) {
    return apiClient.put(`/exercises/manage/${id}`, data);
  },

  deleteExercise(id) {
    return apiClient.delete(`/exercises/manage/${id}`);
  },

  // ========================================
  // Coach-specific methods
  // ========================================

  // Get exercises created by a specific coach
  getExercisesByCoach(coachId) {
    return apiClient.get(`/exercises/coach/${coachId}`);
  },

  // Get all workout results for coach's athletes
  getCoachAthleteResults(coachId) {
    return apiClient.get(`/exercises/coach/${coachId}/results`);
  },

  // Get specific athlete's workout results (for coach view)
  getAthleteResultsForCoach(athleteId) {
    return apiClient.get(`/exercises/athlete/${athleteId}`);  // ✅ FIXED: Removed /results
  },

 
  
  create(data) {
    return apiClient.post("/exercises", data);
  },

  findByAthlete(athleteId) {
    return apiClient.get(`/exercises/athlete/${athleteId}`);
  },

  getAllExerciseResults() {
    return apiClient.get("/exercises");
  },

  getExerciseResultById(id) {
    return apiClient.get(`/exercises/${id}`);
  },

  updateExerciseResult(id, data) {
    const payload = {
      performedDate: data.date,
      setsDone: data.sets,
      repsDone: data.reps,
      weightUsed: data.weight,
      durationSeconds: data.duration ? data.duration * 60 : null,
      notes: data.notes
    };
    return apiClient.put(`/exercises/${id}`, payload);
  },

 deleteExerciseResult(resultId) {
  return apiClient.delete(`/exercises/${resultId}`); // Just /exercises/:id
},
  getExerciseStatistics(athleteId) {
    return apiClient.get(`/exercises/athlete/${athleteId}/statistics`);
  }
};