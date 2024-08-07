<template>
<div class="card m-2 bg-light">
  <div class="card-header bg-light text-center">
    <span class="me-1">Random Playlist</span>
    <i v-if="totalSupply" @click="loadPlaylistData" class="bi bi-arrow-clockwise cursor-pointer hover-color align-middle"></i>
  </div>
  <div class="card-body sidebar-card-body text-center">

    <div v-if="!playlistData">

      <div class="row mt-5 mb-5">
        <div class="offset-md-3 col-md-6 text-center">
          <div class="spinner-grow" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>

      <h5 class="card-title placeholder-glow"><span class="placeholder col-6"></span></h5>

      <p class="card-text placeholder-glow"><span class="placeholder col-4"></span></p>
    </div>

    <div v-if="playlistData" :key="playlistData" @click="closeSidebar">
      <NuxtLink :to="`/playlist?id=`+playlistData.playlistAddress">
        <Image :url="playlistData.image" :alt="playlistData.name" cls="card-img-top w-50 rounded-bottom-3" />
      </NuxtLink>
      
      <NuxtLink :to="`/playlist?id=`+playlistData.playlistAddress">
        <h5 class="card-title text-center mt-3">{{ playlistData.name }}</h5>
      </NuxtLink>

      <p class="card-text text-center">
        <small><em>by 
          <NuxtLink :to="`/profile?id=${ownerDomainOrLongAddress}`">{{ ownerDomainOrShortAddress }}</NuxtLink>
        </em></small>
      </p>
    </div>

  </div>
</div>
</template>

<script>
import axios from 'axios'
import { ethers } from 'ethers'
import Image from '~/components/Image.vue'
import { shortenAddress, useEthers } from '~/store/ethers'
import { getDomainName } from '~/utils/domainUtils'
import { fetchPlaylistDataFromBlockchain } from '~/utils/playlistUtils'
import { fetchPlaylistData, fetchUsername, storeUsername } from '~/utils/storageUtils'

export default {
  name: 'RandomPlaylistOneWidget',
  props: ['isMobile'],
  emits: ['closeRightSidebar'],
  components: { Image },

  data() {
    return {
      ownerDomain: null,
      playlistData: null,
      totalSupply: null,
      waitingPlaylistData: false,
    }
  },

  mounted() {
    this.loadPlaylistData()
  },

  computed: {
    ownerAddress() {
      return this.playlistData ? this.playlistData.owner : null
    },

    ownerDomainOrLongAddress() {
      if (this.ownerDomain) {
        return String(this.ownerDomain).replace(this.$config.tldName, "") + this.$config.tldName
      } else if (this.ownerAddress) {
        return this.ownerAddress
      }

      return null
    },

    ownerDomainOrShortAddress() {
      if (this.ownerDomain) {
        return String(this.ownerDomain).replace(this.$config.tldName, "") + this.$config.tldName
      } else if (this.ownerAddress) {
        return shortenAddress(this.ownerAddress)
      }

      return null
    } 
  },

  methods: {
    closeSidebar() {
      if (this.isMobile) {
        this.$emit('closeRightSidebar')
      }
    },

    async loadPlaylistData() {
      this.ownerDomain = null

      let provider = this.$getFallbackProvider(this.$config.supportedChainId)

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's wallet
        provider = this.signer
      }

      // fetch totalSupply from API
      if (!this.totalSupply) {
        const apiUrl = `${this.$config.radio.apiBaseUrl}/endpoints/playlist-nft-supply/${this.$config.supportedChainId}/${this.$config.radio.playlistNftAddress}`
        //console.log('fetching totalSupply from API:', apiUrl)

        try {
          const response = await axios.get(apiUrl)
          //console.log('response:', response)

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
        // measure time taken to fetch totalSupply
        //console.time('fetch totalSupply')

        const playlistNftInterface = new ethers.utils.Interface([
          'function totalSupply() external view returns (uint256)',
        ])

        const playlistNftContract = new ethers.Contract(
          this.$config.radio.playlistNftAddress,
          playlistNftInterface,
          provider
        )

        this.totalSupply = await playlistNftContract.totalSupply()

        //console.timeEnd('fetch totalSupply')
      }

      const randomTokenId = Math.floor(Math.random() * Number(this.totalSupply)) + 1

      // fetch playlist data from localStorage
      this.playlistData = await fetchPlaylistData(window, randomTokenId)

      if (!this.playlistData) {
        // fetch playlist data from blockchain
        const result = await fetchPlaylistDataFromBlockchain(window, provider, null, randomTokenId)

        if (result.success) {
          this.playlistData = result.data
        } else {
          console.error(result.message)
        }
      }

      if (!this.ownerDomain && this.ownerAddress) {
        this.ownerDomain = fetchUsername(window, this.ownerAddress)

        if (!this.ownerDomain && this.ownerAddress) {
          this.ownerDomain = await getDomainName(this.ownerAddress, provider)

          if (this.ownerDomain) {
            this.ownerDomain = String(this.ownerDomain).replace(this.$config.tldName, "") + this.$config.tldName
            storeUsername(window, this.ownerAddress, this.ownerDomain)
          }
        }
      }
    },
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
