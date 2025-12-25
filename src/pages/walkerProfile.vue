<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { apiGet, apiPost } from "../services/api";

const route = useRoute();

const walker = ref(null);
const availability = ref([]);
const dogs = ref([]);

const bookingDate = ref("");
const selectedDogs = ref([]);

const loading = ref(false);
const error = ref("");
const success = ref("");

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-BE");
}

function formatTime(timeStr) {
  return timeStr.slice(0, 5);
}

async function loadPage() {
  loading.value = true;
  error.value = "";

  try {
    const res = await apiGet(`/walkers/${route.params.id}`);
    walker.value = res.walker;

    availability.value = await apiGet(
      `/walkers/${route.params.id}/availability`
    );

    dogs.value = await apiGet("/dogs");
  } catch (e) {
    error.value = "Failed to load walker";
  } finally {
    loading.value = false;
  }
}

async function bookWalker() {
  error.value = "";
  success.value = "";

  if (!bookingDate.value || selectedDogs.value.length === 0) {
    error.value = "Please select a date and at least one dog";
    return;
  }

  try {
    await apiPost("/bookings", {
      walker_id: Number(route.params.id),
      date: bookingDate.value,
      dog_ids: selectedDogs.value
    });

    success.value = "Booking created successfully";
    selectedDogs.value = [];
  } catch (e) {
    error.value = e.message || "Booking failed";
  }
}

onMounted(loadPage);
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

      <input
        type="date"
        v-model="bookingDate"
        style="margin-bottom: 12px; width: 100%; padding: 8px;"
      />

      <div v-if="dogs.length">
        <div
          v-for="d in dogs"
          :key="d.id"
          style="text-align:left; margin-bottom: 6px;"
        >
          <label>
            <input
              type="checkbox"
              :value="d.id"
              v-model="selectedDogs"
            />
            {{ d.name }} — {{ d.breed }} ({{ d.age }}y)
          </label>
        </div>
      </div>

      <p v-else>No dogs found for your account.</p>

      <button
        @click="bookWalker"
        :disabled="!bookingDate || selectedDogs.length === 0"
        style="margin-top: 12px;"
      >
        Book
      </button>

      <p v-if="error" style="color:red">{{ error }}</p>
      <p v-if="success" style="color:green">{{ success }}</p>
    </div>
  </div>

  <p v-if="loading">Loading...</p>
  <p v-if="error">{{ error }}</p>
</template>
