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

<style scoped>
    .page {
  padding-top: 5px;
  padding-bottom: 140px;
}

h2 {
  margin-bottom: 40px;
  font-size: 28px;
}

.card {
  max-width: 520px;          /* wider */
  padding: 32px 36px;        /* more space inside */
}

.card input {
  width: 100%;
  padding: 12px 14px;        /* taller inputs */
  font-size: 16px;
  margin-bottom: 14px;
}

.card button {
  padding: 12px 18px;        /* bigger button */
  font-size: 16px;
}

.card p {
  margin-top: 16px;
  font-size: 14px;
}
.card {
  margin: 0 auto;   /* ← THIS centers it */
}

</style scoped>
