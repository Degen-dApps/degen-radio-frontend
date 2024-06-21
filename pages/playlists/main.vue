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
        <input
          v-model="songUrl"
          type="text"
          class="form-control"
          id="exampleFormControlInput1"
          placeholder="Enter song URL"
        />
        <input
          v-model="songTitle"
          type="text"
          class="form-control"
          id="exampleFormControlInput1"
          placeholder="Enter song name"
        />
      </div>

      <button @click="addSong" class="btn btn-primary me-2">Add Song</button>
      <button @click="playNow" class="btn btn-primary me-2">Play Now</button>
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
      songTitle: null,
      songUrl: null,
    }
  },

  mounted() {
    const tracks = [
      {
        name: 'Got Dat Degen',
        audioUrl: 'https://ipfs.filebase.io/ipfs/QmTRF3BfANSWVnAzwZmkEqho537Ugrgrh4VRaVFXyWhgmU/got-dat-degen.mp3',
      },
      {
        name: 'Degen Name, Degen Fame',
        audioUrl:
          'https://nftdegeniggy.myfilebase.com/ipfs/QmZ8keL488WqXV41K4V1D4zC7AEzpvhKnM2kp2C2NneTNk/degen-name-degen-fame-2.mp3',
      },
    ]

    this.audioStore.addToQueue(tracks[0])
    this.audioStore.addToQueue(tracks[1])
  },

  methods: {
    addSong() {
      const newSong = {
        name: String(this.songTitle).trim(),
        audioUrl: String(this.songUrl).trim(),
      }

      this.audioStore.addToQueue(newSong)
      this.songTitle = null
      this.songUrl = null
    },

    clearQueue() {
      this.audioStore.clearQueue()
    },

    playNow() {
      const newSong = {
        name: String(this.songTitle).trim(),
        audioUrl: String(this.songUrl).trim(),
      }

      this.audioStore.playNow(newSong)
      this.songTitle = null
      this.songUrl = null
    },
  },

  setup() {
    const audioStore = useAudioStore()

    return { audioStore }
  },
}
</script>
