import { createApp } from "vue";
import App from "./App.vue";
import router from "./router.js";
import vuetify from "./plugins/vuetify.js";
import store from "./store/store.js";

createApp(App)
  .use(vuetify)
  .use(store)  
  .use(router)
  .mount("#app");