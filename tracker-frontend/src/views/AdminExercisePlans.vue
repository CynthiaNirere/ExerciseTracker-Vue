<template>
  <div class="admin-exercise-plans">
    <div class="header">
      <div>
        <h1>Exercise Plans</h1>
        <p class="subtitle">Create and manage training programs</p>
      </div>
      <button @click="openAddPlanModal" class="btn-create">
        <i class="fas fa-plus"></i> Create Plan
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
            <div class="exercises-preview">
              <div v-if="plan.exercises && plan.exercises.length > 0" class="exercise-list">
                <div v-for="exercise in plan.exercises.slice(0, 3)" :key="exercise.id" class="exercise-preview-item">
                  <span class="exercise-name">{{ exercise.name }}</span>
                  <span v-if="exercise.ExercisePlanItem || exercise.exercise_plan_items" class="exercise-meta">
                    {{ (exercise.ExercisePlanItem || exercise.exercise_plan_items)?.sets }} sets × {{ (exercise.ExercisePlanItem || exercise.exercise_plan_items)?.reps }} reps
                    <span v-if="(exercise.ExercisePlanItem || exercise.exercise_plan_items)?.weight && (exercise.ExercisePlanItem || exercise.exercise_plan_items).weight > 0"> 
                      @ {{ (exercise.ExercisePlanItem || exercise.exercise_plan_items).weight }} lbs
                    </span>
                  </span>
                </div>
                <div v-if="plan.exercises.length > 3" class="more-exercises">
                  +{{ plan.exercises.length - 3 }} more
                </div>
              </div>
              <div v-else class="no-exercises-msg">
                No exercises added yet
              </div>
            </div>
          </div>
          <div class="plan-actions">
            <button @click="editPlan(plan)" class="btn-action btn-edit" title="Edit">
              <i class="fas fa-edit"></i>
              <span>Edit</span>
            </button>
            <button @click="confirmDelete(plan)" class="btn-action btn-delete-action" title="Delete">
              <i class="fas fa-trash"></i>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Plan Modal -->
    <div v-if="showPlanModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <div>
            <h2>{{ isEditing ? 'Edit Plan' : 'Create New Plan' }}</h2>
            <p class="modal-subtitle">Design a custom training plan</p>
          </div>
          <button @click="closeModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="savePlan">
            <!-- Plan Name -->
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

            <!-- Description -->
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

            <!-- Exercises Section -->
            <div class="form-group">
              <label>Exercises</label>
              
              <!-- Add Exercise Row -->
              <div class="add-exercise-row">
                <select 
                  v-model="selectedExerciseId" 
                  class="form-control exercise-select"
                >
                  <option value="">Select exercise to add</option>
                  <option 
                    v-for="exercise in availableExercises" 
                    :key="exercise.id" 
                    :value="exercise.id"
                  >
                    {{ exercise.name }} - {{ exercise.category }}
                  </option>
                </select>
                <button 
                  type="button" 
                  @click="addExerciseToPlan" 
                  :disabled="!selectedExerciseId"
                  class="btn-add"
                >
                  <i class="fas fa-plus"></i> Add
                </button>
              </div>

              <!-- Added Exercises List with Inline Editing -->
              <div class="added-exercises">
                <div v-if="planExercises.length === 0" class="empty-state">
                  No exercises added yet. Select an exercise above to get started.
                </div>
                <div v-else class="exercises-list">
                  <div 
                    v-for="(item, index) in planExercises" 
                    :key="index"
                    class="exercise-item-inline"
                  >
                    <div class="exercise-info-left">
                      <div class="exercise-name-main">{{ getExerciseName(item.exercise_id) }}</div>
                      <div class="exercise-category">{{ getExerciseCategory(item.exercise_id) }}</div>
                    </div>
                    
                    <div class="exercise-inputs">
                      <div class="input-group">
                        <label>Sets</label>
                        <input 
                          type="number" 
                          v-model.number="item.sets" 
                          class="form-control-sm"
                          min="1"
                          placeholder="3"
                        >
                      </div>
                      
                      <div class="input-group">
                        <label>Reps</label>
                        <input 
                          type="text" 
                          v-model="item.reps" 
                          class="form-control-sm"
                          placeholder="10"
                        >
                      </div>
                      
                      <div class="input-group">
                        <label>Weight (lbs)</label>
                        <input 
                          type="number" 
                          v-model.number="item.weight" 
                          class="form-control-sm"
                          placeholder="0"
                        >
                      </div>
                    </div>

                    <button 
                      type="button" 
                      @click="removeExercise(index)" 
                      class="btn-delete"
                      title="Remove"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button type="button" @click="closeModal" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary">
                Save Plan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="planToDelete" class="modal-overlay" @click.self="planToDelete = null">
      <div class="modal-container modal-small">
        <div class="modal-header">
          <h3>Delete Plan</h3>
          <button @click="planToDelete = null" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p class="confirm-message">
            Are you sure you want to delete the plan <strong>"{{ planToDelete.name }}"</strong>? 
            This action cannot be undone.
          </p>
        </div>
        <div class="modal-footer">
          <button @click="planToDelete = null" class="btn-secondary">Cancel</button>
          <button @click="deletePlan" class="btn-danger">Delete Plan</button>
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
      planToDelete: null,
      isEditing: false,
      selectedExerciseId: '',
      currentPlan: {
        id: null,
        name: '',
        description: ''
      },
      planExercises: []
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
        this.$toast?.error('Failed to load exercise plans');
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
        this.$toast?.error('Failed to load exercises');
      }
    },
    
    openAddPlanModal() {
      this.isEditing = false;
      this.currentPlan = {
        id: null,
        name: '',
        description: ''
      };
      this.planExercises = [];
      this.selectedExerciseId = '';
      this.showPlanModal = true;
    },
    
    editPlan(plan) {
      this.isEditing = true;
      this.currentPlan = { 
        id: plan.id,
        name: plan.name,
        description: plan.description
      };
      
      // Convert plan exercises to planExercises format
      this.planExercises = plan.exercises ? plan.exercises.map(ex => {
        const junctionData = ex.ExercisePlanItem || ex.exercise_plan_items || {};
        return {
          exercise_id: ex.id,
          sets: junctionData.sets || 3,
          reps: junctionData.reps || '10',
          weight: junctionData.weight || 0,
          order: junctionData.order || 0
        };
      }) : [];
      
      this.showPlanModal = true;
    },
    
    confirmDelete(plan) {
      this.planToDelete = { ...plan };
    },
    
    closeModal() {
      this.showPlanModal = false;
    },
    
    addExerciseToPlan() {
      if (!this.selectedExerciseId) return;
      
      // Check if exercise already added
      const alreadyAdded = this.planExercises.some(
        item => item.exercise_id === parseInt(this.selectedExerciseId)
      );
      
      if (alreadyAdded) {
        this.$toast?.warning('This exercise is already added to the plan');
        return;
      }
      
      // Add exercise with default values
      this.planExercises.push({
        exercise_id: parseInt(this.selectedExerciseId),
        sets: 3,
        reps: '10',
        weight: 0,
        order: this.planExercises.length
      });
      
      // Reset selection
      this.selectedExerciseId = '';
    },
    
    removeExercise(index) {
      this.planExercises.splice(index, 1);
      // Update order
      this.planExercises.forEach((item, idx) => {
        item.order = idx;
      });
    },
    
    getExerciseName(exerciseId) {
      const exercise = this.availableExercises.find(ex => ex.id === parseInt(exerciseId));
      return exercise ? exercise.name : 'Unknown Exercise';
    },
    
    getExerciseCategory(exerciseId) {
      const exercise = this.availableExercises.find(ex => ex.id === parseInt(exerciseId));
      return exercise ? exercise.category : '';
    },
    
    async savePlan() {
      try {
        const planData = {
          name: this.currentPlan.name,
          description: this.currentPlan.description,
          exercises: this.planExercises
        };
        
        if (this.isEditing) {
          await ExercisePlanService.updatePlan(this.currentPlan.id, planData);
          this.$toast?.success('Plan updated successfully');
        } else {
          await ExercisePlanService.createPlan(planData);
          this.$toast?.success('Plan created successfully');
        }
        
        this.showPlanModal = false;
        await this.fetchPlans();
      } catch (error) {
        console.error('Error saving plan:', error);
        this.$toast?.error(`Failed to ${this.isEditing ? 'update' : 'create'} plan`);
      }
    },
    
    async deletePlan() {
      try {
        await ExercisePlanService.deletePlan(this.planToDelete.id);
        this.$toast?.success('Plan deleted successfully');
        this.planToDelete = null;
        await this.fetchPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
        this.$toast?.error('Failed to delete plan');
      }
    }
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.admin-exercise-plans {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: #fafafa;
  min-height: 100vh;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0 0 0.25rem 0;
  font-size: 2rem;
  font-weight: 600;
  color: #1a1a1a;
}

