import { createRouter, createWebHistory } from "vue-router";
import Utils from "./config/utils.js";

import Login from "./views/Login.vue";
import CoachDashboard from "./views/coachDashboard.vue";
import CoachAthletes from "./views/coachAthletes.vue";

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
      path: "/coachDashboard",
      name: "coachDashboard",
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
  const user = Utils.getStore("user");
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiredRole = to.meta.role;

  if (requiresAuth && !user) {
    next({ name: "login" });
  } else if (requiredRole && user && user.role !== requiredRole) {
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
    next();
  }
});

export default router;