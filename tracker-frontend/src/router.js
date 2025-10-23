import { createRouter, createWebHistory } from "vue-router";
import Utils from "./config/utils";

// Auth
import Login from "./views/Login.vue";

// Admin Views
import AdminDashboard from "./views/AdminDashboard.vue";
import AdminUsers from "./views/AdminUsers.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ========================================
    // Public Routes
    // ========================================
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: { requiresAuth: false },
    },

    // ========================================
    // Admin Routes
    // ========================================
    {
      path: "/admin/dashboard",
      name: "adminDashboard",
      component: AdminDashboard,
      meta: { requiresAuth: true, role: "admin" },
    },
    {
      path: "/admin/users",
      name: "userManagement",
      component: AdminUsers,
      meta: { requiresAuth: true, role: "admin" },
    },

    // ========================================
    // 404 - Catch All
    // ========================================
    {
      path: "/:pathMatch(.*)*",
      redirect: "/login",
    },
  ],
});

// ========================================
// Navigation Guard (Role-Based Access)
// ========================================
router.beforeEach((to, from, next) => {
  const user = Utils.getStore("user");
  const requiresAuth = to.meta.requiresAuth;
  const requiredRole = to.meta.role;

  // If route requires auth and user is not logged in
  if (requiresAuth && !user) {
    console.log("Not authenticated, redirecting to login");
    next({ name: "login" });
    return;
  }

  // If route requires specific role and user doesn't have it
  if (requiresAuth && requiredRole && user.role !== requiredRole) {
    console.log(`Access denied. Required: ${requiredRole}, User: ${user.role}`);
    next({ name: "login" });
    return;
  }

  // If user is logged in and trying to access login page, redirect to dashboard
  if (to.name === "login" && user) {
    if (user.role === "admin") {
      next({ name: "adminDashboard" });
    } else {
      next(); // future roles can be handled later
    }
    return;
  }

  // Allow navigation
  next();
});

export default router;
