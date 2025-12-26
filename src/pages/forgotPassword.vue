<script setup>
import { ref } from "vue";
import { apiPost } from "../services/api";

const email = ref("");
const loading = ref(false);
const message = ref("");
const error = ref("");

async function requestReset() {
  if (!email.value) {
    error.value = "Please enter your email";
    return;
  }

  loading.value = true;
  error.value = "";
  message.value = "";

  try {
    const response = await apiPost("/auth/forgot-password", {
      email: email.value
    });

    message.value = "If an account exists with this email, a reset link has been sent!";
    email.value = "";
  } catch (e) {
    error.value = e.message || "Failed to send reset email";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page">
    <div class="form-container">
      <h2>Forgot Password</h2>
      
      <p style="margin-bottom: 20px; color: #666;">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <input
        type="email"
        v-model="email"
        placeholder="Email"
        @keyup.enter="requestReset"
      />

      <button @click="requestReset" :disabled="loading">
        {{ loading ? "Sending..." : "Send Reset Link" }}
      </button>

      <p v-if="message" style="color: green; margin-top: 15px;">{{ message }}</p>
      <p v-if="error" style="color: red; margin-top: 15px;">{{ error }}</p>

      <p style="margin-top: 20px;">
        <router-link to="/login">Back to Login</router-link>
      </p>
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

a {
  color: #667eea;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>