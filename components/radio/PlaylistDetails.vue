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

    <div class="row">
      <div class="offset-md-4 col-md-4 offset-3 col-6 mb-3">
        <img :src="playlistImage" :alt="playlistName" class="img-fluid rounded-3" />
      </div>
    </div>

    <h4 class="mb-3 text-center">{{ playlistName }}</h4>

    <p class="text-center">{{ playlistDescription }}</p>

    <p>
      <strong class="me-2 h4">Tracks</strong>
      <button
        v-if="isCurrentUserOwner"
        class="btn btn-primary btn-sm mt-2 mb-3"
        type="button"
        data-bs-toggle="modal"
        data-bs-target="#addNewTrackModal"
      >
        <i class="bi bi-plus-circle"></i>
        Add more tracks
      </button>
    </p>

    <div v-if="waitingTracksData" class="d-flex justify-content-center mb-3">
      <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
    </div>

    <TracksListItem class="mb-2" v-for="(track, index) in tracks" :key="index" :track="track" />

    <div class="d-grid gap-2 mt-3">
      <button class="btn btn-primary" type="button">Load more tracks</button>
    </div>

    <AddNewTrackModal :audioStore="audioStore" :playlist="playlistData" @addSongToTracks="addSongToTracks" />
  </div>
</template>

<script>
import { ethers } from 'ethers'
import { useToast } from 'vue-toastification/dist/index.mjs'
import DegenRadioPlaylistAbi from '~/assets/abi/DegenRadioPlaylistAbi.json'
import AddNewTrackModal from '~/components/radio/AddNewTrackModal.vue'
import TracksListItem from '~/components/radio/TracksListItem.vue'
import { useAudioStore } from '~/store/audio'
import { useEthers } from '~/store/ethers'
import { fetchMusicNftData } from '~/utils/audioUtils'
import { getDomainName } from '~/utils/domainUtils'
import { fetchPlaylistData } from '~/utils/storageUtils'
import { fetchPlaylistDataFromBlockchain } from '~/utils/playlistUtils'

export default {
  name: 'PlaylistDetails',
  props: ['playlistAddress'],
  components: { AddNewTrackModal, TracksListItem },

  data() {
    return {
      ownerAddress: null,
      playlistData: null,
      playlistNftId: null,
      tracks: [],
      waitingPlaylistData: false,
      waitingTracksData: false,
    }
  },

  mounted() {
    this.loadPlaylistData()
  },

  computed: {
    isCurrentUserOwner() {
      if (this.address && this.ownerAddress) {
        return String(this.address).toLowerCase() === String(this.ownerAddress).toLowerCase()
      }

      return false
    },

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
    async addSongToTracks(musicNft) {
      const provider = this.$getProviderForChain(Number(this.tChainId))
      const trackData = await fetchMusicNftData(window, provider, musicNft.tAddress, musicNft.tNftId, musicNft.tChainId)

      if (trackData.success) {
        this.tracks.push(trackData.nftData)
      }
    },

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

      this.waitingTracksData = true

      // TODO: fetch playlist tracks from blockchain (do not store it in localStorage)
      // individial track data will be fetched from track components (and stored in localStorage)
      const playlistContract = new ethers.Contract(this.playlistAddress, DegenRadioPlaylistAbi, provider)

      // fetch first 10 tracks
      const musicNfts = await playlistContract.getTracks(0, 10)

      for (let i = 0; i < musicNfts.length; i++) {
        const musicNft = musicNfts[i]
        const trackData = await fetchMusicNftData(window, provider, musicNft.nftAddress, musicNft.tokenId, musicNft.chainId)

        if (trackData.success) {
          this.tracks.push(trackData?.nftData)
        }
      }

      this.waitingTracksData = false

      // fetch contract owner
      this.ownerAddress = await playlistContract.getOwner()
    },
  },

  setup() {
    const audioStore = useAudioStore()
    const { address, isActivated, chainId, signer } = useEthers()
    const toast = useToast()

    return {
      address,
      audioStore,
      isActivated,
      chainId,
      signer,
      toast,
    }
  },
}
</script>
