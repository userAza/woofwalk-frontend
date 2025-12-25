<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { apiGet, apiPost } from "../services/api";

const route = useRoute();

const walker = ref(null);
const availability = ref([]);
const dogs = ref([]);
const addons = ref([]);

const bookingDate = ref("");
const selectedDogs = ref([]);
const selectedAddons = ref([]);

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

function num(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function parseDateToYYYYMMDD(dateValue) {
  if (!dateValue) return null;

  if (typeof dateValue === "string" && dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
    return dateValue.substring(0, 10);
  }

  const d = new Date(dateValue);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const selectedAvailability = computed(() => {
  if (!bookingDate.value) return null;

  const match = availability.value.find((a) => {
    const slotDate = parseDateToYYYYMMDD(a.date);
    return slotDate === bookingDate.value;
  });

  if (!match) return null;

  return {
    date: bookingDate.value,
    start_time: normalizeTime(match.start_time),
    end_time: normalizeTime(match.end_time)
  };
});

const totalPrice = computed(() => {
  if (!walker.value) return "0.00";

  let total = num(walker.value.price_per_30min);

  selectedAddons.value.forEach((addonId) => {
    const addon = addons.value.find((a) => a.id === addonId);
    if (addon) total += num(addon.price);
  });

  return total.toFixed(2);
});

async function loadPage() {
  loading.value = true;
  error.value = "";
  success.value = "";

  try {
    const id = route.params.id;

    const res = await apiGet(`/walkers/${id}`);
    walker.value = res.walker ?? res;

    availability.value = Array.isArray(res.availability) ? res.availability : [];

    dogs.value = await apiGet("/dogs");

    // IMPORTANT: correct endpoint for routes/addons.js
    addons.value = await apiGet(`/addons/walker/${id}`);
    if (!Array.isArray(addons.value)) addons.value = [];
  } catch (e) {
    error.value = "Failed to load walker";
  } finally {
    loading.value = false;
  }
}

async function bookWalker() {
  error.value = "";
  success.value = "";

  const slot = selectedAvailability.value;

  if (!walker.value || !slot || !selectedDogs.value.length) {
    error.value = "Missing booking data";
    return;
  }

  try {
    await apiPost("/bookings", {
      walker_id: walker.value.id,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      dog_ids: selectedDogs.value,
      addon_ids: selectedAddons.value
    });

    success.value = "Booking created!";

    bookingDate.value = "";
    selectedDogs.value = [];
    selectedAddons.value = [];
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
      <p><strong>Price (30 min):</strong> €{{ Number(walker.price_per_30min || 0).toFixed(2) }}</p>
      <p><strong>Max dogs:</strong> {{ walker.max_dogs_per_walk }}</p>
    </div>

    <div class="card">
      <h3>Available time</h3>

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

      <div v-if="dogs.length">
        <h4>Select your dogs:</h4>
        <label v-for="d in dogs" :key="d.id" style="display:block;">
          <input type="checkbox" :value="d.id" v-model="selectedDogs" />
          {{ d.name }} — {{ d.breed }} ({{ d.age }}y)
        </label>
      </div>

      <div v-if="addons.length" style="margin-top:15px;">
        <h4>Optional add-ons:</h4>
        <label v-for="a in addons" :key="a.id" style="display:block;">
          <input type="checkbox" :value="a.id" v-model="selectedAddons" />
          {{ a.name }} — €{{ Number(a.price || 0).toFixed(2) }}
        </label>
      </div>

      <div v-if="bookingDate" style="margin-top:15px; font-size:18px; font-weight:bold;">
        Total Price: €{{ totalPrice }}
      </div>

      <button @click="bookWalker" style="margin-top:10px;">Book</button>

      <p v-if="error" style="color:red">{{ error }}</p>
      <p v-if="success" style="color:green">{{ success }}</p>
    </div>
  </div>

  <p v-if="loading">Loading...</p>
  <p v-if="!loading && error && !walker">{{ error }}</p>
</template>
