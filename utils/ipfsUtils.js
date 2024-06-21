import { ThirdwebStorage } from '@thirdweb-dev/storage'
import axios from 'axios'

export async function uploadFileToThirdWeb(file) {
  const config = useRuntimeConfig()

  const storage = new ThirdwebStorage({
    clientId: config.thirdwebClientId,
  })

  const fileUri = await storage.upload(file)

  return fileUri
}

export async function getWorkingIpfsGatewayUrl(ipfsLink) {
  let cid

  if (!ipfsLink.startsWith('ipfs://')) {
    console.log('ipfsLink does not start with ipfs://:', ipfsLink)
    const res = checkIfIpfsGatewayUrl(ipfsLink)

    if (res.success) {
      cid = res.cid
    } else {
      return { success: false, message: 'Invalid IPFS link' }
    }
  } else {
    console.log('ipfsLink starts with ipfs://:', ipfsLink)
    cid = ipfsLink.replace('ipfs://', '')
  }

  console.log('cid in getWorkingIpfsGatewayUrl:', cid)

  const ipfsGateways = [
    'https://ipfs.io/ipfs/',
    'https://nftdegeniggy.myfilebase.com/ipfs/',
    'https://ipfs.filebase.io/ipfs/',
    //'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
  ]

  // prefetch the IPFS link to see if it's valid or accessible
  for (const gateway of ipfsGateways) {
    try {
      console.log('gateway in getWorkingIpfsGatewayUrl:', gateway)
      const ipfsUrl = gateway + cid
      const response = await axios.head(gateway + cid)

      if (response.status == 200) {
        const contentType = response.headers['content-type'] // this is needed for song URLs to determine the format
        const format = parseAudioContentType(contentType) // get the format of the audio file
        return { success: true, validUrl: ipfsUrl, contentType: contentType, format: format }
      }
    } catch (error) {
      console.log(error)
    }
  }
}

function checkIfIpfsGatewayUrl(url) {
  console.log('checkIfIpfsGatewayUrl url:', url)

  const ipfsGateways = [
    'https://cloudflare-ipfs.com/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://nftdegeniggy.myfilebase.com/ipfs/',
    'https://ipfs.filebase.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
  ]

  for (const gateway of ipfsGateways) {
    if (url.startsWith(gateway)) {
      console.log('gateway:', gateway)

      const cid = url.replace(gateway, '')
      console.log('cid:', cid)

      return { success: true, cid: cid }
    }
  }

  return { success: false, message: 'Very likely not an IPFS gateway URL' }
}

function parseAudioContentType(contentType) {
  if (String(contentType).toLowerCase() === 'audio/mpeg') {
    return 'mp3'
  } else if (String(contentType).toLowerCase() === 'audio/wav') {
    return 'wav'
  } else if (String(contentType).toLowerCase() === 'audio/ogg') {
    return 'ogg'
  } else {
    return null
  }
}
