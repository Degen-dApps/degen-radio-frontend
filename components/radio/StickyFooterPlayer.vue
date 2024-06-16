<template>
<div class="footer-sticky-player">
  <AudioPlayer />
</div>
</template>

<script>
import AudioPlayer from '~/components/radio/AudioPlayer.vue';

export default {
  name: 'StickyFooterPlayer',

  components: {
    AudioPlayer,
  },
}
</script>
