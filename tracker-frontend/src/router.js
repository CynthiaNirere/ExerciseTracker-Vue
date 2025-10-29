import { createRouter, createWebHistory } from "vue-router";
import store from "./store/store"; // Import your store

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

router.beforeEach((to, from, next) => {
  const isAuthenticated =
    store.state.currentUser !== null || store.state.loginUser !== null;
  const currentUser = store.state.currentUser || store.state.loginUser;
  const userRole = currentUser?.role;

  console.log("🔍 Navigation Guard:", {
    to: to.name,
    isAuthenticated,
    userRole,
    user: currentUser,
  });

  // If route requires authentication and user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log(" Not authenticated, redirecting to login");
    next("/");
  }
  // If user is authenticated and trying to access login page
  else if (isAuthenticated && to.path === "/") {
    console.log(" Already authenticated, redirecting based on role");
    if (userRole === "coach") {
      next("/coach-dashboard");
    } else {
      // Redirect to coach-dashboard as fallback
      next("/coach-dashboard");
    }
  }
  // If route requires specific role
  else if (to.meta.role && userRole !== to.meta.role) {
    console.log(" Wrong role, redirecting to appropriate dashboard");
    if (userRole === "coach") {
      next("/coach-dashboard");
    } else {
      next("/coach-dashboard");
    }
  }
  // Allow navigation
  else {
    console.log(" Proceeding to", to.name);
    next();
  }
});

export default router;