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
      this.queue.push(audio)
    },

    async addToQueueAtIndex(audio, index) {
      let newQueue = this.queue.length === 0 ? true : false;

      this.queue.splice(index, 0, audio)
      this.currentTrackIndex = index

      if (newQueue) {
        // pause so that the audio player can be rendered
        await new Promise(resolve => setTimeout(resolve, 500)); // pause
      }

      this.playTrigger++
    },

    clearQueue() {
      this.queue = []
      this.currentTrackIndex = 0
      this.currentPlaylistAddress = null
    },

    async playNewPlaylist(queue, playlistAddress) {
      let newQueue = this.queue.length === 0 ? true : false;

      this.queue = queue
      this.currentTrackIndex = 0
      this.currentPlaylistAddress = playlistAddress

      if (newQueue) {
        // pause so that the audio player can be rendered
        await new Promise(resolve => setTimeout(resolve, 500)); // pause
      }
      
      this.playTrigger++
    },

    async playNow(audio) {
      let index = this.queue.findIndex(item => item.id === audio.id)

      if (index === -1) {
        let newQueue = this.queue.length === 0 ? true : false;

        this.queue.push(audio)
        this.currentTrackIndex = this.queue.length - 1

        if (newQueue) {
          // pause so that the audio player can be rendered
          await new Promise(resolve => setTimeout(resolve, 500)); // pause
        }

        this.playTrigger++
      } else {
        this.currentTrackIndex = index
        this.playTrigger++
      }
    },

    removeLastTrack() {
      this.queue.pop()
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
