<script setup>
import { ref, onMounted } from "vue";
import { apiGet, apiPost, apiPatch } from "../../services/api";


const users = ref([]);
const walkers = ref([]);
const error = ref("");
const loading = ref(false);

// Load admin data
async function loadAdminData() {
  loading.value = true;
  error.value = "";

  try {
    users.value = await apiGet("/admin/users");
    walkers.value = await apiGet("/admin/walkers");
  } catch (e) {
    error.value = "Failed to load admin data";
  } finally {
    loading.value = false;
  }
}

// Toggle user subscription
async function toggleSubscription(user) {
  try {
    await apiPost(`/admin/users/${user.id}/subscription`);
    user.subscription_active = user.subscription_active ? 0 : 1;
  } catch {
    alert("Failed to update subscription");
  }
}

// Ban / unban walker
async function toggleBan(walker) {
  try {
    await apiPatch(
  `/admin/walkers/${walker.id}/${walker.is_banned ? "unban" : "ban"}`
);

    walker.is_banned = walker.is_banned ? 0 : 1;
  } catch {
    alert("Failed to update walker");
  }
}

async function toggleUserBan(user) {
  try {
    await apiPatch(
      `/admin/users/${user.id}/${user.is_banned ? "unban" : "ban"}`
    );
    user.is_banned = user.is_banned ? 0 : 1;
  } catch {
    alert("Failed to update user");
  }
}


onMounted(loadAdminData);
</script>

<template>
  <div class="page">
    <h2>Admin Dashboard</h2>

    <p v-if="loading">Loading...</p>
    <p v-if="error" style="color:red">{{ error }}</p>

    <!-- USERS -->
    <div class="card">
      <h3>Users</h3>

      <table border="1" width="100%">
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Subscription</th>
          <th>Status</th>
          <th>Action</th>
        </tr>

        <tr v-for="u in users" :key="u.id">
          <td>{{ u.name }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.role }}</td>
          <td>{{ u.subscription_active ? "Active" : "Inactive" }}</td>
            <td>{{ u.is_banned ? "Banned" : "Active" }}</td>

            <td>
            <button @click="toggleSubscription(u)">
                Toggle subscription
            </button>

            <button @click="toggleUserBan(u)" style="margin-left:8px;">
                {{ u.is_banned ? "Unban" : "Ban" }}
            </button>
            </td>

        </tr>
      </table>
    </div>

    <!-- WALKERS -->
    <div class="card" style="margin-top:30px;">
      <h3>Walkers</h3>

      <table border="1" width="100%">
        <tr>
          <th>Name</th>
          <th>Location</th>
          <th>Price</th>
          <th>Status</th>
          <th>Action</th>
        </tr>

        <tr v-for="w in walkers" :key="w.id">
          <td>{{ w.name }}</td>
          <td>{{ w.location }}</td>
          <td>€{{ w.price_per_30min }}</td>
          <td>{{ w.is_banned ? "Banned" : "Active" }}</td>
          <td>
            <button @click="toggleBan(w)">
              {{ w.is_banned ? "Unban" : "Ban" }}
            </button>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
