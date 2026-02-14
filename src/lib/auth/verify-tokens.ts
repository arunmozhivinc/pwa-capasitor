export interface GoogleUserInfo {
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  sub: string; // Google user ID
}

export interface FacebookUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface VerificationResult {
  success: boolean;
  provider: "google" | "facebook";
  providerId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  error?: string;
}

export async function verifyGoogleToken(idToken: string): Promise<VerificationResult> {
  try {
    // Verify the ID token with Google's tokeninfo endpoint
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        provider: "google",
        providerId: "",
        email: "",
        name: null,
        avatarUrl: null,
        error: `Google token verification failed: ${errorText}`,
      };
    }

    const data = (await response.json()) as GoogleUserInfo & { aud?: string };

    // Verify the token was issued for our app
    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && data.aud !== expectedClientId) {
      return {
        success: false,
        provider: "google",
        providerId: "",
        email: "",
        name: null,
        avatarUrl: null,
        error: "Token was not issued for this application",
      };
    }

    if (!data.email_verified) {
      return {
        success: false,
        provider: "google",
        providerId: "",
        email: "",
        name: null,
        avatarUrl: null,
        error: "Email not verified with Google",
      };
    }

    return {
      success: true,
      provider: "google",
      providerId: data.sub,
      email: data.email,
      name: data.name || null,
      avatarUrl: data.picture || null,
    };
  } catch (error) {
    return {
      success: false,
      provider: "google",
      providerId: "",
      email: "",
      name: null,
      avatarUrl: null,
      error: error instanceof Error ? error.message : "Unknown error verifying Google token",
    };
  }
}

export async function verifyFacebookToken(accessToken: string): Promise<VerificationResult> {
  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;

    if (!appId || !appSecret) {
      return {
        success: false,
        provider: "facebook",
        providerId: "",
        email: "",
        name: null,
        avatarUrl: null,
        error: "Facebook app credentials not configured",
      };
    }

    // First, verify the token is valid using debug_token endpoint
    const debugResponse = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(accessToken)}&access_token=${appId}|${appSecret}`
    );

    if (!debugResponse.ok) {
      const errorText = await debugResponse.text();
      return {
        success: false,
        provider: "facebook",
        providerId: "",
        email: "",
        name: null,
        avatarUrl: null,
        error: `Facebook token debug failed: ${errorText}`,
      };
    }

    const debugData = (await debugResponse.json()) as {
      data: {
        is_valid: boolean;
        app_id: string;
        user_id: string;
        error?: { message: string };
      };
    };

    if (!debugData.data.is_valid) {
      return {
        success: false,
        provider: "facebook",
        providerId: "",
        email: "",
        name: null,
        avatarUrl: null,
        error: debugData.data.error?.message || "Invalid Facebook token",
      };
    }

    // Verify the token was issued for our app
    if (debugData.data.app_id !== appId) {
      return {
        success: false,
        provider: "facebook",
        providerId: "",
        email: "",
        name: null,
        avatarUrl: null,
        error: "Token was not issued for this application",
      };
    }

    // Get user info using the access token
    const userResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,email,name,picture.type(large)&access_token=${encodeURIComponent(accessToken)}`
    );

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      return {
        success: false,
        provider: "facebook",
        providerId: "",
        email: "",
        name: null,
        avatarUrl: null,
        error: `Failed to fetch Facebook user info: ${errorText}`,
      };
    }

    const userData = (await userResponse.json()) as FacebookUserInfo;

    if (!userData.email) {
      return {
        success: false,
        provider: "facebook",
        providerId: "",
        email: "",
        name: null,
        avatarUrl: null,
        error: "Email permission not granted for Facebook account",
      };
    }

    return {
      success: true,
      provider: "facebook",
      providerId: userData.id,
      email: userData.email,
      name: userData.name || null,
      avatarUrl: userData.picture?.data?.url || null,
    };
  } catch (error) {
    return {
      success: false,
      provider: "facebook",
      providerId: "",
      email: "",
      name: null,
      avatarUrl: null,
      error: error instanceof Error ? error.message : "Unknown error verifying Facebook token",
    };
  }
}
