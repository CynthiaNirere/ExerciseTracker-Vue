<template>
  <div class="admin-exercise-plans">
    <div class="header">
      <h1>Exercise Plans</h1>
      <button @click="showPlanModal = true" class="btn btn-primary">
        <i class="fas fa-plus"></i> Add New Plan
      </button>
    </div>

    <div class="plans-container">
      <div v-if="loading" class="loading">Loading exercise plans...</div>
      <div v-else-if="plans.length === 0" class="no-plans">
        No exercise plans found. Create your first plan!
      </div>
      <div v-else class="plans-grid">
        <div v-for="plan in plans" :key="plan.id" class="plan-card">
          <div class="plan-header">
            <h3>{{ plan.name }}</h3>
          </div>
          <div class="plan-body">
            <p class="description" v-if="plan.description">{{ plan.description }}</p>
            <div class="plan-meta">
              <span><i class="fas fa-dumbbell"></i> {{ plan.exercises ? plan.exercises.length : 0 }} exercises</span>
            </div>
          </div>
          <div class="plan-actions">
            <button @click="viewPlan(plan)" class="btn btn-sm btn-outline-primary">
              <i class="fas fa-eye"></i> View
            </button>
            <button @click="editPlan(plan)" class="btn btn-sm btn-outline-secondary">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button @click="confirmDelete(plan)" class="btn btn-sm btn-outline-danger">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Plan Modal -->
    <div v-if="showPlanModal" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditing ? 'Edit' : 'Add New' }} Exercise Plan</h3>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="savePlan">
            <div class="form-group">
              <label for="planName">Plan Name</label>
              <input 
                type="text" 
                id="planName" 
                v-model="currentPlan.name" 
                class="form-control" 
                required 
                placeholder="Enter plan name"
              >
            </div>
            <div class="form-group">
              <label for="planDescription">Description</label>
              <textarea 
                id="planDescription" 
                v-model="currentPlan.description" 
                class="form-control" 
                rows="3"
                placeholder="Enter plan description"
              ></textarea>
            </div>
            
            <div class="form-group">
              <label>Exercises</label>
              <div v-if="availableExercises.length === 0" class="no-exercises">
                No exercises available. Please add exercises first.
              </div>
              <div v-else class="exercises-list">
                <div 
                  v-for="exercise in availableExercises" 
                  :key="exercise.id"
                  class="exercise-item"
                >
                  <label class="exercise-checkbox">
                    <input 
                      type="checkbox" 
                      :value="exercise.id" 
                      v-model="selectedExercises"
                    >
                    <span class="checkmark"></span>
                    <span class="exercise-name">{{ exercise.name }}</span>
                    <span class="exercise-category">{{ exercise.category }}</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button 
                type="button" 
                @click="closeModal" 
                class="btn btn-outline-secondary"
              >
                Cancel
              </button>
              <button type="submit" class="btn btn-primary">
                {{ isEditing ? 'Update' : 'Create' }} Plan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Plan Modal -->
    <div v-if="viewingPlan" class="modal" @click.self="viewingPlan = null">
      <div class="modal-content view-plan">
        <div class="modal-header">
          <h3>{{ viewingPlan.name }}</h3>
          <button @click="viewingPlan = null" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="plan-details">
            <p class="plan-description" v-if="viewingPlan.description">
              {{ viewingPlan.description }}
            </p>
            <div class="plan-meta">
              <span><i class="fas fa-dumbbell"></i> {{ viewingPlan.exercises ? viewingPlan.exercises.length : 0 }} exercises</span>
            </div>
          </div>
          
          <div class="exercises-section">
            <h4>Exercises in this plan:</h4>
            <div v-if="!viewingPlan.exercises || viewingPlan.exercises.length === 0" class="no-exercises">
              No exercises added to this plan yet.
            </div>
            <div v-else class="exercises-list">
              <div 
                v-for="(exercise, index) in viewingPlan.exercises" 
                :key="exercise.id"
                class="exercise-item"
              >
                <div class="exercise-header">
                  <h5>{{ exercise.name }}</h5>
                  <span class="exercise-category">{{ exercise.category }}</span>
                </div>
                <div class="exercise-details">
                  <span v-if="exercise.difficulty" class="badge">
                    {{ exercise.difficulty }}
                  </span>
                  <span v-if="exercise.equipmentNeeded">
                    <i class="fas fa-tools"></i> {{ exercise.equipmentNeeded }}
                  </span>
                </div>
                <div v-if="exercise.description" class="exercise-description">
                  {{ exercise.description }}
                </div>
                <div v-if="exercise.instructions" class="exercise-instructions">
                  <h6>Instructions:</h6>
                  <p>{{ exercise.instructions }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="viewingPlan = null" class="btn btn-primary">Close</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="planToDelete" class="modal" @click.self="planToDelete = null">
      <div class="modal-content delete-confirm">
        <div class="modal-header">
          <h3>Delete Plan</h3>
          <button @click="planToDelete = null" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete the plan "{{ planToDelete.name }}"? This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button @click="planToDelete = null" class="btn btn-outline-secondary">Cancel</button>
          <button @click="deletePlan" class="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExerciseService from '../services/exerciseServices';
import ExercisePlanService from '../services/exercisePlan.service';

export default {
  name: 'AdminExercisePlans',
  data() {
    return {
      plans: [],
      availableExercises: [],
      loading: true,
      showPlanModal: false,
      viewingPlan: null,
      planToDelete: null,
      isEditing: false,
      currentPlan: {
        id: null,
        name: '',
        description: '',
        exercises: []
      },
      selectedExercises: []
    };
  },
  async created() {
    await this.fetchPlans();
    await this.fetchExercises();
  },
  methods: {
    async fetchPlans() {
      try {
        this.loading = true;
        const response = await ExercisePlanService.getAllPlans();
        this.plans = response.data || [];
      } catch (error) {
        console.error('Error fetching exercise plans:', error);
        this.$toast.error('Failed to load exercise plans');
      } finally {
        this.loading = false;
      }
    },
    
    async fetchExercises() {
      try {
        const response = await ExerciseService.getAllExercises();
        this.availableExercises = response.data || [];
      } catch (error) {
        console.error('Error fetching exercises:', error);
        this.$toast.error('Failed to load exercises');
      }
    },
    
    openAddPlanModal() {
      this.isEditing = false;
      this.currentPlan = {
        id: null,
        name: '',
        description: '',
        exercises: []
      };
      this.selectedExercises = [];
      this.showPlanModal = true;
    },
    
    editPlan(plan) {
      this.isEditing = true;
      this.currentPlan = { ...plan };
      this.selectedExercises = plan.exercises ? plan.exercises.map(ex => ex.id) : [];
      this.showPlanModal = true;
    },
    
    viewPlan(plan) {
      this.viewingPlan = { ...plan };
    },
    
    confirmDelete(plan) {
      this.planToDelete = { ...plan };
    },
    
    closeModal() {
      this.showPlanModal = false;
      this.viewingPlan = null;
    },
    
    /*async savePlan() {
      try {
        const planData = {
          ...this.currentPlan,
          exercises: this.selectedExercises
        };
        
        let response;
        if (this.isEditing) {
          response = await ExercisePlanService.updatePlan(this.currentPlan.id, planData);
          this.$toast.success('Plan updated successfully');
          
          // Update the plan in the list immediately
          const index = this.plans.findIndex(p => p.id === this.currentPlan.id);
          if (index !== -1 && response.data) {
            this.plans[index] = {
              ...response.data,
              exercises: this.availableExercises.filter(ex => 
                this.selectedExercises.includes(ex.id)
              )
            };
          }
        } else {
          response = await ExercisePlanService.createPlan(planData);
          this.$toast.success('Plan created successfully');
          
          // Add the new plan to the list immediately
          if (response.data) {
            const newPlan = {
              ...response.data,
              exercises: this.availableExercises.filter(ex => 
                this.selectedExercises.includes(ex.id)
              )
            };
            this.plans.push(newPlan);
          }
        }
        
        // Close modal immediately
        this.showPlanModal = false;
        
        // Fetch plans in background to ensure sync
        this.fetchPlans();
      } catch (error) {
        console.error('Error saving plan:', error);
        this.$toast.error(`Failed to ${this.isEditing ? 'update' : 'create'} plan`);
      }
    },*/
    async savePlan() {
      try {
        const planData = {
          ...this.currentPlan,
          exercises: this.selectedExercises
        };
        
        let response;
        if (this.isEditing) {
          response = await ExercisePlanService.updatePlan(this.currentPlan.id, planData);
          this.$toast.success('Plan updated successfully');
          
          // Update the plan in the list immediately
          const index = this.plans.findIndex(p => p.id === this.currentPlan.id);
          if (index !== -1) {
            const updatedPlan = {
              ...(response.data || response),
              exercises: this.availableExercises.filter(ex => 
                this.selectedExercises.includes(ex.id)
              )
            };
            this.$set(this.plans, index, updatedPlan);
          }
        } else {
          response = await ExercisePlanService.createPlan(planData);
          this.$toast.success('Plan created successfully');
          
          // Add the new plan to the list immediately
          const planResponse = response.data || response;
          console.log('Response:', planResponse); // Keep this to debug
          
          const newPlan = {
            id: planResponse.id || planResponse._id || Date.now(),
            name: planData.name,
            description: planData.description,
            exercises: this.availableExercises.filter(ex => 
              this.selectedExercises.includes(ex.id)
            ),
            ...planResponse
          };
          
          // Use Vue's reactive method to ensure UI updates
          this.plans = [...this.plans, newPlan];
          console.log('Plans after adding:', this.plans); // Keep this to debug
        }
        
        // Close modal immediately
        this.showPlanModal = false;
        
        // Fetch plans in background to ensure sync (no await)
        this.fetchPlans();
      } catch (error) {
        console.error('Error saving plan:', error);
        this.$toast.error(`Failed to ${this.isEditing ? 'update' : 'create'} plan`);
      }
    },
        
    async deletePlan() {
      if (!this.planToDelete) return;
      
      const planId = this.planToDelete.id;
      
      try {
        // Remove from list immediately
        this.plans = this.plans.filter(p => p.id !== planId);
        this.planToDelete = null;
        
        // Delete from server
        await ExercisePlanService.deletePlan(planId);
        this.$toast.success('Plan deleted successfully');
        
        // Sync with server in background
        this.fetchPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
        this.$toast.error('Failed to delete plan');
        // Refetch to restore the plan if delete failed
        await this.fetchPlans();
      }
    }
  }
};
</script>

<style scoped>
.admin-exercise-plans {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.plan-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.plan-header {
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.difficulty {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.difficulty.beginner {
  background-color: #d4edda;
  color: #155724;
}

.difficulty.intermediate {
  background-color: #fff3cd;
  color: #856404;
}

.difficulty.advanced {
  background-color: #f8d7da;
  color: #721c24;
}

.plan-body {
  padding: 15px;
}

.description {
  color: #666;
  margin-bottom: 15px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.plan-meta {
  display: flex;
  gap: 15px;
  font-size: 0.85rem;
  color: #6c757d;
}

.plan-meta i {
  margin-right: 5px;
}

.plan-actions {
  padding: 10px 15px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  position: relative;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0 5px;
  line-height: 1;
}

.close-btn:hover {
  color: #343a40;
}

.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 2rem;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

/* Exercises list */
.exercises-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
}

.exercise-item {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.exercise-item:last-child {
  border-bottom: none;
}

.exercise-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.exercise-name {
  margin-left: 10px;
  font-weight: 500;
}

.exercise-category {
  margin-left: 10px;
  font-size: 0.8rem;
  color: #6c757d;
  background: #f8f9fa;
  padding: 2px 8px;
  border-radius: 10px;
}

/* View plan modal */
.view-plan .plan-details {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.view-plan .plan-description {
  color: #495057;
  line-height: 1.6;
}

.view-plan .exercises-section {
  margin-top: 20px;
}

.view-plan .exercises-section h4 {
  margin-bottom: 15px;
  color: #495057;
}

.view-plan .exercise-item {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.view-plan .exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.view-plan .exercise-header h5 {
  margin: 0;
  color: #212529;
}

.view-plan .exercise-details {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 0.85rem;
  color: #6c757d;
}

.view-plan .exercise-details i {
  margin-right: 3px;
}

.view-plan .exercise-description,
.view-plan .exercise-instructions {
  font-size: 0.9rem;
  color: #495057;
  line-height: 1.5;
  margin-bottom: 10px;
}

.view-plan .exercise-instructions h6 {
  margin: 10px 0 5px;
  font-size: 0.9rem;
  color: #343a40;
}

/* Delete confirmation modal */
.delete-confirm {
  max-width: 500px;
}

.delete-confirm .modal-body {
  text-align: center;
  padding: 30px 20px;
}

.delete-confirm .modal-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

/* Loading and empty states */
.loading,
.no-plans,
.no-exercises {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
  font-style: italic;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
  }
}
</style>