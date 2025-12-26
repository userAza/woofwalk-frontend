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
    <!-- ALWAYS VISIBLE -->
    <router-link to="/">Home</router-link>
    
    <template v-if="!isLoggedIn">
      <router-link to="/login">Login</router-link>
      <router-link to="/register">Create account</router-link>
    </template>

    <!-- SHOW BUT PROTECTED (will redirect to login) -->
    <router-link to="/walkers">Browse Walkers</router-link>
    <router-link to="/vets">Find a Vet</router-link>
    
    <template v-if="isLoggedIn">
      <router-link to="/profile">Profile</router-link>
      <router-link to="/bookings">My Bookings</router-link>
      <button class="link-btn" @click="logout">Logout</button>
    </template>
    
    <template v-else>
      <router-link to="/admin/login">Admin</router-link>
    </template>
  </nav>

    <router-view />
  </div>
</template>