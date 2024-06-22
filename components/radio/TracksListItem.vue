<template>
  <div class="card track-card">
    <div class="row text-center">
      <div class="col-md-8 mt-3">
        <p>{{ track?.name }}</p>
      </div>
      <div class="col-md-4 align-self-center track-buttons">
        <button class="btn btn-primary btn-sm me-2" :disabled="!songUrlAccessible">Add to queue</button>
        <button class="btn btn-primary btn-sm" :disabled="!songUrlAccessible">Play now</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TracksListItem',
  props: ['track'],

  mounted() {
    console.log('Track:', this.track);
  },

  data() {
    return {
      songUrlAccessible: false, // if song file is accessible, make it true
    }
  },
}
</script>

<style scoped>
.track-card {
  border: 1px solid #adb5bd;
}

/* Mobile view */
@media (max-width: 768px) {
  .track-buttons {
    margin-bottom: 20px;
  }
}
</style>
