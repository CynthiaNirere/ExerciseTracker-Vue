import { createStore } from "vuex";
import Utils from "../config/utils.js";

const user = Utils.getStore("user");

const store = createStore({
  state: {
    loginUser: user,
    currentUser: user,
  },
  
  mutations: {
    setLoginUser(state, user) {
      state.loginUser = user;
      state.currentUser = user;
      Utils.setStore("user", user);
    },
    
    setCurrentUser(state, user) {
      state.currentUser = user;
      state.loginUser = user;
      Utils.setStore("user", user);
    },
  },
  
  actions: {
    login({ commit }, user) {
      commit('setCurrentUser', user);
    },
    
    logout({ commit }) {
      commit('setCurrentUser', null);
      Utils.removeStore('user');
    }
  },
  
  getters: {
    getLoginUserInfo(state) {
      return state.loginUser;
    },
    
    isAuthenticated: state => !!state.currentUser,
    currentUser: state => state.currentUser,
  }
});

export default store;