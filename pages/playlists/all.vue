<template>
  <Head>
    <Title>All Playlists | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'All Playlists | ' + $config.projectMetadataTitle" />
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <ListAllPlaylists />
    </div>
  </div>
</template>

<script>
import ListAllPlaylists from '~/components/radio/ListAllPlaylists.vue'

export default {
  components: { ListAllPlaylists },
}
</script>
