import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rowing.intervals',
  appName: 'RowingIntervals',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;