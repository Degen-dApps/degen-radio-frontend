<template>
  <div class="col col-lg-auto px-0 mt-1">
    <div id="sidebar1" class="collapse collapse-horizontal" :class="$config.sidebarLeftSticky ? 'sticky-lg-top' : ''">
      <div class="sidebar-nav list-group border-0 rounded-0 text-sm-start min-vh-100">
        <div class="card m-2 p-2 bg-light">
          <div v-if="isActivated" class="text-center">
            <!-- Profile image 
            <NuxtLink to="/profile">
              <ProfileImage
                :key="userStore.getOrbisImage"
                @click="closeLeftSidebar"
                class="img-fluid mt-3 rounded-circle w-30 sidebar-profile-image"
                :address="address"
                :domain="userStore.getDefaultDomain"
                :image="userStore.getOrbisImage"
              />
            </NuxtLink>

            <h6 class="mt-3" v-if="userStore.getDefaultDomain">
              {{ getTextWithoutBlankCharacters(userStore.getDefaultDomain) }}
            </h6>

            <hr />
            -->

            <!-- Chat tokens -->
            <!--
						<button v-if="userStore.getChatTokenBalanceWei > 0 && $config.chatTokenAddress" class="btn btn-outline-primary btn-sm mt-2 mb-2 disabled">
							{{ userStore.getChatTokenBalance }} {{ $config.chatTokenSymbol }}
						</button>
						-->
          </div>

          <ul class="nav nav-pills flex-column">
            <ul class="list-group">
              <NuxtLink
                to="/playlists/main"
                class="list-group-item cursor-pointer hover-color bg-light border-0"
                :class="$route.path === '/playlists/main' ? 'active' : ''"
                @click="closeLeftSidebar"
              >
                Top Hits
              </NuxtLink>
            </ul>

            <hr />

            <!-- Home 
						<li class="nav-item p-1" @click="closeLeftSidebar">
							<NuxtLink class="nav-link" :class="$route.path === '/' ? 'active' : ''" aria-current="page" to="/">
								<i class="bi bi-house me-1"></i> Home
							</NuxtLink>
						</li>
						-->

            <!-- Create Playlist -->
            <li class="nav-item p-1" @click="closeLeftSidebar">
              <NuxtLink
                class="nav-link"
                :class="$route.path === '/playlists/create' ? 'active' : ''"
                aria-current="page"
                to="/playlists/create"
              >
                <i class="bi bi-music-note-list me-1"></i> Create Playlist
              </NuxtLink>
            </li>

            <!-- Profile -->
            <li v-if="isActivated" class="nav-item p-1" @click="closeLeftSidebar">
              <NuxtLink
                class="nav-link"
                :class="$route.path.startsWith('/profile') ? 'active' : ''"
                aria-current="page"
                to="/profile"
              >
                <i class="bi bi-person me-1"></i> Profile
              </NuxtLink>
            </li>

            <!-- Send tokens -->
            <li class="nav-item p-1" @click="closeLeftSidebar" v-if="$config.showFeatures.sendTokens">
              <NuxtLink
                class="nav-link"
                :class="$route.path.startsWith('/send-tokens') ? 'active' : ''"
                aria-current="page"
                to="/send-tokens"
              >
                <i class="bi bi-send me-1"></i> Send Tokens
              </NuxtLink>
            </li>

            <!-- Stake & Earn -->
            <li
              class="nav-item p-1"
              @click="closeLeftSidebar"
              v-if="$config.stakingContractAddress && $config.showFeatures.stake"
            >
              <NuxtLink
                class="nav-link"
                :class="$route.path.startsWith('/stake') ? 'active' : ''"
                aria-current="page"
                to="/stake"
              >
                <i class="bi bi-cash-stack me-1"></i> Stake & Earn
              </NuxtLink>
            </li>

            <!-- Swap -->
            <li
              class="nav-item p-1"
              @click="closeLeftSidebar"
              v-if="$config.swapRouterAddress && $config.showFeatures.swap"
            >
              <NuxtLink
                class="nav-link"
                :class="$route.path.startsWith('/swap') ? 'active' : ''"
                aria-current="page"
                to="/swap"
              >
                <i class="bi bi-arrow-down-up me-1"></i> Swap
              </NuxtLink>
            </li>

            <!-- Airdrop -->
            <li
              class="nav-item p-1"
              @click="closeLeftSidebar"
              v-if="($config.airdropClaimDomainsAddress || $config.airdropApAddress) && $config.showFeatures.airdrop"
            >
              <NuxtLink
                class="nav-link"
                :class="$route.path.startsWith('/airdrop') ? 'active' : ''"
                aria-current="page"
                to="/airdrop"
              >
                <i class="bi bi-gift me-1"></i> Airdrop
              </NuxtLink>
            </li>

            <!-- Governance -->
            <li class="nav-item p-1" v-if="$config.showFeatures.governance" @click="closeLeftSidebar">
              <a class="nav-link" :href="$config.governanceUrl" target="_blank">
                <i class="bi bi-box2 me-1"></i> Governance
                <small><i class="bi bi-box-arrow-up-right ms-1"></i></small>
              </a>
            </li>

            <!-- Find User -->
            <li class="nav-item p-1" @click="closeLeftSidebar">
              <NuxtLink
                class="nav-link"
                :class="$route.path.startsWith('/find-user') ? 'active' : ''"
                aria-current="page"
                to="/find-user"
              >
                <i class="bi bi-binoculars me-1"></i> Find User
              </NuxtLink>
            </li>

            <!-- About -->
            <li class="nav-item p-1" @click="closeLeftSidebar">
              <NuxtLink
                class="nav-link"
                :class="$route.path.startsWith('/about') ? 'active' : ''"
                aria-current="page"
                to="/about"
              >
                <i class="bi bi-patch-question me-1"></i> About
              </NuxtLink>
            </li>

            <!-- More 
          <li class="nav-item p-1 dropdown">
            <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">
              <i class="bi bi-three-dots me-1"></i> More
            </a>

            <ul class="dropdown-menu">

              <li class="pt-1 pb-1" @click="closeLeftSidebar" v-if="$config.airdropClaimDomainsAddress || $config.airdropApAddress">
                <NuxtLink class="dropdown-item" :class="$route.path.startsWith('/airdrop') ? 'active' : ''" aria-current="page" to="/airdrop">
                  <i class="bi bi-gift me-1"></i> Airdrop
                </NuxtLink>
              </li>

              <li class="pt-1 pb-1" @click="closeLeftSidebar">
                <NuxtLink class="dropdown-item" :class="$route.path.startsWith('/profile') ? 'active' : ''" aria-current="page" to="/profile">
                  <i class="bi bi-person me-1"></i> Profile
                </NuxtLink>
              </li>

              <li class="pt-1 pb-1" @click="closeLeftSidebar">
                <a class="dropdown-item" href="https://snapshot.org/#/sgbchat.eth" target="_blank">
                  <i class="bi bi-box2 me-1"></i> Governance <small><i class="bi bi-box-arrow-up-right ms-1"></i></small>
                </a>
              </li>

              <li class="pt-1 pb-1" @click="closeLeftSidebar">
                <NuxtLink class="dropdown-item" :class="$route.path.startsWith('/about') ? 'active' : ''" aria-current="page" to="/about">
                  <i class="bi bi-patch-question me-1"></i> About
                </NuxtLink>
              </li>

            </ul>
          </li>
          --></ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useEthers } from '~/store/ethers'
import { useToast } from 'vue-toastification/dist/index.mjs'
import { useSidebarStore } from '~/store/sidebars'
import { useUserStore } from '~/store/user'
import ProfileImage from '~/components/profile/ProfileImage.vue'
import { getTextWithoutBlankCharacters } from '~/utils/textUtils'

export default {
  name: 'SidebarLeft',
  props: ['lSidebar', 'isMobile'],

  components: {
    ProfileImage,
  },

  methods: {
    closeLeftSidebar() {
      if (this.isMobile) {
        this.lSidebar.hide()
        this.sidebarStore.setLeftSidebar(false)
        this.sidebarStore.setMainContent(true)
      }
    },
  },

  setup() {
    const { address, isActivated } = useEthers()

    const toast = useToast()

    const sidebarStore = useSidebarStore()
    const userStore = useUserStore()

    return { address, isActivated, sidebarStore, toast, userStore }
  },
}
</script>
