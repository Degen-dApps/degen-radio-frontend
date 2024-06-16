import { defineStore } from 'pinia'

export const useExampleStore = defineStore({
  id: 'example',

  state: () => {
    return {
      queue: [],
    }
  },

  getters: {
    getAudioQueue(state) {
      return state.queue
    }
  },

  actions: {
    addToQueue(audio) {
      this.queue.push(audio)
    }
  },
})
