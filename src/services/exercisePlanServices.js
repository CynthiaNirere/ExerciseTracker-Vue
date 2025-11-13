import apiClient from "./services";

export default {

  // Get all exercise plans
  getAllExercisePlans() {
    return apiClient.get("/exercise-plans");
  },
  
  // Get exercise plan by ID (with exercises included)
  getExercisePlanById(planId) {
    return apiClient.get(`/exercise-plans/${planId}`);
  },
  
  // Get exercise plan details
  getExercisePlanDetails(planId) {
    return apiClient.get(`/exercise-plans/${planId}`);
  },
  
  // Create new exercise plan
  createExercisePlan(planData) {
    return apiClient.post("/exercise-plans", planData);
  },
  
  // Update exercise plan
  updateExercisePlan(planId, planData) {
    return apiClient.put(`/exercise-plans/${planId}`, planData);
  },
  
  // Delete exercise plan
  deleteExercisePlan(planId) {
    return apiClient.delete(`/exercise-plans/${planId}`);
  },
  
  // Get plans by difficulty
  getPlansByDifficulty(difficulty) {
    return apiClient.get(`/exercise-plans/difficulty/${difficulty}`);
  },

  

  // Get plans created by a specific coach
  getPlansByCoach(coachId) {
    return apiClient.get(`/exercise-plans/coach/${coachId}`);
  },

  // Assign plan to athlete
  assignPlanToAthlete(planId, athleteId) {
    return apiClient.post(`/exercise-plans/${planId}/assign`, { athleteId });
  },

  // Get plans assigned to a specific athlete
  getPlansByAthlete(athleteId) {
    return apiClient.get(`/exercise-plans/athlete/${athleteId}`);
  },

  // Unassign plan from athlete
  unassignPlanFromAthlete(planId, athleteId) {
    return apiClient.delete(`/exercise-plans/${planId}/assign/${athleteId}`);
  }
};