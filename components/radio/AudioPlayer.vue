<template>
<div class="card m-3">
  <div class="card-body row d-flex justify-content-evenly">
    <div class="col-md-6 text-center mb-2 mt-2">

      <span class="dropup-center dropup align-text-top" v-if="currentTrack?.title">
        <span class="dropdown-toggle me-4 cursor-pointer" data-bs-toggle="dropdown" aria-expanded="false">
          {{ currentTrack.title }}
        </span>

        <ul class="dropdown-menu">
          <li>
            <span class="dropdown-item" v-for="(track, index) in getAudioQueue" :key="index" @click="skipToSong(index)">
              {{ track?.title }} {{ index === currentTrackIndex ? ' ♫' : '' }}
            </span>
          </li>
        </ul>
      </span>

      <span class="align-bottom" v-if="currentTimeFormatted && durationFormatted">{{ currentTimeFormatted }} / {{ durationFormatted }}</span>
    </div>

    <div class="col-md-6 row d-flex justify-content-evenly">
      <button class="col btn btn-primary me-2" @click="previousTrack"><i class="bi bi-rewind-fill"></i></button>
      <button v-if="!playing" class="col btn btn-primary me-2" @click="play"><i class="bi bi-play-fill"></i></button>
      <button v-if="playing" class="col btn btn-primary me-2" @click="pause"><i class="bi bi-pause-fill"></i></button>
      <button class="col btn btn-primary" @click="nextTrack"><i class="bi bi-fast-forward-fill"></i></button>
    </div>
  </div>
</div>
</template>

<script>
import { Howl } from 'howler';
import { useAudioStore } from '~/store/audio'

export default {
  name: 'AudioPlayer',
  data() {
    return {
      currentTime: 0,
      currentTrack: null,
      currentTrackIndex: 0,
      duration: 0,
      playing: false,
      sound: null,
      timer: null,
      userStartedListening: false
    }; 
  },

  computed: {
    currentTimeFormatted() {
      return this.formatTime(this.currentTime);
    },
    
    durationFormatted() {
      return this.formatTime(this.duration);
    },

    getAudioQueue() {
      return this.audioStore.queue
    },

    getAudioQueueLength() {
      return this.audioStore.queue.length
    }
  },

  methods: {

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    },

    loadTrack(src) {
      this.sound = new Howl({
        src: [src],
        onplay: () => {
          this.duration = this.sound.duration();
          this.startTimer();
        },
        onend: () => {
          this.nextTrack();
        },
        onpause: () => {
          this.stopTimer();
        }
      });

      this.playing = true;
      this.sound.play();
    },

    nextTrack() {
      this.playing = false;
      this.stopTimer();
      this.currentTrackIndex++;

      if (this.currentTrackIndex >= this.getAudioQueue.length) {
        this.currentTrackIndex = 0;
      }

      this.sound.stop();
      this.currentTrack = this.getAudioQueue[this.currentTrackIndex];
      this.loadTrack(this.currentTrack.url);
    },

    pause() {
      this.playing = false;
      if (this.sound) {
        this.sound.pause();
      }
    },

    play() {
      // user initiated play
      this.userStartedListening = true;
      this.playSongs();
    },

    playSongs() {
      this.playing = true;
      if (this.getAudioQueue.length === 0) {
        return;
      };

      if (!this.sound) {
        this.currentTrack = this.getAudioQueue[this.currentTrackIndex];
        this.loadTrack(this.currentTrack.url);
      } else {
        this.sound.play();
      }
    },

    previousTrack() {
      this.playing = false;
      this.stopTimer();
      this.currentTrackIndex--;

      if (this.currentTrackIndex < 0) {
        this.currentTrackIndex = this.getAudioQueue.length - 1;
      }

      this.sound.stop();
      this.currentTrack = this.getAudioQueue[this.currentTrackIndex];
      this.loadTrack(this.currentTrack.url);
    },

    restart() {
      this.playing = false;
      this.stopTimer();
      this.sound.stop();
      this.sound.play();
      this.playing = true;
    },

    skipToSong(index) {
      this.playing = false;
      this.stopTimer();
      this.sound.stop();
      this.sound = null;
      this.currentTrackIndex = index;
      this.playSongs();
    },

    startTimer() {
      this.stopTimer();
      this.timer = setInterval(() => {
        this.currentTime = this.sound.seek();
      }, 1000);
    },

    stopTimer() {
      clearInterval(this.timer);
      this.timer = null;
    },

  },

  setup() {
    const audioStore = useAudioStore()
    return { audioStore }
  },

  watch: {
    getAudioQueueLength(newVal, oldVal) {

      if (newVal === 0) {
        // user has cleared the queue, so stop playing
        this.playing = false;
        this.currentTrackIndex = 0;
        this.stopTimer();
        if (this.sound) {
          this.sound.stop();
        }
      }

      if (this.userStartedListening && oldVal === 0 && newVal > 0) {
        // the queue was previously empty, but now has songs, so start playing
        this.play()
      }
    }
  },

  beforeUnmount() {
    this.stopTimer();

    if (this.sound) {
      this.sound.unload();
    }
  }

};
</script>
