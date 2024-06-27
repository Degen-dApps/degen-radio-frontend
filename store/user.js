import { defineStore } from 'pinia'
import { ethers } from 'ethers'

export const useUserStore = defineStore({
  id: 'user',

  state: () => {
    return {
      address: null,
      chatTokenBalanceWei: BigInt(0),
      defaultDomain: null,
      lpTokenBalanceWei: BigInt(0),
      stakeTokenBalanceWei: BigInt(0), // receipt token from the staking contract (aka governance token)
    }
  },

  getters: {
    getCurrentUserAddress(state) {
      return state.address
    },

    getChatTokenBalance(state) {
      const balance = ethers.utils.formatEther(state.chatTokenBalanceWei)

      const formatter = Intl.NumberFormat('en', { notation: 'compact' })

      return formatter.format(Number(balance))
    },

    getChatTokenBalanceWei(state) {
      return ethers.BigNumber.from(state.chatTokenBalanceWei)
    },

    getDefaultDomain(state) {
      return state.defaultDomain
    },

    getLpTokenBalanceWei(state) {
      return ethers.BigNumber.from(state.lpTokenBalanceWei)
    },

    getStakeTokenBalanceWei(state) {
      return ethers.BigNumber.from(state.stakeTokenBalanceWei)
    },
  },

  actions: {
    addToChatTokenBalanceWei(balance) {
      this.chatTokenBalanceWei += balance.toBigInt()
    },

    addToLpTokenBalanceWei(balance) {
      this.lpTokenBalanceWei += balance.toBigInt()
    },

    addToStakeTokenBalanceWei(balance) {
      this.stakeTokenBalanceWei += balance.toBigInt()
    },

    setChatTokenBalanceWei(balance) {
      this.chatTokenBalanceWei = balance.toBigInt()
    },

    setCurrentUserAddress(address) {
      this.address = address
    },

    setDefaultDomain(domain) {
      this.defaultDomain = domain
    },

    setLpTokenBalanceWei(balance) {
      this.lpTokenBalanceWei = balance.toBigInt()
    },

    setStakeTokenBalanceWei(balance) {
      this.stakeTokenBalanceWei = balance.toBigInt()
    },
  },
})
