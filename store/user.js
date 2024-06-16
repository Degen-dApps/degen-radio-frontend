import { defineStore } from 'pinia'
import { ethers } from 'ethers'

export const useUserStore = defineStore({
  id: 'user',

  state: () => {
    return {
      address: null,
      chatTokenBalanceWei: BigInt(0),
      defaultDomain: null,
      did: null,
      didParent: null,
      followers: 0,
      following: 0,
      isConnectedToOrbis: false,
      lastActivityTimestamp: null,
      lpTokenBalanceWei: BigInt(0),
      orbisImage: null,
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

    getDid(state) {
      return state.did
    },

    getDidParent(state) {
      return state.didParent
    },

    getFollowers(state) {
      return state.followers
    },

    getFollowing(state) {
      return state.following
    },

    getIsConnectedToOrbis(state) {
      return state.isConnectedToOrbis
    },

    getLastActivityTimestamp(state) {
      return state.lastActivityTimestamp
    },

    getLpTokenBalanceWei(state) {
      return ethers.BigNumber.from(state.lpTokenBalanceWei)
    },

    getOrbisImage(state) {
      return state.orbisImage
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

    setDid(did) {
      this.did = did
    },

    setDidParent(didParent) {
      this.didParent = didParent
    },

    setFollowers(followers) {
      this.followers = followers
    },

    setFollowing(following) {
      this.following = following
    },

    setIsConnectedToOrbis(isConnected) {
      this.isConnectedToOrbis = isConnected
    },

    setLastActivityTimestamp(timestamp) {
      this.lastActivityTimestamp = timestamp
    },

    setLpTokenBalanceWei(balance) {
      this.lpTokenBalanceWei = balance.toBigInt()
    },

    setOrbisImage(image) {
      this.orbisImage = image
    },

    setStakeTokenBalanceWei(balance) {
      this.stakeTokenBalanceWei = balance.toBigInt()
    },
  },
})
