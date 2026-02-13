import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ewright412.clinch',
  appName: 'Clinch',
  webDir: 'out',
  server: {
    url: 'https://mma-track-jlno.vercel.app',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
    StatusBar: {
      style: 'dark' as const,
    },
  },
};

export default config;
