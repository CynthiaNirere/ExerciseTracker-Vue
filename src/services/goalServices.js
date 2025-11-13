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
      unit: data.unit || 'count',
      status: data.status || 'in_progress',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.targetDate // targetDate from frontend maps to endDate in backend
    };
    
    console.log('GoalServices createGoal payload:', payload);
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
    // Transform frontend data to match backend fields
    const payload = {
      title: data.title,
      description: data.description,
      targetValue: data.targetValue,
      currentValue: data.currentValue,
      unit: data.unit || 'count',
      status: data.status,
      endDate: data.targetDate // targetDate from frontend maps to endDate in backend
    };
    
    console.log('GoalServices updateGoal payload:', payload);
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
      status: 'in_progress',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.targetDate
    };
    return apiClient.post("/goals", payload);
  }
};