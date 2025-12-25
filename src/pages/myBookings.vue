<script setup>
import { ref, onMounted } from "vue";
import { apiGet, apiPatch } from "../services/api";

const bookings = ref([]);
const loading = ref(false);
const error = ref("");

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("nl-BE");
}

function formatTime(timeStr) {
  return (timeStr || "").slice(0, 5);
}

function parseAddons(addonsStr) {
  if (!addonsStr) return [];

  return addonsStr.split("|").map((a) => {
    const [name, price] = a.split(":");
    return { name, price: Number(price) };
  });
}

function calculateTotal(basePrice, addons) {
  return (
    basePrice +
    addons.reduce((sum, a) => sum + a.price, 0)
  ).toFixed(2);
}

async function loadBookings() {
  loading.value = true;
  error.value = "";

  try {
    bookings.value = await apiGet("/bookings");
  } catch (e) {
    error.value = e.message || "Failed to load bookings";
  } finally {
    loading.value = false;
  }
}

async function cancelBooking(id) {
  if (!confirm("Cancel this booking?")) return;

  try {
    await apiPatch(`/bookings/${id}/cancel`, {});
    await loadBookings();
  } catch (e) {
    error.value = e.message || "Failed to cancel booking";
  }
}

onMounted(loadBookings);
</script>

<template>
  <div class="profile">
    <h2>My bookings</h2>

    <p v-if="loading">Loading...</p>
    <p v-if="error" style="color:red">{{ error }}</p>

    <div v-for="b in bookings" :key="b.id" class="card">
      <p><strong>Walker:</strong> {{ b.walker_name }}</p>
      <p><strong>Date:</strong> {{ formatDate(b.date) }}</p>
      <p><strong>Time:</strong> {{ formatTime(b.start_time) }} → {{ formatTime(b.end_time) }}</p>
      <p><strong>Dogs:</strong> {{ b.dogs }}</p>
      <p><strong>Status:</strong> {{ b.status }}</p>

      <div v-if="b.addons">
        <h4>Extras:</h4>
        <p
          v-for="a in parseAddons(b.addons)"
          :key="a.name"
        >
          {{ a.name }} +€{{ a.price.toFixed(2) }}
        </p>
      </div>

      <p style="font-weight:bold;margin-top:10px;">
        Total price: €
        {{ calculateTotal(10, parseAddons(b.addons)) }}
      </p>

      <button
        v-if="b.status !== 'cancelled' && b.status !== 'done'"
        @click="cancelBooking(b.id)"
        style="margin-top:10px"
      >
        Cancel booking
      </button>
    </div>
  </div>
</template>
