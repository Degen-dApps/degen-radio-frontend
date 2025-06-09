<template>
  <div class="card audio-player-card">

    <!-- Seek Bar -->
    <div class="col-12">
      <div class="progress seekbar" role="progressbar" :aria-valuenow="(currentTime / duration) * 100" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar seek-bar" :style="{ width: `${(currentTime / duration) * 100}%` }"></div>
      </div>
    </div>

    <div class="card-body row d-flex justify-content-evenly">
      <div class="col-md-6 text-center mb-2 mt-2">
        
        <span class="dropup-center dropup align-text-top me-4" v-if="currentTrack?.name">
          <span class="dropdown-toggle cursor-pointer h6" data-bs-toggle="dropdown" aria-expanded="false" data-bs-offset="0,30">
            <span class="me-1 text-wrap">{{ currentTrack.name }}</span>
          </span>

          <ul class="dropdown-menu">
            <li
              class="dropdown-item h6 cursor-pointer"
              v-for="(track, index) in getAudioQueue"
              :key="index"
              @click="skipToSong(index)"
            >
              <span class="me-2">{{ index + 1 }})</span>
              <span>{{ track?.name }} {{ track?.name === currentTrack?.name ? ' ♫' : '' }}</span>
            </li>

            <li><hr /></li>

            <NuxtLink
              v-if="getPlaylistAddress"
              :to="'/playlist?id='+getPlaylistAddress"
              class="dropdown-item h6 cursor-pointer"
            >
              <i class="bi bi-music-note-list me-1"></i> View playlist
            </NuxtLink>

            <li class="dropdown-item h6 cursor-pointer" @click="audioStore.shuffleQueue()">
              <i class="bi bi-shuffle me-1"></i> Shuffle
            </li>

            <li class="dropdown-item h6 cursor-pointer" @click="audioStore.clearQueue()">
              <i class="bi bi-x-circle me-1"></i> Clear queue
            </li>
          </ul>
        </span>

        <span class="align-bottom" v-if="currentTimeFormatted && durationFormatted">
          {{ currentTimeFormatted }} / {{ durationFormatted }}
        </span>
      </div>

      <!-- Button -->
      <div class="col-md-6 row d-flex justify-content-evenly">
        <button class="col btn btn-outline-primary me-2" @click="previousTrack">
          <i class="bi bi-rewind-fill"></i>
        </button>

        <button class="col btn btn-outline-primary me-2" @click="seekBackward">
          -15s
        </button>

        <button v-if="!playing" class="col btn btn-primary me-2" @click="play">
          <i class="bi bi-play-fill"></i>
        </button>

        <button v-if="playing" class="col btn btn-primary me-2" @click="pause">
          <i class="bi bi-pause-fill"></i>
        </button>

        <button class="col btn btn-outline-primary me-2" @click="seekForward">
          +15s
        </button>

        <button class="col btn btn-outline-primary" @click="nextTrack">
          <i class="bi bi-fast-forward-fill"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Howl } from 'howler'
import { useAudioStore } from '~/store/audio'

