"use client";

import { Capacitor } from "@capacitor/core";

interface SocialLoginResult {
  success: boolean;
  provider: "google" | "facebook";
  token: string;
  error?: string;
}

let googleAuthInitialized = false;

export async function signInWithGoogle(): Promise<SocialLoginResult> {
  if (!Capacitor.isNativePlatform()) {
    return {
      success: false,
      provider: "google",
      token: "",
      error: "Google Sign-In is only available on native platforms",
    };
  }

  try {
    const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");

    // Initialize GoogleAuth if not already done
    if (!googleAuthInitialized) {
      await GoogleAuth.initialize({
        scopes: ["profile", "email"],
        grantOfflineAccess: true,
      });
      googleAuthInitialized = true;
    }

    const result = await GoogleAuth.signIn();

    return {
      success: true,
      provider: "google",
      token: result.authentication.idToken,
    };
  } catch (error) {
    console.error("Google sign-in error:", error);
    return {
      success: false,
      provider: "google",
      token: "",
      error: error instanceof Error ? error.message : "Google sign-in failed",
    };
  }
}

export async function signInWithFacebook(): Promise<SocialLoginResult> {
  return {
    success: false,
    provider: "facebook",
    token: "",
    error: "Facebook login is disabled in this build. Re-enable the plugin to use it.",
  };
}

export async function signOutFromGoogle(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");
    await GoogleAuth.signOut();
  } catch (error) {
    console.error("Google sign-out error:", error);
  }
}

export async function signOutFromFacebook(): Promise<void> {
  // Facebook logout disabled while the plugin is removed.
  return;
}

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export function getPlatform(): string {
  return Capacitor.getPlatform();
}
