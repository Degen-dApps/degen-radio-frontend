<template>
  <div class="col-auto col-lg-3 px-0 mt-1">
    <div id="sidebar2" class="collapse collapse-horizontal" :class="{ show: sidebarStore.showRightSidebar }">
      <div id="sidebar-nav" class="list-group border-0 rounded-0 text-sm-start min-vh-100">

        <!-- Connect wallet / Switch Chain -->
        <div v-if="isMobile" class="card m-2 bg-light">
          <div class="card-body sidebar-card-body text-center mt-4">
            <ConnectWalletButton v-if="!isActivated" class="btn btn-primary" btnText="Connect wallet" />
            <SwitchChainButton v-if="isActivated && !isSupportedChain" />

            <div class="dropdown" v-if="isActivated && isSupportedChain">
              <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Actions
              </button>
              <ul class="dropdown-menu">
                <li><button class="dropdown-item" @click="disconnect">Disconnect wallet</button></li>
                <li><button class="dropdown-item">Delete local storage</button></li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Random playlist -->
        <RandomPlaylistOneWidget />

        <!-- Featured playlists 
        <div class="card m-2 bg-light">
          <div class="card-header bg-light text-center">Featured Playlists</div>
          <div class="card-body sidebar-card-body">
            <p class="text-center">
              <NuxtLink to="/playlist?id=0x0Dd272d469fB118f26Db72563f501Bb522AC2A95">Happy Songs</NuxtLink> by 
              <NuxtLink to="/profile?id=techie.sepolia">techie.sepolia</NuxtLink>
            </p>
          </div>
        </div>
        -->

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
  },

  setup() {
    const { chainId, disconnect, isActivated } = useEthers()
    const sidebarStore = useSidebarStore()
    return { chainId, disconnect, isActivated, sidebarStore, tokens }
  },
}
</script>
