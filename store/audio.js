import { defineStore } from 'pinia'

export const useAudioStore = defineStore({
  id: 'audio',

  state: () => {
    return {
      currentTrackIndex: 0,
      queue: [], // audio objects, e.g. { name: '...', audioUrl: '...' }
    }
  },

  actions: {
    addToQueue(audio) {
      // TODO: prefetch the audio URL to see if it's valid or accessible
      this.queue.push(audio)
    },

    clearQueue() {
      this.queue = []
    },

    setCurrentTrackIndex(index) {
      this.currentTrackIndex = index
    },

    shuffleQueue() {
      this.queue = this.queue.sort(() => Math.random() - 0.5)
    }
  },
})