export default {
  name: 'AudioPlayer',

  data() {
    return {
      currentTime: 0,
      currentTrack: null,
      duration: 0,
      loadTimeout: null,
      playing: false,
      sound: null,
      timer: null,
      userStartedListening: false,
    }
  },

  mounted() {
    if (this.getAudioQueue.length > 0) {
      this.currentTrack = this.getAudioQueue[this.currentTrackIndex]
    }
  },

  computed: {
    currentTimeFormatted() {
      return this.formatTime(this.currentTime)
    },

    currentTrackArtwork() {
      if (this.currentTrack) {
        if (this.currentTrack?.imageHttp && this.currentTrack?.imageFormat) {
          return { 
            src: this.currentTrack?.imageHttp, 
            sizes: '96x96', 
            type: this.currentTrack?.imageFormat 
          }
        }
      }

      return { 
        src: '/img/logo.png', 
        sizes: '96x96', 
        type: 'image/png' 
      }
    },

    currentTrackIndex() {
      return this.audioStore.currentTrackIndex
    },

    currentTrackName() {
      return this.audioStore.queue[this.currentTrackIndex]?.name
    },

    durationFormatted() {
      return this.formatTime(this.duration)
    },

    getAudioQueue() {
      return this.audioStore.queue
    },

    getAudioQueueLength() {
      return this.audioStore.queue.length
    },

    getPlaylistAddress() {
      return this.audioStore.currentPlaylistAddress
    },

    getPlayTrigger() {
      return this.audioStore.playTrigger
    },

    getStopTrigger() {
      return this.audioStore.stopTrigger
    },
  },

  methods: {
    clearQueue() {
      this.stop()
      this.audioStore.clearQueue()
      this.currentTrack = null
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${minutes}:${secs < 10 ? '0' : ''}${secs}`
    },

    loadTrack(src, format) {
      // Clean up existing sound
      if (this.sound) {
        console.log('Unloading existing sound');
        this.sound.unload();
      }

      this.sound = new Howl({
        src: [src],
        html5: true, // To ensure playback on mobile devices
        format: [format || 'mp3'],
        onload: () => {
          // Only play if we're not already playing
          if (!this.sound.playing()) {
            this.sound.play();
          }

          if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: this.currentTrack?.name,
              artwork: [ this.currentTrackArtwork ],
            });

            navigator.mediaSession.setActionHandler('play', this.play);
            navigator.mediaSession.setActionHandler('pause', this.pause);
            navigator.mediaSession.setActionHandler('stop', this.pause);
            navigator.mediaSession.setActionHandler('seekbackward', this.seekBackward);
            navigator.mediaSession.setActionHandler('seekforward', this.seekForward);
            navigator.mediaSession.setActionHandler('previoustrack', this.previousTrack);
            navigator.mediaSession.setActionHandler('nexttrack', this.nextTrack);
          }
        },
        onloaderror: (id, error) => {
          this.nextTrack(); // skip to next song if current song fails to load
        },
        onplay: () => {
          // Only update state if we're not already playing
          if (!this.playing) {
            this.playing = true;
          }

          this.duration = this.sound.duration();
          this.startTimer();
        },
        onend: () => {
          this.nextTrack();
        },
        onpause: () => {
          this.stopTimer();
        },
      });

      this.sound.load();
    },

    nextTrack() {
      this.stop()
      this.currentTime = 0
      this.audioStore.setCurrentTrackIndex(this.currentTrackIndex + 1)

      if (this.currentTrackIndex >= this.getAudioQueue.length) {
        this.audioStore.setCurrentTrackIndex(0)
      }

      this.currentTrack = this.getAudioQueue[this.currentTrackIndex]
      this.loadTrack(this.currentTrack.audioUrl, this.currentTrack?.format)
    },

    pause() {
      this.playing = false
      if (this.sound) {
        this.sound.pause()
      }
    },

    play() {
      // user initiated play
      this.userStartedListening = true;
      
      // If we have a sound and it's already loaded, just play it
      if (this.sound && this.sound.state() === 'loaded') {
        this.sound.play();
        this.playing = true;
        this.startTimer();
        return;
      }
      
      this.playSongs();
    },

    playSongs() {
      this.playing = true
      if (this.getAudioQueue.length === 0) {
        return
      }

      if (!this.sound) {
        this.currentTrack = this.getAudioQueue[this.currentTrackIndex]
        this.loadTrack(this.currentTrack.audioUrl, this.currentTrack?.format)
      } else {
        this.sound.play()
      }
    },

    previousTrack() {
      this.stop()
      this.currentTime = 0
      this.audioStore.setCurrentTrackIndex(this.currentTrackIndex - 1)

      if (this.currentTrackIndex < 0) {
        this.audioStore.setCurrentTrackIndex(this.getAudioQueue.length - 1)
      }
      
      this.currentTrack = this.getAudioQueue[this.currentTrackIndex]
      this.loadTrack(this.currentTrack.audioUrl, this.currentTrack?.format)
    },

    seekForward() {
      if (this.sound) {
        const wasPlaying = this.playing
        const currentPosition = this.sound.seek();
        const newPosition = Math.min(currentPosition + 15, this.duration);
        this.pause()
        this.sound.seek(newPosition);
        this.currentTime = newPosition;
        if (wasPlaying) {
          this.sound.play()
        }
      }
    },

    seekBackward() {
      if (this.sound) {
        const wasPlaying = this.playing
        const currentPosition = this.sound.seek();
        const newPosition = Math.max(currentPosition - 15, 0);
        this.pause()
        this.sound.seek(newPosition);
        this.currentTime = newPosition;
        if (wasPlaying) {
          this.sound.play()
        }
      }
    },

    skipToSong(index) {
      this.stop()
      this.currentTime = 0
      this.audioStore.setCurrentTrackIndex(index)
      this.playSongs()
    },

    startTimer() {
      this.stopTimer()
      this.timer = setInterval(() => {
        this.currentTime = this.sound.seek()
      }, 1000)
    },

    stop() {
      this.playing = false
      this.stopTimer()

      if (this.sound) {
        this.sound.stop()
        this.sound.unload()
      }

      this.sound = null
    },

    stopTimer() {
      clearInterval(this.timer)
      this.timer = null
    },
  },

  setup() {
    const audioStore = useAudioStore()
    return { audioStore }
  },

  watch: {
    getPlayTrigger() {
      this.skipToSong(this.audioStore.currentTrackIndex)
    },

    getStopTrigger() {
      this.stop()
    },

    getAudioQueueLength(newVal, oldVal) {
      if (newVal === 0) {
        // user has cleared the queue, so stop playing
        this.playing = false
        this.audioStore.setCurrentTrackIndex(0)
        this.stopTimer()
        if (this.sound) {
          this.sound.stop()
        }
      }

      if (this.userStartedListening && oldVal === 0 && newVal > 0) {
        // the queue was previously empty, but now has songs, so start playing
        this.play()
      }
    },
  },

  beforeUnmount() {
    this.stopTimer()

    if (this.sound) {
      this.sound.unload()
    }
  },
}
</script>
