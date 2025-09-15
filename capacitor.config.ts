import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zoxaa.cognipartner',
  appName: 'ZOXAA - AI Companion',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a1a",
      showSpinner: true,
      spinnerColor: "#8b5cf6"
    },
    App: {
      launchShowDuration: 0
    },
    Microphone: {
      NSMicrophoneUsageDescription: "ZOXAA needs microphone access to have voice conversations with you."
    }
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: "APK"
    }
  }
};

export default config;
