import { defineStore } from 'pinia'

export const useAudioStore = defineStore({
  id: 'audio',

  state: () => {
    return {
      queue: [],
    }
  },

  actions: {
    addToQueue(audio) {
      this.queue.push(audio)
    },

    clearQueue() {
      this.queue = []
    } 
  },
})
