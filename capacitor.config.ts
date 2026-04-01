import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'at.austrofit.app',
  appName: 'AustroFit',
  webDir: 'build',
  server: {
    // Live Server Mode: Native App lädt UI vom deployten Server.
    // Testing:    https://dev.austrofit.at  (dev branch)
    // Production: https://austrofit.at      (main branch)
    url: 'https://dev.austrofit.at',
    cleartext: false
  },
  plugins: {
    StatusBar: {
      // LIGHT = dunkle Icons → lesbar auf hellem Hintergrund (#F0FBF1 Navbar)
      style: 'LIGHT',
      backgroundColor: '#F0FBF1'
    }
  }
};

export default config;
