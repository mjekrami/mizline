import { playTone } from "@/lib/audio/play-tone";

export function playWaiterBuzzAlert() {
  playTone(660, 0.2, 0.12, "sine");
  window.setTimeout(() => playTone(880, 0.25, 0.12, "sine"), 160);
  window.setTimeout(() => playTone(660, 0.2, 0.1, "sine"), 320);

  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate([200, 100, 200, 100, 300]);
  }
}
