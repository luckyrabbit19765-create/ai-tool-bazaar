<script setup>
// Pure CSS floating gradient orbs — no JS needed
</script>

<template>
  <div class="floating-orbs" aria-hidden="true">
    <div class="floating-orbs__orb floating-orbs__orb--1"></div>
    <div class="floating-orbs__orb floating-orbs__orb--2"></div>
    <div class="floating-orbs__orb floating-orbs__orb--3"></div>
    <div class="floating-orbs__orb floating-orbs__orb--4"></div>
    <div class="floating-orbs__orb floating-orbs__orb--5"></div>
  </div>
</template>

<style scoped>
.floating-orbs {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.floating-orbs__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
}

.floating-orbs__orb--1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(45,140,130,0.3), transparent);
  top: -10%; left: -5%;
  animation: orbFloat1 14s ease-in-out infinite;
}

.floating-orbs__orb--2 {
  width: 320px; height: 320px;
  background: radial-gradient(circle, rgba(122,185,219,0.28), transparent);
  top: 30%; right: -8%;
  animation: orbFloat2 16s ease-in-out infinite 2s;
}

.floating-orbs__orb--3 {
  width: 280px; height: 280px;
  background: radial-gradient(circle, rgba(121,199,176,0.25), transparent);
  bottom: -10%; left: 20%;
  animation: orbFloat3 18s ease-in-out infinite 1s;
}

.floating-orbs__orb--4 {
  width: 240px; height: 240px;
  background: radial-gradient(circle, rgba(168,213,239,0.22), transparent);
  top: 50%; left: 40%;
  animation: orbFloat1 12s ease-in-out infinite 3s reverse;
}

.floating-orbs__orb--5 {
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(139,215,201,0.2), transparent);
  top: 60%; right: 20%;
  animation: orbFloat2 15s ease-in-out infinite 4s;
}

@keyframes orbFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(60px, -40px) scale(1.15); }
  66% { transform: translate(-30px, 30px) scale(0.9); }
}

@keyframes orbFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-50px, 50px) scale(1.1); }
  66% { transform: translate(40px, -30px) scale(0.85); }
}

@keyframes orbFloat3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -50px) scale(1.2); }
}
</style>
