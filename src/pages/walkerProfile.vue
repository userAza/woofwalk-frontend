<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiGet, apiPost } from "../services/api";

const route = useRoute();
const router = useRouter();

const walker = ref(null);
const availability = ref([]);
const loading = ref(false);
const error = ref("");

const isLoggedIn = computed(() => !!localStorage.getItem("token"));

const myDogs = ref([]);
const dogsLoading = ref(false);

const bookingDate = ref("");
const selectedDogIds = ref([]);
const bookingLoading = ref(false);
const bookingError = ref("");
const bookingSuccess = ref("");

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

  try {
    const res = await apiGet(`/walkers/${route.params.id}`);
    walker.value = res.walker;

    availability.value = await apiGet(`/walkers/${route.params.id}/availability`);
  } catch (e) {
    error.value = e.message || "Failed to load walker";
  } finally {
    loading.value = false;
  }
}

async function loadDogs() {
  if (!isLoggedIn.value) return;

  dogsLoading.value = true;
  try {
    myDogs.value = await apiGet("/dogs");
  } catch {
    myDogs.value = [];
  } finally {
    dogsLoading.value = false;
  }
}

async function book() {
  bookingError.value = "";
  bookingSuccess.value = "";

  if (!isLoggedIn.value) {
    router.push("/login");
    return;
  }

  if (!bookingDate.value) {
    bookingError.value = "Please select a date";
    return;
  }

  if (!selectedDogIds.value.length) {
    bookingError.value = "Please select at least one dog";
    return;
  }

  bookingLoading.value = true;

  try {
    await apiPost("/bookings", {
      walker_id: Number(route.params.id),
      date: bookingDate.value,
      dog_ids: selectedDogIds.value.map(Number),
      addon_ids: []
    });

    bookingSuccess.value = "Booking created! You can manage it in My Bookings.";
    selectedDogIds.value = [];
  } catch (e) {
    bookingError.value = e.message || "Booking failed";
  } finally {
    bookingLoading.value = false;
  }
}

onMounted(async () => {
  await loadPage();
  await loadDogs();
});
</script>

<template>
  <div class="page" v-if="walker">
    <h2>{{ walker.name }}</h2>

    <div class="card">
      <p><strong>Location:</strong> {{ walker.location }}</p>
      <p><strong>Bio:</strong> {{ walker.bio }}</p>
      <p><strong>Price (30 min):</strong> €{{ Number(walker.price_per_30min).toFixed(2) }}</p>
      <p><strong>Max dogs:</strong> {{ walker.max_dogs_per_walk }}</p>
    </div>

    <div class="card">
      <h3>Available times</h3>

      <ul v-if="availability.length" class="list">
        <li v-for="a in availability" :key="a.id">
          {{ formatDate(a.date) }} — {{ formatTime(a.start_time) }} → {{ formatTime(a.end_time) }}
        </li>
      </ul>

      <p v-else class="muted">No availability listed.</p>
    </div>

    <div class="card">
      <h3>Book this walker</h3>

      <div v-if="!isLoggedIn" class="muted">
        Please <router-link to="/login">login</router-link> to book a walk.
      </div>

      <div v-else class="form compact">
        <input v-model="bookingDate" type="date" />

        <div class="dogs-box">
          <div v-if="dogsLoading" class="muted">Loading your dogs...</div>

          <div v-else-if="!myDogs.length" class="muted">
            No dogs found for your account yet.
          </div>

          <label v-for="d in myDogs" :key="d.id" class="check">
            <input type="checkbox" :value="d.id" v-model="selectedDogIds" />
            <span>{{ d.name }}</span>
          </label>
        </div>

        <button class="btn primary" :disabled="bookingLoading" @click="book">
          {{ bookingLoading ? "Booking..." : "Book" }}
        </button>

        <p v-if="bookingError" class="error">{{ bookingError }}</p>
        <p v-if="bookingSuccess" class="success">{{ bookingSuccess }}</p>
      </div>
    </div>
  </div>

  <p v-if="loading" class="page">Loading...</p>
  <p v-if="error" class="page error">{{ error }}</p>
</template>
