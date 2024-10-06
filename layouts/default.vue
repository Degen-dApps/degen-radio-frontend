<template>
  <div>
    <Head>
      <Title>{{ $config.projectMetadataTitle }}</Title>
      <Meta name="description" :content="$config.projectDescription" />
      <Link rel="icon" type="image/x-icon" :href="$config.favicon" />

      <Meta property="og:title" :content="$config.projectMetadataTitle" />
      <Meta property="og:description" :content="$config.projectDescription" />
      <Meta property="og:image" :content="$config.projectUrl + $config.previewImage" />

      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:site" :content="$config.projectTwitter" />
      <Meta name="twitter:creator" :content="$config.projectTwitter" />
      <Meta name="twitter:title" :content="$config.projectMetadataTitle" />
      <Meta name="twitter:description" :content="$config.projectDescription" />
      <Meta name="twitter:image" :content="$config.projectUrl + $config.previewImage" />
    </Head>

    <NavbarDesktop v-if="!isMobile" />
    <NavbarMobile v-if="isMobile" :lSidebar="lSidebar" :rSidebar="rSidebar" />

    <!-- Main content with sidebars -->
    <div class="container-fluid page-container">
      <div class="row flex-nowrap">
        <SidebarLeft :lSidebar="lSidebar" :isMobile="isMobile" class="z-1" />

        <main class="col col-lg-4 ps-md-2 pt-2 main-containter" v-show="sidebarStore.showMainContent">
          <slot></slot>
        </main>

        <SidebarRight :rSidebar="rSidebar" :isMobile="isMobile" />
      </div>
    </div>

    <!-- Footer -->
    <Transition name="slide-up-down">
      <StickyFooterPlayer v-if="audioQueueLength > 0"  class="z-2" />
    </Transition>

    <!-- Connect Wallet modal -->
    <VueDappModal :dark="siteStore.getColorMode === 'dark'" auto-connect auto-connect-browser-wallet-if-solo />

    <ChatSettingsModal />

    <ChangeUsernameModal />

    <FindUserModal />

    <ReferralModal />
  </div>

  <!-- Do not delete: ugly hack to make "global" work with Vite -->
  <component :is="'script'"> var global = global || window; </component>
</template>

<script>
import '@vue-dapp/modal/dist/style.css'
import { BrowserWalletConnector, RdnsEnum } from '@vue-dapp/core'
import { VueDappModal } from '@vue-dapp/modal'
import { ethers } from 'ethers'
import ChatSettingsModal from '~/components/ChatSettingsModal.vue'
import ChangeUsernameModal from '~/components/names/ChangeUsernameModal.vue'
import NavbarDesktop from '~/components/navbars/NavbarDesktop.vue'
import NavbarMobile from '~/components/navbars/NavbarMobile.vue'
import StickyFooterPlayer from '~/components/radio/StickyFooterPlayer.vue'
import ReferralModal from '~/components/referrals/ReferralModal.vue'
import FindUserModal from '~/components/search/FindUserModal.vue'
import SidebarLeft from '~/components/sidebars/SidebarLeft.vue'
import SidebarRight from '~/components/sidebars/SidebarRight.vue'
import { useAudioStore } from '~/store/audio'
import { useEthers } from '~/store/ethers'
import { useSidebarStore } from '~/store/sidebars'
import { useSiteStore } from '~/store/site'
import { useUserStore } from '~/store/user'
import { getArweaveBalance } from '~/utils/balanceUtils'
import { getDomainHolder, getDomainName } from '~/utils/domainUtils'
import { fetchUserPlaylists } from '~/utils/playlistUtils'
import { storeReferrer, storeUsername } from '~/utils/storageUtils'

