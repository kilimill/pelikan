<template>
  <div class="preloader">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "Preloader"
}
</script>

<style scoped>
.preloader {
  display: flex;
  overflow: hidden;
  width: 100%;
  height: 100%;
  margin: auto;
  flex-direction: column;
  align-content: center;
  justify-content: center;
  align-items: center;
}

.btn-loader .spinner-border {
  width: 24px;
  height: 24px;
}
</style>