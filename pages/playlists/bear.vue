<template>
  <Head>
    <Title>Bear Market Playlist | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Bear Market Playlist | ' + $config.projectMetadataTitle" />
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <PlaylistDetails playlistAddress="0xbD079D834CF8d97470A23ee2C053Ec9225eeA395" />
    </div>
  </div>
</template>

<script>
import PlaylistDetails from '~/components/radio/PlaylistDetails.vue'

export default {
  name: 'PlaylistBear',
  components: { PlaylistDetails },
}
</script>
