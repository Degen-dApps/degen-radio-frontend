<template>
  <Head>
    <Title>Bear Market Playlist | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Bear Market Playlist | ' + $config.projectMetadataTitle" />
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
      playlistAddress: '0xbD079D834CF8d97470A23ee2C053Ec9225eeA395',
    }
  },
  components: { ChatFeed, PlaylistDetails },
}
</script>
