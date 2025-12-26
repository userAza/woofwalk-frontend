<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
import { apiGet } from "../services/api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const selectedCity = ref("");
const vets = ref([]);
const loading = ref(false);
const error = ref("");
const hasSearched = ref(false);

let map = null;
let markers = [];

const cities = [
  "Aalst",
  "Antwerp",
  "Bruges",
  "Brussels",
  "Geel",
  "Genk",
  "Ghent",
  "Hasselt",
  "Kortrijk",
  "Leuven",
  "Mechelen",
  "Ostend"
];

async function searchVets() {
  if (!selectedCity.value) {
    error.value = "Please select a city";
    return;
  }

  loading.value = true;
  error.value = "";
  hasSearched.value = true;
  
  try {
    vets.value = await apiGet(`/vets?city=${encodeURIComponent(selectedCity.value)}`);
    
    await nextTick();
    if (vets.value.length > 0) {
      initMap();
    }
  } catch (e) {
    error.value = e.message || "Failed to load vets";
  } finally {
    loading.value = false;
  }
}

function initMap() {
  if (map) {
    map.remove();
    map = null;
  }
  
  markers = [];
  
  const vetsWithCoords = vets.value.filter(v => v.latitude && v.longitude);
  
  if (vetsWithCoords.length === 0) return;
  
  const firstVet = vetsWithCoords[0];
  
  map = L.map('map').setView([firstVet.latitude, firstVet.longitude], 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  
  vetsWithCoords.forEach(vet => {
    const marker = L.marker([vet.latitude, vet.longitude]).addTo(map);
    
    marker.bindPopup(`
      <strong>${vet.name}</strong><br>
      ${vet.address}<br>
      ${vet.phone}
    `);
    
    markers.push(marker);
  });
  
  if (markers.length > 1) {
    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

watch(selectedCity, () => {
  vets.value = [];
  hasSearched.value = false;
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<template>
  <div class="page">
    <h2>Find a Vet</h2>
    
    <div class="card">
      <h3>Search by City</h3>
      
      <div style="display: flex; gap: 10px; margin-top: 15px;">
        <select v-model="selectedCity" style="flex: 1; padding: 8px;">
          <option value="">Select a city</option>
          <option v-for="city in cities" :key="city" :value="city">
            {{ city }}
          </option>
        </select>
        
        <button @click="searchVets" :disabled="loading">
          {{ loading ? "Searching..." : "Search" }}
        </button>
      </div>

      <p v-if="error" style="color: red; margin-top: 10px;">{{ error }}</p>
    </div>

    <div v-if="vets.length" style="margin-top: 20px;">
      <div id="map" style="height: 400px; border-radius: 8px; margin-bottom: 20px;"></div>
      
      <h3>Vets in {{ selectedCity }}</h3>
      
      <div v-for="vet in vets" :key="vet.id" class="card" style="margin-top: 15px;">
        <h4 style="margin-top: 0; color: #667eea;">{{ vet.name }}</h4>
        
        <p v-if="vet.address">
          <strong>Address:</strong> {{ vet.address }}, {{ vet.city }}
        </p>
        <p v-else>
          <strong>City:</strong> {{ vet.city }}
        </p>
        
        <p v-if="vet.phone">
          <strong>Phone:</strong> {{ vet.phone }}
        </p>
      </div>
    </div>

    <div v-else-if="hasSearched && !loading && selectedCity" class="card" style="margin-top: 20px;">
      <p>No vets found in {{ selectedCity }}. Try another city!</p>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h3, h4 {
  color: #333;
}

button {
  padding: 8px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover:not(:disabled) {
  background: #45a049;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

select {
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

p {
  margin: 8px 0;
}

#map {
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
</style>