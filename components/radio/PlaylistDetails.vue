<template>
  <div>
    <div v-if="waitingPlaylistData">
      <div class="d-flex justify-content-center mb-3">
        <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
      </div>
      <div class="row">
        <div class="col-md-6 offset-md-3 text-center">
          <p>Loading Playlist data for the first time, please wait until it's loaded...</p>
          <p>(Next time it will be quicker, we promise!)</p>
        </div>
      </div>
    </div>

    <div class="row text-center">
      <img
        :src="playlistImage"
        :alt="playlistName"
        class="offset-md-4 col-md-4 offset-3 col-6 mb-3 img-fluid rounded" 
      />
    </div>

    <h4 class="mb-3 text-center">{{ playlistName }}</h4>

    <p>Playlist address: {{ playlistAddress }}</p>
  </div>
</template>

<script>
import { ethers } from 'ethers'
import { useToast } from 'vue-toastification/dist/index.mjs'
import { useEthers } from '~/store/ethers'
import { getDomainName } from '~/utils/domainUtils'
import { fetchPlaylistData, fetchPlaylistNftId, storePlaylistData } from '~/utils/storageUtils'
import { fetchPlaylistDataFromBlockchain } from '~/utils/playlistUtils'

export default {
  name: 'PlaylistDetails',
  props: ['playlistAddress'],

  data() {
    return {
      playlistData: null,
      playlistNftId: null,
      waitingPlaylistData: false,
    }
  },

  mounted() {
    this.loadPlaylistData()
  },

  computed: {
    playlistName() {
      return this.playlistData ? this.playlistData.name : ''
    },
    playlistDescription() {
      return this.playlistData ? this.playlistData.description : ''
    },
    playlistImage() {
      return this.playlistData ? this.playlistData.image : ''
    },
  },

  methods: {
    async loadPlaylistData() {
      this.waitingPlaylistData = true

      // fetch playlist data from localStorage
      this.playlistData = fetchPlaylistData(window, this.playlistAddress)

      let provider = this.$getFallbackProvider(this.$config.supportedChainId)

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's wallet
        provider = this.signer
      }

      if (!this.playlistData) {
        // fetch playlist data from blockchain
        const result = await fetchPlaylistDataFromBlockchain(window, provider, this.playlistAddress, null)

        if (result.success) {
          this.playlistData = result.data
        } else {
          console.error(result.message)
          return this.toast.error(result.message)
        }
      }

      this.waitingPlaylistData = false

      // TODO: fetch playlist tracks from blockchain (do not store it in localStorage)
      // individial track data will be fetched from track components (and stored in localStorage)

      
    },
  },

  setup() {
    const { isActivated, chainId, signer } = useEthers()
    const toast = useToast()

    return {
      isActivated,
      chainId,
      signer,
      toast,
    }
  },

  // TODO:
  // - fetch playlist name, description, image (store it into localStorage, with an expiry date)
  // - fetch playlist tracks
  //   - list (track component): index, track name, button to add to queue, button to play now - if song cannot load, skip it
}
</script>
