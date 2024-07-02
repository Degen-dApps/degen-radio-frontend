<template>
<div v-if="!playlistData" class="col-md-4 card mb-3">
  <div class="card-body">
    <img src="/img/user/anon.svg" class="card-img-top" alt="Placeholder image">
    <h5 class="card-title placeholder-glow"><span class="placeholder col-6"></span></h5>
    <p class="card-text placeholder-glow">
      <span class="placeholder col-7"></span>
      <span class="placeholder col-4"></span>
      <span class="placeholder col-4"></span>
      <span class="placeholder col-6"></span>
      <span class="placeholder col-8"></span>
    </p>
  </div>
</div>

<div v-if="playlistData" class="col-md-4 card mb-3">
  <NuxtLink :to="`/playlist?id=`+playlistData.playlistAddress">
    <Image :url="playlistData.image" :alt="playlistData.name" cls="card-img-top" />
  </NuxtLink>
  <div class="card-body border border-2 border-top-0 rounded-bottom-3">
    <NuxtLink :to="`/playlist?id=`+playlistData.playlistAddress">
      <h5 class="card-title text-center">{{ playlistData.name }}</h5>
    </NuxtLink>
    <p class="card-text text-center mt-2">{{ playlistData.description }}</p>
  </div>
</div>

</template>

<script>
import { useToast } from 'vue-toastification/dist/index.mjs'
import Image from '~/components/Image.vue'
import { useEthers } from '~/store/ethers'
import { fetchPlaylistData } from '~/utils/storageUtils'
import { fetchPlaylistDataFromBlockchain } from '~/utils/playlistUtils'

export default {
  name: 'UserPlaylistItem',
  props: ['nftId'],
  components: { Image },

  data() {
    return {
      playlistData: null,
      waiting: false,
    }
  },

  mounted() {
    this.loadPlaylistData()
  },

  methods: {
    async loadPlaylistData() {
      this.waiting = true

      // fetch playlist data from localStorage
      this.playlistData = await fetchPlaylistData(window, this.nftId)

      let provider = this.$getFallbackProvider(this.$config.supportedChainId)

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's wallet
        provider = this.signer
      }

      if (!this.playlistData) {
        // fetch playlist data from blockchain
        const result = await fetchPlaylistDataFromBlockchain(window, provider, null, this.nftId)

        if (result.success) {
          this.playlistData = result.data
        } else {
          console.error(result.message)
          this.toast.error(result.message)
        }
      }

      this.waiting = false
    }
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
}
</script>
