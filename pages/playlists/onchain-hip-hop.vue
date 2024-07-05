<template>
  <Head>
    <Title>Onchain Hip Hop | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Onchain Hip Hop | ' + $config.projectMetadataTitle" />
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <PlaylistDetails playlistAddress="0x25ffe322625ae07e73895194F2e6AAf21257D85b" />
    </div>
  </div>
</template>

<script>
import PlaylistDetails from '~/components/radio/PlaylistDetails.vue'

export default {
  components: { PlaylistDetails },
}
</script>
