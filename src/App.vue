<template>
  <div class="app">
    <h1>WoofWalk</h1>

    <nav class="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/walkers">Browse Walkers</router-link>
      <router-link to="/login">Login</router-link>
      <router-link to="/register">Register</router-link>
    </nav>


    <router-view />
  </div>
</template>
