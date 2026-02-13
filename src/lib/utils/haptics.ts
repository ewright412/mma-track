import { Capacitor } from '@capacitor/core';

let Haptics: typeof import('@capacitor/haptics').Haptics | null = null;
let ImpactStyle: typeof import('@capacitor/haptics').ImpactStyle | null = null;

// Lazy load haptics only on native
if (Capacitor.isNativePlatform()) {
  import('@capacitor/haptics').then((mod) => {
    Haptics = mod.Haptics;
    ImpactStyle = mod.ImpactStyle;
  }).catch(() => {
    // @capacitor/haptics not installed, ignore
  });
}

export function hapticLight() {
  if (Haptics && ImpactStyle) {
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
  }
}

export function hapticMedium() {
  if (Haptics && ImpactStyle) {
    Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
  }
}
