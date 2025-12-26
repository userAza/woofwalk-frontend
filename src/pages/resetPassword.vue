<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiPost } from "../services/api";

const route = useRoute();
const router = useRouter();

const token = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const error = ref("");
const success = ref(false);

onMounted(() => {
  token.value = route.query.token || "";
  
  if (!token.value) {
    error.value = "Invalid or missing reset token";
  }
});

async function resetPassword() {
  error.value = "";

  if (!newPassword.value) {
    error.value = "Please enter a new password";
    return;
  }

  if (newPassword.value.length < 6) {
    error.value = "Password must be at least 6 characters";
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = "Passwords do not match";
    return;
  }

  loading.value = true;

  try {
    await apiPost("/auth/reset-password", {
      token: token.value,
      newPassword: newPassword.value
    });

    success.value = true;

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (e) {
    error.value = e.message || "Failed to reset password";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page">
    <div class="form-container">
      <h2>Reset Password</h2>

      <div v-if="success">
        <p style="color: green; text-align: center;">
          ✅ Password reset successfully! Redirecting to login...
        </p>
      </div>

      <div v-else>
        <input
          type="password"
          v-model="newPassword"
          placeholder="New Password"
          @keyup.enter="resetPassword"
        />

        <input
          type="password"
          v-model="confirmPassword"
          placeholder="Confirm Password"
          @keyup.enter="resetPassword"
        />

        <button @click="resetPassword" :disabled="loading || !token">
          {{ loading ? "Resetting..." : "Reset Password" }}
        </button>

        <p v-if="error" style="color: red; margin-top: 15px;">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 20px;
}

.form-container {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 400px;
  width: 100%;
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
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