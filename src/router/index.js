import { createRouter, createWebHistory } from "vue-router";

// TEMP pages (we create real ones later)
const Home = { template: "<h2>Home</h2>" };
const Login = { template: "<h2>Login</h2>" };

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/login", name: "login", component: Login },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
