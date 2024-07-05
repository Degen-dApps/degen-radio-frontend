<template>
  <div>
    <img @load="loading = false" :src="imageUrl" @error="handleLoadError" :alt="alt" :class="cls" />
    <div v-if="loading" class="d-flex justify-content-center">
      <span v-if="loading" class="spinner-grow spinner-grow-lg" role="status" aria-hidden="true"></span>
    </div>
  </div>
</template>

<script>
import { getWorkingIpfsGatewayUrl } from '~/utils/ipfsUtils'

export default {
  name: 'Image',
  props: ['alt', 'cls', 'url'],

  data() {
    return {
      cid: null,
      defaultImage: '/img/user/anon.svg',
      imageUrl: this.defaultImage,
      loading: true,
    }
  },

  mounted() {
    this.fetchImageData()
  },

  methods: {
    async fetchImageData() {
      const result = await getWorkingIpfsGatewayUrl(this.url)

      if (result.success) {
        this.imageUrl = result.validUrl
      } else {
        this.imageUrl = this.defaultImage
      }
    },

    handleLoadError() {
      this.imageUrl = this.defaultImage
    },
  },
}
</script>
