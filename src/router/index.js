import { createRouter, createWebHistory } from "vue-router";

import Home from "../pages/home.vue";
import BrowseWalkers from "../pages/browseWalkers.vue";
import Login from "../pages/login.vue";
import Register from "../pages/register.vue";
import MyBookings from "../pages/myBookings.vue";

const routes = [
  { path: "/", component: Home },

  // Auth pages (guests only)
  { path: "/login", component: Login, meta: { guestOnly: true } },
  { path: "/register", component: Register, meta: { guestOnly: true } },

  // Protected pages
  { path: "/profile", component: () => import("../pages/profile.vue"), meta: { auth: true } },
  { path: "/walkers", component: BrowseWalkers, meta: { auth: true } },
  { path: "/walkers/:id", component: () => import("../pages/walkerProfile.vue"), meta: { auth: true } },
  { path: "/bookings", component: MyBookings, meta: { auth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const token = localStorage.getItem("token");

  // If page requires auth and user is not logged in
  if (to.meta?.auth && !token) {
    return "/login";
  }

  // If page is guest-only and user IS logged in
  if (to.meta?.guestOnly && token) {
    return "/walkers";
  }
});

export default router;
