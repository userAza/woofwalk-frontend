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
    <!-- NOT LOGGED IN -->
    <template v-if="!isLoggedIn">
      <div class="nav-grid">
        <router-link class="nav-btn" to="/">Home</router-link>
        <router-link class="nav-btn" to="/login">Login</router-link>
        <router-link class="nav-btn" to="/register">Create account</router-link>
      </div>

      <!-- Admin stays separate -->
      <router-link class="admin-link" to="/admin/login">Admin</router-link>
    </template>

    <!-- LOGGED IN -->
    <template v-else>
      <router-link to="/">Home</router-link>
      <router-link to="/profile">Profile</router-link>
      <router-link to="/walkers">Browse Walkers</router-link>
      <router-link to="/bookings">My Bookings</router-link>
      <router-link to="/admin/login">Admin</router-link>
      <button class="link-btn" @click="logout">Logout</button>
    </template>
  </nav>


    <router-view />
  </div>
</template>

<style scoped>
.auth-grid {
  display: grid;
  grid-auto-flow: column;
  gap: 16px;
  align-items: center;
}
.nav-grid {
  display: grid;
  grid-auto-flow: column;
  gap: 16px;
  margin-bottom: 8px;
}

.nav-btn {
  padding: 8px 16px;
  border: 1px solid #aaa;
  border-radius: 6px;
  text-decoration: none;
  background: white;
  font-weight: 500;
}

.nav-btn:hover {
  background: #f3f3f3;
}

.admin-link {
  margin-left: 12px;
  position: relative;
  top: 10px; /* lowers it slightly to align with buttons */


}

</style>
