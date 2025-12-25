import { createRouter, createWebHistory } from "vue-router";

import Home from "../pages/home.vue";
import BrowseWalkers from "../pages/browseWalkers.vue";
import Login from "../pages/login.vue";
import Register from "../pages/register.vue";
import MyBookings from "../pages/myBookings.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },

  { path: "/walkers", component: BrowseWalkers, meta: { auth: true } },
  { path: "/walkers/:id", component: () => import("../pages/walkerProfile.vue"), meta: { auth: true } },
  { path: "/bookings", component: MyBookings, meta: { auth: true } },
  { path: "/profile", component: () => import("../pages/profile.vue"), meta: { auth: true } },

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  if (to.meta && to.meta.auth) {
    const token = localStorage.getItem("token");
    if (!token) return "/login";
  }
});

export default router;
