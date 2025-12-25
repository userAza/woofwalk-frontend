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
      <input
        v-model="email"
        type="email"
        placeholder="Admin email"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
      />

      <button @click="login" :disabled="loading">
        {{ loading ? "Logging in..." : "Login as Admin" }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60px;
}

/* Bigger card */
.form-card {
  width: 100%;
  max-width: 520px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* Bigger inputs */
.form-card input {
  height: 52px;
  font-size: 18px;
  padding: 10px 14px;
}

/* Bigger button */
.form-card button {
  height: 52px;
  font-size: 18px;
  cursor: pointer;
}

/* Error */
.error {
  color: red;
  margin-top: 4px;
}
</style>
