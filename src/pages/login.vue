<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const error = ref(null);

const router = useRouter();

async function login() {
  error.value = null;

  if (!email.value || !password.value) {
    error.value = "Please fill in all fields";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      error.value = data.error || "Login failed";
      return;
    }

    localStorage.setItem("token", data.token);
    router.push("/walkers");
  } catch {
    error.value = "Login failed";
  }
}
</script>

<template>
  <div class="page">
    <h2>Login</h2>

    <div class="card">
      <input
        type="email"
        placeholder="Email"
        v-model="email"
      />
      <br /><br />
      <input
        type="password"
        placeholder="Password"
        v-model="password"
      />
      <br /><br />
      <button @click="login">Login</button>

      <p v-if="error" style="color:red; margin-top:10px;">
        {{ error }}
      </p>
    </div>
  </div>
</template>
