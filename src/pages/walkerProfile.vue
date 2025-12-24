<script setup>
import { ref, onMounted } from "vue";
import { apiGet } from "../services/api";
import { useRoute } from "vue-router";

const route = useRoute();

const walker = ref(null);
const availability = ref([]);
const loading = ref(false);
const error = ref(null);
onMounted(async () => {
  loading.value = true;

  try {
    const res = await apiGet(`/walkers/${route.params.id}`);
    walker.value = res.walker;

    availability.value = await apiGet(
      `/walkers/${route.params.id}/availability`
    );
  } catch (e) {
    error.value = "Failed to load walker";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <p v-if="error" style="color:red">{{ error }}</p>

    <div v-if="walker">
      <h2>{{ walker.name }}</h2>
      <p><strong>Location:</strong> {{ walker.location }}</p>
      <p><strong>Bio:</strong> {{ walker.bio }}</p>
      <p><strong>Price (30 min):</strong> €{{ walker.price_per_30min }}</p>
      <p><strong>Max dogs:</strong> {{ walker.max_dogs_per_walk }}</p>

      <h3>Available times</h3>

      <ul v-if="availability.length">
        <li v-for="a in availability" :key="a.id">
          {{ a.date }} — {{ a.start_time }} → {{ a.end_time }}
        </li>
      </ul>

      <p v-else>No availability listed.</p>
    </div>
  </div>
</template>
