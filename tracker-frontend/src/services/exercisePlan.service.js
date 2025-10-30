import apiClient from "./services.js";

export default {
  // Get all exercise plans
  getAllPlans() {
    return apiClient.get("/plans");
  },
  
  // Get exercise plan by ID
  getPlan(id) {
    return apiClient.get(`/plans/${id}`);
  },
  
  // Create new exercise plan
  createPlan(planData) {
    return apiClient.post("/plans", planData);
  },
  
  // Update exercise plan
  updatePlan(id, planData) {
    return apiClient.put(`/plans/${id}`, planData);
  },
  
  // Delete exercise plan
  deletePlan(id) {
    return apiClient.delete(`/plans/${id}`);
  },
  
  // Get plans by difficulty
  getPlansByDifficulty(difficulty) {
    return apiClient.get(`/plans/difficulty/${difficulty}`);
  }
};
