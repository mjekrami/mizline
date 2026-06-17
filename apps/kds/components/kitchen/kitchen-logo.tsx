import {
  kitchenLogoWordmarkClassName,
  MIZLINE_WORDMARK,
} from "@/lib/kitchen/brand";

export function KitchenLogo() {
  return (
    <span className={kitchenLogoWordmarkClassName} aria-label={MIZLINE_WORDMARK}>
      {MIZLINE_WORDMARK}
    </span>
  );
}
