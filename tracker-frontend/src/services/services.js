import axios from "axios";
import Utils from "../config/utils.js";
import AuthServices from "./authServices.js";
import Router from "../router.js";

// Use environment variable for API URL
var baseurl = "";
if (import.meta.env.DEV) {
  // Development: use the backend URL from .env
  baseurl = import.meta.env.VITE_APP_API_URL || "http://localhost:3100/tracker-t1/";
} else {
  // Production: use relative path
  baseurl = "/tracker-t1/";
}

const apiClient = axios.create({
  baseURL: baseurl,
  withCredentials: true,  // Keep true since your backend uses credentials
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  transformRequest: (data, headers) => {
    let user = Utils.getStore("user");
    if (user != null) {
      let token = user.token;
      let authHeader = "";
      if (token != null && token != "") authHeader = "Bearer " + token;
      headers["Authorization"] = authHeader;
    }
    return JSON.stringify(data);
  },
  transformResponse: function (data) {
    data = JSON.parse(data);
    
    if (data.message !== undefined && data.message.includes("Unauthorized")) {
      AuthServices.logoutUser(Utils.getStore("user"))
        .then((response) => {
          console.log(response);
          Utils.removeItem("user");
          Router.push({ name: "login" });
        })
        .catch((error) => {
          console.log("error", error);
        });
    }
    
    return data;
  },
});

export default apiClient;