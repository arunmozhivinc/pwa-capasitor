declare module "@codetrix-studio/capacitor-google-auth" {
  export interface GoogleAuthPlugin {
    signIn(): Promise<{
      email: string;
      familyName: string;
      givenName: string;
      id: string;
      imageUrl: string;
      name: string;
      authentication: {
        accessToken: string;
        idToken: string;
        refreshToken?: string;
      };
    }>;
    signOut(): Promise<void>;
    refresh(): Promise<{
      accessToken: string;
      idToken: string;
      refreshToken?: string;
    }>;
    initialize(options?: {
      clientId?: string;
      scopes?: string[];
      grantOfflineAccess?: boolean;
    }): Promise<void>;
  }

  export const GoogleAuth: GoogleAuthPlugin;
}
/* Facebook plugin types commented out while plugin is removed
declare module "@capacitor-community/facebook-login" {
  export interface FacebookLoginPlugin {
    login(options: {
      permissions: string[];
    }): Promise<{
      accessToken: {
        token: string;
        userId: string;
        applicationId: string;
        declinedPermissions: string[];
        expires: string;
        isExpired: boolean;
        lastRefresh: string;
        permissions: string[];
      } | null;
    }>;
    logout(): Promise<void>;
    getCurrentAccessToken(): Promise<{
      accessToken: {
        token: string;
        userId: string;
      } | null;
    }>;
    getProfile<T extends Record<string, unknown>>(options: {
      fields: string[];
    }): Promise<T>;
  }

  export const FacebookLogin: FacebookLoginPlugin;
}
*/
