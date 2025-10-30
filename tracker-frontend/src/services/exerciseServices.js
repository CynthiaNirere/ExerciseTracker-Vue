import apiClient from "./services";

export default {
  // ========================================
  // Exercise Results (NEW - Athlete-specific)
  // ========================================
  
  // Get exercise results for logged-in athlete
  getExerciseResultsByAthlete(athleteId) {
    // If athleteId is not provided, get it from stored user
    const userId = athleteId || JSON.parse(localStorage.getItem('user'))?.userId;
    if (!userId) {
      return Promise.reject(new Error('User ID not found'));
    }
    return apiClient.get(`/exercises/athlete/${userId}`);
  },

  // Record new exercise result
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
    
    console.log('Recording exercise result:', payload); // Debug log
    return apiClient.post("/exercises", payload);
  },

  // Get athlete statistics
  getAthleteStatistics(athleteId) {
    // If athleteId is not provided, get it from stored user
    const userId = athleteId || JSON.parse(localStorage.getItem('user'))?.userId;
    if (!userId) {
      return Promise.reject(new Error('User ID not found'));
    }
    return apiClient.get(`/exercises/athlete/${userId}/statistics`);
  },

  // ========================================
  // Exercise Management (for admin/coach)
  // ========================================
  
  // Get all exercises
  getAllExercises() {
    return apiClient.get("/exercises/list"); // Updated to match route
  },

  // Get a single exercise by ID
  getExerciseById(id) {
    return apiClient.get(`/exercises/${id}`); // Fixed syntax
  },

  // Create a new exercise
  createExercise(data) {
    return apiClient.post("/exercises", data);
  },

  // Update an exercise
  updateExercise(id, data) {
    return apiClient.put(`/exercises/${id}`, data); // Fixed syntax
  },

  // Delete an exercise
  deleteExercise(id) {
    return apiClient.delete(`/exercises/${id}`); // Fixed syntax
  },

  // ========================================
  // Legacy methods (keeping for compatibility)
  // ========================================
  
  // Create exercise result (directly use provided data)
  create(data) {
    return apiClient.post("/exercises", data);
  },

  // Find exercise results by athlete ID
  findByAthlete(athleteId) {
    return apiClient.get(`/exercises/athlete/${athleteId}`); // Fixed syntax
  },

  // Get all exercise results (old method)
  getAllExerciseResults() {
    return apiClient.get("/exercises");
  },

  // Get exercise results by ID (old method)
  getExerciseResultById(id) {
    return apiClient.get(`/exercises/${id}`); // Fixed syntax
  },

  // Update an exercise result (old method)
  updateExerciseResult(id, data) {
    const payload = {
      performedDate: data.date,
      setsDone: data.sets,
      repsDone: data.reps,
      weightUsed: data.weight,
      durationSeconds: data.duration ? data.duration * 60 : null,
      notes: data.notes
    };
    return apiClient.put(`/exercises/${id}`, payload); // Fixed syntax
  },

  // Delete an exercise result (old method)
  deleteExerciseResult(id) {
    return apiClient.delete(`/exercises/${id}`); // Fixed syntax
  },

  // Get exercise statistics for an athlete (old method)
  getExerciseStatistics(athleteId) {
    return apiClient.get(`/exercises/athlete/${athleteId}/statistics`); // Fixed syntax
  }
};