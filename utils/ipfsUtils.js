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

  if (!ipfsLink.startsWith('ipfs://')) { // either an IPFS gateway link or a classic web2 server HTTP link
    const res = checkIfIpfsGatewayUrl(ipfsLink)

    if (res.success) {
      cid = res.cid
    } else {
      // probably an HTTP link (non-IPFS link or unknown IPFS gateway link)
      const httpLink = ipfsLink
      const httpResponse = await axios.head(httpLink)

      if (httpResponse.status == 200) {
        const contentType = httpResponse.headers['content-type'] // this is needed for song URLs to determine the format
        const format = parseAudioContentType(contentType) // get the format of the audio file

        return { success: true, validUrl: httpLink, contentType: contentType, format: format }
      }
      
    }
  } else { // IPFS link
    cid = ipfsLink.replace('ipfs://', '')
  }

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
  const ipfsGateways = [
    'https://cloudflare-ipfs.com/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://nftdegeniggy.myfilebase.com/ipfs/',
    'https://ipfs.filebase.io/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
  ]

  for (const gateway of ipfsGateways) {
    if (url.startsWith(gateway)) {
      const cid = url.replace(gateway, '')

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
  } else if (String(contentType).toLowerCase() === 'video/mp4') { // howler.js supports mp4, plays it as audio
    return 'mp4'
  }
  else {
    return null
  }
}
