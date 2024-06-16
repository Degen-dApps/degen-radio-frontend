<template>
  <Head>
    <Title>Top Hits | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Top Hits | ' + $config.projectMetadataTitle" />
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <p class="fs-3">
        <i class="bi bi-arrow-left-circle cursor-pointer" @click="$router.back()"></i>
      </p>

      <h3 class="mb-3 mt-3">Top Hits</h3>

    </div>
  </div>
</template>

<script>
export default {
  name: 'PlaylistMain',
}
</script>
