<template>
  <div class="col-auto col-lg-3 px-0 mt-1">
    <div id="sidebar2" class="collapse collapse-horizontal" :class="{ show: sidebarStore.showRightSidebar }">
      <div id="sidebar-nav" class="list-group border-0 rounded-0 text-sm-start min-vh-100">
        <!-- Mint/register a domain name 
        <NameMintWidget />
        -->

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
            <p>Random playlists to check out</p>
          </div>
        </div>

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
import { useSidebarStore } from '~/store/sidebars'
import MintedPostsWidget from '~/components/minted-posts/MintedPostsWidget.vue'
import NameMintWidget from '~/components/names/NameMintWidget.vue'
import SimpleSwapWidget from '~/components/swap/SimpleSwapWidget.vue'
import ReferralWidget from '~/components/referrals/ReferralWidget.vue'

export default {
  name: 'SidebarRight',
  props: ['rSidebar', 'isMobile'],

  components: {
    MintedPostsWidget,
    NameMintWidget,
    ReferralWidget,
    SimpleSwapWidget,
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
    const sidebarStore = useSidebarStore()
    return { sidebarStore, tokens }
  },
}
</script>
