<script setup>
import ocLogo from "/oc-logo-white.png";
import { ref, onMounted, watch } from "vue";
import Utils from "../config/utils";
import AuthServices from "../services/authServices";
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()
const user = ref(null);
const title = ref("Exercise Tracker"); 
const initials = ref("");
const name = ref("");
const logoURL = ref("");

const resetMenu = () => {
  user.value = Utils.getStore("user");
  
  if (user.value && user.value.fName && user.value.lName) {
    initials.value = user.value.fName[0] + user.value.lName[0];
    name.value = user.value.fName + " " + user.value.lName;
  } else if (user.value && user.value.first_name && user.value.last_name) {
    initials.value = user.value.first_name[0] + user.value.last_name[0];
    name.value = user.value.first_name + " " + user.value.last_name;
  } else {
    initials.value = "";
    name.value = "";
  }
};

const logout = () => {
  console.log('🚪 Logging out...');
  
  if (user.value && user.value.token) {
    AuthServices.logoutUser(user.value)
      .then((response) => {
        console.log(' Backend logout successful:', response);
      })
      .catch((error) => {
        console.log("Backend logout error (continuing anyway):", error);
      });
  }
  
  store.commit('setCurrentUser', null);
  store.commit('setLoginUser', null);
  Utils.removeItem("user");
  user.value = null;
  initials.value = "";
  name.value = "";
  
  console.log(' Logged out successfully, redirecting to login');
  router.push({ name: "login" });
};

watch(() => store.state.currentUser, (newUser) => {
  if (newUser) {
    resetMenu();
  }
});

onMounted(() => {
  logoURL.value = ocLogo;
  resetMenu();
});
</script>

<template>
  <div>
    <v-app-bar app>
      <router-link :to="{ name: 'coach-dashboard' }">
        <v-img
          class="mx-2"
          :src="logoURL"
          height="50"
          width="50"
          contain
        ></v-img>
      </router-link>
      <v-toolbar-title class="title">
        {{ title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      
      <div v-if="user">
        <v-btn class="mx-2" :to="{ name: 'coach-dashboard' }"> Coach Dashboard </v-btn>
      </div>
      
      <v-menu bottom min-width="200px" rounded offset-y v-if="user">
        <template #activator="{ props }">
          <v-btn v-bind="props" icon x-large>
            <v-avatar v-if="user" color="secondary">
              <span class="accent--text font-weight-bold">{{ initials }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <div class="mx-auto text-center">
              <v-avatar color="secondary" class="mt-2 mb-2">
                <span class="accent--text font-weight-bold">{{
                  initials
                }}</span>
              </v-avatar>
              <h3>{{ name }}</h3>
              <p class="text-caption mt-1">
                {{ user.email }}
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn depressed rounded text @click="logout"> Logout </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-app-bar>
  </div>
</template>