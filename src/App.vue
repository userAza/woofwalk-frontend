<template>
  <div class="app">
    <header class="navbar">
      <h1 class="logo">WoofWalk</h1>
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/login">Login</router-link>
      </nav>
    </header>

    <main class="page">
      <router-view />
    </main>
  </div>
</template>
