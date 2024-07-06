import { ethers } from 'ethers'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig() // access env vars like this: config.alchemyPolygonKey

  function getChainName(chainId) {
    let chain = chains.find(chain => chain.chainId == chainId)

    if (chain) {
      return chain.name
    }

    return 'Unsupported Network'
  }

  function getFallbackProvider(networkId) {
    let chain = chains.find(chain => chain.chainId == networkId)

    let urls = [chain.rpc1]

    if (urls) {
      const providers = urls.map(url => new ethers.providers.JsonRpcProvider(url))
      return new ethers.providers.FallbackProvider(providers, 1) // return fallback provider
    } else {
      return null
    }
  }

  function getProviderForChain(chainId) {
    let chain = chains.find(chain => chain.chainId == chainId)

    if (chain) {
      let provider = new ethers.providers.JsonRpcProvider(chain.rpc1)
      return provider
    }

    return null
  }

  function getRpcByChainId(chainId) {
    let chain = chains.find(chain => chain.chainId == chainId)
    return chain.rpc1
  }

  async function switchOrAddChain(ethereum, networkName) {
    // get network id from chains
    let chain = chains.find(chain => chain.name == networkName)
    let chainId = chain.chainId

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: ethers.utils.hexValue(chainId),
          },
        ],
      })
    } catch (error) {
      if (error.code === 4902) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: ethers.utils.hexValue(chainId),
              chainName: networkName,
              nativeCurrency: {
                name: chain.currency,
                symbol: chain.currency,
                decimals: 18,
              },
              rpcUrls: [chain.rpc2],
              blockExplorerUrls: [chain.blockExplorer],
            },
          ],
        })
      }
    }
  }

  return {
    provide: {
      getChainName: chainId => getChainName(chainId),
      getFallbackProvider: chainId => getFallbackProvider(chainId),
      getProviderForChain: chainId => getProviderForChain(chainId),
      getRpcByChainId: chainId => getRpcByChainId(chainId),
      switchOrAddChain: (ethereum, networkName) => switchOrAddChain(ethereum, networkName),
    },
  }
})

const chains = [
  {
    chainId: 666666666,
    name: 'Degen Chain',
    currency: 'DEGEN',
    rpc1: 'https://rpc.degen.tips',
    rpc2: 'https://rpc.degen.tips',
    blockExplorer: 'https://explorer.degen.tips',
  },
  {
    chainId: 10,
    name: 'Optimism',
    currency: 'ETH',
    rpc1: 'https://mainnet.optimism.io',
    rpc2: 'https://rpc.ankr.com/optimism',
    blockExplorer: 'https://optimistic.etherscan.io',
  },
  {
    chainId: 8453,
    name: 'Base',
    currency: 'ETH',
    rpc1: 'https://mainnet.base.org',
    rpc2: 'https://1rpc.io/base',
    blockExplorer: 'https://basescan.org',
  },
  {
    chainId: 42161,
    name: 'Arbitrum',
    currency: 'ETH',
    rpc1: 'https://arb1.arbitrum.io/rpc',
    rpc2: 'https://rpc.ankr.com/arbitrum',
    blockExplorer: 'https://arbiscan.io',
  },
  {
    chainId: 1,
    name: 'Ethereum',
    currency: 'ETH',
    rpc1: 'https://rpc.ankr.com/eth',
    rpc2: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
  },
  {
    chainId: 137,
    name: 'Polygon PoS Chain',
    currency: 'MATIC',
    rpc1: 'https://polygon-rpc.com',
    rpc2: 'https://rpc.ankr.com/polygon',
    blockExplorer: 'https://polygonscan.com',
  },
  {
    chainId: 11155111,
    name: 'Sepolia',
    currency: 'ETH',
    rpc1: 'https://rpc.sepolia.org',
    rpc2: 'https://1rpc.io/sepolia',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
]
