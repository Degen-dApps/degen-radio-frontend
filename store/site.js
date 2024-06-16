import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useSiteStore = defineStore({
  id: 'site',

  state: () => {
    return {
      colorMode: 'dark',
      fileUploadEnabled: true,
      showOnlyMasterPosts: useLocalStorage('showOnlyMasterPosts', 'false'),
      slippage: '0.5', // percentage (%)
      swapDeadline: '20', // minutes
    }
  },

  getters: {
    getColorMode(state) {
      const pStorage = useLocalStorage('colorMode', null)

      if (pStorage.value) {
        state.colorMode = pStorage.value
      }

      return state.colorMode
    },

    getFileUploadEnabled(state) {
      return state.fileUploadEnabled
    },

    getShowOnlyMasterPosts(state) {
      const pStorage = useLocalStorage('showOnlyMasterPosts', null)

      if (pStorage.value) {
        state.showOnlyMasterPosts = pStorage.value
      }

      return state.showOnlyMasterPosts
    },

    getSlippage(state) {
      const pStorage = useLocalStorage('swapSlippage', '0.5')

      if (pStorage.value) {
        state.slippage = pStorage.value
      }

      return state.slippage
    },

    getSwapDeadline(state) {
      const pStorage = useLocalStorage('swapDeadline', '20')

      if (pStorage.value) {
        state.swapDeadline = pStorage.value
      }

      return state.swapDeadline
    },
  },

  actions: {
    setColorMode(cm) {
      this.colorMode = cm
      localStorage.setItem('colorMode', cm)
    },

    setFileUploadEnabled(enabled) {
      this.fileUploadEnabled = enabled
    },

    setShowOnlyMasterPosts(somp) {
      this.showOnlyMasterPosts = somp
      localStorage.setItem('showOnlyMasterPosts', somp)
    },

    setSlippage(slippage) {
      this.slippage = slippage
      localStorage.setItem('swapSlippage', slippage)
    },

    setSwapDeadline(swapDeadline) {
      this.swapDeadline = swapDeadline
      localStorage.setItem('swapDeadline', swapDeadline)
    },
  },
})
