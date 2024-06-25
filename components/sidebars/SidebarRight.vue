<template>
  <div class="col-auto col-lg-3 px-0 mt-1">
    <div id="sidebar2" class="collapse collapse-horizontal" :class="{ show: sidebarStore.showRightSidebar }">
      <div id="sidebar-nav" class="list-group border-0 rounded-0 text-sm-start min-vh-100">

        <!-- Connect wallet / Switch Chain -->
        <div v-if="isMobile" class="card m-2 bg-light">
          <div class="card-body sidebar-card-body text-center mt-4">
            <ConnectWalletButton v-if="!isActivated" class="btn btn-primary" btnText="Connect wallet" />
            <SwitchChainButton v-if="isActivated && !isSupportedChain" />
          </div>
        </div>

        <!-- Random track -->
        <div class="card m-2 bg-light">
          <div class="card-header bg-light">Random Song</div>
          <div class="card-body sidebar-card-body">
            <p>Random song</p>
          </div>
        </div>

        <!-- Random playlists -->
        <div class="card m-2 bg-light">
          <div class="card-header bg-light">5 Random Playlists</div>
          <div class="card-body sidebar-card-body">
            <p>Random playlists to check out:</p>

            <li>
              <NuxtLink to="/playlist?id=0x0Dd272d469fB118f26Db72563f501Bb522AC2A95">Happy Songs</NuxtLink>
            </li>
          </div>
        </div>

        <!-- Mint/register a domain name 
        <NameMintWidget />
        -->

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

        <!-- Random minted post(s) -->
        <MintedPostsWidget v-if="$config.showFeatures.randomMintedPosts" @closeRightSidebar="closeRightSidebar" />
      </div>
    </div>
  </div>
</template>

<script>
import tokens from '~/assets/data/tokens.json'
import ConnectWalletButton from '~/components/ConnectWalletButton.vue'
import SwitchChainButton from '~/components/SwitchChainButton.vue'
import MintedPostsWidget from '~/components/minted-posts/MintedPostsWidget.vue'
import NameMintWidget from '~/components/names/NameMintWidget.vue'
import ReferralWidget from '~/components/referrals/ReferralWidget.vue'
import SimpleSwapWidget from '~/components/swap/SimpleSwapWidget.vue'
import { useEthers } from '~/store/ethers'
import { useSidebarStore } from '~/store/sidebars'

export default {
  name: 'SidebarRight',
  props: ['rSidebar', 'isMobile'],

  components: {
    ConnectWalletButton,
    MintedPostsWidget,
    NameMintWidget,
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
    const { chainId, isActivated } = useEthers()
    const sidebarStore = useSidebarStore()
    return { chainId, isActivated, sidebarStore, tokens }
  },
}
</script>
