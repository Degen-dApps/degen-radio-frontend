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
      <li v-for="(track, index) in tracks" :key="index">
        {{ track }}
      </li>
    </ul>
  </div>
</template>

<script>
import { Howl } from 'howler';

export default {
  name: 'AudioPlayer',
  data() {
    return {
      sound: null,
      currentTime: 0,
      duration: 0,
      playing: false,
      timer: null,
      tracks: [
        "https://ipfs.filebase.io/ipfs/QmTRF3BfANSWVnAzwZmkEqho537Ugrgrh4VRaVFXyWhgmU/got-dat-degen.mp3",
        'https://nftdegeniggy.myfilebase.com/ipfs/QmZ8keL488WqXV41K4V1D4zC7AEzpvhKnM2kp2C2NneTNk/degen-name-degen-fame-2.mp3'
      ],
      currentTrackIndex: 0,
    }; 
  },

  computed: {
    currentTimeFormatted() {
      return this.formatTime(this.currentTime);
    },
    
    durationFormatted() {
      return this.formatTime(this.duration);
    }
  },

  methods: {

    addTrack(newTrack) {
      if (newTrack) {
        this.tracks.push(newTrack);
      }
    },

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

      if (this.currentTrackIndex >= this.tracks.length) {
        this.currentTrackIndex = 0;
      }

      this.sound.stop();
      this.loadTrack(this.tracks[this.currentTrackIndex]);
    },

    pause() {
      this.playing = false;
      if (this.sound) {
        this.sound.pause();
      }
    },

    play() {
      this.playing = true;
      if (this.tracks.length === 0) return;

      if (!this.sound) {
        this.loadTrack(this.tracks[this.currentTrackIndex]);
      } else {
        this.sound.play();
      }
    },

    previousTrack() {
      this.playing = false;
      this.stopTimer();
      this.currentTrackIndex--;

      if (this.currentTrackIndex < 0) {
        this.currentTrackIndex = this.tracks.length - 1;
      }

      this.sound.stop();
      this.loadTrack(this.tracks[this.currentTrackIndex]);
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

  beforeUnmount() {
    this.stopTimer();

    if (this.sound) {
      this.sound.unload();
    }
  }

};
</script>
