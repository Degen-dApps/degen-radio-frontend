<template>
  <Head>
    <Title>Onchain Hip Hop | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Onchain Hip Hop | ' + $config.projectMetadataTitle" />
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
      playlistAddress: '0x25ffe322625ae07e73895194F2e6AAf21257D85b',
    }
  },
  components: { ChatFeed, PlaylistDetails },
}
</script>
