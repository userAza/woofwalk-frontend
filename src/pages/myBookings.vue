<script setup>
import { ref, onMounted } from "vue";
import { apiGet, apiPatch, apiPost } from "../services/api";

const bookings = ref([]);
const loading = ref(false);
const error = ref("");

const showReviewModal = ref(false);
const reviewBooking = ref(null);
const reviewRating = ref(0);
const reviewComment = ref("");
const reviewError = ref("");
const reviewSubmitting = ref(false);

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("nl-BE");
}

function formatTime(timeStr) {
  return (timeStr || "").slice(0, 5);
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
  if (!confirm("Are you sure you want to cancel this booking?")) return;

  try {
    await apiPatch(`/bookings/${id}/cancel`, {});
    await loadBookings();
  } catch (e) {
    error.value = e.message || "Failed to cancel booking";
  }
}

function openReview(booking) {
  reviewBooking.value = booking;
  reviewRating.value = 0;
  reviewComment.value = "";
  reviewError.value = "";
  showReviewModal.value = true;
}

function closeReviewModal() {
  showReviewModal.value = false;
  reviewBooking.value = null;
  reviewRating.value = 0;
  reviewComment.value = "";
  reviewError.value = "";
}

async function submitReview() {
  if (reviewRating.value === 0) {
    reviewError.value = "Please select a rating";
    return;
  }

  reviewSubmitting.value = true;
  reviewError.value = "";

  try {
    await apiPost("/reviews", {
      booking_id: reviewBooking.value.id,
      rating: reviewRating.value,
      comment: reviewComment.value.trim() || null
    });

    closeReviewModal();
    await loadBookings();
  } catch (e) {
    reviewError.value = e.message || "Failed to submit review";
  } finally {
    reviewSubmitting.value = false;
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

    <div v-for="b in bookings" :key="b.id" class="card" style="text-align:left">
      <p><strong>Walker:</strong> {{ b.walker_name }}</p>
      <p><strong>Date:</strong> {{ formatDate(b.date) }}</p>
      <p>
        <strong>Time:</strong>
        {{ formatTime(b.start_time) }} → {{ formatTime(b.end_time) }}
      </p>

      <p v-if="b.dogs"><strong>Dogs:</strong> {{ b.dogs }}</p>
      <p v-if="b.addons"><strong>Add-ons:</strong> {{ b.addons }}</p>

      <p v-if="b.total_price">
        <strong>Total price:</strong>
        €{{ Number(b.total_price).toFixed(2) }}
      </p>

      <p><strong>Status:</strong> {{ b.status }}</p>

      <button
        v-if="b.status === 'done' && !b.reviewed"
        @click="openReview(b)"
        style="margin-top:10px; margin-right:10px"
      >
        Leave review
      </button>

      <button
        v-if="b.status !== 'cancelled' && b.status !== 'done'"
        @click="cancelBooking(b.id)"
        style="margin-top:10px"
      >
        Cancel booking
      </button>
    </div>

    <div v-if="showReviewModal" class="modal-overlay" @click="closeReviewModal">
      <div class="modal-content" @click.stop>
        <h3>Review {{ reviewBooking?.walker_name }}</h3>

        <div class="stars">
          <span
            v-for="star in 5"
            :key="star"
            class="star"
            :class="{ active: star <= reviewRating }"
            @click="reviewRating = star"
          >
            ★
          </span>
        </div>

        <textarea
          v-model="reviewComment"
          placeholder="Optional: Share your experience..."
          rows="4"
          style="width: 100%; margin-top: 15px; padding: 10px;"
        ></textarea>

        <p v-if="reviewError" style="color:red; margin-top:10px">{{ reviewError }}</p>

        <div style="margin-top: 15px;">
          <button @click="submitReview" :disabled="reviewSubmitting">
            {{ reviewSubmitting ? "Submitting..." : "Submit review" }}
          </button>
          <button @click="closeReviewModal" style="margin-left: 10px;">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
}

.stars {
  display: flex;
  gap: 10px;
  font-size: 40px;
  margin-top: 15px;
}

.star {
  cursor: pointer;
  color: #ddd;
  transition: color 0.2s;
}

.star.active {
  color: #ffc107;
}

.star:hover {
  color: #ffeb3b;
}
</style>