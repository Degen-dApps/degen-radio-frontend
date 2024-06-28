<template>
  <div v-if="waiting" class="d-flex justify-content-center mb-3">
    <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
  </div>

  <div class="row" v-if="playlistNftIds">
    <UserPlaylistItem v-for="nftId in playlistNftIds" :key="nftId" :nftId="nftId" />
  </div>
</template>

<script>
import { ethers } from 'ethers'
import UserPlaylistItem from '~/components/radio/UserPlaylistItem.vue'
import { useEthers } from '~/store/ethers'

export default {
  name: 'UserPlaylists',
  props: ['address'],
  components: { UserPlaylistItem },

  data() {
    return {
      playlistNftIds: [],
      waiting: false,
    }
  },

  mounted() {
    this.fetchUserPlaylists()
  },

  methods: {
    async fetchUserPlaylists() {
      this.waiting = true
      
      // fetch provider from hardcoded RPCs
      let provider = this.$getFallbackProvider(this.$config.supportedChainId)

      if (this.isActivated) {
        if (this.chainId === this.$config.supportedChainId) {
          // fetch provider from user's MetaMask
          provider = this.signer
        }
      }

      const playlistNftInterface = new ethers.utils.Interface([
        'function balanceOf(address owner) external view returns (uint256)',
        'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
      ])

      const playlistNftContract = new ethers.Contract(
        this.$config.radio.playlistNftAddress,
        playlistNftInterface,
        provider
      )

      const playlistNftBalance = await playlistNftContract.balanceOf(this.address)

      for (let i = 0; i < playlistNftBalance; i++) {
        const playlistNftId = await playlistNftContract.tokenOfOwnerByIndex(this.address, i)
        this.playlistNftIds.push(Number(playlistNftId))
      }

      this.waiting = false
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
