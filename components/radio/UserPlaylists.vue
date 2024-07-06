<template>
  <div v-if="waiting" class="d-flex justify-content-center mb-3">
    <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
  </div>

  <div class="row" v-if="playlistNftIds">
    <UserPlaylistItem v-for="nftId in playlistNftIds" :key="nftId" :nftId="nftId" />
  </div>
</template>

<script>
import UserPlaylistItem from '~/components/radio/UserPlaylistItem.vue'
import { useEthers } from '~/store/ethers'
import { fetchUserPlaylists } from '~/utils/playlistUtils'

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
    this.fetchCurrentUserPlaylists()
  },

  methods: {
    async fetchCurrentUserPlaylists() {
      this.waiting = true
      
      // fetch provider from hardcoded RPCs
      let provider = this.$getFallbackProvider(this.$config.supportedChainId)

      this.playlistNftIds = await fetchUserPlaylists(window, provider, this.address)

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
