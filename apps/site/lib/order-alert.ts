export function playNewOrderAlert() {
  playTone(880, 0.35, 0.08);
}

export function playDelayAlert() {
  playTone(440, 0.55, 0.1);
  window.setTimeout(() => playTone(520, 0.45, 0.08), 180);
}

function playTone(frequency: number, duration: number, volume: number) {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
    oscillator.onended = () => {
      void context.close();
    };
  } catch {
    // Audio may be blocked until user interaction.
  }
}
