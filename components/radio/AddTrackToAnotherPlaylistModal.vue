<template>
  <div
    class="modal fade"
    :id="'addTrackToAnotherPlaylistModal'+componentId"
    tabindex="-1"
    :aria-labelledby="'addTrackToAnotherPlaylistModalLabel'+componentId"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" :id="'addTrackToAnotherPlaylistModalLabel'+componentId">Add track to another playlist</h5>
          <button :id="'closeAddTrackToAnotherPlaylistModal'+componentId" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <p>Add track <em>{{ track?.name }}</em> to another playlist.</p>

          <!-- Track blockchain -->
          <div class="mb-3">
            <label for="tChain" class="form-label">Select your playlist:</label>
            <div class="dropdown">
              <button
                class="btn btn-secondary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                @click="getUserPlaylists"
              >
                <span v-if="waitingRefresh" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                <span v-if="waitingRefresh">Refreshing playlists...</span>
                <span v-if="!waitingRefresh">{{ selectedPlaylistName }}</span>
              </button>

              <ul class="dropdown-menu">

                <li @click="createNewPlaylist">
                  <span class="dropdown-item cursor-pointer">
                    <i class="bi bi-plus-circle me-1"></i>
                    Create a new playlist with this track
                  </span>
                </li>

                <li @click="refreshPlaylists">
                  <span class="dropdown-item cursor-pointer">
                    <i class="bi bi-arrow-clockwise me-1"></i>
                    Refresh playlists
                  </span>
                </li>

                <li v-if="userPlaylists.length > 0"><hr class="dropdown-divider"></li>

                <li 
                  v-for="userPlaylist in userPlaylists"
                  :key="userPlaylist?.playlistNftId"
                  @click="selectPlaylist(userPlaylist)"
                ><span class="dropdown-item cursor-pointer">{{ userPlaylist?.name }}</span></li>
              </ul>

            </div>
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
            :disabled="waitingSubmitTrack"
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
import { fetchUserPlaylists } from '~/utils/playlistUtils'
import { fetchData, fetchPlaylistData } from '~/utils/storageUtils'

export default {
  name: 'AddTrackToAnotherPlaylistModal',
  props: ['componentId', 'toast', 'track'],
  emits: ['addSongToTracks'],
  components: { SwitchChainButton },

  data() {
    return {
      selectedPlaylist: null,
      selectedPlaylistName: "Choose playlist",
      userPlaylists: [],
      waitingRefresh: false,
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
  },

  methods: {

    createNewPlaylist() {
      document.getElementById('closeAddTrackToAnotherPlaylistModal'+this.componentId).click()

      // redirect to create playlist page with track address, chainId, and tokenId in the query
      return this.$router.push({
        path: '/playlists/create',
        query: {
          addr: this.track.address,
          chain: this.track.chainId,
          nftid: this.track.tokenId,
        },
      })
    },

    async getUserPlaylists() {
      this.userPlaylists = []

      const storageResult = fetchData(window, this.address, 'playlistNftIds', 0)

      let playlistNftIds
      
      if (storageResult) {
        playlistNftIds = storageResult?.playlistNftIds
      } else {
        playlistNftIds = []
      }

      for (let i = 0; i < playlistNftIds.length; i++) {
        const playlistData = await fetchPlaylistData(window, Number(playlistNftIds[i]))
        this.userPlaylists.push(playlistData)
      }
    },

    async refreshPlaylists() {
      this.waitingRefresh = true

      const playlistNftIds = await fetchUserPlaylists(window, this.signer, this.address)

      if (playlistNftIds && playlistNftIds.length > 0) {
        this.userPlaylists = []
        for (let i = 0; i < playlistNftIds.length; i++) {
          const playlistData = await fetchPlaylistData(window, Number(playlistNftIds[i]))
          this.userPlaylists.push(playlistData)
        }
      }

      this.waitingRefresh = false
    },

    selectPlaylist(playlist) {
      this.selectedPlaylistName = playlist.name
      this.selectedPlaylist = playlist
    },

    async submit() {
      // submit track data to playlist smart contract
      this.waitingSubmitTrack = true

      const playlistInterface = new ethers.utils.Interface([
        'function addTrack(address addr_, uint256 tokenId_, uint256 chainId_) external',
      ])

      const playlistContract = new ethers.Contract(this.selectedPlaylist.playlistAddress, playlistInterface, this.signer)

      try {
        const tx = await playlistContract.addTrack(
          this.track.address, 
          Number(this.track.tokenId), 
          Number(this.track.chainId)
        )

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

          this.toast('You have successfully added this track to your playlist!', {
            type: 'success',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          })

          document.getElementById('closeAddTrackToAnotherPlaylistModal'+this.componentId).click()
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
    
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers()

    return { address, chainId, isActivated, signer }
  },
}
</script>
