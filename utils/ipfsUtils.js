import axios from 'axios'

const abortTimeout = 5000 // 5 seconds

export async function getWorkingUrl(url) {
  let cid

  if (url.startsWith('ar://')) {
    return getWorkingArweaveUrl(url)
  }

  if (!url.startsWith('ipfs://')) { // either an IPFS gateway link or a classic web2 server HTTP link
    const httpLink = url

    try {
      const httpResponse = await axios.head(httpLink, { 
        timeout: abortTimeout,
        validateStatus: function (status) {
          return status >= 200 && status < 300; // Consider all 2xx statuses as success
        }
      })
      
      const contentType = httpResponse.headers['content-type']
      const format = parseAudioContentType(contentType) // get the format of the audio file

      return { success: true, validUrl: httpLink, contentType: contentType, format: format }
    } catch (error) {
      console.log("HTTP error:", error.message)
      // Continue to IPFS gateway check if HTTP request fails
    }

    const res = checkIfIpfsGatewayUrl(url)

    if (res.success) {
      cid = res.cid
    }
  } else { // IPFS link
    cid = url.replace('ipfs://', '')
  }

  if (!cid) {
    return { success: false, message: 'Invalid IPFS link' }
  }

  const ipfsGateways = [
    'https://ipfs.io/ipfs/',
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

async function getWorkingArweaveUrl(url) {
  if (!url.startsWith('ar://')) {
    return { success: false, message: 'Invalid Arweave link' }
  }

  const arweaveGateways = [
    "https://arweave.net",
  ]

  const txid = url.replace('ar://', '')

  for (const gateway of arweaveGateways) {
    try {
      const arweaveUrl = `${gateway}/${txid}`
      const response = await axios.head(arweaveUrl)

      if (response.status == 200) {
        const contentType = response.headers['content-type']
        const format = parseAudioContentType(contentType) // get the format of the audio file
        return { success: true, validUrl: arweaveUrl, contentType: contentType, format: format }
      }
    } catch (error) {
      console.log(`Arweave gateway (${gateway}) error:`, error)
    }
  }
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
