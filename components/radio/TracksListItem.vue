<template>
  <div class="card track-card">
    <div class="row text-center">
      <div class="col-md-8 mt-3">
        <p>{{ track?.name }}</p>
      </div>
      <div class="col-md-4 align-self-center track-buttons">

        <button class="btn btn-primary btn-sm me-2" :disabled="!songUrlAccessible">Add to queue</button>

        <button 
          @click="playSong"
          class="btn btn-primary btn-sm me-1" 
        >
          Play now
        </button>

        <div class="btn-group">
          <span class="dropdown-toggle cursor-pointer hover-color" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-three-dots-vertical"></i>
          </span>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><button class="dropdown-item" type="button">Add to another playlist</button></li>
            <li v-if="isCurrentUserOwner"><button class="dropdown-item" type="button">Remove track</button></li>
          </ul>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TracksListItem',
  props: ['audioStore', 'isCurrentUserOwner', 'track'],
  emits: ['removeTrack'],

  data() {
    return {
      songUrlAccessible: false, // if song file is accessible, make it true
    }
  },

  methods: {
    async playSong() {
      this.audioStore.playNowExisting(this.track)
    },

    removeTrack() {
      this.$emit('removeTrack', this.track);
    }
  }
}
</script>

<style scoped>
.dropdown-toggle::after {
  display: none;
}

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
