<script setup>
import { ref, onMounted } from "vue";
import { apiGet, apiPost, apiPatch, apiDelete } from "../../services/api";

const users = ref([]);
const walkers = ref([]);
const bookings = ref([]);
const subscriptions = ref([]);

const loading = ref(false);
const error = ref("");

const formatDate = (d) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("nl-BE");
};

const formatPrice = (p) => (p == null ? "-" : Number(p).toFixed(2));

async function loadAdminData() {
  loading.value = true;
  error.value = "";

  try {
    const [u, w, b, s] = await Promise.all([
      apiGet("/admin/users"),
      apiGet("/admin/walkers"),
      apiGet("/admin/bookings"),
      apiGet("/subscriptions/all")
    ]);

    users.value = u;
    walkers.value = w;
    bookings.value = b;
    subscriptions.value = s;
  } catch (e) {
    error.value = e.message || "Failed to load admin data";
  } finally {
    loading.value = false;
  }
}


const toggleSubscription = async (u) => {
  await apiPost(`/admin/users/${u.id}/subscription`);
  u.subscription_active = !u.subscription_active;
};

const toggleUserBan = async (u) => {
  await apiPatch(`/admin/users/${u.id}/${u.is_banned ? "unban" : "ban"}`);
  u.is_banned = !u.is_banned;
};


const toggleWalkerBan = async (w) => {
  await apiPatch(`/admin/walkers/${w.id}/${w.is_banned ? "unban" : "ban"}`);
  w.is_banned = !w.is_banned;
};


const updateBookingStatus = async (b, status) => {
  await apiPatch(`/admin/bookings/${b.id}/status`, {
    status,
    walker_id: b.walker_id
  });
  b.status = status;
};

const grantSubscription = async (userId) => {
  try {
    await apiPost(`/subscriptions/grant/${userId}`);
    await loadAdminData(); 
  } catch (e) {
    alert("Failed to grant subscription");
  }
};

const revokeSubscription = async (userId) => {
  if (!confirm("Revoke this subscription?")) return;
  
  try {
    await apiDelete(`/subscriptions/revoke/${userId}`);
    alert("Subscription revoked!");
    await loadAdminData(); 
  } catch (e) {
    alert("Failed to revoke subscription: " + e.message);
  }
};

onMounted(loadAdminData);
</script>

<template>
  <div class="page">
    <h2>Admin Dashboard</h2>

    <p v-if="loading">Loading...</p>
    <p v-if="error" style="color:red">{{ error }}</p>


    <div class="card">
      <h3>User Subscriptions & Statistics</h3>
      <table border="1" width="100%">
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Completed Bookings</th>
          <th>Total Bookings</th>
          <th>Subscription Status</th>
          <th>Active Until</th>
          <th>Discount</th>
          <th>Action</th>
        </tr>
        <tr v-for="s in subscriptions" :key="s.user_id">
          <td>{{ s.name }}</td>
          <td>{{ s.email }}</td>
          <td><strong>{{ s.completed_bookings }}</strong></td>
          <td>{{ s.total_bookings }}</td>
          <td>
            <span :style="{ color: s.active ? 'green' : 'gray' }">
              {{ s.active ? '✅ Active' : '❌ Inactive' }}
            </span>
          </td>
          <td>{{ formatDate(s.active_until) }}</td>
          <td>{{ s.discount_percent ? s.discount_percent + '%' : '-' }}</td>
          <td>
            <button 
              v-if="!s.active"
              @click="grantSubscription(s.user_id)"
              style="background: green; color: white;"
            >
              Grant Sub
            </button>
            <button 
              v-else
              @click="revokeSubscription(s.user_id)"
              style="background: red; color: white;"
            >
              Revoke
            </button>
          </td>
        </tr>
      </table>
      <p style="margin-top: 10px; font-size: 14px; color: #666;">
        💡 <strong>Auto-subscribe:</strong> Users automatically get subscription after 10 completed bookings
      </p>
    </div>

    <div class="card" style="margin-top:30px">
      <h3>Users</h3>
      <table border="1" width="100%">
        <tr>
          <th>Name</th><th>Email</th><th>Role</th>
          <th>Subscription</th><th>Status</th><th>Action</th>
        </tr>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.name }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.role }}</td>
          <td>{{ u.subscription_active ? "Active" : "Inactive" }}</td>
          <td>{{ u.is_banned ? "Banned" : "Active" }}</td>
          <td>
            <button @click="toggleSubscription(u)">Toggle subscription</button>
            <button @click="toggleUserBan(u)" style="margin-left:8px">
              {{ u.is_banned ? "Unban" : "Ban" }}
            </button>
          </td>
        </tr>
      </table>
    </div>


    <div class="card" style="margin-top:30px">
      <h3>Walkers</h3>
      <table border="1" width="100%">
        <tr>
          <th>Name</th><th>Location</th><th>Price</th><th>Status</th><th>Action</th>
        </tr>
        <tr v-for="w in walkers" :key="w.id">
          <td>{{ w.name }}</td>
          <td>{{ w.location }}</td>
          <td>€{{ formatPrice(w.price_per_30min) }}</td>
          <td>{{ w.is_banned ? "Banned" : "Active" }}</td>
          <td>
            <button @click="toggleWalkerBan(w)">
              {{ w.is_banned ? "Unban" : "Ban" }}
            </button>
          </td>
        </tr>
      </table>
    </div>


    <div class="card" style="margin-top:30px">
      <h3>Bookings</h3>
      <table border="1" width="100%">
        <tr>
          <th>User</th><th>Walker</th><th>Date</th>
          <th>Status</th><th>Total</th><th>Action</th>
        </tr>

        <tr v-for="b in bookings" :key="b.id">
          <td>{{ b.user_name }}</td>
          <td>{{ b.walker_name }}</td>
          <td>{{ formatDate(b.date) }}</td>
          <td>{{ b.status }}</td>
          <td>€{{ formatPrice(b.total_price) }}</td>
          <td>
            <button
              v-if="b.status === 'pending'"
              @click="updateBookingStatus(b, 'accepted')"
            >Accept</button>

            <button
              v-if="b.status === 'accepted'"
              @click="updateBookingStatus(b, 'done')"
            >Done</button>

            <button
              v-if="b.status !== 'cancelled'"
              @click="updateBookingStatus(b, 'cancelled')"
            >Cancel</button>

            <span v-else>-</span>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>