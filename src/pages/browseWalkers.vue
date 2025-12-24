<script setup>
import { ref } from "vue";
import { apiGet } from "../services/api";


const location = ref("Antwerp");
const date = ref("2025-01-10");
const start_time = ref("09:00:00");
const end_time = ref("12:00:00");
const dogs = ref(1);

const walkers = ref([]);
const error = ref("");
const loading = ref(false);

async function search() {
  error.value = "";
  walkers.value = [];
  loading.value = true;

  try {
    const qs = new URLSearchParams({
      location: location.value,
      date: date.value,
      start_time: start_time.value,
      end_time: end_time.value,
      dogs: String(dogs.value),
    });

    walkers.value = await apiGet(`/api/walkers/search?${qs.toString()}`);
  } catch (e) {
    error.value = e.message || "Failed to fetch";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <h2>Available Dog Walkers</h2>

    <div style="margin: 20px 0;">
      <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
        <input v-model="location" placeholder="City" />
        <input v-model="date" type="date" />
        <input v-model="start_time" type="time" />
        <input v-model="end_time" type="time" />
        <input v-model.number="dogs" type="number" min="1" style="width:80px;" />
        <button @click="search">Search</button>
      </div>
    </div>

    <p v-if="loading">Loading...</p>
    <p v-if="error" style="color: red;">{{ error }}</p>

    <ul v-if="walkers.length">
      <li v-for="w in walkers" :key="w.id">
        {{ w.name }} — {{ w.location }} — €{{ Number(w.price_per_30min).toFixed(2) }}
      </li>
    </ul>

    <p v-else-if="!loading && !error">No walkers found for this filter.</p>
  </div>
</template>
