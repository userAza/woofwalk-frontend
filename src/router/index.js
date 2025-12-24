import { createRouter, createWebHistory } from "vue-router";

import Home from "../pages/home.vue";
import BrowseWalkers from "../pages/browseWalkers.vue";
import Login from "../pages/login.vue";
import Register from "../pages/register.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/walkers", component: BrowseWalkers },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/walkers/:id", component: () => import("../pages/walkerProfile.vue") }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
