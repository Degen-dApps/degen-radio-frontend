<template>
  <Head>
    <Title>Edit Playlist | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Edit Playlist | ' + $config.projectMetadataTitle" />
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <p class="fs-3">
        <i class="bi bi-arrow-left-circle cursor-pointer" @click="goBackToPlaylist"></i>
      </p>

      <h3 class="mt-3">
        <span v-if="!oldPlaylistName">Edit a playlist</span>
        <span v-if="oldPlaylistName">Edit playlist <em>{{ oldPlaylistName }}</em></span>
      </h3>

      <div class="d-flex justify-content-center mb-3" v-if="waitingData">
        <span class="spinner-border spinner-border-lg" role="status" aria-hidden="true"></span>
      </div>

      <!-- Playlist Name -->
      <div class="mb-2 mt-5">
        <label for="pName" class="form-label">Playlist Name</label>
        <input type="text" class="form-control" id="pName" placeholder="e.g. Dinner With Friends" v-model="pName" />
      </div>

      <p v-if="nameTooLong">
        <small class="text-danger">Name is too long. Maximum {{ nameMaxLength }} characters allowed.</small>
      </p>

      <!-- Change Name Buttons div -->
      <div class="d-flex justify-content-start mb-5">
        <!-- Change Playlist Name button -->
        <button
          :disabled="waitingData || waitingEditName || !pName || nameTooLong"
          v-if="isActivated && isSupportedChain"
          class="btn btn-primary"
          type="button"
          @click="changeName"
        >
          <span
            v-if="waitingEditName"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          Change Name
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

      <!-- Playlist Description -->
      <div class="mb-2 mt-3">
        <label for="pDescription" class="form-label">Playlist Description (keep it short)</label>
        <input
          type="text"
          class="form-control"
          id="pDescription"
          placeholder="e.g. A playlist for dinner with friends"
          v-model="pDescription"
        />
      </div>

      <p v-if="descriptionTooLong">
        <small class="text-danger">Description is too long. Maximum {{ descriptionMaxLength }} characters allowed.</small>
      </p>

      <!-- Change Description Buttons div -->
      <div class="d-flex justify-content-start mb-5">
        <!-- Change Playlist Description button -->
        <button
          :disabled="waitingData || waitingEditDescription || !pDescription || descriptionTooLong"
          v-if="isActivated && isSupportedChain"
          class="btn btn-primary"
          type="button"
          @click="changeDescription"
        >
          <span
            v-if="waitingEditDescription"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          Change Description
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

      <!-- Playlist Image -->
      <div class="mb-2 mt-3">
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

      <div v-if="pImage" class="mb-2">
        <Image :url="pImage" cls="img-thumbnail img-fluid" style="max-width: 100px" />
        <br />
        <small
          >If image didn't appear above, then something is wrong with the link you added (wait until the loading
          indicator completes).</small
        >
      </div>

      <!-- Change Image Buttons div -->
      <div class="d-flex justify-content-start mb-5">
        <!-- Change Playlist Image button -->
        <button
          :disabled="waitingData || waitingEditImage || !pImage"
          v-if="isActivated && isSupportedChain"
          class="btn btn-primary"
          type="button"
          @click="changeImage"
        >
          <span
            v-if="waitingEditImage"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          Change Image
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

      <!-- Playlist Genre -->
      <div class="mb-2 mt-3">
        <label for="pGenre" class="form-label">Playlist Genre (optional)</label>
        <input type="text" class="form-control" id="pGenre" placeholder="e.g. Rock" v-model="pGenre" />
      </div>

      <p v-if="genreTooLong">
        <small class="text-danger">Genre is too long. Maximum {{ genreMaxLength }} characters allowed.</small>
      </p>

      <!-- Change Genre Buttons div -->
      <div class="d-flex justify-content-start mb-5">
        <!-- Change Playlist Genre button -->
        <button
          :disabled="waitingData || waitingEditGenre || !pGenre || genreTooLong"
          v-if="isActivated && isSupportedChain"
          class="btn btn-primary"
          type="button"
          @click="changeGenre"
        >
          <span
            v-if="waitingEditGenre"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          ></span>
          Change Genre
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
import axios from 'axios'
import { ethers } from 'ethers'
import { useEthers } from '~/store/ethers'
import { useToast } from 'vue-toastification/dist/index.mjs'
import ConnectWalletButton from '~/components/ConnectWalletButton.vue'
import Image from '~/components/Image.vue'
import SwitchChainButton from '~/components/SwitchChainButton.vue'
import WaitingToast from '~/components/WaitingToast'
import FileUploadModal from '~/components/storage/FileUploadModal.vue'
import { fetchPlaylistDataFromBlockchain } from '~/utils/playlistUtils'
import { fetchPlaylistData } from '~/utils/storageUtils'

