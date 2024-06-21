import { ethers } from 'ethers'

const usernameExtension = '-username'
const referrerKey = 'referrer'

/**
 *
 * @param {*} window
 * @param {*} address Blockchain address of smart contract or EOA
 * @param {*} objType E.g. 'playlist', 'nftplaylist', 'collection'
 * @param {*} expiration In milliseconds (0 means never expire, fetch from the config file)
 * @returns
 */
export function fetchData(window, address, objType, expiration) {
  if (!window) {
    console.log(`No window object for ${objType} in storageUtils/fetchData`)
    return null
  }

  try {
    const currentTime = new Date().getTime()

    const objectString = window.localStorage.getItem(String(address).toLowerCase() + '-' + objType)

    if (!objectString) {
      return null
    }

    const obj = JSON.parse(objectString)

    // check if expired (expiration = 0 means never expire)
    if (expiration != 0 && obj.stored + expiration < currentTime) {
      return null
    }

    if (typeof obj == 'object') {
      return obj
    }

    return null
  } catch (error) {
    console.log(error)
    return null
  }
}

/**
 *
 * @param {*} window
 * @param {*} addressOrNftId Enter either Playlist address, or PlaylistNft NFT token ID
 * @returns
 */
export function fetchPlaylistData(window, addressOrNftId) {
  if (!window) {
    console.log(`No window object for ${addressOrNftId} in storageUtils/fetchPlaylistData`)
    return null
  }

  const config = useRuntimeConfig()

  let objectType
  let playlistAddress
  let playlistNftAddress = config.radio.playlistNftAddress
  let nftId

  // check if addressOrNftId is an address or an NFT token ID
  if (ethers.utils.isAddress(addressOrNftId)) {
    objectType = 'playlist'
    playlistAddress = addressOrNftId
    nftId = null
  } else {
    objectType = 'nftplaylist'
    nftId = addressOrNftId
  }

  if (objectType === 'playlist') {
    const playlistString = window.localStorage.getItem(String(playlistAddress).toLowerCase() + '-' + objectType)

    if (!playlistString) {
      return null
    }

    const playlistObject = JSON.parse(playlistString)
    // note that playlist object in local storage stores only the playlist NFT ID and never expires
    nftId = playlistObject.playlistNftId
  }

  try {
    const currentTime = new Date().getTime()

    const objectString = window.localStorage.getItem(
      String(Number(nftId)) + '-' + String(playlistNftAddress).toLowerCase() + '-nftplaylist',
    )

    if (!objectString) {
      return null
    }

    const obj = JSON.parse(objectString)

    const expiration = config.expiryPlaylists // in milliseconds

    // check if expired (expiration = 0 means never expire)
    if (expiration != 0 && obj.stored + expiration < currentTime) {
      return null
    }

    if (typeof obj == 'object') {
      return obj
    }

    return null
  } catch (error) {
    console.log(error)
    return null
  }
}

export function fetchPlaylistNftId(window, playlistAddress) {
  if (!window) {
    console.log(`No window object for ${playlistAddress} in storageUtils/fetchPlaylistNftId`)
    return null
  }

  if (!playlistAddress || !ethers.utils.isAddress(playlistAddress)) {
    console.error(`Invalid playlist address`)
    return null
  }

  const playlistString = window.localStorage.getItem(String(playlistAddress).toLowerCase() + '-playlist')

  if (!playlistString) {
    return null
  }

  const playlistObject = JSON.parse(playlistString)

  return playlistObject.playlistNftId
}

export function fetchReferrer(window) {
  if (!window) {
    console.log('No window object in fetchReferrer')
    return ethers.constants.AddressZero
  }

  try {
    const referrerAddress = window.localStorage.getItem(referrerKey)

    if (!referrerAddress) {
      return ethers.constants.AddressZero
    }

    // if not a valid address, return 0x0
    if (!ethers.utils.isAddress(referrerAddress)) {
      return ethers.constants.AddressZero
    }

    return referrerAddress
  } catch (error) {
    console.log(error)
    return ethers.constants.AddressZero
  }
}

export function fetchUsername(window, userAddress) {
  if (!window) {
    console.log('No window object in fetchUsername')
    return null
  }

  try {
    const config = useRuntimeConfig()
    const expiration = config.expiryUsernames // in milliseconds
    const currentTime = new Date().getTime()

    const usernameObjectString = window.localStorage.getItem(String(userAddress).toLowerCase() + usernameExtension)

    if (!usernameObjectString) {
      return null
    }

    const usernameObject = JSON.parse(usernameObjectString)

    // check if username is expired (expiration = 0 means never expire)
    if (expiration != 0 && usernameObject.stored + expiration < currentTime) {
      return null
    }

    if (usernameObject.username) {
      return usernameObject.username
    }

    return null
  } catch (error) {
    console.log(error)
    return null
  }
}

/**
 *
 * @param {*} window
 * @param {*} address Blockchain address of smart contract or EOA
 * @param {*} dataObject Data object to store
 * @param {*} objType E.g. 'playlist', 'nftplaylist', 'collection'
 * @returns
 */
