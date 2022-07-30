<script setup lang="ts">
</script>
<template>
  <div class="loading">
    Chargement des données
  </div>
</template>

<style scoped lang="scss">
@keyframes fade {
  0% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

@keyframes load {
  0% {
    transform: scaleX(0);
    transform-origin: 0 0;
  }

  50% {
    transform: scaleX(1);
    transform-origin: 0 0;
  }

  51% {
    transform-origin: 100% 0;
  }

  100% {
    transform: scaleX(0);
    transform-origin: 100% 0;
  }
}

.loading {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #4E5166;
  font-size: 2em;
  animation: fade 0.75s infinite alternate;

  &::after {
    content: '';
    height: 30%;
    width: 100%;
    background-color: #FD2D01;
    opacity: 0.3;
    position: absolute;
    top: 70%;
    left: 0;
    animation: load 1.5s infinite;
  }
}
</style>