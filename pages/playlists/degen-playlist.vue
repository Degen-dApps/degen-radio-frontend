<template>
  <Head>
    <Title>Degen Playlist | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Degen Playlist | ' + $config.projectMetadataTitle" />
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <PlaylistDetails playlistAddress="0x0ecf4934EdC5e1A186f7D7ba46E882C795f6E223" />
    </div>
  </div>
</template>

<script>
import PlaylistDetails from '~/components/radio/PlaylistDetails.vue'

export default {
  components: { PlaylistDetails },
}
</script>
