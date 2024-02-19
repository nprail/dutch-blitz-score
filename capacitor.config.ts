import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.noahprail.blitzscore',
  appName: 'Blitz Score',
  webDir: 'build',
  android: {
    buildOptions: {
      keystoreAlias: 'blitz',
      keystorePassword: process.env.BLITZ_APP_KEYSTORE_PASS,
      keystoreAliasPassword: process.env.BLITZ_APP_KEYSTORE_PASS,
      keystorePath: process.env.BLITZ_APP_KEYSTORE_PATH,
    },
  },
}

export default config
