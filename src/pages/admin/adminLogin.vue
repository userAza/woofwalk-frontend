<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { apiPost } from "../../services/api";

const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function login() {
  error.value = "";
  loading.value = true;

  try {
    const res = await apiPost("/auth/login", {
      email: email.value.trim(),
      password: password.value
    });

    if (!res || !res.token || !res.user) {
      throw new Error("Login failed");
    }

    if (res.user.role !== "admin") {
      throw new Error("You are not an admin");
    }

    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));

    router.push("/admin");
  } catch (e) {
    error.value = e.message || "Admin login failed";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page">
    <h2>Admin Login</h2>

    <div class="card form-card">
      <input v-model="email" type="email" placeholder="Admin email" />
      <input v-model="password" type="password" placeholder="Password" />

      <button @click="login" :disabled="loading">
        {{ loading ? "Logging in..." : "Login as Admin" }}
      </button>

      <p v-if="error" style="color:red">{{ error }}</p>
    </div>
  </div>
</template>
