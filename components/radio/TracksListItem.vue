<template>
  <div class="card track-card">
    <div class="row text-center">
      <div class="col-md-8 mt-3">
        <p class="text-wrap ps-2 pe-2">
          <span v-if="waitingRefresh" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          {{ track?.name }}
          <span v-if="author"> | 
            <NuxtLink class="cursor-pointer link-without-color hover-color text-wrap" :to="'/profile?id='+author">{{ author }}</NuxtLink>
          </span>
        </p>
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
          <span class="dropdown-toggle cursor-pointer hover-color dropdown-no-caret" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-three-dots-vertical"></i>
          </span>
          <ul class="dropdown-menu dropdown-menu-end">

            <li v-if="isActivated">
              <button 
                class="dropdown-item" 
                type="button" 
                data-bs-toggle="modal"
                data-bs-target="#addTrackToAnotherPlaylistModal"
              >
                Add to
                <span v-if="isCurrentUserOwner">another</span>
                <span v-if="!isCurrentUserOwner">your</span>
                playlist
              </button>
            </li>

            <li @click="removeTrack" v-if="isCurrentUserOwner"><button class="dropdown-item" type="button" :disabled="waitingRemoveTrack">
              <span v-if="waitingRemoveTrack" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              Remove track
            </button></li>

            <li v-if="track.externalUrl">
              <a class="dropdown-item" target="_blank" :href="track.externalUrl">
                Go to track external URL
              </a>
            </li>
            
            <li>
              <button 
                @click="refreshTrackData"
                class="dropdown-item" 
                type="button" 
                :disabled="waitingRefresh"
              >Refresh track data</button></li>
          </ul>
        </div>

      </div>
    </div>

    <AddTrackToAnotherPlaylistModal :track="track" :toast="toast" />
  </div>
</template>

<script>
import axios from 'axios'
import { ethers } from 'ethers'
import { useToast } from 'vue-toastification/dist/index.mjs'
import SwitchChainButton from '~/components/SwitchChainButton.vue'
import WaitingToast from '~/components/WaitingToast'
import AddTrackToAnotherPlaylistModal from '~/components/radio/AddTrackToAnotherPlaylistModal.vue'
import { useEthers } from '~/store/ethers'
import { fetchFreshMusicNftData } from '~/utils/audioUtils'
import { getDomainName } from '~/utils/domainUtils'
import { getWorkingIpfsGatewayUrl } from '~/utils/ipfsUtils'
import { fetchUsername, storeUsername } from '~/utils/storageUtils'

export default {
  name: 'TracksListItem',
  props: ['audioStore', 'isCurrentUserOwner', 'playlistAddress', 'track', 'trackIndex'],
  emits: ['removeTrack'],
  components: { AddTrackToAnotherPlaylistModal, SwitchChainButton },

  data() {
    return {
      author: null,
      waitingRefresh: false,
      waitingRemoveTrack: false
    }
  },

  mounted() {
    this.fetchTrackAuthor()
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
    async addToQueue() {
      const prefetchResult = await getWorkingIpfsGatewayUrl(this.track.audioUrl)

      if (prefetchResult.success && prefetchResult.format) {
        this.track.audioUrl = prefetchResult.validUrl
        this.track.format = prefetchResult.format
      }

      this.audioStore.addToQueue(this.track)
      this.toast.info('Track added to the listening queue.', { timeout: 2000 })
    },

    async fetchTrackAuthor() {
      if (this.track?.authorAddress) {
        this.author = fetchUsername(window, this.track.authorAddress)

        if (!this.author) {
          const provider = this.$getProviderForChain(this.$config.supportedChainId)
          const domainName = await getDomainName(this.track.authorAddress, provider)

          if (domainName) {
            this.author = String(domainName).replace(this.$config.tldName, '') + this.$config.tldName
            storeUsername(window, this.track.authorAddress, this.author)
          }
        }
      }
    },

    playSong() {
      this.audioStore.playNow(this.track)
    },

    async refreshTrackData() {
      this.waitingRefresh = true

      try {
        const provider = this.$getProviderForChain(Number(this.track.chainId))
        await fetchFreshMusicNftData(window, provider, this.track.address, this.track.tokenId, this.track.chainId)
      } catch (e) {
        console.error(e)
        this.toast('Failed to refresh track data.', { type: 'error' })
      }

      // refresh in the API
      try {
        const apiUrl = `${this.$config.radio.apiBaseUrl}/endpoints/track-refresh/${this.track.chainId}/${this.track.address}/${this.track.tokenId}`

        const response = await axios.get(apiUrl)

        if (response.data?.success) {
          console.log(response.data?.msg)
        } else {
          console.error('Failed to refresh track in the API:', response.data?.error)
        }
      } catch (error) {
        console.error('Failed to refresh track:', error)
      }

      this.waitingRefresh = false
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
