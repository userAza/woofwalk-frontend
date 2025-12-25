<script setup>
import { ref } from "vue";
import { apiGet } from "../services/api";

const location = ref("Antwerp");
const date = ref("2025-01-10");
const start_time = ref("09:00");
const end_time = ref("12:00");
const dogs = ref(1);

const walkers = ref([]);
const error = ref(null);
const loading = ref(false);

const addonsByWalker = ref({}); // { [walkerId]: addon[] }
const selectedAddonsByWalker = ref({}); // { [walkerId]: number[] }

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
  // IMPORTANT: matches routes/addons.js => router.get("/walker/:walkerId")
  // and server mount should be app.use("/api/addons", addonsRoutes)
  try {
    const list = await apiGet(`/addons/walker/${walkerId}`);
    addonsByWalker.value = {
      ...addonsByWalker.value,
      [walkerId]: Array.isArray(list) ? list : []
    };
  } catch {
    // If no route or error: just show none (no breaking the page)
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

    // reset addon state for new search
    addonsByWalker.value = {};
    selectedAddonsByWalker.value = {};

    // load addons for each walker found
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

    <div style="margin: 20px 0;">
      <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; align-items:flex-end;">
        <div>
          <div style="font-size:12px;">City</div>
          <input v-model="location" placeholder="City" />
        </div>

        <div>
          <div style="font-size:12px;">Date</div>
          <input v-model="date" type="date" />
        </div>

        <div>
          <div style="font-size:12px;">Start time</div>
          <input v-model="start_time" type="time" />
        </div>

        <div>
          <div style="font-size:12px;">End time</div>
          <input v-model="end_time" type="time" />
        </div>

        <div>
          <div style="font-size:12px;">Dogs</div>
          <input v-model.number="dogs" type="number" min="1" style="width:80px;" />
        </div>

        <button @click="search">Search</button>
      </div>
    </div>

    <p v-if="loading">Loading...</p>
    <p v-if="error" style="color: red;">{{ error }}</p>

    <div v-if="walkers.length">
      <div
        v-for="w in walkers"
        :key="w.id"
        class="card"
        style="text-align:left; max-width: 800px; margin: 20px auto;"
      >
        <router-link :to="`/walkers/${w.id}`" style="font-weight:bold; font-size:18px;">
          {{ w.name }}
        </router-link>

        <p><strong>Location:</strong> {{ w.location }}</p>
        <p><strong>Base price (30 min):</strong> €{{ Number(w.price_per_30min || 0).toFixed(2) }}</p>
        <p><strong>Max dogs:</strong> {{ w.max_dogs_per_walk }}</p>

        <!-- Add-ons toggles (DB driven, not hardcoded) -->
        <div v-if="(addonsByWalker[w.id] || []).length" style="margin-top: 12px;">
          <strong>Extras:</strong>
          <div
            v-for="a in addonsByWalker[w.id]"
            :key="a.id"
            style="margin-top: 6px;"
          >
            <label>
              <input
                type="checkbox"
                :value="a.id"
                :checked="getSelectedAddons(w.id).includes(a.id)"
                @change="(ev) => {
                  const checked = ev.target.checked;
                  const current = getSelectedAddons(w.id);
                  const next = checked
                    ? [...current, a.id]
                    : current.filter((x) => x !== a.id);
                  setSelectedAddons(w.id, next);
                }"
              />
              {{ a.name }} — €{{ Number(a.price || 0).toFixed(2) }}
            </label>
          </div>
        </div>

        <p style="margin-top: 12px; font-weight:bold;">
          Total price: €{{ totalForWalker(w) }}
        </p>
      </div>
    </div>

    <p v-else-if="!loading && !error">No walkers found for this filter.</p>
  </div>
</template>
