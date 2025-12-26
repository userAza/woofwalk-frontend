<script setup>
import { ref, onMounted } from "vue";
import { apiGet, apiPost, apiPatch, apiDelete } from "../services/api";

const user = ref(null);
const dogs = ref([]);
const subscription = ref({ active: false, discount_percent: 0, active_until: null });

const editName = ref("");
const editEmail = ref("");
const profileMessage = ref("");

const dogName = ref("");
const dogBreed = ref("");
const dogAge = ref("");

const error = ref("");
const success = ref("");

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-BE");
}

async function loadProfile() {
  user.value = JSON.parse(localStorage.getItem("user"));
  editName.value = user.value.name;
  editEmail.value = user.value.email;
  dogs.value = await apiGet("/dogs");
  
  try {
    subscription.value = await apiGet("/subscriptions/my-subscription");
  } catch (e) {
    subscription.value = { active: false, discount_percent: 0, active_until: null };
  }
}

async function saveProfile() {
  profileMessage.value = "";
  await apiPatch("/profiles/me", {
    name: editName.value,
    email: editEmail.value
  });

  user.value.name = editName.value;
  user.value.email = editEmail.value;
  localStorage.setItem("user", JSON.stringify(user.value));

  profileMessage.value = "Profile updated";
}

async function addDog() {
  error.value = "";
  success.value = "";

  if (!dogName.value || !dogBreed.value || dogAge.value === "") {
    error.value = "Fill in all fields";
    return;
  }

  await apiPost("/dogs", {
    name: dogName.value,
    breed: dogBreed.value,
    age: Number(dogAge.value)
  });

  dogName.value = "";
  dogBreed.value = "";
  dogAge.value = "";

  success.value = "Dog added";
  dogs.value = await apiGet("/dogs");
}

async function updateDog(dog) {
  await apiPatch(`/dogs/${dog.id}`, {
    name: dog.name,
    breed: dog.breed,
    age: dog.age
  });
}

async function deleteDog(id) {
  if (!confirm("Delete this dog?")) return;
  await apiDelete(`/dogs/${id}`);
  dogs.value = dogs.value.filter(d => d.id !== id);
}

onMounted(loadProfile);
</script>

<template>
  <div class="profile">
    <h2>My profile</h2>

    <div class="card">
      <h3>User info</h3>
      <div class="row">
        <input v-model="editName" placeholder="Name" />
        <input v-model="editEmail" placeholder="Email" />
        <button @click="saveProfile">Save</button>
      </div>
      <p class="success" v-if="profileMessage">{{ profileMessage }}</p>
    </div>

    <div class="card">
    <h3>Subscription Status</h3>
    
    <div v-if="subscription && subscription.active">
        <p style="color: green; font-size: 18px; font-weight: bold;">
        ✅ Active Subscription
        </p>
        <p><strong>Discount:</strong> {{ subscription.discount_percent }}% off all walks</p>
        <p><strong>Valid until:</strong> {{ formatDate(subscription.active_until) }}</p>
        <p style="margin-top: 10px; padding: 10px; background: #e8f5e9; border-radius: 5px; font-size: 14px;">
        💡 Your discount is applied automatically when you book a walk!
        </p>
    </div>
    
    <div v-else>
        <p style="color: gray; font-size: 18px;">
        ❌ No Active Subscription
        </p>
        <p style="margin-top: 10px;">
        Complete 10 walks to automatically get a subscription with 20% discount for a month!
        </p>
        
        <details style="margin-top: 15px; cursor: pointer;">
        <summary style="padding: 10px; background: #f5f5f5; border-radius: 5px; font-weight: bold;">
            ℹ️ How it works
        </summary>
        <div style="margin-top: 10px; padding: 15px; background: #fafafa; border-left: 4px solid #2196f3; font-size: 14px;">
            <ul style="margin: 0; padding-left: 20px;">
            <li>Book walks with any walker</li>
            <li>After each walk is completed (marked as "done"), your counter increases</li>
            <li>At 10 completed walks → You automatically get a subscription!</li>
            <li>Subscription gives you 20% off ALL future bookings</li>
            <li>The discount is applied automatically when you book</li>
            </ul>
        </div>
        </details>
    </div>
    </div>

    <div class="card">
      <h3>My dogs</h3>

      <div v-for="d in dogs" :key="d.id" class="dog-row">
        <input v-model="d.name" placeholder="Name" />
        <input v-model="d.breed" placeholder="Breed" />
        <input v-model.number="d.age" type="number" placeholder="Age" />
        <button @click="updateDog(d)">Save</button>
        <button class="danger" @click="deleteDog(d.id)">Delete</button>
      </div>

      <p v-if="!dogs.length">No dogs yet</p>
    </div>

    <div class="card">
      <h3>Add a dog</h3>
      <div class="row">
        <input v-model="dogName" placeholder="Dog name" />
        <input v-model="dogBreed" placeholder="Breed" />
        <input v-model="dogAge" type="number" placeholder="Age" />
        <button @click="addDog">Add</button>
      </div>
      <p class="error" v-if="error">{{ error }}</p>
      <p class="success" v-if="success">{{ success }}</p>
    </div>
  </div>
</template>

<style scoped>
.profile {
  max-width: 700px;
  margin: auto;
}

.card {
  background: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 10px;
}

.row,
.dog-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

input {
  padding: 6px;
  flex: 1;
}

button {
  padding: 6px 10px;
  cursor: pointer;
}

button.danger {
  padding: 4px 8px;
  font-size: 12px;
  height: 32px;
  background-color: #f8b4b4;
  border: 1px solid #e57373;
  color: #7a1f1f;
}

.success {
  color: green;
}

.error {
  color: red;
}
</style>