<script setup>
import { ref } from "vue";
import { apiPost } from "../services/api";

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const error = ref("");
const success = ref("");

async function changePassword() {
  error.value = "";
  success.value = "";

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    error.value = "All fields are required";
    return;
  }

  if (newPassword.value.length < 6) {
    error.value = "New password must be at least 6 characters";
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = "New passwords do not match";
    return;
  }

  loading.value = true;

  try {
    await apiPost("/auth/change-password", {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    });

    success.value = "Password changed successfully!";
    
    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";
  } catch (e) {
    error.value = e.message || "Failed to change password";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page">
    <h2>Account Settings</h2>

    <div class="card">
      <h3>Change Password</h3>

      <input
        type="password"
        v-model="currentPassword"
        placeholder="Current Password"
      />

      <input
        type="password"
        v-model="newPassword"
        placeholder="New Password (min 6 characters)"
      />

      <input
        type="password"
        v-model="confirmPassword"
        placeholder="Confirm New Password"
      />

      <button @click="changePassword" :disabled="loading">
        {{ loading ? "Changing..." : "Change Password" }}
      </button>

      <p v-if="success" style="color: green; margin-top: 15px;">{{ success }}</p>
      <p v-if="error" style="color: red; margin-top: 15px;">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
}

.card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h3 {
  margin-top: 0;
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

button:hover:not(:disabled) {
  background: #45a049;
} 

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>