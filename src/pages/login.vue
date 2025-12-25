<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { apiPost } from "../services/api";

const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function submit() {
  error.value = "";
  loading.value = true;

  try {
    const res = await apiPost("/auth/login", {
      email: email.value.trim(),
      password: password.value
    });

    if (!res || !res.token) {
      throw new Error("Login failed");
    }

    localStorage.setItem("token", res.token);
    if (res.user) localStorage.setItem("user", JSON.stringify(res.user));

    router.push("/profile");
  } catch (e) {
    error.value = e.message || "Login failed";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page">
    <h2>Login</h2>

    <div class="card form-card">
      <div class="form">
        <input v-model="email" type="email" placeholder="Email" />
        <input v-model="password" type="password" placeholder="Password" />
        <button class="btn primary" :disabled="loading" @click="submit">
          {{ loading ? "Logging in..." : "Login" }}
        </button>

        <p v-if="error" class="error">{{ error }}</p>

        <p class="hint">
          No account yet?
          <router-link to="/register">Create one</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