export default {
  data() {
    return {
      breakpoint: 1000,
      isMounted: false,
      lSidebar: null,
      referrer: null,
      rSidebar: null,
      width: null,
    }
  },

  components: {
    ChangeUsernameModal,
    ChatSettingsModal,
    FindUserModal,
    NavbarDesktop,
    NavbarMobile,
    ReferralModal,
    SidebarLeft,
    SidebarRight,
    StickyFooterPlayer,
    VueDappModal,
  },

  mounted() {
    this.isMounted = true

    // set color mode
    document.documentElement.setAttribute('data-bs-theme', this.siteStore.getColorMode)

    // set sidebar collapse
    this.lSidebar = new bootstrap.Collapse('#sidebar1', { toggle: false })
    this.rSidebar = new bootstrap.Collapse('#sidebar2', { toggle: false })
    this.width = window.innerWidth

    if (this.width < this.breakpoint) {
      this.sidebarStore.setLeftSidebar(false)
      this.sidebarStore.setRightSidebar(false)
      this.lSidebar.hide()
      this.rSidebar.hide()
    } else {
      this.lSidebar.show()
      //this.rSidebar.show();
      this.sidebarStore.setLeftSidebar(true)
      this.sidebarStore.setRightSidebar(true)
    }

    window.addEventListener('resize', this.onWidthChange)

    // connect to wallet if user was connected before
    if (!this.isActivated) {
      try {
        if (localStorage.getItem('connected') == 'metamask') {
          this.connectMetaMask()
        }
      } catch (error) {
        console.log('Error connecting to wallet:', error)
      }
    }

    // enable popovers everywhere
    new bootstrap.Popover(document.body, {
      selector: "[data-bs-toggle='popover']",
    })

    // fetch Arweave balance
    this.fetchArweaveBalance()

    // check if file upload is enabled
    this.siteStore.setFileUploadEnabled(this.$config.fileUploadEnabled)

    // check if referrer in the URL
    this.referrer = this.$route.query.ref
    if (this.referrer && this.isActivated) {
      this.parseReferrer()
    }
  },

  unmounted() {
    window.removeEventListener('resize', onWidthChange)
  },

  computed: {
    audioQueueLength() {
      return this.audioStore.queue.length
    },

    isMobile() {
      if (this.width < this.breakpoint) {
        return true
      }
      return false
    },
  },

  methods: {
    getDomainHolder,
    getDomainName, // imported function from utils/domainUtils.js

    async connectMetaMask() {
      await this.connectTo('BrowserWallet', {
        target: 'rdns',
        rdns: RdnsEnum.metamask,
      })
      localStorage.setItem('connected', 'metamask') // store in local storage to autoconnect next time
      document.getElementById('closeConnectModal').click()
    },

    async fetchArweaveBalance() {
      if (this.$config.arweaveAddress) {
        const balance = await getArweaveBalance(this.$config.arweaveAddress)
        //console.log('Arweave balance:', balance)

        this.siteStore.setArweaveBalance(balance)
      }
    },

    onWidthChange() {
      this.width = window.innerWidth
    },

    async parseReferrer() {
      // check if referrer is a domain name
      if (!this.referrer.startsWith('0x')) {
        let domainName = this.referrer

        if (this.referrer.includes(this.$config.tldName)) {
          // get the domain name without extension
          domainName = this.referrer.split('.')[0]
        }

        // fetch the domain holder address
        const provider = this.$getFallbackProvider(this.$config.supportedChainId)
        this.referrer = await this.getDomainHolder(domainName, provider)
      }

      if (this.address) {
        if (String(this.address).toLowerCase() === String(this.referrer).toLowerCase()) {
          return // cannot refer yourself
        }
      }

      // check if referrer is a valid address and not a zero address
      if (ethers.utils.isAddress(this.referrer) && this.referrer != ethers.constants.AddressZero) {
        // store into local storage as referrer
        storeReferrer(window, this.referrer)
      }
    },
  },

  setup() {
    const audioStore = useAudioStore()
    const sidebarStore = useSidebarStore()
    const siteStore = useSiteStore()
    const userStore = useUserStore()
    const {
      address,
      chainId,
      isActivated,
      signer,
      setWallet,
      resetWallet,
      addConnectors,
      connectTo,
      watchWalletChanged,
      watchDisconnect,
      watchAddressChanged,
      fetchBalance,
    } = useEthers()

    if (process.client) {
      addConnectors([new BrowserWalletConnector()])
    }

    const { $config } = useNuxtApp()

    watchWalletChanged(async wallet => {
      setWallet(wallet.provider)
      await fetchBalance()

      fetchUserDomain()
    })

    watchDisconnect(() => {
      resetWallet()

      // if user disconnects, clear the local storage
      console.log('user disconnected')
      localStorage.setItem('connected', '')
    })

    watchAddressChanged(() => {
      // if address changes, clear local & session storage?
    })

    async function fetchUserDomain() {
      if (chainId.value === $config.supportedChainId && address.value != userStore.getCurrentUserAddress) {
        userStore.setCurrentUserAddress(address.value)

        let userDomain

        if (signer.value) {
          userDomain = await getDomainName(address.value, signer.value)
        } else {
          userDomain = await getDomainName(address.value)
        }

        if (userDomain) {
          userStore.setDefaultDomain(userDomain + $config.tldName)
          storeUsername(window, address.value, userDomain + $config.tldName)
        } else {
          userStore.setDefaultDomain(null)
        }

        fetchChatTokenBalance()
      }
    }

    async function fetchChatTokenBalance() {
      if ($config.chatTokenAddress) {
        const chatTokenInterface = new ethers.utils.Interface([
          'function balanceOf(address owner) view returns (uint256)',
        ])

        const chatTokenContract = new ethers.Contract($config.chatTokenAddress, chatTokenInterface, signer.value)

        const balance = await chatTokenContract.balanceOf(address.value)

        userStore.setChatTokenBalanceWei(balance)
      }
    }

    return {
      address,
      audioStore,
      chainId,
      connectTo,
      isActivated,
      signer,
      sidebarStore,
      siteStore,
      userStore,
      fetchUserDomain,
      fetchChatTokenBalance,
    }
  },

  watch: {
    address(newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        let provider = this.$getFallbackProvider(this.$config.supportedChainId)
        fetchUserPlaylists(window, provider, this.address)
      }
    },

    width(newVal, oldVal) {
      if (newVal > this.breakpoint) {
        this.lSidebar.show()
        this.rSidebar.show()
        this.sidebarStore.setLeftSidebar(true)
        this.sidebarStore.setMainContent(true)
        this.sidebarStore.setRightSidebar(true)
      } else {
        this.lSidebar.hide()
        this.rSidebar.hide()
        this.sidebarStore.setLeftSidebar(false)
        this.sidebarStore.setMainContent(true)
        this.sidebarStore.setRightSidebar(false)
      }
    },
  },
}
</script>
