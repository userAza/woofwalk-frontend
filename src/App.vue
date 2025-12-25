<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const isLoggedIn = computed(() => !!localStorage.getItem("token"));

const user = computed(() => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
});

const isAdmin = computed(() => user.value?.role === "admin");

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  router.push("/");
}
</script>

<template>
  <div class="app">
    <h1>WoofWalk</h1>

    <nav class="nav">
      <router-link to="/">Home</router-link>

      <template v-if="isLoggedIn">
        <router-link to="/profile">Profile</router-link>
        <router-link to="/walkers">Browse Walkers</router-link>
        <router-link to="/bookings">My Bookings</router-link>

        <!-- ✅ ADMIN BUTTON (visible to everyone) -->
        <router-link to="/admin/login">Admin</router-link>

        <button class="link-btn" @click="logout">Logout</button>
      </template>

      <template v-else>
        <router-link to="/login">Login</router-link>
        <router-link to="/register">Register</router-link>
      </template>
    </nav>


    <router-view />
  </div>
</template>
