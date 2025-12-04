import apiClient from "./services";

export default {
  // ========================================
  // NEW: Get exercises from a specific plan (for goal creation)
  // ========================================
  getExercisesFromPlan(planId) {
    return apiClient.get(`/goals/plan/${planId}/exercises`);
  },

  // ========================================
  // NEW: Get daily/weekly goals for an athlete
  // ========================================
  getDailyGoals(athleteId) {
    return apiClient.get(`/goals/athlete/${athleteId}/daily`);
  },

  // ========================================
  // EXISTING METHODS (Updated for consistency)
  // ========================================
  
  // Create a new goal
  createGoal(data) {
    const payload = {
      athleteId: data.athleteId,
      title: data.title,
      description: data.description,
      targetValue: data.targetValue,
      currentValue: data.currentValue || 0,
      unit: data.unit || 'count',
      status: data.status || 'active',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.targetDate,
      // NEW: Include plan and exercise IDs if provided
      planId: data.planId || null,
      exerciseId: data.exerciseId || null
    };
    
    return apiClient.post("/goals", payload);
  },
  
  // Get all goals
  getAllGoals() {
    return apiClient.get("/goals");
  },
  
  // Get goals by athlete ID
  getGoalsByAthlete(athleteId) {
    return apiClient.get(`/goals/athlete/${athleteId}`);
  },
  
  // Get a single goal by ID
  getGoalById(id) {
    return apiClient.get(`/goals/${id}`);
  },
  
  // Update a goal
  updateGoal(id, data) {
    const payload = {
      title: data.title,
      description: data.description,
      targetValue: data.targetValue,
      currentValue: data.currentValue,
      unit: data.unit || 'count',
      status: data.status,
      endDate: data.targetDate,
      // NEW: Include plan and exercise IDs if provided
      planId: data.planId || null,
      exerciseId: data.exerciseId || null
    };
    
    return apiClient.put(`/goals/${id}`, payload);
  },
  
  // Delete a goal
  deleteGoal(id) {
    return apiClient.delete(`/goals/${id}`);
  },
  
  // Update goal progress
  updateGoalProgress(id, currentValue) {
    return apiClient.patch(`/goals/${id}/progress`, { currentValue });
  },
  
  // Get goals by status
  getGoalsByStatus(athleteId, status) {
    return apiClient.get(`/goals/athlete/${athleteId}/status/${status}`);
  },
  
  // Get goal completion statistics
  getGoalStatistics(athleteId) {
    return apiClient.get(`/goals/athlete/${athleteId}/statistics`);
  },
  
  // Get all goals for coach's athletes
  getGoalsByCoach(coachId) {
    return apiClient.get(`/goals/coach/${coachId}`);
  },
  
  // Get active goals for a specific athlete (coach view)
  getActiveGoalsByAthlete(athleteId) {
    return apiClient.get(`/goals/athlete/${athleteId}/active`);
  },
  
  // Create goal for athlete (by coach)
  createGoalForAthlete(athleteId, data) {
    const payload = {
      athleteId: athleteId,
      title: data.title,
      description: data.description,
      targetValue: data.targetValue,
      currentValue: data.currentValue || 0,
      unit: data.unit || 'count',
      status: 'active',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.targetDate,
      // NEW: Include plan and exercise IDs if provided
      planId: data.planId || null,
      exerciseId: data.exerciseId || null
    };
    
    return apiClient.post("/goals", payload);
  }
};