<template>
  <Head>
    <Title>{{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="$config.projectMetadataTitle" />
    <Meta name="description" :content="$config.projectDescription" />
    <Meta property="og:image" :content="$config.projectUrl + $config.previewImage" />
    <Meta property="og:description" :content="$config.projectDescription" />

    <!-- Frame 
    <Meta property="fc:frame" content="vNext" />
    <Meta property="fc:frame:image" :content="$config.projectUrl + $config.previewImage" />
    <Meta name="fc:frame:button:1:target" :content="$config.projectUrl" />
    <Meta name="fc:frame:button:1:action" content="link" />
    <Meta name="fc:frame:button:1" :content="$config.projectMetadataTitle" />
    -->
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <PlaylistDetails playlistAddress="0xed12d701B4E8D00fC5e06c03a6efFDf6135DE71D" />
    </div>
  </div>
</template>

<script>
import PlaylistDetails from '~/components/radio/PlaylistDetails.vue'

export default {
  components: { PlaylistDetails },
}
</script>
