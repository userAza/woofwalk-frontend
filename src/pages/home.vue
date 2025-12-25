<script setup>
import { computed } from "vue";

const isLoggedIn = computed(() => !!localStorage.getItem("token"));
</script>

<template>
  <div class="page">
    <h2 class="hero-title">Your dog’s perfect walk, every time 🐾</h2>

    <p class="hero-text">
      WoofWalk helps you find trusted dog walkers near you.<br />
      Choose based on location, availability, price, and reviews.<br />
      Book a walk in a few clicks and relax.<br />
      Log in or joins us to get started!
    </p>

    <p class="hero-joke">
      Because your dog deserves more than a “quick walk around the block.” 🐶
    </p>

    <!-- removed duplicate login/register buttons here -->

    <div class="dog-grid">
      <img src="/dogs/dog1.jpg" alt="Dog 1" />
      <img src="/dogs/dog2.jpg" alt="Dog 2" />
      <img src="/dogs/dog3.jpg" alt="Dog 3" />
    </div>
  </div>
</template>

<style scoped>
.page {
  padding-top: 80px;
  padding-bottom: 120px;
}

.hero-title {
  margin-bottom: 30px;
}

.hero-text {
  margin-bottom: 40px;
  line-height: 1.8;
}

.hero-joke {
  margin-bottom: 60px;
  font-style: italic;
  opacity: 0.85;
}
.dog-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.dog-grid img {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: 14px;
}

</style>