.subtitle {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.btn-create {
  background: #000;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
}

.btn-create:hover {
  background: #333;
}

/* Plans Grid */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.plan-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
}

.plan-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.plan-header {
  padding: 1.25rem;
  border-bottom: 1px solid #f0f0f0;
}

.plan-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.plan-body {
  padding: 1.25rem;
}

.description {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.exercises-preview {
  margin-top: 1rem;
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.exercise-preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f9f9f9;
  border-radius: 6px;
  font-size: 0.85rem;
}

.exercise-name {
  font-weight: 500;
  color: #333;
}

.exercise-meta {
  color: #666;
  font-size: 0.8rem;
}

.more-exercises {
  padding: 0.5rem;
  text-align: center;
  color: #666;
  font-size: 0.85rem;
  font-style: italic;
}

.no-exercises-msg {
  color: #999;
  font-size: 0.85rem;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}

.plan-actions {
  padding: 1rem 1.25rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-action {
  background: none;
  border: 1px solid #e0e0e0;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-action i {
  font-size: 0.9rem;
}

.btn-edit:hover {
  background: #e8f4f8;
  border-color: #90caf9;
  color: #1976d2;
}

.btn-delete-action {
  color: #999;
}

.btn-delete-action:hover {
  background: #fee;
  border-color: #fcc;
  color: #d32f2f;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-container.modal-small {
  max-width: 500px;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.modal-subtitle {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  font-weight: normal;
}

.btn-close {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 2rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  flex-shrink: 0;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.95rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s;
  font-family: inherit;
  background: #fafafa;
}

.form-control:focus {
  outline: none;
  border-color: #000;
  background: #fff;
}

.form-control::placeholder {
  color: #999;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

/* Add Exercise Row */
.add-exercise-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.exercise-select {
  flex: 1;
}

.btn-add {
  background: #000;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-add:hover:not(:disabled) {
  background: #333;
}

.btn-add:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Added Exercises - Inline Editing */
.added-exercises {
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  background: #fafafa;
}

.empty-state {
  padding: 3rem 2rem;
  text-align: center;
  color: #999;
  font-size: 0.9rem;
  line-height: 1.6;
}

.exercises-list {
  padding: 1rem;
}

.exercise-item-inline {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #fff;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.exercise-item-inline:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.exercise-item-inline:last-child {
  margin-bottom: 0;
}

.exercise-info-left {
  flex: 1;
  min-width: 0;
}

.exercise-name-main {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}

.exercise-category {
  font-size: 0.8rem;
  color: #999;
}

.exercise-inputs {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-group label {
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.form-control-sm {
  width: 70px;
  padding: 0.5rem;
  border: 2px solid #e8e8e8;
  border-radius: 6px;
  font-size: 0.9rem;
  text-align: center;
  font-family: inherit;
  background: #fafafa;
  transition: all 0.2s;
}

.form-control-sm:focus {
  outline: none;
  border-color: #000;
  background: #fff;
}

.btn-delete {
  background: none;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-delete:hover {
  background: #fee;
  color: #d32f2f;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f0f0f0;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #000;
  color: #fff;
}

.btn-primary:hover {
  background: #333;
}

.btn-secondary {
  background: #fff;
  color: #333;
  border: 2px solid #e0e0e0;
}

.btn-secondary:hover {
  background: #f5f5f5;
  border-color: #d0d0d0;
}

.btn-danger {
  background: #d32f2f;
  color: #fff;
}

.btn-danger:hover {
  background: #b71c1c;
}

/* Confirm Message */
.confirm-message {
  text-align: center;
  padding: 1rem 0;
  color: #666;
  line-height: 1.6;
}

.confirm-message strong {
  color: #333;
}

/* Loading and Empty States */
.loading,
.no-plans {
  text-align: center;
  padding: 4rem 2rem;
  color: #999;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-exercise-plans {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .add-exercise-row {
    flex-direction: column;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .exercise-item-inline {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .exercise-inputs {
    width: 100%;
    justify-content: space-between;
  }

  .btn-delete {
    align-self: flex-end;
  }
}
</style>