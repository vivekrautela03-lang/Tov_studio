import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tovstudio.app',
  appName: 'TOV Studio',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
