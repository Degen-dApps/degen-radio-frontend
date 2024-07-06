<template>
  <Head>
    <Title>Create Playlist | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Create Playlist | ' + $config.projectMetadataTitle" />
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <p class="fs-3">
        <i class="bi bi-arrow-left-circle cursor-pointer" @click="$router.back()"></i>
      </p>

      <h3 class="mt-3">Create a new playlist</h3>

      <p class="mt-4 mb-4">
        <small>
          All playlist data is stored on the blockchain and can be updated at any time.
          <span v-if="price">Price to create a playlist: {{ price }} {{ $config.tokenSymbol }}</span>
        </small>
      </p>

      <div class="d-flex justify-content-center mb-3" v-if="waitingData">
        <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
      </div>

      <!-- Playlist Name -->
      <div class="mb-4">
        <label for="pName" class="form-label">Playlist Name</label>
        <input type="text" class="form-control" id="pName" placeholder="e.g. Dinner With Friends" v-model="pName" />
      </div>

      <!-- Playlist Description -->
      <div class="mb-4">
        <label for="pDescription" class="form-label">Playlist Description (keep it short)</label>
        <input
          type="text"
          class="form-control"
          id="pDescription"
          placeholder="e.g. A playlist for dinner with friends"
          v-model="pDescription"
        />
      </div>

      <!-- Playlist Image -->
      <div class="mb-2">
        <label for="pImage" class="form-label">Playlist Image</label>
        <div class="input-group" aria-describedby="pImageHelp" id="pImage">
          <input
            v-model="pImage"
            type="text"
            class="form-control"
            placeholder="Enter image URL or click the upload button"
          />

          <button
            v-if="isActivated && $config.fileUploadEnabled !== ''"
            class="btn btn-outline-secondary rounded-end-2"
            data-bs-toggle="modal"
            :data-bs-target="'#fileUploadModal' + $.uid"
          >
            <i class="bi bi-file-earmark-image-fill"></i>
            Upload
          </button>
        </div>
        <div id="pImageHelp" class="form-text">
          Even if you want a generative PFP collection, put a single preview image for now and you will change it to a
          metadata link later.
        </div>
      </div>

      <div v-if="pImage" class="mb-4">
        <Image :url="pImage" cls="img-thumbnail img-fluid" style="max-width: 100px" />
        <br />
        <small
          >If image didn't appear above, then something is wrong with the link you added (wait until the loading
          indicator completes).</small
        >
      </div>

      <h5 class="mt-3">Enter the first track to playlist</h5>

      <p>
        <small> You'll add others later, after the playlist is created. </small>
      </p>

      <!-- Track address -->
      <div class="mb-4">
        <label for="tAddress" class="form-label">Track (Music NFT) Address</label>
        <input type="text" class="form-control" id="tAddress" placeholder="0x..." v-model="tAddress" />
      </div>

      <!-- Track NFT ID -->
      <div class="mb-4">
        <label for="tNftId" class="form-label">Track NFT token ID (optional)</label>
        <input type="text" class="form-control" id="tNftId" v-model="tNftId" />
      </div>

      <!-- Track blockchain -->
      <div class="mb-1">
        <label for="tChain" class="form-label">Track Blockchain</label>
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
            <li><span class="dropdown-item cursor-pointer" @click="selectChain(42161, 'Arbitrum')">Arbitrum</span></li>
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
        <small class="mb-4">
          Note that the track data will be entered in the smart contract on Degen Chain, even if track itself is on
          another chain.
        </small>
      </div>

      <button @click="playNow" class="btn btn-outline-primary btn-sm mt-3" :disabled="waitingPlayNow">
        <span v-if="waitingPlayNow" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <i v-if="!waitingPlayNow" class="bi bi-play-circle-fill"></i>
        Play song
      </button>

      <!-- Buttons div -->
      <div class="d-flex justify-content-center mt-5 mb-5">
        <!-- Create Playlist button -->
        <button
          :disabled="waitingCreate || !fieldsValid"
          v-if="isActivated && isSupportedChain"
          class="btn btn-primary"
          type="button"
          @click="createPlaylist"
        >
          <span
            v-if="waitingData || waitingCreate"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          Create Playlist<span v-if="price"> for {{ price }} {{ $config.tokenSymbol }}</span>
        </button>

        <!-- Connect Wallet button -->
        <ConnectWalletButton
          v-if="!isActivated && !isSupportedChain"
          class="btn btn-primary"
          btnText="Connect wallet"
        />

        <!-- Switch Chain button -->
        <SwitchChainButton v-if="isActivated && !isSupportedChain" />
      </div>
    </div>
  </div>

  <!-- Upload Image Modal -->
  <FileUploadModal
    v-if="isMounted"
    @processFileUrl="insertImage"
    title="Upload your playlist image"
    infoText="Upload the playlist image."
    storageType="ipfs"
    :componentId="$.uid"
    :maxFileSize="$config.fileUploadSizeLimit"
  />
  <!-- END Upload Image Modal -->
</template>

<script>
import { ethers } from 'ethers'
import { useEthers } from '~/store/ethers'
import { useToast } from 'vue-toastification/dist/index.mjs'
import ConnectWalletButton from '~/components/ConnectWalletButton.vue'
import Image from '~/components/Image.vue'
import SwitchChainButton from '~/components/SwitchChainButton.vue'
import WaitingToast from '~/components/WaitingToast'
import FileUploadModal from '~/components/storage/FileUploadModal.vue'
import { useAudioStore } from '~/store/audio'
import { fetchMusicNftData } from '~/utils/audioUtils'

