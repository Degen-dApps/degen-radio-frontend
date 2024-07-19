<template>
  <div v-if="waiting" class="d-flex justify-content-center mb-3">
    <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
  </div>

  <div class="row" v-if="playlistNftIds">
    <UserPlaylistItem v-for="nftId in playlistNftIds" :key="nftId" :nftId="nftId" />
  </div>

  <div class="d-grid gap-2 mt-3">
    <button 
      v-if="!allTracksLoaded"
      class="btn btn-primary" 
      type="button"
      :disabled="waiting"
      @click="fetchPlaylists"
    >
      <span v-if="waiting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Load more playlists
    </button>
  </div>
</template>

<script>
import axios from 'axios'
import { ethers } from 'ethers'
import { useEthers } from '~/store/ethers'
import UserPlaylistItem from '~/components/radio/UserPlaylistItem.vue'

export default {
  name: 'ListAllPlaylists',
  components: { UserPlaylistItem },

  data() {
    return {
      idCursor: null,
      limit: 9,
      playlistNftIds: [],
      totalSupply: null,
      waiting: false,
    }
  },

  mounted() {
    this.fetchPlaylists()
  },

  computed: {
    allTracksLoaded() {
      return this.idCursor <= 1
    }
  },

  methods: {
    async getTotalSupply() {
      // fetch totalSupply from API
      if (!this.totalSupply) {
        const apiUrl = `${this.$config.radio.apiBaseUrl}/endpoints/playlist-nft-supply/${this.$config.supportedChainId}/${this.$config.radio.playlistNftAddress}`
        //console.log('fetching totalSupply from API:', apiUrl)

        try {
          const response = await axios.get(apiUrl)

          if (response.data?.success) {
            const item = response.data?.item
            this.totalSupply = Number(item?.supply)
            //console.log('totalSupply fetched from API:', this.totalSupply)
          }
        } catch (error) {
          console.error('Failed to fetch totalSupply from API:', error)
        }
      }

      if (!this.totalSupply) {
        console.error('Failed to fetch totalSupply from API, get it from blockchain')

        let provider = this.$getFallbackProvider(this.$config.supportedChainId)

        if (this.isActivated && this.chainId === this.$config.supportedChainId) {
          // fetch provider from user's wallet
          provider = this.signer
        }

        const playlistNftInterface = new ethers.utils.Interface([
          'function totalSupply() external view returns (uint256)',
        ])

        const playlistNftContract = new ethers.Contract(
          this.$config.radio.playlistNftAddress,
          playlistNftInterface,
          provider
        )

        this.totalSupply = await playlistNftContract.totalSupply()
      }
    },

    async fetchPlaylists() {
      this.waiting = true

      if (!this.totalSupply) {
        await this.getTotalSupply()
      }

      if (this.totalSupply) {
        if (!this.idCursor) {
          this.idCursor = this.totalSupply
        }

        for (let i = 0; i < this.limit; i++) {
          if (this.idCursor <= 0) {
            break
          }

          this.playlistNftIds.push(this.idCursor)
          this.idCursor--
        }

        this.waiting = false
      }
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

}
</script>
