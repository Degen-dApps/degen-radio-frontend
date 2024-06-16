<template>
  <!--
    "https://ipfs.filebase.io/ipfs/QmTRF3BfANSWVnAzwZmkEqho537Ugrgrh4VRaVFXyWhgmU/got-dat-degen.mp3",
    'https://nftdegeniggy.myfilebase.com/ipfs/QmZ8keL488WqXV41K4V1D4zC7AEzpvhKnM2kp2C2NneTNk/degen-name-degen-fame-2.mp3'
  -->

  <div class="row p-3">
    <button v-if="!playing" class="col btn btn-primary me-2" @click="play">Play</button>
    <button v-if="playing" class="col btn btn-primary me-2" @click="pause">Pause</button>
    <button class="col btn btn-primary me-2" @click="restart">Restart</button>
    <button class="col btn btn-primary me-2" @click="nextTrack">Next</button>
    <button class="col btn btn-primary" @click="previousTrack">Previous</button>
    <p class="col" v-if="currentTimeFormatted && durationFormatted">{{ currentTimeFormatted }} / {{ durationFormatted }}</p>
  </div>

  <div class="track-list">
    <h3>Track List</h3>
    <ul>
      <li v-for="(track, index) in getAudioQueue" :key="index">
        {{ track }}
      </li>
    </ul>
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
      this.loadTrack(this.getAudioQueue[this.currentTrackIndex]);
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
        this.loadTrack(this.getAudioQueue[this.currentTrackIndex]);
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
      this.loadTrack(this.getAudioQueue[this.currentTrackIndex]);
    },

    restart() {
      this.playing = false;
      this.stopTimer();
      this.sound.stop();
      this.sound.play();
      this.playing = true;
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
