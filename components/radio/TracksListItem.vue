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
            <li><button class="dropdown-item" type="button" :disabled="true">Add to another playlist</button></li>

            <li @click="removeTrack" v-if="isCurrentUserOwner"><button class="dropdown-item" type="button" :disabled="waitingRemoveTrack">
              <span v-if="waitingRemoveTrack" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Remove track
            </button></li>

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
import SwitchChainButton from '~/components/SwitchChainButton.vue'
import WaitingToast from '~/components/WaitingToast'

export default {
  name: 'TracksListItem',
  props: ['audioStore', 'isCurrentUserOwner', 'playlistAddress', 'track', 'trackIndex'],
  emits: ['removeTrack'],
  components: { SwitchChainButton },

  data() {
    return {
      waitingRemoveTrack: false
    }
  },

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
      this.toast.info('Track added to the listening queue.', { timeout: 2000 })
    },

    playSong() {
      this.audioStore.playNow(this.track)
    },

    async removeTrack() {
      this.waitingRemoveTrack = true

      const playlistInterface = new ethers.utils.Interface([
        'function removeTrackByIndex(uint256 index_) external',
      ])

      const playlistContract = new ethers.Contract(this.playlistAddress, playlistInterface, this.signer)

      try {
        const tx = await playlistContract.removeTrackByIndex(this.trackIndex)

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: 'Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.',
            },
          },
          {
            type: 'info',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          },
        )

        const receipt = await tx.wait()

        if (receipt.status === 1) {
          this.waitingRemoveTrack = false

          this.toast.dismiss(toastWait)

          this.toast('You have successfully removed track from the playlist!', {
            type: 'success',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          })

          this.$emit('removeTrack');

        } else {
          this.waitingRemoveTrack = false
          this.toast.dismiss(toastWait)
          this.toast('Transaction has failed.', {
            type: 'error',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          })
          console.log(receipt)
        }
      } catch (e) {
        console.error(e)

        try {
          let extractMessage = e.message.split('reason=')[1]
          extractMessage = extractMessage.split(', method=')[0]
          extractMessage = extractMessage.replace(/"/g, '')
          extractMessage = extractMessage.replace('execution reverted:', 'Error:')

          console.log(extractMessage)

          this.toast(extractMessage, { type: 'error' })
        } catch (e) {
          this.toast('Transaction has failed.', { type: 'error' })
        }

        this.waitingRemoveTrack = false
      }
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
