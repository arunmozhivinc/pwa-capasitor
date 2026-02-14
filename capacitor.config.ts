import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.socialauth",
  appName: "Social Auth Demo",
  webDir: "out",
  server: {
    // For development, point to your Next.js server
    // Comment this out for production builds
    url: "http://192.168.1.22:3001", // Your local IP - phone must be on same WiFi
    cleartext: true,
  },
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "1000532101675-q428o8uq4hhdjapa8pd7pfm39vi63h69.apps.googleusercontent.com",
      forceCodeForRefreshToken: true,
    },
    FacebookLogin: {
      appId: "1611343776964846",
      permissions: ["email", "public_profile"],
    },
  },
  android: {
    buildOptions: {
      keystorePath: "release.keystore",
      keystoreAlias: "release",
    },
  },
};

export default config;
