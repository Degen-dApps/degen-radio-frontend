import axios from 'axios'
import { ethers } from 'ethers'
import { getWorkingUrl } from './ipfsUtils'

export async function fetchMusicNftData(window, provider, nftAddress, nftId, chainId) {
  const config = useRuntimeConfig()

  if (!window) {
    return { success: false, message: 'No window object' }
  }

  if (!nftAddress || !nftId || !chainId) {
    return { success: false, message: 'Invalid input' }
  }

  // check localStorage for cached audio data
  const key = String(nftAddress) + '-' + String(nftId) + '-' + String(chainId)
  const cachedData = window.localStorage.getItem(key)

  if (cachedData) {
    const nftData = JSON.parse(cachedData)

    if (nftData.audioUrl) {
      return { success: true, nftData: nftData }
    } else {
      const trackData = await fetchTrackDataFromApi(config.radio.apiBaseUrl, nftAddress, nftId, chainId)

      if (trackData) {
        return { success: true, nftData: trackData }
      }
    }
  } else {
    const trackData = await fetchTrackDataFromApi(config.radio.apiBaseUrl, nftAddress, nftId, chainId)

    if (trackData) {
      return { success: true, nftData: trackData }
    }
  }

  // if not found in localStorage, fetch fresh audio URL
  return await fetchFreshMusicNftData(window, provider, nftAddress, nftId, chainId)
}

export async function fetchFreshMusicNftData(window, provider, nftAddress, nftId, chainId) {

  if (!window) {
    return { success: false, message: 'No window object' }
  }

  if (!nftAddress || !nftId || !chainId) {
    return { success: false, message: 'Invalid input' }
  }

  const nftInterface = new ethers.utils.Interface([
    'function tokenURI(uint256 tokenId) external view returns (string)',
    'function metadataAddress() external view returns (address)',
    'function owner() external view returns (address)'
  ])

  const nftContract = new ethers.Contract(nftAddress, nftInterface, provider)

  let ownerAddress;

  try {
    ownerAddress = await nftContract.owner()
  } catch (e) {
    console.error(`Error fetching owner address for Music NFT contract ${trackAddress}:`, e)
  }

  let tokenUri

  try {
    tokenUri = await nftContract.tokenURI(Number(nftId))
  } catch (error) {
    // if error, get metadata address (then fetch metadata from getMetadata function in metadata contract)
    let metadataAddress

    try {
      metadataAddress = await nftContract.metadataAddress()
    } catch (error) {
      return { success: false, message: 'Error fetching track data' }
    }

    if (metadataAddress) {
      const mdInterface = new ethers.utils.Interface([
        'function getMetadata(address nftAddress_, uint256 tokenId_) external view returns (string memory)',
      ])

      const mdContract = new ethers.Contract(metadataAddress, mdInterface, provider)

      try {
        tokenUri = await mdContract.getMetadata(nftAddress, nftId)
      } catch (error) {
        return { success: false, message: 'Error fetching metadata' }
      }
    }
  }

  if (tokenUri) {
    let metadata

    if (tokenUri.startsWith('data:application/json;base64')) {
      metadata = JSON.parse(atob(tokenUri.split(',')[1]))
    } else if (tokenUri.startsWith('ipfs://') || tokenUri.startsWith('ar://')) {
      const validIpfsUrlData = await getWorkingUrl(tokenUri)
      const mdResult = await axios.get(validIpfsUrlData.validUrl)
      metadata = mdResult.data
    } else if (tokenUri.startsWith('http')) {
      const validIpfsUrlData = await getWorkingUrl(tokenUri)

      let nftUrl = tokenUri

      if (validIpfsUrlData.success) {
        nftUrl = validIpfsUrlData.validUrl
      }

      const mdResult = await axios.get(nftUrl)
      metadata = mdResult.data
    } else {
      // TODO: swarm, etc.
      return { success: false, message: 'Invalid token URI' }
    }

    let nftName = metadata.name

    if (Number(nftId) === 1) {
      nftName = nftName.replace(' #1', '')
    }

    const nftData = {
      id: `${nftAddress}-${nftId}-${chainId}`,
      name: nftName,
      address: nftAddress,
      tokenId: nftId,
      chainId: chainId,
    }

    if (ownerAddress) {
      nftData.authorAddress = ownerAddress
    }

    if (metadata?.image) {
      nftData.image = metadata.image
      const imageHttpData = await getWorkingUrl(metadata.image)

      if (metadata.image.startsWith('ar://')) {
        nftData.image = imageHttpData.validUrl
      }

      if (imageHttpData.success) {
        nftData.imageHttp = imageHttpData.validUrl
        nftData.imageFormat = imageHttpData.contentType
      }
    }

    if (metadata?.description) {
      nftData.description = metadata.description
    }

    if (metadata?.external_url) {
      nftData.externalUrl = metadata.external_url
    }

    if (metadata?.artist_name) {
      nftData.artistName = metadata.artist_name
      nftData.name = metadata.artist_name + ' - ' + nftData.name
    }

    // check if metadata has an audio_url field
    if (metadata?.audio_url) {
      let audioUrl = metadata.audio_url

      const audioUrlData = await getWorkingUrl(audioUrl)

      if (audioUrlData.success) {
        audioUrl = audioUrlData.validUrl
        nftData.format = audioUrlData.format
      }

      nftData.audioUrl = audioUrl

      storeNftAudioData(nftData, window)

      return { success: true, nftData: nftData }
    } else if (metadata?.animation_url) {
      let audioUrl = metadata.animation_url

      const audioUrlData = await getWorkingUrl(audioUrl)

      if (audioUrlData.success) {
        audioUrl = audioUrlData.validUrl
        nftData.format = audioUrlData.format
      }

      nftData.audioUrl = audioUrl

      storeNftAudioData(nftData, window)

      return { success: true, nftData: nftData }
    } else {
      return { success: false, message: 'No audio URL found in metadata' }
    }
  }
}

function storeNftAudioData(nftData, window) {
  // nftData: { name: '...', image: '(optional)', address: '...', tokenId: '...', chainId: '...', audioUrl: '...' }

  const key = String(nftData.address) + '-' + String(nftData.tokenId) + '-' + String(nftData.chainId)

  window.localStorage.setItem(key, JSON.stringify(nftData))
}

async function fetchTrackDataFromApi(apiBaseUrl, trackAddress, trackNftId, chainId) {
  try {
    // fetch track data from API and store it in local storage
    const apiUrl = apiBaseUrl + '/endpoints/track/' + chainId + '/' + trackAddress + '/' + trackNftId

    const response = await axios.get(apiUrl)

    if (response.status === 200) {
      const resData = response.data

      if (resData?.success) {
        const trackData = resData.track

        storeNftAudioData(trackData, window)

        return trackData
      }

      return null
    }
  } catch (error) {
    return null
  }
}