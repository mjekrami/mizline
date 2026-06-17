import { playTone } from "@/lib/audio/play-tone";

export function playNewOrderAlert() {
  playTone(880, 0.35, 0.08);
}

export function playDelayAlert() {
  playTone(440, 0.55, 0.1);
  window.setTimeout(() => playTone(520, 0.45, 0.08), 180);
}
