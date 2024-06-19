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

      <h3 class="mb-3 mt-3">Playlist</h3>

      <p v-if="$route.query.id" class="text-break mt-3">Playlist address: {{ $route.query.id }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Playlist',
}
</script>
