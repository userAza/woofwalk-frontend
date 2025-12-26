import { createRouter, createWebHistory } from "vue-router";

import Home from "../pages/home.vue";
import BrowseWalkers from "../pages/browseWalkers.vue";
import Login from "../pages/login.vue";
import Register from "../pages/register.vue";
import MyBookings from "../pages/myBookings.vue";
import VetFinder from '../pages/vetFinder.vue';
import ForgotPassword from '../pages/forgotPassword.vue';
import ResetPassword from '../pages/resetPassword.vue';
import AccountSettings from '../pages/accountSettings.vue';

const routes = [
  { path: "/", component: Home },

  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/forgot-password", component: ForgotPassword },
  { path: "/reset-password", component: ResetPassword },

  { path: "/profile", component: () => import("../pages/profile.vue"), meta: { auth: true } },
  { path: "/account-settings", component: AccountSettings, meta: { auth: true } },
  { path: "/walkers", component: BrowseWalkers, meta: { auth: true } },
  { path: "/walkers/:id", component: () => import("../pages/walkerProfile.vue"), meta: { auth: true } },
  { path: "/bookings", component: MyBookings, meta: { auth: true } },
  { path: "/vets", component: VetFinder },

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

  const publicPages = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/admin/login", "/vets"];
  const isPublicPage = publicPages.includes(to.path);

  if (to.meta.auth && !token) {
    return next("/login");
  }

  if ((to.path === "/login" || to.path === "/register") && token) {
    return next("/profile");
  }

  next();
});

export default router;