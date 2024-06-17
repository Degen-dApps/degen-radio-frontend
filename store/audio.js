import { defineStore } from 'pinia'

export const useAudioStore = defineStore({
  id: 'audio',

  state: () => {
    return {
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

    shuffleQueue() {
      this.queue = this.queue.sort(() => Math.random() - 0.5)
    }
  },
})
