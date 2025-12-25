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
  { path: "/bookings", component: MyBookings, meta: { auth: true } },

  // Admin
  { path: "/admin/login", component: () => import("../pages/admin/adminLogin.vue") },
  {
    path: "/admin",
    component: () => import("../pages/admin/adminDashboard.vue"),
    meta: { auth: true, admin: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  const publicPages = ["/", "/login", "/register", "/admin/login"];
  const authRequired = !publicPages.includes(to.path);

  if (authRequired && !token) {
    return next("/login");
  }

  if ((to.path === "/login" || to.path === "/register") && token) {
    return next("/profile");
  }

  next();
});


export default router;