export default {
  name: 'PlaylistEdit',
  components: { ConnectWalletButton, Image, SwitchChainButton, FileUploadModal },

  data() {
    return {
      descriptionMaxLength: 300,
      genreMaxLength: 30,
      isMounted: false,
      nameMaxLength: 30,
      oldPlaylistName: null,
      pAddress: null,
      pDescription: null,
      pGenre: null,
      pImage: null,
      pName: null,
      nftId: null,
      waitingEditDescription: false,
      waitingEditGenre: false,
      waitingEditImage: false,
      waitingEditName: false,
      waitingData: false,
    }
  },

  mounted() {
    this.isMounted = true

    // check if the query params are present
    if (this.$route.query.addr && this.$route.query.nftid) {
      this.pAddress = this.$route.query.addr
      this.nftId = this.$route.query.nftid
      this.fetchData()
    } else {
      this.toast('No Playlist NFT ID or address found in the query params.', { type: 'error' })
      return this.$router.push({ path: '/' })
    }
    
  },

  computed: {
    descriptionTooLong() {
      return this.pDescription && this.pDescription.length > this.descriptionMaxLength
    },

    genreTooLong() {
      return this.pGenre && this.pGenre.length > this.genreMaxLength
    },

    isSupportedChain() {
      if (this.chainId === this.$config.supportedChainId) {
        return true
      } else {
        return false
      }
    },

    nameTooLong() {
      return this.pName && this.pName.length > this.nameMaxLength
    },
  },

  methods: {
    async changeDescription() {
      this.waitingEditDescription = true

      // get provider
      let provider = this.$getFallbackProvider(this.$config.supportedChainId)

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's MetaMask
        provider = this.signer
      }

      const mdInterface = new ethers.utils.Interface([
        'function setDescription(uint256, string memory) external',
      ])

      const mdContract = new ethers.Contract(this.$config.radio.playlistNftMetadata, mdInterface, provider)

      try {
        const tx = await mdContract.setDescription(this.nftId, this.pDescription)

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
          this.waitingEditDescription = false

          this.toast.dismiss(toastWait)

          this.toast('You have successfully change the playlist description!', {
            type: 'success',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          })

          this.refreshPlaylistData()
           
        } else {
          this.waitingEditDescription = false
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

        this.waitingEditDescription = false
      }
    },

    async changeGenre() {
      this.waitingEditGenre = true

      // get provider
      let provider = this.$getFallbackProvider(this.$config.supportedChainId)

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's MetaMask
        provider = this.signer
      }

      const mdInterface = new ethers.utils.Interface([
        'function setGenre(uint256 tokenId_, string memory genre_) external',
      ])

      const mdContract = new ethers.Contract(this.$config.radio.playlistNftMetadata, mdInterface, provider)

      try {
        const tx = await mdContract.setGenre(this.nftId, this.pGenre)

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
          this.waitingEditGenre = false

          this.toast.dismiss(toastWait)

          this.toast('You have successfully change the playlist genre!', {
            type: 'success',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          })

          this.refreshPlaylistData()
           
        } else {
          this.waitingEditGenre = false
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

        this.waitingEditGenre = false
      }
    },

    async changeImage() {
      this.waitingEditImage = true

      // get provider
      let provider = this.$getFallbackProvider(this.$config.supportedChainId)

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's MetaMask
        provider = this.signer
      }

      const mdInterface = new ethers.utils.Interface([
        'function setImage(uint256 tokenId_, string memory image_) external',
      ])

      const mdContract = new ethers.Contract(this.$config.radio.playlistNftMetadata, mdInterface, provider)

      try {
        const tx = await mdContract.setImage(this.nftId, this.pImage)

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
          this.waitingEditImage = false

          this.toast.dismiss(toastWait)

          this.toast('You have successfully change the playlist image!', {
            type: 'success',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          })

          this.refreshPlaylistData()
           
        } else {
          this.waitingEditImage = false
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

        this.waitingEditImage = false
      }
    },

    async changeName() {
      this.waitingEditName = true

      // get provider
      let provider = this.$getFallbackProvider(this.$config.supportedChainId)

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's MetaMask
        provider = this.signer
      }

      const mdInterface = new ethers.utils.Interface([
        'function setName(uint256 tokenId_, string memory name_) external',
      ])

      const mdContract = new ethers.Contract(this.$config.radio.playlistNftMetadata, mdInterface, provider)

      try {
        const tx = await mdContract.setName(this.nftId, this.pName)

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
          this.waitingEditName = false

          this.toast.dismiss(toastWait)

          this.toast('You have successfully change the playlist name!', {
            type: 'success',
            onClick: () => window.open(this.$config.blockExplorerBaseUrl + '/tx/' + tx.hash, '_blank').focus(),
          })

          this.refreshPlaylistData()
           
        } else {
          this.waitingEditName = false
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

        this.waitingEditName = false
      }
    },

    async fetchData() {
      this.waitingData = true

      // fetch playlist data from localStorage
      let playlistData = await fetchPlaylistData(window, this.pAddress)

      if (!playlistData) {
        // fetch provider from hardcoded RPCs
        let provider = this.$getFallbackProvider(this.$config.supportedChainId)

        if (this.isActivated && this.chainId === this.$config.supportedChainId) {
          // fetch provider from user's MetaMask
          provider = this.signer
        }

        // fetch playlist data from blockchain
        playlistData = await fetchPlaylistDataFromBlockchain(window, provider, this.pAddress, this.nftId)
      }

      if (playlistData) {
        this.oldPlaylistName = playlistData.name
        this.pName = playlistData.name
        this.pDescription = playlistData.description
        this.pImage = playlistData.image
        this.pGenre = playlistData.genre
      }

      this.waitingData = false
    },

    goBackToPlaylist() {
      return this.$router.push({ path: '/playlist', query: { id: this.pAddress } })
    },

    insertImage(imageUrl) {
      this.pImage = imageUrl.replace('?.img', '')
    },

    async refreshPlaylistData() {
      let provider = this.$getFallbackProvider(this.$config.supportedChainId)

      if (this.isActivated && this.chainId === this.$config.supportedChainId) {
        // fetch provider from user's wallet
        provider = this.signer
      }

      // fetch playlist data from blockchain
      const result = await fetchPlaylistDataFromBlockchain(window, provider, this.pAddress, this.nftId)

      if (result.success) {
        const playlistData = result.data

        this.oldPlaylistName = playlistData.name
        this.pName = playlistData.name
        this.pDescription = playlistData.description
        this.pImage = playlistData.image
        this.pGenre = playlistData.genre
      } else {
        console.error(result.message)
        return this.toast.error(result.message)
      }

      // refresh playlist in the API
      try {
        const apiUrl = `${this.$config.radio.apiBaseUrl}/endpoints/playlist-refresh/${this.$config.supportedChainId}/${this.pAddress}`
        const response = await axios.get(apiUrl)

        if (response.data?.success) {
          console.log(response.data?.msg)
        } else {
          console.error('Failed to refresh playlist in the API:', response.data?.error)
        }
      } catch (error) {
        console.error('Failed to refresh playlist in the API:', error)
      }
    }
  },

  setup() {
    const { address, chainId, isActivated, signer } = useEthers()
    const toast = useToast()

    return { address, chainId, isActivated, signer, toast }
  },
}
</script>
