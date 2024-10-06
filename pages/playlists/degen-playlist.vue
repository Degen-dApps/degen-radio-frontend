<template>
  <Head>
    <Title>Degen Playlist | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Degen Playlist | ' + $config.projectMetadataTitle" />
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
      playlistAddress: '0x0ecf4934EdC5e1A186f7D7ba46E882C795f6E223',
    }
  },
  components: { ChatFeed, PlaylistDetails },
}
</script>
