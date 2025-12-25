<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { apiPost } from "../services/api";

const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

async function submit() {
  error.value = "";
  loading.value = true;

  try {
    const res = await apiPost("/auth/register", {
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value
    });

    if (res && res.token) {
      localStorage.setItem("token", res.token);
      if (res.user) localStorage.setItem("user", JSON.stringify(res.user));
      router.push("/profile");
      return;
    }

    router.push("/login");
  } catch (e) {
    error.value = e.message || "Registration failed";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page">
    <h2>Create account</h2>

    <div class="card form-card">
      <div class="form">
        <input v-model="name" placeholder="Full name" />
        <input v-model="email" type="email" placeholder="Email" />
        <input v-model="password" type="password" placeholder="Password" />

        <button class="btn primary" :disabled="loading" @click="submit">
          {{ loading ? "Creating..." : "Create account" }}
        </button>

        <p v-if="error" class="error">{{ error }}</p>

        <p class="hint">
          Already have an account?
          <router-link to="/login">Login</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
