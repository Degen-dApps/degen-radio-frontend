import { defineStore } from 'pinia'

export const useAudioStore = defineStore({
  id: 'audio',

  state: () => {
    return {
      currentPlaylistAddress: null,
      currentTrackIndex: 0,
      playTrigger: 1, // increment to trigger play
      stopTrigger: 1, // increment to trigger stop playing
      queue: [], // audio objects, e.g. { name: '...', audioUrl: '...', format: '...' }
    }
  },

  actions: {
    addToQueue(audio) {
      // TODO: prefetch the audio URL to see if it's valid or accessible
      this.queue.push(audio)
    },

    addToQueueAtIndex(audio, index) {
      this.queue.splice(index, 0, audio)
      this.currentTrackIndex = index
      this.playTrigger++
    },

    clearQueue() {
      this.queue = []
      this.currentTrackIndex = 0
      this.currentPlaylistAddress = null
    },

    async playNewPlaylist(queue, playlistAddress) {
      this.queue = queue
      this.currentTrackIndex = 0
      this.currentPlaylistAddress = playlistAddress
      // pause so that the audio player can be rendered
      await new Promise(resolve => setTimeout(resolve, 500)); // pause
      this.playTrigger++
    },

    playNow(audio) {
      this.queue.push(audio)
      this.currentTrackIndex = this.queue.length - 1
      this.playTrigger++
    },

    setCurrentTrackIndex(index) {
      this.currentTrackIndex = index
    },

    shuffleQueue() {
      this.queue = this.queue.sort(() => Math.random() - 0.5)
    },

    stopPlaying() {
      this.stopTrigger++
    },
  },
})
