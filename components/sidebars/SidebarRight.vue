<template>
  <div class="col-auto col-lg-3 px-0 mt-1">
    <div id="sidebar2" class="collapse collapse-horizontal" :class="{ show: sidebarStore.showRightSidebar }">
      <div id="sidebar-nav" class="list-group border-0 rounded-0 text-sm-start min-vh-100">

        <!-- Connect wallet / Switch Chain -->
        <div v-if="isMobile" class="card m-2 bg-light">
          <div class="card-body sidebar-card-body text-center mt-4">
            <ConnectWalletButton v-if="!isActivated" class="btn btn-primary" btnText="Connect wallet" />
            <SwitchChainButton v-if="isActivated && !isSupportedChain" />

            <div class="dropdown mt-2">
              <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Actions
              </button>
              <ul class="dropdown-menu">
                <li><button class="dropdown-item"  v-if="isActivated" @click="disconnect">Disconnect wallet</button></li>
                <li><button class="dropdown-item" @click="deleteBrowserStorage">Delete browser storage</button></li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Random playlist -->
        <RandomPlaylistOneWidget :isMobile="isMobile" @closeRightSidebar="closeRightSidebar" />

        <!-- Featured playlists -->
        <div class="card m-2 bg-light">
          <div class="card-header bg-light text-center">Featured Playlists</div>
          <div class="card-body sidebar-card-body">
            <p class="text-center">
              <NuxtLink to="/playlist?id=0xb5dd0F6dC1d41a60f09d8435141d549E4F671d6B">Top LOUDER Tracks</NuxtLink>
            </p>
            <p class="text-center">
              <NuxtLink to="/playlist?id=0x2c2d584832Fa3537b621FA93048252d3722147b3">Violetta Zironi's Songs</NuxtLink>
            </p>
            <p class="text-center">
              <NuxtLink to="/playlist?id=0xB7E60a6F04F0C15cb8E703882314C430cbcc0dd3">Official poidh playlist</NuxtLink>
            </p>
            <p class="text-center">
              <NuxtLink to="/playlist?id=0x3891A59A41b5BF2acBdb8BC4123Ef5D1374b84DB">Grimes AI</NuxtLink>
            </p>
            <p class="text-center">
              <NuxtLink to="/playlist?id=0xF2b68fbB5c7dDCa39Bdf4A74B1C5592c90A87348">Tempe's playlist</NuxtLink>
            </p>
          </div>
        </div>

        <!-- Mint/register a domain name -->
        <NameMintWidget />

        <!-- Referrals 
				<ReferralWidget />
				-->

        <!-- Swap tokens -->
        <SimpleSwapWidget
          v-if="$config.swapRouterAddress && $config.showFeatures.swap"
          :routerAddress="$config.swapRouterAddress"
          :tokens="tokens"
          title="Swap tokens"
        />

      </div>
    </div>
  </div>
</template>

<script>
import tokens from '~/assets/data/tokens.json'
import ConnectWalletButton from '~/components/ConnectWalletButton.vue'
import SwitchChainButton from '~/components/SwitchChainButton.vue'
import NameMintWidget from '~/components/names/NameMintWidget.vue'
import RandomPlaylistOneWidget from '~/components/radio/RandomPlaylistOneWidget.vue'
import ReferralWidget from '~/components/referrals/ReferralWidget.vue'
import SimpleSwapWidget from '~/components/swap/SimpleSwapWidget.vue'
import { useEthers } from '~/store/ethers'
import { useSidebarStore } from '~/store/sidebars'

export default {
  name: 'SidebarRight',
  props: ['rSidebar', 'isMobile'],

  components: {
    ConnectWalletButton,
    NameMintWidget,
    RandomPlaylistOneWidget,
    ReferralWidget,
    SimpleSwapWidget,
    SwitchChainButton,
  },

  computed: {
    isSupportedChain() {
      if (this.chainId === this.$config.supportedChainId) {
        return true
      } else {
        return false
      }
    },
  },

  methods: {
    closeRightSidebar() {
      if (this.isMobile) {
        //this.rSidebar.hide();
        this.sidebarStore.setRightSidebar(false)
        this.sidebarStore.setMainContent(true)
      }
    },

    deleteBrowserStorage() {
      window.localStorage.clear()
      window.sessionStorage.clear()
      window.location.reload()
    },
  },

  setup() {
    const { chainId, disconnect, isActivated } = useEthers()
    const sidebarStore = useSidebarStore()
    return { chainId, disconnect, isActivated, sidebarStore, tokens }
  },
}
</script>