export default {
  name: 'PlaylistCreate',
  components: { ConnectWalletButton, Image, SwitchChainButton, FileUploadModal },

  data() {
    return {
      isMounted: false,
      pDescription: null,
      pImage: null,
      pName: null,
      priceWei: null,
      tAddress: null,
      tChainId: 666666666,
      tChainName: 'Degen Chain',
      tNftId: 1,
      waitingCreate: false,
      waitingData: false,
      waitingPlayNow: false,
    }
  },

  mounted() {
    this.isMounted = true
    this.fetchFactoryData()

    // check if the query params are present
    if (this.$route.query.addr && this.$route.query.chain && this.$route.query.nftid) {
      this.tAddress = this.$route.query.addr
      this.tChainId = this.$route.query.chain
      this.tNftId = this.$route.query.nftid
      this.tChainName = this.$getChainName(Number(this.tChainId))
    }
    
  },

  computed: {
    fieldsValid() {
      return (
        this.pName && this.pDescription && this.pImage && ethers.utils.isAddress(this.tAddress) && !isNaN(this.tChainId)
      )
    },

    isSupportedChain() {
      if (this.chainId === this.$config.supportedChainId) {
        return true
      } else {
        return false
      }
    },

    price() {
      if (!this.priceWei) return null

      const price = Number(ethers.utils.formatEther(this.priceWei))

      if (price > 1) {
        return price.toFixed(0)
      } else if (price > 0.1) {
        return price.toFixed(4)
      } else if (price > 0.01) {
        return price.toFixed(5)
      } else if (price > 0.001) {
        return price.toFixed(6)
      } else if (price > 0.0001) {
        return price.toFixed(7)
      } else if (price > 0.00001) {
        return price.toFixed(8)
      } else if (price > 0.000001) {
        return price.toFixed(9)
      } else {
        return price
      }
    },
  },

  methods: {
    async createPlaylist() {
      this.waitingCreate = true

      // load track data
      const trackData = await this.loadTrack()

      if (!trackData.success) {
        this.waitingCreate = false
        console.error(trackData.message)
        this.toast.error(trackData.message)
        return
      }

      // get provider
      let provider = this.$getFallbackProvider(this.$config.supportedChainId)

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's MetaMask
        provider = this.signer
      }

      const factoryInterface = new ethers.utils.Interface([
        'event PlaylistCreated(address indexed caller_, address indexed playlistAddress_, uint256 paid_)',
        'function createPlaylist(string name, string description, string image, address trackAddress, uint256 trackNftId, uint256 trackChainId) external payable returns (address playlistAddress_)',
      ])

      const factoryContract = new ethers.Contract(this.$config.radio.playlistFactoryAddress, factoryInterface, provider)

      try {
        const tx = await factoryContract.createPlaylist(
          this.pName,
          this.pDescription,
          this.pImage,
          this.tAddress,
          this.tNftId,
          this.tChainId,
          { value: this.priceWei },
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
        console.log(receipt)

        if (receipt.status === 1) {
          this.waitingCreate = false

          this.toast.dismiss(toastWait)

          this.toast('You have successfully created an onchain playlist!', {
            type: 'success',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          })

          // get PlaylistCreated event from the receipt
          const events = receipt.events
          const [event] = events.filter(x => x.event === 'PlaylistCreated')
          const playlistAddress = event.args.playlistAddress_

          // redirect to the playlist page
          return this.$router.push({ path: '/playlist', query: { id: playlistAddress } })
        } else {
          this.waitingCreate = false
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

        this.waitingCreate = false
      }
    },

    async fetchFactoryData() {
      this.waitingData = true

      // fetch provider from hardcoded RPCs
      let provider = this.$getFallbackProvider(this.$config.supportedChainId)

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's MetaMask
        provider = this.signer
      }

      const factoryInterface = new ethers.utils.Interface(['function price() external view returns (uint256)'])

      const factoryContract = new ethers.Contract(this.$config.radio.playlistFactoryAddress, factoryInterface, provider)

      try {
        this.priceWei = await factoryContract.price()
      } catch (error) {
        console.error(error)
      }

      this.waitingData = false
    },

    insertImage(imageUrl) {
      this.pImage = imageUrl.replace('?.img', '')
    },

    async loadTrack() {
      const provider = this.$getProviderForChain(Number(this.tChainId))
      const trackData = await fetchMusicNftData(window, provider, this.tAddress, this.tNftId, this.tChainId)

      if (trackData.success) {
        return { success: true, nftData: trackData.nftData }
      } else {
        if (trackData?.message) {
          return { success: false, message: trackData.message }
        }

        return { success: false, message: 'Failed to load track' }
      }
    },

    async playNow() {
      this.waitingPlayNow = true

      const trackData = await this.loadTrack()

      if (trackData.success) {
        this.audioStore.playNow(trackData.nftData)
      } else {
        console.error(trackData.message)
        this.toast.error(trackData.message)
      }

      this.waitingPlayNow = false
    },

    selectChain(chainId, chainName) {
      this.tChainId = chainId
      this.tChainName = chainName
    },
  },

  setup() {
    const audioStore = useAudioStore()
    const { address, chainId, isActivated, signer } = useEthers()
    const toast = useToast()

    return { address, audioStore, chainId, isActivated, signer, toast }
  },
}
</script>
