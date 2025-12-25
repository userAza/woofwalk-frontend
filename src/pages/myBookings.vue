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

async function load() {
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
  try {
    await apiPatch(`/bookings/${id}/cancel`, {});
    await load();
  } catch (e) {
    error.value = e.message || "Cancel failed";
  }
}

onMounted(load);
</script>

<template>
  <div class="page">
    <h2>My bookings</h2>

    <p v-if="loading">Loading...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="!loading && bookings.length === 0" class="card">
      No bookings yet.
    </div>

    <div v-for="b in bookings" :key="b.id" class="card booking-card">
      <div class="booking-row">
        <div>
          <strong>{{ b.walker_name }}</strong>
          <div class="muted">{{ formatDate(b.date) }}</div>
        </div>

        <div class="right">
          <div class="status">{{ b.status }}</div>
        </div>
      </div>

      <div class="muted" v-if="b.dogs">Dogs: {{ b.dogs }}</div>

      <div class="booking-actions">
        <button
          v-if="b.status !== 'cancelled' && b.status !== 'done' && b.status !== 'declined'"
          class="btn"
          @click="cancelBooking(b.id)"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
