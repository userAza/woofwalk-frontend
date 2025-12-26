<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { apiGet, apiPost } from "../services/api";

const route = useRoute();

const walker = ref(null);
const availability = ref([]);
const dogs = ref([]);
const addons = ref([]);
const reviews = ref([]);
const averageRating = ref(0);
const userSubscription = ref(null);

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
  if (!dateStr) return "";
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

  if (userSubscription.value?.active && userSubscription.value?.discount_percent) {
    const discount = total * (userSubscription.value.discount_percent / 100);
    total -= discount;
  }

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

    addons.value = await apiGet(`/addons/walker/${id}`);
    if (!Array.isArray(addons.value)) addons.value = [];

    try {
      const reviewData = await apiGet(`/reviews/walker/${id}`);
      reviews.value = reviewData.reviews || [];
      averageRating.value = reviewData.average_rating || 0;
    } catch (e) {
      reviews.value = [];
      averageRating.value = 0;
    }

    try {
      userSubscription.value = await apiGet("/subscriptions/my-subscription");
    } catch (e) {
      userSubscription.value = { active: false, discount_percent: 0 };
    }
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

  if (!dogs.value || dogs.value.length === 0) {
    error.value = "You need to add a dog first! Go to your Profile to add one.";
    return;
  }

  if (!bookingDate.value || !slot) {
    error.value = "Please select a date from the available times.";
    return;
  }

  const selectedDate = new Date(bookingDate.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    error.value = "Cannot book dates in the past. Please select a future date.";
    return;
  }

  if (!selectedDogs.value.length) {
    error.value = "Please select at least one dog for the walk.";
    return;
  }

  if (!walker.value) {
    error.value = "Walker information is missing.";
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

    success.value = "Booking created successfully!";

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
      
      <p class="rating">
        ⭐ {{ averageRating.toFixed(1) }}
        <span v-if="reviews.length">
          ({{ reviews.length }} {{ reviews.length === 1 ? 'review' : 'reviews' }})
        </span>
        <span v-else>
          (no reviews yet)
        </span>
      </p>
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

    <div class="card" v-if="reviews.length">
      <h3>Reviews</h3>

      <div v-for="review in reviews" :key="review.id" class="review">
        <div class="review-header">
          <div class="review-stars">
            <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= review.rating }">
              ★
            </span>
          </div>
          <span class="review-author">{{ review.user_name }}</span>
          <span class="review-date">{{ formatDate(review.created_at) }}</span>
        </div>
        
        <p v-if="review.comment" class="review-comment">{{ review.comment }}</p>
      </div>
    </div>

    <div class="card">
      <h3>Book this walker</h3>

      <input type="date" v-model="bookingDate" :min="new Date().toISOString().split('T')[0]" />

      <div v-if="selectedAvailability" style="margin-top:10px;">
        <p>
          <strong>Time:</strong> 
          {{ formatTime(selectedAvailability.start_time) }} → {{ formatTime(selectedAvailability.end_time) }}
        </p>
      </div>

      <div v-if="!dogs.length" style="margin-top: 20px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
        <p style="margin: 0; color: #856404;">
          <strong>You need to add a dog first!</strong><br>
          Go to your <router-link to="/profile" style="color: #007bff;">Profile</router-link> to add a dog before booking.
        </p>
      </div>

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

      <div v-if="bookingDate" style="margin-top:15px;">
        <p><strong>Base price:</strong> €{{ Number(walker.price_per_30min || 0).toFixed(2) }}</p>
        
        <p v-if="userSubscription && userSubscription.active" style="color: green; font-weight: bold;">
          Subscription discount: -{{ userSubscription.discount_percent }}%
        </p>
        
        <p style="font-size:18px; font-weight:bold;">
          <strong>Total price:</strong> €{{ totalPrice }}
        </p>
      </div>

      <button @click="bookWalker" style="margin-top:10px;">Book</button>

      <p v-if="error" style="color:red">{{ error }}</p>
      <p v-if="success" style="color:green">{{ success }}</p>
    </div>
  </div>

  <p v-if="loading">Loading...</p>
  <p v-if="!loading && error && !walker">{{ error }}</p>
</template>

<style scoped>
.rating {
  font-size: 16px;
  margin-top: 10px;
}

.review {
  border-bottom: 1px solid #eee;
  padding: 15px 0;
}

.review:last-child {
  border-bottom: none;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.review-stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #ddd;
  font-size: 18px;
}

.star.filled {
  color: #ffc107;
}

.review-author {
  font-weight: bold;
  font-size: 14px;
}

.review-date {
  font-size: 12px;
  color: #666;
  margin-left: auto;
}

.review-comment {
  margin: 8px 0 0 0;
  color: #333;
  line-height: 1.5;
}
</style>