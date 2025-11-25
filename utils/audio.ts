class AudioService {
  private context: AudioContext | null = null;
  private ambientOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private ambientInterval: number | null = null;

  private getContext(): AudioContext {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.context;
  }

  // Initialize context on user interaction
  public async init() {
    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', vol: number = 0.3) {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  public playCountdown() {
    // Sharp, short beep for 3, 2, 1
    // Higher pitch and sharper envelope for clarity
    this.playTone(880, 0.1, 'square', 0.2); 
  }

  public playSwitchPhase(isSprint: boolean) {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    if (isSprint) {
      // High energy ALARM! GO!
      const play = (f: number, t: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.exponentialRampToValueAtTime(f/2, t + 0.4); // Drop pitch
        
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      };

      play(1200, now);
      play(1200, now + 0.2); 
    } else {
      // Relaxing Gong/Chime for recover
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0); // Long decay
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.0);
    }
  }

  public playComplete() {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'triangle';
      gain.gain.value = 0.3;
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.2);
      osc.stop(now + i * 0.2 + 0.5);
    });
  }

  // --- AMBIENT DRONE SYSTEM ---

  public stopAmbient() {
    this.ambientOscillators.forEach(({ osc, gain }) => {
        try {
            const now = this.context?.currentTime || 0;
            gain.gain.setTargetAtTime(0, now, 0.1);
            osc.stop(now + 0.2);
        } catch (e) {
            // ignore
        }
    });
    this.ambientOscillators = [];
    if (this.ambientInterval) {
        clearInterval(this.ambientInterval);
        this.ambientInterval = null;
    }
  }

  public startAmbient(isSprint: boolean) {
    this.stopAmbient(); // Stop previous
    const ctx = this.getContext();

    if (isSprint) {
        // High Tension Drone (Throbbing Sawtooth)
        // Helps keep cadence high
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc1.frequency.value = 100; // Low bass drone
        
        // Tremolo effect (Volume modulation)
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 4; // 4Hz throb (fast)
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.05; // Depth of modulation
        
        // Connect LFO
        lfo.connect(lfoGain);
        lfoGain.connect(gain1.gain);

        gain1.gain.value = 0.08; // Base volume (low but audible)
        
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        
        osc1.start();
        lfo.start();
        
        this.ambientOscillators.push({ osc: osc1, gain: gain1 });
        this.ambientOscillators.push({ osc: lfo, gain: lfoGain });

    } else {
        // Calm Ambient (Binaural beats / Ocean feel)
        const createDrone = (freq: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.value = 0.15;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            return { osc, gain };
        };

        // Two sine waves slightly detuned to create a slow beat (Relaxation)
        this.ambientOscillators.push(createDrone(150));
        this.ambientOscillators.push(createDrone(152)); // 2Hz beat
    }
  }
}

export const audioService = new AudioService();