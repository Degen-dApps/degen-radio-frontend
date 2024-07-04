import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          charset: 'utf-8',
        },
      ],
      link: [
        {
          // Bootstrap
          rel: 'stylesheet',
          href: '	https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
        },
        {
          // Bootstrap icons
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css',
        },
        {
          // Custom
          rel: 'stylesheet',
          href: '/css/custom.css',
        },
      ],
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
        },
      ],
    },
  },
  components: false,
  css: ['vue-toastification/dist/index.css'],
  modules: ['@pinia/nuxt', '@vueuse/nuxt'],
  router: {
    options: {
      hashMode: false,
    },
  },
  runtimeConfig: {
    public: {
      airdropApAddress: '', // chat token claim for APs
      airdropClaimDomainsAddress: '', // chat token claim for domain holders
      blockExplorerBaseUrl: 'https://explorer.degen.tips',
      chatTokenAddress: '', // chat token address
      chatTokenImage: '', // chat token image
      chatTokenSymbol: '', // chat token symbol or name
      domainRequiredToPost: true,
      expiryCollections: 1000 * 60 * 60 * 24 * 10, // must be in milliseconds (0 means no expiration)
      expiryPfps: 1000 * 60 * 60 * 24 * 10, // must be in milliseconds (0 means no expiration)
      expiryPlaylists: 1000 * 60 * 60 * 24 * 10, // must be in milliseconds (0 means no expiration)
      expiryUsernames: 1000 * 60 * 60 * 24 * 10, // must be in milliseconds (0 means no expiration)
      favicon: '/img/logo.svg',
      fileUploadEnabled: true, // enable/disable file uploads (enable only if external file storage is used, e.g. IPFS via ThirdWeb)
      fileUploadSizeLimit: 1 * 1024 * 1024, // max file upload size in bytes (1 * 1024 * 1024 = 1 MB)
      fileUploadTokenService: process.env.FILE_UPLOAD_SERVICE || 'netlify', // "netlify" or "vercel" (or leave empty for no file uploads)
      governanceUrl: 'https://warpcast.com/~/channel/degen', // governance url (snapshot, Tally, etc.)
      iggyPostAddress: '0x0BF6333Fc85159663A30Ac89FD02c5031B97c5ee',
      iggyPostMinterAddress: '0xc486B08Ed47fFe5c1b4b1A2ff5c671EA0083D9bA',
      iggyPostStatsAddress: '0x3Fa0EaC3058828Cc4BA97F51A33597C695bF6F9e',
      imagekitEndpoint: process.env.IMAGEKIT_ENDPOINT,
      imagekitPublicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      ipfsGateway: 'https://ipfs.io/ipfs/',
      ipfsGateway2: 'https://nftdegeniggy.myfilebase.com/ipfs/',
      ipfsGateway3: 'https://cloudflare-ipfs.com/ipfs/',
      linkPreviews: process.env.LINK_PREVIEW_SERVICE || 'netlify', // "netlify", "vercel", or "microlink" (or leave empty for no link previews)
      lpTokenAddress: '', // liquidity pool token (token to stake in the staking contract)
      lpTokenSymbol: 'LP tokens', // LP token symbol
      marketplacePostNftUrl: 'https://explorer.degen.tips/token/0x99Dbf11aCd46baFBCE82506FaeB4F13E6Ea1726A',
      marketplacePostNftItemUrl:
        'https://explorer.degen.tips/token/0x99Dbf11aCd46baFBCE82506FaeB4F13E6Ea1726A/instance/', // url (append nft id to it)
      previewImage: '/img/covers/cover.png',
      previewImageAirdrop: '/img/covers/cover.png',
      previewImagePost: '/img/covers/cover.png',
      previewImagePostNft: '/img/covers/cover.png',
      previewImageProfile: '/img/covers/cover.png',
      previewImageStake: '/img/covers/cover.png',
      profileMintedPostIdsMax: 36, // max number of minted post ids to show in the profile page
      projectMetadataTitle: 'Degen Radio | Listen to your favorite Music NFTs!',
      projectName: 'Degen Radio',
      projectDescription: 'Stream Music NFTs & Create Your Own Playlists',
      projectTwitter: 'https://twitter.com/iggysocial',
      projectUrl: 'https://degenradio.lol', // without trailing slash!
      punkMinterAddress: '0x1f8cf0bc042308677838fB50f264992A4e783610', // punk domain minter contract address
      punkNumberOfPrices: 5, // number of different prices (based on domain length), usually 1 (price()) or 5 (price1char() - price5char())
      punkTldAddress: '0x4087fb91A1fBdef05761C02714335D232a2Bf3a1', // punk domain TLD address
      radio: {
        apiBaseUrl: 'https://api.degenradio.lol',
        loadTrackLimit: 10, // number of tracks to load initially and later via the "Load more" button
        maxTracks: 20, // max number of tracks in a playlist
        metadataAddress: '0x7aE45ae751278EBF5E452321ab3f50849492F6E6',
        playlistFactoryAddress: '0xEbcA849484aEAd9458990772e475AD34A1eADA95',
        playlistNftAddress: '0x4aC7FD98CF859cAc9Bd4b9c4E8b3974cA5933dE6',
      },
      randomPostsNumber: 1, // number of random post NFTs to show in the sidebar widget
      showFeatures: {
        // show/hide features in sidebars (if you have too many "true", make the sidebar scrollable --> sidebarLeftSticky: false)
        airdrop: true,
        governance: false,
        randomMintedPosts: false,
        swap: true,
        stake: false,
        sendTokens: false,
      },
      showRepliesOnHomepage: true, // show replies on the homepage
      sidebarLeftSticky: true, // make the left sidebar sticky (always visible)
      stakingContractAddress: '', // this is also the stake/gov token address
      stakeTokenSymbol: 'TBD', // stake token symbol (governance token symbol)
      supportedChainId: 666666666,
      swapPriceImpactMaxBps: 1000, // max price impact in bips (1 bps = 0.01%, 1000bps = 10%) for the swap function
      swapRouterAddress: '', // iggy swap router contract address
      tenorApiKey: process.env.TENOR_KEY || '',
      thirdwebClientId: process.env.THIRDWEB_CLIENT_ID || '',
      tldName: '.degen',
      tokenAddress: null, // leave null if it's a native token of the chain
      tokenDecimals: 18,
      tokenSymbol: 'DEGEN',
    },
  },
  vite: {
    build: {
      target: ['es2020'], // fix big integer literals error
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis', // fix nuxt3 global
        },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true, // fix nuxt3 process
            buffer: true,
          }),
          NodeModulesPolyfillPlugin(),
        ],
        target: 'es2020', // fix big integer literals error
      },
    },
  },
})
