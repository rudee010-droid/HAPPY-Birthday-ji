// Web Audio API Synthesizer - 100% Procedural Audio, No External Audio Files
class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.bgmGain = null;
    this.sfxGain = null;
    this.isMusicPlaying = false;
    this.musicTimer = null;
    this.currentStep = 0;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master FX Gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.5;
      this.sfxGain.connect(this.ctx.destination);

      // BGM Gain with ducking capabilities
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.22;
      this.bgmGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio not supported:", e);
    }
  }

  unlock() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isMuted = false;
    this.startAmbientMusic();
  }

  toggle() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAmbientMusic();
      if (this.bgmGain) this.bgmGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    } else {
      if (this.bgmGain) this.bgmGain.gain.setTargetAtTime(0.22, this.ctx.currentTime, 0.05);
      this.startAmbientMusic();
    }
    return !this.isMuted;
  }

  duckMusic(duration = 0.8) {
    if (!this.ctx || this.isMuted || !this.bgmGain) return;
    const now = this.ctx.currentTime;
    this.bgmGain.gain.cancelScheduledValues(now);
    this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
    this.bgmGain.gain.linearRampToValueAtTime(0.06, now + 0.08);
    this.bgmGain.gain.linearRampToValueAtTime(0.22, now + duration);
  }

  // Play gentle ambient dreamy arpeggio
  startAmbientMusic() {
    if (this.isMusicPlaying || this.isMuted || !this.ctx) return;
    this.isMusicPlaying = true;

    // Chord progression in F# minor / A major pentatonic (F#3, A3, C#4, E4, G#4)
    const chords = [
      [220.00, 261.63, 329.63, 392.00], // A maj7
      [196.00, 246.94, 293.66, 392.00], // G maj7
      [220.00, 277.18, 329.63, 440.00], // A add9
      [164.81, 220.00, 261.63, 329.63]  // E / F#m
    ];

    let chordIdx = 0;
    let noteIdx = 0;

    const playNextNote = () => {
      if (!this.isMusicPlaying || this.isMuted || !this.ctx) return;
      const chord = chords[chordIdx];
      const freq = chord[noteIdx % chord.length] * (noteIdx % 2 === 0 ? 1 : 2);
      
      this.playPluck(freq, 0.12, 1.2, this.bgmGain);

      noteIdx++;
      if (noteIdx >= 8) {
        noteIdx = 0;
        chordIdx = (chordIdx + 1) % chords.length;
      }

      this.musicTimer = setTimeout(playNextNote, 420);
    };

    playNextNote();
  }

  stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  playPluck(freq, gainVal = 0.2, decay = 1.0, destination = null) {
    if (this.isMuted || !this.ctx) return;
    const dest = destination || this.sfxGain;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Warm soft envelope
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + decay);
  }

  // Chime when tapping star or photo
  playChime(highPitch = false) {
    if (this.isMuted || !this.ctx) return;
    this.duckMusic(0.6);
    const base = highPitch ? 880 : 587.33; // D5 or A5
    const freqs = [base, base * 1.25, base * 1.5, base * 2.0];
    
    freqs.forEach((f, i) => {
      setTimeout(() => {
        this.playPluck(f, 0.25, 0.9);
      }, i * 60);
    });
  }

  // Quiz correct chime (bright uplifting triad)
  playCorrect() {
    if (this.isMuted || !this.ctx) return;
    this.duckMusic(1.0);
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => {
        this.playPluck(freq, 0.3, 0.8);
      }, i * 80);
    });
  }

  // Quiz wrong buzz (playful cute boing)
  playWrong() {
    if (this.isMuted || !this.ctx) return;
    this.duckMusic(0.6);
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Confetti pop
  playPop() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Candle blow puff
  playCandleBlow() {
    if (this.isMuted || !this.ctx) return;
    this.duckMusic(0.5);
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(250, now + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start(now);
  }

  // Firework boom and sparkle
  playFirework() {
    if (this.isMuted || !this.ctx) return;
    this.duckMusic(1.5);
    const now = this.ctx.currentTime;
    
    // Deep boom
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.5);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.6);

    // Crackle sparkles
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.playPluck(1200 + Math.random() * 800, 0.15, 0.1);
      }, 200 + i * 80);
    }
  }

  // Love letter typewriter key
  playTypewriter() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400 + (Math.random() - 0.5) * 200, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }
}

export const sound = new SoundManager();

