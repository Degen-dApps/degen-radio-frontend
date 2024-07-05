import { ThirdwebStorage } from '@thirdweb-dev/storage'
import axios from 'axios'

const abortTimeout = 5000

export async function uploadFileToThirdWeb(file) {
  const config = useRuntimeConfig()

  const storage = new ThirdwebStorage({
    clientId: config.thirdwebClientId,
  })

  const fileUri = await storage.upload(file)

  return fileUri
}

export async function getWorkingIpfsGatewayUrl(url) {
  let cid

  if (!url.startsWith('ipfs://')) { // either an IPFS gateway link or a classic web2 server HTTP link
    const httpLink = url

    let httpResponse

    try {
      httpResponse = await axios.head(httpLink, { signal: AbortSignal.timeout(abortTimeout) })
    } catch (error) {
      console.log("HTTP error:", error)
    }

    if (httpResponse?.status == 200) {
      const contentType = httpResponse.headers['content-type'] // this is needed for song URLs to determine the format
      const format = parseAudioContentType(contentType) // get the format of the audio file

      return { success: true, validUrl: httpLink, contentType: contentType, format: format }
    } else {
      const res = checkIfIpfsGatewayUrl(url)

      if (res.success) {
        cid = res.cid
      }
    }
  } else { // IPFS link
    cid = url.replace('ipfs://', '')
  }

  if (!cid) {
    return { success: false, message: 'Invalid IPFS link' }
  }

  const ipfsGateways = [
    'https://ipfs.io/ipfs/',
    'https://nftdegeniggy.myfilebase.com/ipfs/',
    'https://ipfs.filebase.io/ipfs/',
    //'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.itslit.org/ipfs/',
    'https://ipfs.dylmusic.com/ipfs/',
  ]

  // prefetch the IPFS link to see if it's valid or accessible
  for (const gateway of ipfsGateways) {
    try {
      const ipfsUrl = gateway + cid
      const response = await axios.head(gateway + cid, { signal: AbortSignal.timeout(abortTimeout) })

      if (response.status == 200) {
        const contentType = response.headers['content-type'] // this is needed for song URLs to determine the format
        const format = parseAudioContentType(contentType) // get the format of the audio file
        return { success: true, validUrl: ipfsUrl, contentType: contentType, format: format }
      }
    } catch (error) {
      console.log("Gateway error:", error)
      continue
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
    'https://ipfs.itslit.org/ipfs/',
    'https://ipfs.dylmusic.com/ipfs/',
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
