import { defineStore } from 'pinia'

export const useAudioStore = defineStore({
  id: 'audio',

  state: () => {
    return {
      currentTrackIndex: 0,
      playTrigger: 1, // increment to trigger play
      queue: [], // audio objects, e.g. { name: '...', audioUrl: '...' }
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
    }
  },
})
