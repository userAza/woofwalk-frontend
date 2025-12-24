<template>
  <section>
    <h2>Available Dog Walkers</h2>

    <div class="walkers-grid">
      <div class="walker-card" v-for="n in 3" :key="n">
        <h3>Walker Name</h3>
        <p>City: Antwerp</p>
        <p>€15 / 30 min</p>
        <p>⭐ 4.8</p>

        <router-link class="btn small" to="#">
          View profile
        </router-link>
      </div>
    </div>
  </section>
</template>
