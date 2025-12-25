<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { apiGet } from "../services/api";

const route = useRoute();

const walker = ref(null);
const availability = ref([]);
const loading = ref(false);
const error = ref(null);

const date = ref("");
const dogIds = ref("");
const success = ref(null);

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("nl-BE");
}

function formatTime(timeStr) {
  return timeStr.slice(0, 5);
}

async function book() {
  error.value = null;
  success.value = null;

  if (!date.value || !dogIds.value) {
    error.value = "Please fill in all fields";
    return;
  }

  const ids = dogIds.value
    .split(",")
    .map(x => Number(x.trim()))
    .filter(Boolean);

  if (ids.length === 0) {
    error.value = "Invalid dog IDs";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        walker_id: walker.value.id,
        date: date.value,
        dog_ids: ids
      })
    });

    const data = await res.json();

    if (!res.ok) {
      error.value = data.error || "Booking failed";
      return;
    }

    success.value = "Booking created successfully";
    date.value = "";
    dogIds.value = "";
  } catch {
    error.value = "Booking failed";
  }
}

onMounted(async () => {
  loading.value = true;

  try {
    const res = await apiGet(`/walkers/${route.params.id}`);
    walker.value = res.walker;

    availability.value = await apiGet(
      `/walkers/${route.params.id}/availability`
    );
  } catch {
    error.value = "Failed to load walker";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="profile" v-if="walker">
    <h2>{{ walker.name }}</h2>

    <div class="card">
      <p><strong>Location:</strong> {{ walker.location }}</p>
      <p><strong>Bio:</strong> {{ walker.bio }}</p>
      <p><strong>Price (30 min):</strong> €{{ walker.price_per_30min }}</p>
      <p><strong>Max dogs:</strong> {{ walker.max_dogs_per_walk }}</p>
    </div>

    <div class="card">
      <h3>Available times</h3>

      <ul v-if="availability.length">
        <li v-for="a in availability" :key="a.id">
          {{ formatDate(a.date) }} —
          {{ formatTime(a.start_time) }} → {{ formatTime(a.end_time) }}
        </li>
      </ul>

      <p v-else>No availability listed.</p>
    </div>

    <div class="card">
      <h3>Book this walker</h3>

      <input type="date" v-model="date" />
      <input
        placeholder="Dog IDs (comma separated)"
        v-model="dogIds"
        style="margin-left:10px;"
      />
      <button style="margin-left:10px;" @click="book">
        Book
      </button>

      <p v-if="error" style="color:red; margin-top:10px;">{{ error }}</p>
      <p v-if="success" style="color:green; margin-top:10px;">{{ success }}</p>
    </div>
  </div>

  <p v-if="loading">Loading...</p>
  <p v-if="error">{{ error }}</p>
</template>
