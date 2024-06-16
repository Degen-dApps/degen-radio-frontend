<template>
  <Head>
    <Title>Top Hits | {{ $config.projectMetadataTitle }}</Title>
    <Meta property="og:title" :content="'Top Hits | ' + $config.projectMetadataTitle" />
  </Head>

  <div class="card border scroll-500">
    <div class="card-body">
      <p class="fs-3">
        <i class="bi bi-arrow-left-circle cursor-pointer" @click="$router.back()"></i>
      </p>

      <h3 class="mb-3 mt-3">Top Hits</h3>

      <div class="mb-3">
        <label for="exampleFormControlInput1" class="form-label">Add new song to the queue</label>
        <input v-model="newSong" type="text" class="form-control" id="exampleFormControlInput1" placeholder="Enter song URL" />
      </div>

      <button @click="addSong" class="btn btn-primary me-2">Add Song</button>
      <button @click="clearQueue" class="btn btn-danger">Clear queue</button>

    </div>
  </div>
</template>

<script>
import { useAudioStore } from '~/store/audio'

export default {
  name: 'PlaylistMain',

  data() {
    return {
      newSong: null
    }
  },

  mounted() {
    const tracks = [
      "https://ipfs.filebase.io/ipfs/QmTRF3BfANSWVnAzwZmkEqho537Ugrgrh4VRaVFXyWhgmU/got-dat-degen.mp3",
      'https://nftdegeniggy.myfilebase.com/ipfs/QmZ8keL488WqXV41K4V1D4zC7AEzpvhKnM2kp2C2NneTNk/degen-name-degen-fame-2.mp3'
    ]

    this.audioStore.addToQueue(tracks[0])
    this.audioStore.addToQueue(tracks[1])
  },

  methods: {
    addSong() {
      this.audioStore.addToQueue(String(this.newSong).trim())
      this.newSong = null
    },

    clearQueue() {
      this.audioStore.clearQueue()
    }
  },

  setup() {
    const audioStore = useAudioStore()

    return { audioStore }
  }
}
</script>
