<template>
  <div>
    <div class="row text-center">
      <img
        src="https://i.pinimg.com/originals/ea/70/75/ea707569ecc64bb0cf6c5165f8a9b392.jpg"
        alt="Playlist name"
        class="offset-md-4 col-md-4 offset-3 col-6 mb-3 img-fluid rounded" 
      />
    </div>

    <h4 class="mb-3 text-center">Playlist</h4>

    <p>Playlist address: {{ playlistAddress }}</p>
  </div>
</template>

<script>
import { ethers } from 'ethers'
import { useEthers } from '~/store/ethers'
import { getDomainName } from '~/utils/domainUtils'
import { fetchPlaylistData, storePlaylistData } from '~/utils/storageUtils'

export default {
  name: 'PlaylistDetails',
  props: ['playlistAddress'],

  mounted() {
    this.loadPlaylistData()
  },

  methods: {
    async loadPlaylistData() {
      // fetch playlist data from localStorage
      let playlistData = fetchPlaylistData(window, this.playlistAddress)
      console.log('playlistData', playlistData)

      if (playlistData) {
        // TODO
      } else {
        // fetch playlist data from blockchain
        this.loadPlaylistDataFromBlockchain()
      }

      
    },

    async loadPlaylistDataFromBlockchain() {
      console.log('load Playlist Data From Blockchain')
      // useful also to manually refresh playlist data

      // get provider
      let provider = this.$getFallbackProvider(this.$config.supportedChainId)

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's MetaMask
        provider = this.signer
      }

      const playlistInterface = new ethers.utils.Interface([
        'function playlistId() view returns (uint256)',
      ])

      const playlistContract = new ethers.Contract(this.playlistAddress, playlistInterface, provider)

      // fetch playlist name, description, image
      // fetch playlist tracks
    }
  },

  setup() {
    const { isActivated, chainId, signer } = useEthers()

    return {
      isActivated,
      chainId,
      signer,
    }
  },

  // TODO:
  // - fetch playlist name, description, image (store it into localStorage, with an expiry date)
  // - fetch playlist tracks
  //   - list (track component): index, track name, button to add to queue, button to play now - if song cannot load, skip it
}
</script>
