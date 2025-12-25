<script setup>
import { ref, onMounted } from "vue";
import { apiGet, apiPost } from "../services/api";

const user = ref(null);
const dogs = ref([]);

const dogName = ref("");
const dogBreed = ref("");
const dogAge = ref("");

const error = ref("");
const success = ref("");

async function loadProfile() {
  try {
    user.value = JSON.parse(localStorage.getItem("user"));
    dogs.value = await apiGet("/dogs");
  } catch (e) {
    error.value = "Failed to load profile";
  }
}

async function addDog() {
  error.value = "";
  success.value = "";

  if (!dogName.value || !dogBreed.value || dogAge.value === "") {
    error.value = "Please fill in all dog fields";
    return;
  }

  try {
    await apiPost("/dogs", {
      name: dogName.value,
      breed: dogBreed.value,
      age: Number(dogAge.value)
    });

    dogName.value = "";
    dogBreed.value = "";
    dogAge.value = "";

    success.value = "Dog added successfully";
    dogs.value = await apiGet("/dogs");
  } catch (e) {
    error.value = e.message || "Failed to add dog";
  }
}

onMounted(loadProfile);
</script>

<template>
  <div class="profile">
    <h2>My profile</h2>

    <div class="card" v-if="user">
      <p><strong>Name:</strong> {{ user.name }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
    </div>

    <div class="card">
      <h3>My dogs</h3>

      <ul v-if="dogs.length">
        <li v-for="d in dogs" :key="d.id">
          {{ d.name }} — {{ d.breed }} ({{ d.age }} years)
        </li>
      </ul>

      <p v-else>No dogs added yet.</p>
    </div>

    <div class="card">
      <h3>Add a dog</h3>

      <input
        v-model="dogName"
        placeholder="Dog name"
        style="margin-bottom: 10px; width: 100%; padding: 8px;"
      />

      <input
        v-model="dogBreed"
        placeholder="Breed"
        style="margin-bottom: 10px; width: 100%; padding: 8px;"
      />

      <input
        v-model="dogAge"
        type="number"
        placeholder="Age"
        style="margin-bottom: 10px; width: 100%; padding: 8px;"
      />

      <button @click="addDog">Add dog</button>

      <p v-if="error" style="color:red">{{ error }}</p>
      <p v-if="success" style="color:green">{{ success }}</p>
    </div>

    <div class="card">
      <router-link to="/walkers">Go to Browse Walkers →</router-link>
    </div>
  </div>
</template>
