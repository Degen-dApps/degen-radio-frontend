<template>
  <Head>
    <Title>About | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'About | ' + $config.projectMetadataTitle" />
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <p class="fs-3" @click="$router.back()">
        <i class="bi bi-arrow-left-circle cursor-pointer"></i>
      </p>

      <h3 class="mb-3 mt-3">About Degen Radio</h3>

      <p class="text-break text-center">
        <img src="https://ik.imagekit.io/iggy/put-radio-on-blockchain.png" alt="Warpcast logo" class="mt-3 mb-3 img-fluid rounded" />
      </p>

      <p class="text-break mt-3">
        Brought to you by
        <a target="_blank" href="https://warpcast.com/tempetechie.eth">Tempe Techie</a> &
        <a target="_blank" href="https://warpcast.com/tekr0x.eth">Tekr</a>.
      </p>

      <h5>Useful links</h5>

      <ul>
        <li><a href="https://nftdegen.lol" target="_blank">NFTdegen.lol - launch your music NFT</a></li>
        <li><a href="https://github.com/degen-dapps" target="_blank">Degen dApps GitHub</a></li>
      </ul>

      <h5>Tech stack</h5>

      <p class="text-break mt-3">
        This chat is built on top of various decentralized and open source technologies, such as:
      </p>

      <ul>
        <li><a href="https://ipfs.tech/" target="_blank">IPFS</a></li>
        <li><a href="https://ceramic.network/" target="_blank">Ceramic Network</a></li>
        <li><a href="https://useorbis.com/" target="_blank">Orbis</a></li>
        <li><a href="https://punk.domains/" target="_blank">Punk Domains</a></li>
        <li><a href="https://iggy.social/" target="_blank">Iggy Social</a></li>
        <li>... and others.</li>
      </ul>

      <hr />

      <h5>Feedback</h5>

      <p class="text-break mt-3">Feel free to post ideas, features suggestions, rants on Farcaster.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About',
}
</script>
