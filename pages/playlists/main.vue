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
      <PlaylistDetails :playlistAddress="playlistAddress" :key="playlistAddress" />

      <!-- Comments section -->
      <h4 class="mt-4">Comments</h4>
      <ChatFeed
        :hideCommentBox="false"
        class="mt-3"
        :chatContext="$config.chat.contexts.playlistComments"
        :mainItemId="playlistAddress"
      />
    </div>
  </div>
</template>

<script>
import ChatFeed from '~/components/chat/ChatFeed.vue'
import PlaylistDetails from '~/components/radio/PlaylistDetails.vue'

export default {
  data() {
    return {
      playlistAddress: '0xed12d701B4E8D00fC5e06c03a6efFDf6135DE71D',
    }
  },
  components: { ChatFeed, PlaylistDetails },
}
</script>
