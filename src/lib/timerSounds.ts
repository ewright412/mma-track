let audioContext: AudioContext | null = null;
let unlocked = false;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Must be called from a user gesture (tap/click) to unlock AudioContext on iOS.
 */
export function unlockAudio(): void {
  if (unlocked) return;
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  // Play a silent buffer to unlock
  const buffer = ctx.createBuffer(1, 1, 22050);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
  unlocked = true;
}

function playTone(frequency: number, durationMs: number, volume = 0.3): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // Audio not available
  }
}

/** Short beep for 10-second warning countdown */
export function playWarningBeep(): void {
  playTone(800, 150, 0.3);
}

/** Long beep for round end */
export function playLongBeep(): void {
  playTone(600, 800, 0.4);
}

/** Triple beep for round start */
export function playTripleBeep(): void {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  [0, 200, 400].forEach((delay) => {
    setTimeout(() => playTone(1000, 150, 0.35), delay);
  });
}

/** Double beep for interval transition */
export function playDoubleBeep(): void {
  playTone(900, 150, 0.3);
  setTimeout(() => playTone(900, 150, 0.3), 200);
}
