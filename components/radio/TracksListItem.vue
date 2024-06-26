<template>
  <div class="card track-card">
    <div class="row text-center">
      <div class="col-md-8 mt-3">
        <p>{{ track?.name }}</p>
      </div>
      <div class="col-md-4 align-self-center track-buttons">

        <button 
          v-if="!isCurrentPlaylist"
          @click="addToQueue"
          class="btn btn-primary btn-sm me-2" 
          :disabled="isAlreadyInQueue"
        >
          Add to queue
        </button>

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
            <li v-if="track.externalUrl"><a class="dropdown-item" target="_blank" :href="track.externalUrl">Go to track external URL</a></li>
          </ul>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers'
import { useEthers } from '~/store/ethers'
import { useToast } from 'vue-toastification/dist/index.mjs'
import DegenRadioPlaylistAbi from '~/assets/abi/DegenRadioPlaylistAbi.json'
import SwitchChainButton from '~/components/SwitchChainButton.vue'
import WaitingToast from '~/components/WaitingToast'

export default {
  name: 'TracksListItem',
  props: ['audioStore', 'isCurrentUserOwner', 'playlistAddress', 'track'],
  emits: ['removeTrack'],
  components: { SwitchChainButton },

  computed: {
    isAlreadyInQueue() {
      return this.audioStore.queue.some((q) => q.id === this.track.id)
    },

    isCurrentPlaylist() {
      return String(this.audioStore.currentPlaylistAddress).toLowerCase() === String(this.playlistAddress).toLowerCase()
    }
  },

  methods: {
    addToQueue() {
      this.audioStore.addToQueue(this.track)
      this.toast.info('Track added to the listening queue.', {
        timeout: 2000,
      })
    },

    playSong() {
      this.audioStore.playNow(this.track)
    },

    removeTrack() {
      this.$emit('removeTrack', this.track);
    }
  },

  setup() {
    const { address, isActivated, signer } = useEthers()
    const toast = useToast()

    return { address, isActivated, signer, toast }
  },
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
