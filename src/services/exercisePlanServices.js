import apiClient from "./services";

export default {
  // Get all exercise plans
  getAllExercisePlans() {
    return apiClient.get("/exercise-plans");
  },
  
  // Get exercise plan by ID (with exercises included)
  getExercisePlanById(planId) {
    return apiClient.get(`/exercise-plans/${planId}`); // FIXED: parentheses instead of backticks
  },
  
  // Get exercise plan details
  getExercisePlanDetails(planId) {
    return apiClient.get(`/exercise-plans/${planId}`); // FIXED: parentheses instead of backticks
  },
  
  // Create new exercise plan
  createExercisePlan(planData) {
    return apiClient.post("/exercise-plans", planData);
  },
  
  // Update exercise plan
  updateExercisePlan(planId, planData) {
    return apiClient.put(`/exercise-plans/${planId}`, planData); // FIXED: parentheses instead of backticks
  },
  
  // Delete exercise plan
  deleteExercisePlan(planId) {
    return apiClient.delete(`/exercise-plans/${planId}`); // FIXED: parentheses instead of backticks
  },
  
  // Get plans by difficulty
  getPlansByDifficulty(difficulty) {
    return apiClient.get(`/exercise-plans/difficulty/${difficulty}`); // FIXED: parentheses instead of backticks
  },
  
  // Get plans created by a specific coach
  getPlansByCoach(coachId) {
    return apiClient.get(`/exercise-plans/coach/${coachId}`); // FIXED: parentheses instead of backticks
  },
  
  // Assign plan to athlete
  assignPlanToAthlete(planId, athleteId) {
    return apiClient.post(`/exercise-plans/${planId}/assign`, { athleteId }); // FIXED: parentheses instead of backticks
  },
  
  // Get plans assigned to a specific athlete
  getPlansByAthlete(athleteId) {
    return apiClient.get(`/exercise-plans/athlete/${athleteId}`); // FIXED: parentheses instead of backticks
  },
  
  // Unassign plan from athlete
  unassignPlanFromAthlete(planId, athleteId) {
    return apiClient.delete(`/exercise-plans/${planId}/assign/${athleteId}`); // FIXED: parentheses instead of backticks
  }
};