<script setup>
import ocLogo from "/oc-logo-white.png";
import { ref, onMounted } from "vue";
import Utils from "../config/utils";
import AuthServices from "../services/authServices";
import { useRouter } from "vue-router";

const router = useRouter();
const user = ref(null);
const title = ref("Exercise Tracker");
const initials = ref("");
const name = ref("");
const logoURL = ref("");

const resetMenu = () => {
  user.value = Utils.getStore("user");
  if (user.value) {
    initials.value =
      (user.value.fName?.[0] || "") + (user.value.lName?.[0] || "");
    name.value = `${user.value.fName || ""} ${user.value.lName || ""}`.trim();
  }
};

const logout = async () => {
  try {
    await AuthServices.logoutUser(user.value);
  } catch (err) {
    console.warn("Logout error:", err);
  } finally {
    Utils.removeItem("user");
    router.push({ name: "login" });
  }
};

// Get dashboard route based on user role
const getDashboardRoute = () => {
  if (!user.value) return { name: "login" };
  switch (user.value.role) {
    case "admin":
      return { name: "adminDashboard" };
    case "coach":
      return { name: "coachDashboard" };
    case "athlete":
      return { name: "athleteDashboard" };
    default:
      return { name: "login" };
  }
};

onMounted(() => {
  logoURL.value = ocLogo;
  resetMenu();
});
</script>

<template>
  <v-app-bar app color="primary" dark>
    <!-- Logo -->
    <router-link :to="getDashboardRoute()" style="text-decoration: none">
      <v-img
        class="mx-3"
        :src="logoURL"
        height="45"
        width="45"
        contain
      ></v-img>
    </router-link>

    <!-- App Title -->
    <v-toolbar-title>{{ title }}</v-toolbar-title>
    <v-spacer></v-spacer>

    <!-- Admin Menu -->
    <template v-if="user && user.role === 'admin'">
      <v-btn class="mx-2" :to="{ name: 'adminDashboard' }" text>Dashboard</v-btn>
      <v-btn class="mx-2" :to="{ name: 'adminUsers' }" text>Users</v-btn>
    </template>

    <!-- Coach Menu (future use) -->
    <template v-else-if="user && user.role === 'coach'">
      <v-btn class="mx-2" :to="{ name: 'coachDashboard' }" text>Dashboard</v-btn>
      <v-btn class="mx-2" :to="{ name: 'myAthletes' }" text>Athletes</v-btn>
    </template>

    <!-- Athlete Menu (future use) -->
    <template v-else-if="user && user.role === 'athlete'">
      <v-btn class="mx-2" :to="{ name: 'athleteDashboard' }" text>Dashboard</v-btn>
      <v-btn class="mx-2" :to="{ name: 'myProfile' }" text>Profile</v-btn>
    </template>

    <!-- User Menu -->
    <v-menu
      v-if="user"
      bottom
      min-width="200"
      rounded
      offset-y
    >
      <template #activator="{ props }">
        <v-btn v-bind="props" icon>
          <v-avatar color="secondary">
            <span class="font-weight-bold">{{ initials }}</span>
          </v-avatar>
        </v-btn>
      </template>

      <v-card>
        <v-card-text>
          <div class="text-center">
            <v-avatar color="secondary" class="mt-2 mb-2">
              <span class="font-weight-bold">{{ initials }}</span>
            </v-avatar>
            <h3>{{ name }}</h3>
            <p class="text-caption mt-1">{{ user.email }}</p>
            <v-chip
              size="small"
              :color="user.role === 'admin'
                ? 'error'
                : user.role === 'coach'
                ? 'primary'
                : 'success'"
              class="my-2"
            >
              {{ user.role }}
            </v-chip>
            <v-divider class="my-3"></v-divider>
            <v-btn variant="text" color="red" @click="logout">Logout</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
  </v-app-bar>
</template>
