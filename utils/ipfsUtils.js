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
  if (!ipfsLink || !ipfsLink.startsWith('ipfs://')) {
    return { success: false, message: 'Invalid IPFS link' }
  }

  const cid = ipfsLink.replace('ipfs://', '')

  const ipfsGateways = [
    'https://ipfs.io/ipfs/',
    'https://nftdegeniggy.myfilebase.com/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
  ]

  // prefetch the IPFS link to see if it's valid or accessible
  for (const gateway of ipfsGateways) {
    try {
      const ipfsUrl = gateway + cid
      const response = await axios.head(gateway + cid)

      if (response.status == 200) {
        return { success: true, validUrl: ipfsUrl }
      }
    } catch (error) {
      console.log(error)
    }
  }
}
