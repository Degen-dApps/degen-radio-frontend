<template>
  <Head>
    <Title>Playlist | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Playlist | ' + $config.projectMetadataTitle" />
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <p class="fs-3">
        <i class="bi bi-arrow-left-circle cursor-pointer" @click="$router.back()"></i>
      </p>

      <PlaylistDetails :playlistAddress="playlistAddress" />
    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers'
import PlaylistDetails from '~/components/radio/PlaylistDetails.vue'

export default {
  name: 'Playlist',
  components: { PlaylistDetails },

  computed: {
    playlistAddress() {
      if (ethers.utils.isAddress(this.$route.query.id)) {
        return this.$route.query.id
      } else {
        this.$router.push('/')
      }
    },
  },
}
</script>
