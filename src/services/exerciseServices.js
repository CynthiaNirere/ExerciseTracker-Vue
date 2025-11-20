import apiClient from "./services";

export default {
  // Get exercise results by athlete
  getExerciseResultsByAthlete(athleteId) {
    const userId = athleteId || JSON.parse(localStorage.getItem('user'))?.userId;
    if (!userId) {
      return Promise.reject(new Error('User ID not found'));
    }
    return apiClient.get(`/exercises/athlete/${userId}`);  
  },
  
  // Record exercise result
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
  
  // Get athlete statistics
  getAthleteStatistics(athleteId) {
    const userId = athleteId || JSON.parse(localStorage.getItem('user'))?.userId;
    if (!userId) {
      return Promise.reject(new Error('User ID not found'));
    }
    return apiClient.get(`/exercises/athlete/${userId}/statistics`); 
  },
  
  // Get all exercises
  getAllExercises() {
    return apiClient.get("/exercises/list");
  },
  
  // Get exercise by ID
  getExerciseById(id) {
    return apiClient.get(`/exercises/exercise/${id}`);  
  },
  
  // Create exercise
  createExercise(data) {
    return apiClient.post("/exercises/manage", data);
  },
  
  // Update exercise
  updateExercise(id, data) {
    return apiClient.put(`/exercises/manage/${id}`, data);  
  },
  
  // Delete exercise
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
    return apiClient.get(`/exercises/athlete/${athleteId}`);  
  },
  
  // Create exercise result
  create(data) {
    return apiClient.post("/exercises", data);
  },
  
  // Find exercise results by athlete
  findByAthlete(athleteId) {
    return apiClient.get(`/exercises/athlete/${athleteId}`);  
  },
  
  // Get all exercise results
  getAllExerciseResults() {
    return apiClient.get("/exercises");
  },
  
  // Get exercise result by ID
  getExerciseResultById(id) {
    return apiClient.get(`/exercises/${id}`);  
  },
  
  // Update exercise result
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
  
  // Delete exercise result
  deleteExerciseResult(resultId) {
    return apiClient.delete(`/exercises/${resultId}`);  
  },
  
  // Get exercise statistics
  getExerciseStatistics(athleteId) {
    return apiClient.get(`/exercises/athlete/${athleteId}/statistics`); 
  }
};