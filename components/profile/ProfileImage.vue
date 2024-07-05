<template>
  <img :src="parseImageLink" :alt="domainName" class="rounded-circle" />
</template>

<script>
import { ethers } from 'ethers'
import Image from '~/components/Image.vue'
import { useEthers } from '~/store/ethers'
import { fetchData, storeData } from '~/utils/storageUtils'

export default {
  name: 'ProfileImage',
  props: ['domain', 'image'],
  components: { Image },

  data() {
    return {
      imgPath: null,
      defaultImage: '/img/user/anon.svg',
    }
  },

  created() {
    this.imgPath = this.defaultImage
  },

  mounted() {
    this.fetchProfilePicture()
  },

  computed: {
    domainName() {
      if (!this.domain) {
        return null
      }

      return this.domain.replace(this.$config.tldName, '')
    },

    parseImageLink() {
      let parsedImage = this.imgPath

      if (parsedImage && parsedImage.includes('ipfs://')) {
        parsedImage = parsedImage.replace('ipfs://', this.$config.ipfsGateway)
      }

      return parsedImage
    },
  },

  methods: {
    async fetchProfilePicture() {
      if (this.image) {
        return this.imgPath = this.image
      }
      
      // Check if domain name is passed as a prop
      if (this.domainName) {

        // Check if domain name has an image (domainName-img key)
        const dataObject = fetchData(window, this.domainName, "img", this.$config.expiryPfps)

        if (dataObject) {
          return this.imgPath = dataObject.image
        } else {
          // fetch image from blockchain
          let provider = this.$getFallbackProvider(this.$config.supportedChainId)

          if (this.isActivated && this.chainId === this.$config.supportedChainId) {
            // fetch provider from user's wallet
            provider = this.signer
          }

          const punkInterface = new ethers.utils.Interface([
            'function getDomainData(string calldata _domainName) public view returns(string memory) ', // returns a stringified JSON object
          ])

          const punkContract = new ethers.Contract(this.$config.punkTldAddress, punkInterface, provider)

          try {
            const domainData = await punkContract.getDomainData(String(this.domainName).toLowerCase())

            if (domainData) {
              const domainDataJson = JSON.parse(domainData)

              if (domainDataJson?.image) {
                this.imgPath = domainDataJson.image
                if (this.imgPath) {
                  storeData(window, this.domainName, { image: domainDataJson.image }, "img")
                  return
                }
              }
            }
          } catch (error) {
            console.error('Error fetching domain data:', error)
          }
        }
      }

      // If none of the above, use default image
      return this.imgPath = this.defaultImage
    },
  },

  setup() {
    const { signer, chainId, isActivated } = useEthers()

    return {
      signer,
      chainId,
      isActivated,
    }
  },

  watch: {
    domain(oldValue, newValue) {
      if (oldValue != newValue) {
        this.fetchProfilePicture()
      }
    },

    image(oldValue, newValue) {
      if (oldValue != newValue) {
        this.imgPath = newValue

        if (newValue) {
          storeData(window, this.domainName, { image: newValue }, "img")
        }
      }
    },
  },
}
</script>
