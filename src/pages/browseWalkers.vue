<script setup>
import { ref } from "vue";
import { apiGet } from "../services/api";

const location = ref("Antwerp");
const date = ref("2025-01-10");
const start_time = ref("09:00");
const end_time = ref("12:00");
const dogs = ref(1);

const walkers = ref([]);
const error = ref(null);
const loading = ref(false);

function normalizeTime(t) {
  if (!t) return t;
  return t.length === 5 ? `${t}:00` : t;
}

async function search() {
  if (!location.value || !date.value || !start_time.value || !end_time.value || !dogs.value) {
    error.value = "Please fill in all fields";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const query = new URLSearchParams({
      location: location.value,
      date: date.value,
      start_time: normalizeTime(start_time.value),
      end_time: normalizeTime(end_time.value),
      dogs: String(dogs.value)
    }).toString();

    walkers.value = await apiGet(`/walkers/search?${query}`);
  } catch (e) {
    error.value = e?.message || "Failed to fetch";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <h2>Available Dog Walkers</h2>

    <div style="margin: 20px 0;">
      <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; align-items:flex-end;">
        <div>
          <div style="font-size:12px;">City</div>
          <input v-model="location" placeholder="City" />
        </div>

        <div>
          <div style="font-size:12px;">Date</div>
          <input v-model="date" type="date" />
        </div>

        <div>
          <div style="font-size:12px;">Start time</div>
          <input v-model="start_time" type="time" />
        </div>

        <div>
          <div style="font-size:12px;">End time</div>
          <input v-model="end_time" type="time" />
        </div>

        <div>
          <div style="font-size:12px;">Dogs</div>
          <input v-model.number="dogs" type="number" min="1" style="width:80px;" />
        </div>

        <button @click="search">Search</button>
      </div>
    </div>

    <p v-if="loading">Loading...</p>
    <p v-if="error" style="color: red;">{{ error }}</p>

    <ul v-if="walkers.length">
      <li v-for="w in walkers" :key="w.id">
        <router-link :to="`/walkers/${w.id}`">
          {{ w.name }}
        </router-link>
      </li>
    </ul>

    <p v-else-if="!loading && !error">No walkers found for this filter.</p>
  </div>
</template>
