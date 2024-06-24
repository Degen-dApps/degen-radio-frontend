<template>
  <Head>
    <Title>Top Hits | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Top Hits | ' + $config.projectMetadataTitle" />
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <PlaylistDetails playlistAddress="0x82541de0EdCf1B5046c74a5D9896A0D27701DF79" />
    </div>
  </div>
</template>

<script>
import PlaylistDetails from '~/components/radio/PlaylistDetails.vue'

export default {
  name: 'PlaylistMain',
  components: { PlaylistDetails },
}
</script>
