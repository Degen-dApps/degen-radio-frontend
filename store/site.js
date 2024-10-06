import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

export const useSiteStore = defineStore({
  id: 'site',

  state: () => {
    return {
      arweaveBalance: 0,
      colorMode: 'dark',
      fileUploadEnabled: true,
      slippage: '0.5', // percentage (%)
      swapDeadline: '20', // minutes
    }
  },

  getters: {
    getArweaveBalance(state) {
      return state.arweaveBalance
    },

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
    setArweaveBalance(balance) {
      this.arweaveBalance = balance
    },

    setColorMode(cm) {
      this.colorMode = cm
      localStorage.setItem('colorMode', cm)
    },

    setFileUploadEnabled(enabled) {
      this.fileUploadEnabled = enabled
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
