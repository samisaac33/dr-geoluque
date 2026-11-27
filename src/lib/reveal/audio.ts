import { DRAMATIC_FINALE_MS } from "./timing";

/** Motor de audio sintetizado para latidos y celebración (Web Audio API). */
export class RevealAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  private suspenseTimers: number[] = [];
  private suspenseOscillators: OscillatorNode[] = [];
  private revealVoiceOscillators: OscillatorNode[] = [];
  private countdownActive = false;
  private bpm = 72;
  private keepAliveOsc: OscillatorNode | null = null;
  private lifecycleBound = false;
  private resumeWatchId: number | null = null;
  private sustainWatchId: number | null = null;

  /** Volumen pensado para TV / proyector (sube el master moderadamente). */
  private readonly masterLevel = 1;

  private bindLifecycle() {
    if (this.lifecycleBound || typeof window === "undefined") return;
    this.lifecycleBound = true;
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.primeFromUserGesture();
      }
    });
    window.addEventListener("pageshow", () => {
      this.primeFromUserGesture();
    });
  }

  private createContext(): AudioContext {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) throw new Error("Web Audio no disponible");
    const ctx = new Ctx();
    const masterGain = ctx.createGain();
    masterGain.gain.value = this.masterLevel;
    masterGain.connect(ctx.destination);
    this.ctx = ctx;
    this.masterGain = masterGain;
    return ctx;
  }

  /** Buffer mínimo hacia destination (Safari/iOS). */
  private playSilentUnlock(ctx: AudioContext) {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const g = ctx.createGain();
    g.gain.value = 0.00001;
    src.connect(g);
    g.connect(ctx.destination);
    src.start(0);
    src.stop(ctx.currentTime + 0.02);
  }

  /**
   * Micro‑tono audible por el bus principal: iOS a veces ignora buffers “vacíos”.
   */
  private playPrimeBlip(ctx: AudioContext) {
    const master = this.masterGain;
    if (!master) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(196, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.028, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);
    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  private startKeepAlive(ctx: AudioContext) {
    if (this.keepAliveOsc || !this.masterGain) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    g.gain.value = 0.0008;
    osc.frequency.value = 1;
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start();
    this.keepAliveOsc = osc;
  }

  private startResumeWatch() {
    if (this.resumeWatchId) return;
    this.resumeWatchId = window.setInterval(() => {
      if (!this.ctx || this.ctx.state !== "suspended") return;
      void this.ctx.resume();
    }, 350);
  }

  private ensureRunning(): void {
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
  }

  private async resumeWithTimeout(
    ctx: AudioContext,
    timeoutMs = 2_500,
  ): Promise<void> {
    if (ctx.state === "running") return;
    await Promise.race([
      ctx.resume().catch(() => undefined),
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, timeoutMs);
      }),
    ]);
  }

  /**
   * Llamar **sincrónicamente** en pointerdown / click (mismo tick del gesto).
   */
  primeFromUserGesture(): void {
    if (typeof window === "undefined") return;
    this.bindLifecycle();
    const ctx = this.ctx ?? this.createContext();
    try {
      this.playSilentUnlock(ctx);
      this.playPrimeBlip(ctx);
    } catch {
      /* ignorar */
    }
    void ctx.resume();
    this.startKeepAlive(ctx);
    this.startResumeWatch();
    try {
      sessionStorage.setItem("reveal-audio-unlocked", "1");
    } catch {
      /* modo privado */
    }
  }

  /**
   * Desbloqueo asíncrono (complementa primeFromUserGesture).
   */
  async unlock(): Promise<AudioContext> {
    if (typeof window === "undefined") {
      throw new Error("Web Audio no disponible");
    }
    this.primeFromUserGesture();
    const ctx = this.ctx ?? this.createContext();
    await this.resumeWithTimeout(ctx);
    return ctx;
  }

  async ensureContext(): Promise<AudioContext> {
    return this.unlock();
  }

  /** Reanuda el bus antes de sonidos programados (sin gesto del usuario). */
  async prepareForPlayback(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    const ctx = await this.unlock();
    await this.resumeWithTimeout(ctx);
    this.ensureRunning();
    return ctx.state === "running";
  }

  /**
   * Mantiene el contexto activo durante la revelación (proyección / TV).
   * Llamar al entrar en fase «reveal» tras el último toque en los sensores.
   */
  sustainSession() {
    if (typeof window === "undefined") return;
    void this.prepareForPlayback();
    this.startResumeWatch();
    if (this.sustainWatchId) return;
    this.sustainWatchId = window.setInterval(() => {
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") {
        void this.ctx.resume();
      }
    }, 800);
  }

  endSustainSession() {
    if (this.sustainWatchId) {
      clearInterval(this.sustainWatchId);
      this.sustainWatchId = null;
    }
  }

  private schedule(fn: () => void, delayMs: number) {
    const id = window.setTimeout(fn, delayMs);
    this.suspenseTimers.push(id);
  }

  private scheduleAudio(fn: () => void, delayMs: number) {
    this.schedule(() => {
      void this.prepareForPlayback().then((ok) => {
        if (ok) fn();
        else {
          this.ensureRunning();
          fn();
        }
      });
    }, delayMs);
  }

  private stopSuspenseSequence() {
    for (const id of this.suspenseTimers) clearTimeout(id);
    this.suspenseTimers = [];
    for (const osc of this.suspenseOscillators) {
      try {
        osc.stop();
      } catch {
        /* ya detenido */
      }
    }
    this.suspenseOscillators = [];
  }

  private trackRevealVoice(osc: OscillatorNode) {
    this.revealVoiceOscillators.push(osc);
    return osc;
  }

  stopRevealVoices() {
    for (const osc of this.revealVoiceOscillators) {
      try {
        osc.stop();
      } catch {
        /* ya detenido */
      }
    }
    this.revealVoiceOscillators = [];
  }

  /**
   * Pulso corto al alternar celeste / rosado en el «juego de colores».
   */
  playGenderTeasePulse(tint: "boy" | "girl") {
    this.ensureRunning();
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const master = this.masterGain;
    const t = ctx.currentTime;
    const isBoy = tint === "boy";

    const swoosh = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.22), ctx.sampleRate);
    const swooshData = swoosh.getChannelData(0);
    for (let i = 0; i < swooshData.length; i++) {
      swooshData[i] = (Math.random() * 2 - 1) * (1 - i / swooshData.length);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = swoosh;
    const nFilt = ctx.createBiquadFilter();
    nFilt.type = "bandpass";
    nFilt.frequency.setValueAtTime(isBoy ? 2400 : 1800, t);
    nFilt.Q.value = isBoy ? 2.2 : 1.8;
    const nG = ctx.createGain();
    nG.gain.setValueAtTime(0.0001, t);
    nG.gain.exponentialRampToValueAtTime(isBoy ? 0.11 : 0.1, t + 0.03);
    nG.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    noise.connect(nFilt);
    nFilt.connect(nG);
    nG.connect(master);
    noise.start(t);
    noise.stop(t + 0.22);

    const ping = this.trackRevealVoice(ctx.createOscillator());
    const pingG = ctx.createGain();
    ping.type = "sine";
    const f0 = isBoy ? 587.33 : 523.25;
    const f1 = isBoy ? 880 : 783.99;
    ping.frequency.setValueAtTime(f0, t);
    ping.frequency.exponentialRampToValueAtTime(f1, t + 0.14);
    pingG.gain.setValueAtTime(0.0001, t);
    pingG.gain.exponentialRampToValueAtTime(isBoy ? 0.16 : 0.15, t + 0.02);
    pingG.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    ping.connect(pingG);
    pingG.connect(master);
    ping.start(t);
    ping.stop(t + 0.3);

    const chime = this.trackRevealVoice(ctx.createOscillator());
    const chimeG = ctx.createGain();
    chime.type = "triangle";
    chime.frequency.value = isBoy ? 1174.66 : 1046.5;
    chimeG.gain.setValueAtTime(0.0001, t + 0.04);
    chimeG.gain.exponentialRampToValueAtTime(0.06, t + 0.07);
    chimeG.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    chime.connect(chimeG);
    chimeG.connect(master);
    chime.start(t + 0.04);
    chime.stop(t + 0.35);
  }

  /**
   * Música breve e inspiradora al fijarse el resultado (niño / niña).
   */
  async playInspirationalReveal(isBoy: boolean) {
    await this.prepareForPlayback();
    this.stopRevealVoices();
    this.ensureRunning();
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const master = this.masterGain;
    const t = ctx.currentTime;

    const padFreqs = isBoy
      ? [293.66, 369.99, 440.0]
      : [349.23, 440.0, 523.25];
    const melody = isBoy
      ? [293.66, 369.99, 440.0, 493.88, 587.33, 440.0, 369.99, 587.33, 659.25, 739.99]
      : [349.23, 440.0, 523.25, 587.33, 698.46, 523.25, 440.0, 698.46, 783.99, 880.0];
    const noteDur = 0.42;
    const melodyStart = t + 0.35;

    padFreqs.forEach((freq, i) => {
      const osc = this.trackRevealVoice(ctx.createOscillator());
      const g = ctx.createGain();
      osc.type = i === 0 ? "triangle" : "sine";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.07 - i * 0.012, t + 0.9);
      g.gain.exponentialRampToValueAtTime(0.05 - i * 0.008, t + 5.5);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 8.2);
      osc.connect(g);
      g.connect(master);
      osc.start(t);
      osc.stop(t + 8.4);
    });

    melody.forEach((freq, i) => {
      const at = melodyStart + i * noteDur;
      const osc = this.trackRevealVoice(ctx.createOscillator());
      const g = ctx.createGain();
      osc.type = i === melody.length - 1 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, at);
      const peak = i === melody.length - 1 ? 0.22 : 0.14 - (i % 3) * 0.01;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(peak, at + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, at + noteDur * 0.92);
      osc.connect(g);
      g.connect(master);
      osc.start(at);
      osc.stop(at + noteDur);
    });

    const rise = this.trackRevealVoice(ctx.createOscillator());
    const riseG = ctx.createGain();
    const riseFilt = ctx.createBiquadFilter();
    rise.type = "sawtooth";
    rise.frequency.setValueAtTime(isBoy ? 220 : 196, t);
    rise.frequency.exponentialRampToValueAtTime(isBoy ? 659.25 : 587.33, t + 6.5);
    riseFilt.type = "lowpass";
    riseFilt.frequency.setValueAtTime(400, t);
    riseFilt.frequency.exponentialRampToValueAtTime(2800, t + 5.8);
    riseG.gain.setValueAtTime(0.0001, t);
    riseG.gain.exponentialRampToValueAtTime(0.04, t + 2.2);
    riseG.gain.exponentialRampToValueAtTime(0.0001, t + 7.8);
    rise.connect(riseFilt);
    riseFilt.connect(riseG);
    riseG.connect(master);
    rise.start(t);
    rise.stop(t + 8);

    const bloom = this.trackRevealVoice(ctx.createOscillator());
    const bloomG = ctx.createGain();
    bloom.type = "sine";
    bloom.frequency.value = isBoy ? 587.33 : 523.25;
    bloomG.gain.setValueAtTime(0.0001, t + 4.2);
    bloomG.gain.exponentialRampToValueAtTime(0.18, t + 4.35);
    bloomG.gain.exponentialRampToValueAtTime(0.0001, t + 7.5);
    bloom.connect(bloomG);
    bloomG.connect(master);
    bloom.start(t + 4.2);
    bloom.stop(t + 7.6);
  }

  private playLubDub(intensity = 1) {
    this.ensureRunning();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === "suspended") return;
    const t = this.ctx.currentTime;
    const master = this.masterGain;
    const amp = intensity * 1.15;

    const playTone = (
      freq: number,
      start: number,
      duration: number,
      type: OscillatorType,
      gain: number,
    ) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(gain * amp, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(g);
      g.connect(master);
      osc.start(start);
      osc.stop(start + duration + 0.06);
    };

    playTone(58, t, 0.16, "sine", 0.62);
    playTone(42, t + 0.12, 0.2, "triangle", 0.52);
    playTone(82, t + 0.3, 0.08, "sine", 0.26);
  }

  startHeartbeatCountdown(
    durationSec: number,
    onTick?: (secondsLeft: number) => void,
  ) {
    void this.unlock().then(() => {
      this.stopHeartbeat();
      this.countdownActive = true;
      const startBpm = 72;
      const endBpm = 132;
      const startTime = performance.now();

      const tick = () => {
        if (!this.countdownActive) return;
        this.ensureRunning();
        const elapsed = (performance.now() - startTime) / 1000;
        const progress = Math.min(1, elapsed / durationSec);
        this.bpm = startBpm + (endBpm - startBpm) * progress;
        const intervalMs = 60000 / this.bpm;

        const secondsLeft = Math.ceil(durationSec - elapsed);
        if (secondsLeft >= 0) onTick?.(secondsLeft);

        this.playLubDub(0.75 + progress * 0.55);

        if (elapsed >= durationSec) {
          this.countdownActive = false;
          return;
        }
        this.heartbeatTimer = setTimeout(tick, intervalMs);
      };

      tick();
    });
  }

  stopCountdownPulse() {
    this.countdownActive = false;
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  stopHeartbeat() {
    this.stopCountdownPulse();
    this.stopSuspenseSequence();
  }

  private playLowDrone(swellSec = 9) {
    this.ensureRunning();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const lfo = this.ctx.createOscillator();
    const lfoG = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(48, t);
    osc.frequency.linearRampToValueAtTime(62, t + swellSec);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + swellSec * 0.85);
    g.gain.exponentialRampToValueAtTime(0.0001, t + swellSec + 0.4);

    lfo.type = "sine";
    lfo.frequency.value = 0.35;
    lfoG.gain.value = 12;
    lfo.connect(lfoG);
    lfoG.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + swellSec + 1);

    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + swellSec + 0.5);
    this.suspenseOscillators.push(osc, lfo);
  }

  private playRiser(durationSec = 4.5) {
    this.ensureRunning();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(640, t + durationSec * 0.92);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(280, t);
    filter.frequency.exponentialRampToValueAtTime(2200, t + durationSec);
    filter.Q.value = 4;

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + durationSec * 0.75);
    g.gain.exponentialRampToValueAtTime(0.0001, t + durationSec);

    osc.connect(filter);
    filter.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + durationSec + 0.05);
    this.suspenseOscillators.push(osc);
  }

  private playScanBeep(atOffset = 0) {
    this.ensureRunning();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime + atOffset;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1320, t + 0.08);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playFinalHeartbeat(intensity = 1.55) {
    this.ensureRunning();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const master = this.masterGain;

    const thump = (
      freq: number,
      at: number,
      dur: number,
      gain: number,
      type: OscillatorType = "sine",
    ) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, at);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.68, at + dur * 0.88);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(gain * intensity, at + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      osc.connect(g);
      g.connect(master);
      osc.start(at);
      osc.stop(at + dur + 0.08);
    };

    thump(50, t, 0.22, 0.85);
    thump(36, t + 0.15, 0.24, 0.75, "triangle");
    thump(68, t + 0.36, 0.1, 0.32 * intensity);
  }

  playRevealImpact() {
    this.ensureRunning();
    if (!this.ctx || !this.masterGain) return;
    const t = this.ctx.currentTime;
    const master = this.masterGain;

    const boom = this.ctx.createOscillator();
    const boomG = this.ctx.createGain();
    boom.type = "sine";
    boom.frequency.setValueAtTime(52, t);
    boom.frequency.exponentialRampToValueAtTime(28, t + 0.5);
    boomG.gain.setValueAtTime(0.0001, t);
    boomG.gain.exponentialRampToValueAtTime(0.55, t + 0.02);
    boomG.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
    boom.connect(boomG);
    boomG.connect(master);
    boom.start(t);
    boom.stop(t + 0.7);

    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const nG = this.ctx.createGain();
    const filt = this.ctx.createBiquadFilter();
    filt.type = "highpass";
    filt.frequency.value = 1200;
    nG.gain.setValueAtTime(0.0001, t);
    nG.gain.exponentialRampToValueAtTime(0.2, t + 0.01);
    nG.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    noise.connect(filt);
    filt.connect(nG);
    nG.connect(master);
    noise.start(t);
    noise.stop(t + 0.3);
  }

  runDramaticFinale(onReveal: () => void) {
    void this.unlock().then(() => {
      this.stopCountdownPulse();
      this.stopSuspenseSequence();

      this.scheduleAudio(() => this.playLowDrone(10), 1_400);

      [2_200, 4_000, 5_800].forEach((ms) => {
        this.scheduleAudio(() => this.playLubDub(0.55), ms);
      });

      this.scheduleAudio(() => {
        [0, 320, 640].forEach((o) => this.playScanBeep(o));
      }, 6_500);

      this.scheduleAudio(() => this.playRiser(5), 7_000);

      [9_200, 9_900, 10_500].forEach((ms) => {
        this.scheduleAudio(() => this.playLubDub(0.85), ms);
      });

      this.scheduleAudio(() => this.playFinalHeartbeat(1.35), 11_400);
      this.scheduleAudio(() => this.playFinalHeartbeat(1.65), 12_400);

      this.scheduleAudio(() => {
        this.playRevealImpact();
        window.setTimeout(() => onReveal(), 280);
      }, 13_200);
    });
  }

  get dramaticFinaleMs() {
    return DRAMATIC_FINALE_MS;
  }

  async playCelebration(isBoy: boolean) {
    await this.prepareForPlayback();
    const ctx = this.ctx;
    this.ensureRunning();
    const master = this.masterGain;
    if (!ctx || !master || ctx.state === "suspended") return;
    const t = ctx.currentTime;

    const boom = ctx.createOscillator();
    const boomG = ctx.createGain();
    boom.type = "triangle";
    boom.frequency.setValueAtTime(isBoy ? 98 : 110, t);
    boomG.gain.setValueAtTime(0.0001, t);
    boomG.gain.exponentialRampToValueAtTime(0.28, t + 0.04);
    boomG.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    boom.connect(boomG);
    boomG.connect(master);
    boom.start(t);
    boom.stop(t + 0.5);
  }
}

export const revealAudio = new RevealAudioEngine();