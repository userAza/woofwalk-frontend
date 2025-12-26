<script setup>
import { ref } from "vue";
import { apiGet } from "../services/api";

// EMPTY by default (no prefilled data)
const location = ref("");
const date = ref("");
const start_time = ref("");
const end_time = ref("");
const dogs = ref("");

const walkers = ref([]);
const error = ref(null);
const loading = ref(false);

const addonsByWalker = ref({});
const selectedAddonsByWalker = ref({});

function normalizeTime(t) {
  if (!t) return t;
  return t.length === 5 ? `${t}:00` : t;
}

function num(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
}

function getSelectedAddons(walkerId) {
  return selectedAddonsByWalker.value[walkerId] || [];
}

function setSelectedAddons(walkerId, ids) {
  selectedAddonsByWalker.value = {
    ...selectedAddonsByWalker.value,
    [walkerId]: ids
  };
}

function totalForWalker(w) {
  const base = num(w.price_per_30min);
  const selectedIds = getSelectedAddons(w.id);
  const addons = addonsByWalker.value[w.id] || [];

  const extra = selectedIds.reduce((sum, id) => {
    const a = addons.find((x) => x.id === id);
    return sum + (a ? num(a.price) : 0);
  }, 0);

  return (base + extra).toFixed(2);
}

async function loadAddonsForWalker(walkerId) {
  try {
    const list = await apiGet(`/walker-addons/walker/${walkerId}`);
    addonsByWalker.value = {
      ...addonsByWalker.value,
      [walkerId]: Array.isArray(list) ? list : []
    };
  } catch {
    addonsByWalker.value = {
      ...addonsByWalker.value,
      [walkerId]: []
    };
  }
}

async function search() {
  if (!location.value || !date.value || !start_time.value || !end_time.value || !dogs.value) {
    error.value = "Please fill in all fields";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const query = new URLSearchParams({
      location: location.value,
      date: date.value,
      start_time: normalizeTime(start_time.value),
      end_time: normalizeTime(end_time.value),
      dogs: String(dogs.value)
    }).toString();

    const res = await apiGet(`/walkers/search?${query}`);
    walkers.value = Array.isArray(res) ? res : [];

    addonsByWalker.value = {};
    selectedAddonsByWalker.value = {};

    await Promise.all(walkers.value.map((w) => loadAddonsForWalker(w.id)));
  } catch (e) {
    error.value = e?.message || "Failed to fetch";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <h2>Available Dog Walkers</h2>

    <!-- 30-MINUTE WALK NOTICE -->
    <p class="walk-notice">
      All walks are 30 minutes. Prices shown are per 30-minute walk.
    </p>

    <!-- SEARCH BAR -->
    <div class="search-bar">
      <div class="field">
        <label>City</label>
        <input v-model="location" placeholder="City" />
      </div>

      <div class="field">
        <label>Date</label>
        <input v-model="date" type="date" />
      </div>

      <div class="field">
        <label>Start time</label>
        <input v-model="start_time" type="time" />
      </div>

      <div class="field">
        <label>End time</label>
        <input v-model="end_time" type="time" />
      </div>

      <div class="field small">
        <label>How many dogs?</label>
        <input v-model.number="dogs" type="number" min="1" />
      </div>

      <button class="search-btn" @click="search">Search</button>
    </div>

    <p v-if="loading">Loading...</p>
    <p v-if="error" class="error">{{ error }}</p>

    <!-- RESULTS -->
    <div v-if="walkers.length">
      <div v-for="w in walkers" :key="w.id" class="card">
        <router-link :to="`/walkers/${w.id}`" class="walker-name">
          {{ w.name }}
        </router-link>

        <p><strong>Location:</strong> {{ w.location }}</p>
        <p><strong>Base price (30 min):</strong> €{{ Number(w.price_per_30min || 0).toFixed(2) }}</p>
        <p><strong>Max dogs:</strong> {{ w.max_dogs_per_walk }}</p>
        
        <p class="rating">
        ⭐ {{ Number(w.average_rating || 0).toFixed(1) }}
        <span v-if="w.review_count">
            ({{ w.review_count }} reviews)
        </span>
        <span v-else>
            (no reviews yet)
        </span>
        </p>


        <div v-if="(addonsByWalker[w.id] || []).length" class="addons">
          <strong>Extras:</strong>

          <div v-for="a in addonsByWalker[w.id]" :key="a.id">
            <label>
              <input
                type="checkbox"
                :checked="getSelectedAddons(w.id).includes(a.id)"
                @change="(ev) => {
                  const current = getSelectedAddons(w.id);
                  setSelectedAddons(
                    w.id,
                    ev.target.checked
                      ? [...current, a.id]
                      : current.filter(x => x !== a.id)
                  );
                }"
              />
              {{ a.name }} — €{{ Number(a.price || 0).toFixed(2) }}
            </label>
          </div>
        </div>

        <p class="total">
          Total price: €{{ totalForWalker(w) }}
        </p>
      </div>
    </div>

    <p v-else-if="!loading && !error">
      No walkers found for this filter.
    </p>
  </div>
</template>

<style scoped>
/* 30-MINUTE NOTICE */
.walk-notice {
  background: #e0f2fe;
  border-left: 4px solid #c80ee9;
  padding: 12px 16px;
  margin: 20px auto;
  max-width: 800px;
  border-radius: 4px;
  font-size: 14px;
  color: #000000;
  text-align: center;
}

/* SEARCH BAR */
.search-bar {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 30px 0;
  align-items: flex-end;
}

.field {
  display: flex;
  flex-direction: column;
}

.field label {
  font-size: 13px;
  margin-bottom: 4px;
}

.field input {
  height: 48px;
  font-size: 18px;
  padding: 8px 12px;
  min-width: 180px;
}

.field.small input {
  min-width: 90px;
}

.search-btn {
  height: 48px;
  font-size: 18px;
  padding: 0 24px;
  cursor: pointer;
}

/* RESULTS */
.card {
  max-width: 800px;
  margin: 20px auto;
  text-align: left;
}

.walker-name {
  font-weight: bold;
  font-size: 18px;
  display: inline-block;
  margin-bottom: 6px;
}

.addons {
  margin-top: 12px;
}

.total {
  margin-top: 12px;
  font-weight: bold;
}

.error {
  color: red;
}

.rating {
  font-size: 16px;
  margin-top: 10px;
}
</style>