export function storeData(window, address, dataObject, objType) {
  if (!window) {
    console.log(`No window object for ${objType} in storageUtils/storeData`)
    return { success: false, message: `No window object for ${objType} in storageUtils/storeData` }
  }

  const timestamp = new Date().getTime()

  dataObject['stored'] = timestamp

  window.localStorage.setItem(String(address).toLowerCase() + '-' + objType, JSON.stringify(dataObject))

  return { success: true, message: `${objType} with address ${address} stored successfully` }
}

export function storePlaylistData(window, playlistAddress, playlistNftId, dataObject) {
  if (!window) {
    console.log(`No window object for ${playlistAddress} or NFT ID ${playlistNftId} in storageUtils/storePlaylistData`)
    return {
      success: false,
      message: `No window object for ${playlistAddress} or NFT ID ${playlistNftId} in storageUtils/storePlaylistData`,
    }
  }

  const config = useRuntimeConfig()
  let nftId = playlistNftId
  const playlistNftAddress = config.radio.playlistNftAddress

  if (String(playlistAddress).toLowerCase() === String(playlistNftAddress).toLowerCase()) {
    console.error(
      `Error: You have entered the address of the Playlist NFT smart contract instead of a Playlist contract`,
    )
    return {
      success: false,
      message: `Error: You have entered the address of the Playlist NFT smart contract instead of a Playlist contract`,
    }
  }

  if (playlistAddress) {
    const playlistString = window.localStorage.getItem(String(playlistAddress).toLowerCase() + '-playlist')

    if (!nftId && playlistString) {
      const playlistObject = JSON.parse(playlistString)
      // note that playlist object in local storage stores only the playlist NFT ID and never expires
      nftId = playlistObject.playlistNftId
    } else if (nftId && !playlistString) {
      const playlistObject = {
        playlistNftId: nftId,
      }

      window.localStorage.setItem(String(playlistAddress).toLowerCase() + '-playlist', JSON.stringify(playlistObject))
    }
  }

  // store data in the playlist NFT object in local storage
  if (!nftId) {
    console.error(`Error: No NFT ID found...`)
    return { success: false, message: `Error: No NFT ID found...` }
  }

  const timestamp = new Date().getTime()

  dataObject['stored'] = timestamp

  window.localStorage.setItem(
    String(Number(nftId)) + '-' + String(playlistNftAddress).toLowerCase() + '-nftplaylist',
    JSON.stringify(dataObject),
  )

  return {
    success: true,
    message: `Playlist data for Playlist NFT ID ${playlistNftId} stored successfully`,
    data: dataObject,
  }
}

export function storePlaylistNftId(window, playlistAddress, playlistNftId) {
  if (!window) {
    console.log(`No window object for ${playlistAddress} in storageUtils/storePlaylistNftId`)
    return { success: false, message: `No window object for ${playlistAddress} in storageUtils/storePlaylistNftId` }
  }

  if (!playlistAddress || !ethers.utils.isAddress(playlistAddress)) {
    console.error(`Invalid playlist address`)
    return { success: false, message: `Invalid playlist address` }
  }

  const playlistObject = {
    playlistNftId: Number(playlistNftId),
  }

  window.localStorage.setItem(String(playlistAddress).toLowerCase() + '-playlist', JSON.stringify(playlistObject))

  return { success: true, message: `Playlist NFT ID ${playlistNftId} stored successfully` }
}

export function storeReferrer(window, referrerAddress) {
  if (!window) {
    console.log('No window object in storeReferrer')
    return null
  }

  window.localStorage.setItem(referrerKey, referrerAddress)
}

export function storeUsername(window, userAddress, username) {
  if (!window) {
    console.log('No window object in storeUsername')
    return null
  }

  const timestamp = new Date().getTime()

  const usernameObject = {
    username: username,
    stored: timestamp,
  }

  window.localStorage.setItem(String(userAddress).toLowerCase() + usernameExtension, JSON.stringify(usernameObject))
}

/**
 *
 * @param {*} window
 * @param {*} address Blockchain address of smart contract or EOA
 * @param {*} objType E.g. 'playlist', 'nftplaylist', 'collection'
 * @param {*} fieldName Field name to update in an existing object in local storage
 * @param {*} fieldValue New field value for a given field name
 * @returns
 */
export function updateObjectField(window, address, objType, fieldName, fieldValue) {
  if (!window) {
    console.error(`No window object for ${fieldName} in storageUtils/updateObjectField`)
    return { success: false, message: `No window object for ${fieldName} in storageUtils/updateObjectField` }
  }

  try {
    const objectString = window.localStorage.getItem(String(address).toLowerCase() + '-' + objType)

    if (!objectString) {
      console.error(`No object found for ${fieldName} in storageUtils/updateObjectField`)
      return { success: false, message: `No object found for ${fieldName} in storageUtils/updateObjectField` }
    }

    const obj = JSON.parse(objectString)

    obj[fieldName] = fieldValue

    window.localStorage.setItem(String(address).toLowerCase() + '-' + objType, JSON.stringify(obj))

    return { success: true, message: `Field ${fieldName} updated successfully` }
  } catch (error) {
    console.log(error)
    return { success: false, message: error.message }
  }
}
