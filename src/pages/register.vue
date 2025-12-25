<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const name = ref("");
const email = ref("");
const password = ref("");
const error = ref(null);

const router = useRouter();

async function register() {
  error.value = null;

  if (!name.value || !email.value || !password.value) {
    error.value = "Please fill in all fields";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      error.value = data.error || "Registration failed";
      return;
    }

    localStorage.setItem("token", data.token);
    router.push("/walkers");
  } catch {
    error.value = "Registration failed";
  }
}
</script>

<template>
  <div class="page">
    <h2>Register</h2>

    <div class="card">
      <input
        placeholder="Name"
        v-model="name"
      />
      <br /><br />
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
      <button @click="register">Register</button>

      <p v-if="error" style="color:red; margin-top:10px;">
        {{ error }}
      </p>
    </div>
  </div>
</template>
