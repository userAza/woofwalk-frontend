<script setup>
import { ref, onMounted } from "vue";
import { apiGet, apiPatch } from "../services/api";

const bookings = ref([]);
const loading = ref(false);
const error = ref("");

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-BE");
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
  if (!confirm("Are you sure you want to cancel this booking?")) {
    return;
  }

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

    <div v-if="!loading && bookings.length === 0" class="card">
      You have no bookings yet.
    </div>

    <div
      v-for="b in bookings"
      :key="b.id"
      class="card"
      style="text-align:left"
    >
      <p>
        <strong>Walker:</strong> {{ b.walker_name }}
      </p>

      <p>
        <strong>Date:</strong> {{ formatDate(b.date) }}
      </p>

      <p v-if="b.dogs">
        <strong>Dogs:</strong> {{ b.dogs }}
      </p>

      <p>
        <strong>Status:</strong> {{ b.status }}
      </p>

      <button
        v-if="b.status !== 'cancelled' && b.status !== 'done'"
        @click="cancelBooking(b.id)"
        style="margin-top: 10px"
      >
        Cancel booking
      </button>
    </div>
  </div>
</template>
