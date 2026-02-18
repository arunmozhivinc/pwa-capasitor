import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.socialauth",
  appName: "Social Auth Demo",
  webDir: "out",
  server: {
    // For development, point to your Next.js server
    // Comment this out for production builds
    url: "http://192.168.1.36:3000", // Your local IP - phone must be on same WiFi
    cleartext: true,
  },
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "1000532101675-q428o8uq4hhdjapa8pd7pfm39vi63h69.apps.googleusercontent.com",
      iosClientId: process.env.GOOGLE_IOS_CLIENT_ID || "1000532101675-rt4ivfqhk0duh3upt1n0ael282pk17jt.apps.googleusercontent.com", // Create iOS OAuth client ID in Google Cloud Console
      forceCodeForRefreshToken: true,
    },
    /* FacebookLogin: {
      appId: "1611343776964846",
      permissions: ["email", "public_profile"],
    },
    (Facebook login disabled temporarily - re-enable when adding plugin back) */
  },
  android: {
    buildOptions: {
      keystorePath: "release.keystore",
      keystoreAlias: "release",
    },
  },
};

export default config;
