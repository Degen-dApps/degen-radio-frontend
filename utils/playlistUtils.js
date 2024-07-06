import axios from 'axios'
import { ethers } from 'ethers'
import { fetchPlaylistData, fetchPlaylistNftId, storeData, storePlaylistData, storePlaylistNftId } from './storageUtils'
import { getWorkingIpfsGatewayUrl } from './ipfsUtils'

export async function fetchPlaylistDataFromBlockchain(window, provider, playlistAddress, playlistNftId) {
  let nftId = Number(playlistNftId)

  if (!nftId && playlistAddress) {
    nftId = fetchPlaylistNftId(window, playlistAddress)
  }

  const config = useRuntimeConfig()
  
  const playlistNftInterface = new ethers.utils.Interface([
    'function getPlaylistAddress(uint256 tokenId_) external view returns (address)',
    'function tokenURI(uint256 tokenId_) public view returns (string memory)',
  ])

  const playlistNftContract = new ethers.Contract(config.radio.playlistNftAddress, playlistNftInterface, provider)

  if (!playlistAddress && nftId) {
    playlistAddress = await playlistNftContract.getPlaylistAddress(nftId)
  }

  if (!nftId) {
    const playlistInterface = new ethers.utils.Interface(['function playlistId() view returns (uint256)'])

    const playlistContract = new ethers.Contract(playlistAddress, playlistInterface, provider)

    try {
      nftId = await playlistContract.playlistId()
      storePlaylistNftId(window, playlistAddress, nftId)
    } catch (error) {
      console.error(`Error fetching playlist ID for ${playlistAddress}`)
      return { success: false, message: 'Error fetching playlist ID' }
    }
  }

  if (!nftId) {
    return { success: false, message: 'No playlist NFT ID' }
  }

  let tokenUri

  try {
    tokenUri = await playlistNftContract.tokenURI(nftId)

    let metadata

    // parse token URI to get playlist data, and store relevant data in playlistObject
    if (String(tokenUri).startsWith('data:application/json;base64')) {
      metadata = JSON.parse(atob(tokenUri.split(',')[1]))
    } else {
      let mdServerUrl = tokenUri

      // check if token URI is an IPFS link (getWorkingIpfsGatewayUrl)
      const res = await getWorkingIpfsGatewayUrl(tokenUri)
      if (res.success) {
        mdServerUrl = res.validUrl
      }

      const mdResult = await axios.get(mdServerUrl)
      metadata = mdResult.data
    }

    // store metadata in playlistObject
    const playlistObject = {
      playlistAddress: playlistAddress,
      playlistNftId: Number(nftId),
      externalUrl: metadata?.external_url || '',
      ...metadata,
    }

    const resFromStore = storePlaylistData(window, playlistAddress, nftId, playlistObject)

    return resFromStore
  } catch (error) {
    return { success: false, message: 'Error fetching playlist data' }
  }
}

export async function fetchUserPlaylists(window, provider, userAddress) {
  const config = useRuntimeConfig()
  const playlistNftAddress = config.radio.playlistNftAddress

  const playlistNftInterface = new ethers.utils.Interface([
    'function balanceOf(address owner) external view returns (uint256)',
    'function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)',
  ])

  const playlistNftContract = new ethers.Contract(
    playlistNftAddress,
    playlistNftInterface,
    provider
  )

  const playlistNftBalance = await playlistNftContract.balanceOf(userAddress)

  const playlistNftIds = []

  for (let i = 0; i < playlistNftBalance; i++) {
    const playlistNftId = await playlistNftContract.tokenOfOwnerByIndex(userAddress, i)
    playlistNftIds.push(Number(playlistNftId))

    const playlistData = fetchPlaylistData(window, playlistNftId)

    if (!playlistData) {
      fetchPlaylistDataFromBlockchain(window, provider, null, playlistNftId)
    }
  }

  storeData(window, userAddress, { playlistNftIds }, 'playlistNftIds')

  return playlistNftIds
}