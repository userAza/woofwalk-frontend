<script setup>
import { ref, onMounted } from "vue";

const walkers = ref([]);
const error = ref("");

onMounted(async () => {
  try {
    const res = await fetch(
      "http://localhost:3000/api/walkers/search?" +
        new URLSearchParams({
          location: "Antwerp",
          date: "2025-01-10",
          start_time: "09:00",
          end_time: "10:00",
          dogs: 1
        })
    );

    walkers.value = await res.json();
  } catch {
    error.value = "Failed to load walkers";
  }
});
</script>

<template>
  <h2>Available Dog Walkers</h2>

  <p v-if="error">{{ error }}</p>

  <ul>
    <li v-for="w in walkers" :key="w.id">
      {{ w.name }} – {{ w.location }} – €{{ w.price_per_30min }}
    </li>
  </ul>
</template>
