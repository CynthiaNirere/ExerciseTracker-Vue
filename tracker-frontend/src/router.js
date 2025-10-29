import { createRouter, createWebHistory } from "vue-router";
import Utils from "./config/utils.js";

<<<<<<< HEAD
const routes = [
  // Public Routes
  {
    path: "/",
    name: "home",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/Register.vue"),
  },

  // Admin Routes
  {
    path: "/admin",
    name: "adminDashboard",
    component: () => import("../views/AdminDashboard.vue"),
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/users",
    name: "userManagement",
    component: () => import("../views/AdminUser.vue"),
    meta: { requiresAuth: true, role: "admin" },
  },

  // Athlete Routes
  {
    path: "/athlete",
    name: "athleteDashboard",
    component: () => import("../views/AthleteDashboard.vue"),
    meta: { requiresAuth: true, role: "athlete" },
  },
  {
    path: "/athlete/profile",
    name: "athleteProfile",
    component: () => import("../views/AthleteProfile.vue"),
    meta: { requiresAuth: true, role: "athlete" },
  },
  {
    path: "/athlete/record-exercise",
    name: "recordExercise",
    component: () => import("../views/RecordExercise.vue"),
    meta: { requiresAuth: true, role: "athlete" },
  },
  {
    path: "/athlete/goals",
    name: "athleteGoals",
    component: () => import("../views/AthleteGoals.vue"),
    meta: { requiresAuth: true, role: "athlete" },
  },
  {
    path: "/athlete/exercise-results",
    name: "viewExerciseResults",
    component: () => import("../views/ViewExerciseResults.vue"),
    meta: { requiresAuth: true, role: "athlete" },
  },
  {
    path: "/athlete/progress",
    name: "viewProgress",
    component: () => import("../views/ViewProgress.vue"),
    meta: { requiresAuth: true, role: "athlete" },
  },

  // Coach Routes (add these if you have coach pages)
  {
    path: "/coach",
    name: "coachDashboard",
    component: () => import("../views/CoachDashboard.vue"),
    meta: { requiresAuth: true, role: "coach" },
  },

  // Catch all 404
  {
    path: "/:pathMatch(.*)*",
    name: "notFound",
    component: () => import("../views/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Navigation Guard
=======
import Login from "./views/Login.vue";
import CoachDashboard from "./views/coachDashboard.vue";
import CoachAthletes from "./views/coachAthletes.vue"; // ADD THIS


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      alias: "/login",
      name: "login",
      component: Login,
    },
    {
      path: "/coach-dashboard",
      name: "coach-dashboard",
      component: CoachDashboard,
      meta: { requiresAuth: true, role: "coach" },
    },
    {
      path: "/coach/athletes",
      name: "coach-athletes",
      component: CoachAthletes,
      meta: { requiresAuth: true, role: "coach" },
    },
    {
  path: "/coach/athlete/:id",
  name: "athleteDetail",
  component: () => import("./views/athleteDetail.vue"),
  meta: { requiresAuth: true, role: "coach" }
},
  ], 
}); 

>>>>>>> 43399e5aa38a708786d835222012a75ced97f92f
router.beforeEach((to, from, next) => {
  const user = Utils.getStore("user");
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiredRole = to.meta.role;

  // Check if route requires authentication
  if (requiresAuth && !user) {
    // Redirect to login if not authenticated
    next({ name: "login" });
  } else if (requiredRole && user && user.role !== requiredRole) {
    // Redirect to appropriate dashboard if role doesn't match
    if (user.role === "admin") {
      next({ name: "adminDashboard" });
    } else if (user.role === "coach") {
      next({ name: "coachDashboard" });
    } else if (user.role === "athlete") {
      next({ name: "athleteDashboard" });
    } else {
      next({ name: "login" });
    }
  } else {
    // Proceed to route
    next();
  }
});

export default router;