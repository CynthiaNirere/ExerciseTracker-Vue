import apiClient from "./services";

export default {
  // Create a new goal
  createGoal(data) {
    // Transform frontend data to match backend fields
    const payload = {
      athleteId: data.athleteId,
      title: data.title,
      description: data.description,
      targetValue: data.targetValue,
      currentValue: data.currentValue || 0,
      unit: data.unit || 'count', // Add unit field
      status: data.status || 'in_progress',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.targetDate // targetDate from frontend maps to endDate in backend
    };
    
    console.log('GoalServices createGoal payload:', payload); // Debug log
    return apiClient.post("/goals", payload);
  },

  // Get all goals
  getAllGoals() {
    return apiClient.get("/goals");
  },

  // Get goals by athlete ID
  getGoalsByAthlete(athleteId) {
    return apiClient.get(`/goals/athlete/${athleteId}`); // Fixed syntax error
  },

  // Get a single goal by ID
  getGoalById(id) {
    return apiClient.get(`/goals/${id}`); // Fixed syntax error
  },

  // Update a goal
  updateGoal(id, data) {
    // Transform frontend data to match backend fields
    const payload = {
      title: data.title,
      description: data.description,
      targetValue: data.targetValue,
      currentValue: data.currentValue,
      unit: data.unit || 'count', // Add unit field
      status: data.status,
      endDate: data.targetDate // targetDate from frontend maps to endDate in backend
    };
    
    console.log('GoalServices updateGoal payload:', payload); // Debug log
    return apiClient.put(`/goals/${id}`, payload); // Fixed syntax error
  },

  // Delete a goal
  deleteGoal(id) {
    return apiClient.delete(`/goals/${id}`); // Fixed syntax error
  },

  // Update goal progress
  updateGoalProgress(id, currentValue) {
    return apiClient.patch(`/goals/${id}/progress`, { currentValue }); // Fixed syntax error
  },

  // Get goals by status
  getGoalsByStatus(athleteId, status) {
    return apiClient.get(`/goals/athlete/${athleteId}/status/${status}`); // Fixed syntax error
  },

  // Get goal completion statistics
  getGoalStatistics(athleteId) {
    return apiClient.get(`/goals/athlete/${athleteId}/statistics`); // Fixed syntax error
  }
};