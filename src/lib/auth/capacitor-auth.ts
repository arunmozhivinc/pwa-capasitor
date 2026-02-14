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
        clientId: "1000532101675-q428o8uq4hhdjapa8pd7pfm39vi63h69.apps.googleusercontent.com",
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
  if (!Capacitor.isNativePlatform()) {
    return {
      success: false,
      provider: "facebook",
      token: "",
      error: "Facebook Login is only available on native platforms",
    };
  }

  try {
    const { FacebookLogin } = await import("@capacitor-community/facebook-login");

    const result = await FacebookLogin.login({
      permissions: ["email", "public_profile"],
    });

    if (!result.accessToken) {
      return {
        success: false,
        provider: "facebook",
        token: "",
        error: "Facebook login was cancelled or failed",
      };
    }

    return {
      success: true,
      provider: "facebook",
      token: result.accessToken.token,
    };
  } catch (error) {
    console.error("Facebook login error:", error);
    return {
      success: false,
      provider: "facebook",
      token: "",
      error: error instanceof Error ? error.message : "Facebook login failed",
    };
  }
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
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { FacebookLogin } = await import("@capacitor-community/facebook-login");
    await FacebookLogin.logout();
  } catch (error) {
    console.error("Facebook sign-out error:", error);
  }
}

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export function getPlatform(): string {
  return Capacitor.getPlatform();
}
