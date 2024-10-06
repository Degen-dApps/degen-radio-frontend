<template>
  <div
    class="modal fade"
    id="addNewTrackModal"
    tabindex="-1"
    aria-labelledby="addNewTrackModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="addNewTrackModalLabel">Add new track (music NFT) to {{ playlist?.name }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">

          <div v-if="tooManyTracks" class="alert alert-danger" role="alert">
            Your playlist has reached the maximum number of tracks allowed ({{ $config.radio.maxTracks }}). You can't add more tracks to this playlist.
          </div>

          <!-- Track blockchain -->
          <div class="mb-3">
            <label for="tChain" class="form-label">Select the chain where the music NFT is deployed on:</label>
            <div class="dropdown">
              <button
                class="btn btn-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {{ tChainName }}
              </button>
              <ul class="dropdown-menu">
                <li>
                  <span class="dropdown-item cursor-pointer" @click="selectChain(42161, 'Arbitrum')">Arbitrum</span>
                </li>
                <li><span class="dropdown-item cursor-pointer" @click="selectChain(8453, 'Base')">Base</span></li>
                <li>
                  <span class="dropdown-item cursor-pointer" @click="selectChain(666666666, 'Degen Chain')"
                    >Degen Chain</span
                  >
                </li>
                <li><span class="dropdown-item cursor-pointer" @click="selectChain(1, 'Ethereum')">Ethereum</span></li>
                <li><span class="dropdown-item cursor-pointer" @click="selectChain(10, 'Optimism')">Optimism</span></li>
                <li>
                  <span class="dropdown-item cursor-pointer" @click="selectChain(137, 'Polygon PoS Chain')"
                    >Polygon PoS Chain</span
                  >
                </li>
              </ul>
            </div>
          </div>

          <div class="mb-3">
            <label for="trackAddress" class="form-label"> Music NFT Address </label>
            <input
              type="text"
              class="form-control"
              id="trackAddress"
              v-model="tAddress"
              placeholder="Enter 0x Address"
            />
          </div>

          <div class="mb-3">
            <label for="trackNftId" class="form-label"> Music NFT token ID (optional) </label>
            <input type="text" class="form-control" id="trackNftId" v-model="tNftId" />
          </div>

          <div class="mb-3">
            <button
              v-if="!playingNow"
              type="button"
              class="btn btn-primary btn-sm"
              @click="playSong"
              :disabled="!tChainId || !tAddress || waitingPlay"
            >
              <span v-if="waitingPlay" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Play now
            </button>

            <button
              v-if="playingNow"
              type="button"
              class="btn btn-danger btn-sm"
              @click="stopPlaying"
            >
              Stop playing
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>

          <!-- Submit track button -->
          <button
            v-if="isSupportedChain"
            type="button"
            class="btn btn-primary"
            @click="submit"
            :disabled="!tChainId || !tAddress || waitingSubmitTrack || tooManyTracks"
          >
            Add track to playlist
          </button>

          <SwitchChainButton v-if="!isSupportedChain" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers'
import { useEthers } from '~/store/ethers'
import SwitchChainButton from '~/components/SwitchChainButton.vue'
import WaitingToast from '~/components/WaitingToast'
import { fetchMusicNftData } from '~/utils/audioUtils'

export default {
  name: 'AddNewTrackModal',
  props: ['allTracksLength', 'audioStore', 'playlist', 'toast'],
  emits: ['addSongToTracks'],
  components: { SwitchChainButton },

  data() {
    return {
      playingNow: false,
      tAddress: null,
      tChainId: 666666666,
      tChainName: 'Degen Chain',
      tNftId: 1,
      waitingLoadTrack: false,
      waitingPlay: false,
      waitingSubmitTrack: false,
    }
  },

  computed: {
    isSupportedChain() {
      if (this.chainId === this.$config.supportedChainId) {
        return true
      } else {
        return false
      }
    },

    tooManyTracks() {
      return this.allTracksLength >= this.$config.radio.maxTracks
    },
  },

  methods: {

    async loadTrack() {
      this.waitingLoadTrack = true

      if (!this.tNftId) {
        this.tNftId = 1
      }

      const provider = this.$getFallbackProvider(Number(this.tChainId))
      const trackData = await fetchMusicNftData(window, provider, this.tAddress, this.tNftId, this.tChainId)

      if (trackData.success) {
        this.waitingLoadTrack = false
        return { success: true, nftData: trackData.nftData }
      } else {
        if (trackData?.message) {
          this.waitingLoadTrack = false
          return { success: false, message: trackData.message }
        }

        this.waitingLoadTrack = false
        return { success: false, message: 'Failed to load track' }
      }
    },

    async playSong() {
      this.waitingPlay = true

      const trackData = await this.loadTrack()

      if (trackData.success) {
        this.playingNow = true
        this.audioStore.playNow(trackData.nftData)
      } else {
        console.error(trackData.message)
        this.toast.error(trackData.message)
      }
    },

    stopPlaying() {
      this.audioStore.stopPlaying()
      this.audioStore.removeLastTrack()
      this.audioStore.setCurrentTrackIndex(Number(this.audioStore.currentTrackIndex) - 1)
      this.playingNow = false
      this.waitingPlay = false
    },

    async submit() {
      // submit track data to playlist smart contract
      this.waitingSubmitTrack = true

      // load track data
      const trackData = await this.loadTrack()

      if (!trackData.success) {
        this.waitingSubmitTrack = false
        console.error(trackData.message)
        this.toast.error(trackData.message)
        return
      }

      const playlistInterface = new ethers.utils.Interface([
        'function addTrack(address addr_, uint256 tokenId_, uint256 chainId_) external',
      ])

      const playlistContract = new ethers.Contract(this.playlist.playlistAddress, playlistInterface, this.signer)

      if (!this.tNftId) {
        this.tNftId = 1
      }

      try {
        const tx = await playlistContract.addTrack(this.tAddress, this.tNftId, this.tChainId)

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
          this.waitingSubmitTrack = false

          this.toast.dismiss(toastWait)

          this.toast('You have successfully added a new track to your playlist!', {
            type: 'success',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          })

          this.$emit('addSongToTracks', {
            nftData: trackData.nftData,
            chainId: this.tChainId,
            address: this.tAddress,
            tokenId: this.tNftId,
          })
        } else {
          this.waitingSubmitTrack = false
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

        this.waitingSubmitTrack = false
      }
    },

    selectChain(chainId, chainName) {
      this.tChainId = chainId
      this.tChainName = chainName
    },
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers()

    return { address, chainId, isActivated, signer }
  },
}
</script>
