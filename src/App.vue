<script setup>
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const isLoggedIn = ref(false);

function syncAuth() {
  isLoggedIn.value = !!localStorage.getItem("token");
}

watch(
  () => route.fullPath,
  () => {
    syncAuth();
  },
  { immediate: true }
);

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  syncAuth();
  router.push("/");
}
</script>

<template>
  <div class="app">
    <h1>WoofWalk</h1>

  <nav class="nav">
  <!-- NOT LOGGED IN -->
  <template v-if="!isLoggedIn">
    <router-link to="/">Home</router-link>
    <router-link to="/login">Login</router-link>
    <router-link to="/register">Create account</router-link>
    <router-link to="/walkers">Browse Walkers</router-link>
    <router-link to="/vets">Find a Vet</router-link>
    <router-link to="/admin/login">Admin</router-link>
  </template>

  <!-- LOGGED IN -->
  <template v-else>
    <router-link to="/">Home</router-link>
    <router-link to="/profile">Profile</router-link>
    <router-link to="/account-settings">Account Settings</router-link>
    <router-link to="/walkers">Browse Walkers</router-link>
    <router-link to="/bookings">My Bookings</router-link>
    <router-link to="/vets">Find a Vet</router-link>
    <router-link to="/admin/login">Admin</router-link>
    <button class="link-btn" @click="logout">Logout</button>
  </template>
</nav>

    <router-view />
  </div>
</template>