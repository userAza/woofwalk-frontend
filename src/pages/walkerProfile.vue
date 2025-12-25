<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { apiGet, apiPost } from "../services/api";

const route = useRoute();

const walker = ref(null);
const availability = ref([]);
const dogs = ref([]);

const bookingDate = ref("");
const selectedSlotKey = ref("");
const selectedDogs = ref([]);

const loading = ref(false);
const error = ref("");
const success = ref("");

function normalizeTime(t) {
  if (!t) return t;
  return t.length === 5 ? `${t}:00` : t;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-BE");
}

function formatTime(timeStr) {
  return (timeStr || "").slice(0, 5);
}

async function loadPage() {
  loading.value = true;
  error.value = "";
  success.value = "";

  try {
    const id = route.params.id;

    const res = await apiGet(`/walkers/${id}`);

    // backend may return { walker, availability } OR just walker
    walker.value = res.walker ?? res;

    availability.value = Array.isArray(res.availability)
    ? res.availability
    : [];


    dogs.value = await apiGet("/dogs");
  } catch (e) {
    error.value = "Failed to load walker";
  } finally {
    loading.value = false;
  }
}

const slotsForSelectedDate = computed(() => {
  if (!bookingDate.value) return [];
  return availability.value.filter(a => a.date === bookingDate.value);
});

async function bookWalker() {
  error.value = "";
  success.value = "";

  if (!walker.value || !bookingDate.value || !selectedSlotKey.value || !selectedDogs.value.length) {
    error.value = "Missing booking data";
    return;
  }

  const [date, start_time, end_time] = selectedSlotKey.value.split("|");

  try {
    await apiPost("/bookings", {
      walker_id: walker.value.id,
      date,
      start_time: normalizeTime(start_time),
      end_time: normalizeTime(end_time),
      dog_ids: selectedDogs.value
    });

    success.value = "Booking created!";
  } catch (e) {
    error.value = e?.message || "Booking failed";
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
        <li v-for="(a, idx) in availability" :key="idx">
          {{ formatDate(a.date) }} —
          {{ formatTime(a.start_time) }} → {{ formatTime(a.end_time) }}
        </li>
      </ul>

      <p v-else>No availability listed.</p>
    </div>

    <div class="card">
      <h3>Book this walker</h3>

      <input type="date" v-model="bookingDate" />

      <select v-model="selectedSlotKey" :disabled="!bookingDate">
        <option value="">Select a slot</option>
        <option
          v-for="(s, idx) in slotsForSelectedDate"
          :key="idx"
          :value="`${s.date}|${s.start_time}|${s.end_time}`"
        >
          {{ formatTime(s.start_time) }} → {{ formatTime(s.end_time) }}
        </option>
      </select>

      <div v-if="dogs.length">
        <label v-for="d in dogs" :key="d.id">
          <input type="checkbox" :value="d.id" v-model="selectedDogs" />
          {{ d.name }} — {{ d.breed }} ({{ d.age }}y)
        </label>
      </div>

      <button @click="bookWalker">Book</button>

      <p v-if="error" style="color:red">{{ error }}</p>
      <p v-if="success" style="color:green">{{ success }}</p>
    </div>
  </div>

  <p v-if="loading">Loading...</p>
  <p v-if="!loading && error && !walker">{{ error }}</p>
</template>
