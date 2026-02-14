# Social Auth Demo - Setup Guide

This guide walks you through setting up the social authentication demo app with Google and Facebook login for a Capacitor Android app.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Capacitor Android App                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Native SDK Layer                          │ │
│  │  ┌─────────────────────┐  ┌──────────────────────────────┐ │ │
│  │  │ Google Sign-In SDK  │  │ Facebook Login SDK           │ │ │
│  │  │ (capacitor-google-  │  │ (@capacitor-community/       │ │ │
│  │  │  auth)              │  │  facebook-login)             │ │ │
│  │  └─────────┬───────────┘  └──────────────┬───────────────┘ │ │
│  │            │ idToken                     │ accessToken     │ │
│  │            └──────────────┬──────────────┘                 │ │
│  └───────────────────────────┼────────────────────────────────┘ │
│                              │                                   │
│  ┌───────────────────────────▼────────────────────────────────┐ │
│  │                    WebView (Next.js)                        │ │
│  │  POST /api/auth/callback/credentials                        │ │
│  │  { provider: "google"|"facebook", token: "..." }            │ │
│  └───────────────────────────┬────────────────────────────────┘ │
└──────────────────────────────┼──────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Next.js Backend                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ NextAuth Credentials Provider                               │  │
│  │                                                             │  │
│  │  1. Receive token from mobile app                           │  │
│  │  2. Verify with Google/Facebook API                         │  │
│  │  3. Create/update user in PostgreSQL                        │  │
│  │  4. Issue JWT session token                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Android Studio (for building APK)
- JDK 17+

## Step 1: Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Configure the variables in `.env`:
```bash
# Database - Update with your PostgreSQL credentials
DATABASE_URL=postgresql://postgres:password@localhost:5432/socialauth

# NextAuth - Generate a secret
AUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Facebook OAuth (get from Facebook Developer Console)
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
```

## Step 2: Google OAuth Setup

### 2.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** (or Google Identity)

### 2.2 Configure OAuth Consent Screen

1. Navigate to **APIs & Services > OAuth consent screen**
2. Select **External** user type
3. Fill in the required information:
   - App name: `Social Auth Demo`
   - User support email: your email
   - Developer contact email: your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users if in testing mode

### 2.3 Create OAuth Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Create **TWO** credentials:

**Web Application (for backend verification):**
- Application type: Web application
- Name: `Social Auth Web`
- Authorized JavaScript origins: `http://localhost:3000`
- Copy the **Client ID** → `GOOGLE_CLIENT_ID` in `.env`
- Copy the **Client Secret** → `GOOGLE_CLIENT_SECRET` in `.env`

**Android Application (for native SDK):**
- Application type: Android
- Name: `Social Auth Android`
- Package name: `com.example.socialauth`
- SHA-1 certificate fingerprint: (see below)

### 2.4 Get SHA-1 Fingerprint

For debug builds:
```bash
cd android
./gradlew signingReport
```

Look for the `SHA1` value under `Variant: debug`.

For release builds, use your release keystore:
```bash
keytool -list -v -keystore release.keystore -alias release
```

### 2.5 Update Capacitor Config

Edit `capacitor.config.ts`:
```typescript
plugins: {
  GoogleAuth: {
    scopes: ["profile", "email"],
    serverClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com", // Web Client ID
    forceCodeForRefreshToken: true,
  },
  // ...
}
```

## Step 3: Facebook OAuth Setup

### 3.1 Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps > Create App**
3. Select **Consumer** app type
4. Fill in app details

### 3.2 Configure Facebook Login

1. In your app dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Select **Android** platform
4. Skip the SDK setup steps (we use Capacitor plugin)

### 3.3 Get App Credentials

1. Go to **Settings > Basic**
2. Copy **App ID** → `FACEBOOK_APP_ID` in `.env`
3. Copy **App Secret** → `FACEBOOK_APP_SECRET` in `.env`
4. Copy **Client Token** (under Settings > Advanced) 330f158098e7b315855d15a6bfa11767

### 3.4 Add Android Platform

1. In **Settings > Basic**, scroll to **Add Platform**
2. Select **Android**
3. Fill in:
   - Package name: `com.example.socialauth`
   - Class name: `com.example.socialauth.MainActivity`
   - Key hashes: (see below)

### 3.5 Generate Key Hash

For debug:
```bash
# Windows
keytool -exportcert -alias androiddebugkey -keystore %USERPROFILE%\.android\debug.keystore | openssl sha1 -binary | openssl base64

# Mac/Linux
keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
```

Default debug keystore password: `android`

### 3.6 Update Android Configuration

Edit `android/app/src/main/res/values/strings.xml`:
```xml
<string name="facebook_app_id">YOUR_FACEBOOK_APP_ID</string>
<string name="facebook_client_token">YOUR_FACEBOOK_CLIENT_TOKEN</string>
<string name="fb_login_protocol_scheme">fbYOUR_FACEBOOK_APP_ID</string>
```

### 3.7 Update Capacitor Config

Edit `capacitor.config.ts`:
```typescript
plugins: {
  // ...
  FacebookLogin: {
    appId: "YOUR_FACEBOOK_APP_ID",
    permissions: ["email", "public_profile"],
  },
}
```

## Step 4: Database Setup

1. Create the PostgreSQL database:
```sql
CREATE DATABASE socialauth;
```

2. The tables will be created automatically when you start the app (Sequelize sync).

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Run Development Server

1. Start the Next.js server:
```bash
npm run dev
```

2. The server will be available at `http://localhost:3000`

## Step 7: Build and Run Android App

### 7.1 Sync Capacitor

```bash
npx cap sync android
```

### 7.2 Open in Android Studio

```bash
npx cap open android
```

### 7.3 Run on Emulator or Device

- In Android Studio, select a device/emulator
- Click the **Run** button

**Note:** For emulator, the app connects to `http://10.0.2.2:3000` (maps to host localhost).

## Step 8: Build Release APK

### 8.1 Generate Keystore

```bash
keytool -genkey -v -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
```

### 8.2 Configure Signing

1. Copy keystore properties example:
```bash
cp android/keystore.properties.example android/keystore.properties
```

2. Edit `android/keystore.properties`:
```properties
storeFile=../release.keystore
storePassword=your_keystore_password
keyAlias=release
keyPassword=your_key_password
```

### 8.3 Build Release APK

```bash
cd android
./gradlew assembleRelease
```

The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Production Deployment

For production:

1. Deploy the Next.js app to your server (Vercel, AWS, etc.)
2. Update `capacitor.config.ts` to point to your production URL:
```typescript
server: {
  url: "https://your-production-domain.com",
  // Remove cleartext: true for production
}
```

3. Update OAuth redirect URIs in Google/Facebook consoles
4. Rebuild the Android app with `npx cap sync && cd android && ./gradlew assembleRelease`

## Troubleshooting

### Google Sign-In Error 10

- Ensure the SHA-1 fingerprint matches your keystore
- Verify the Web Client ID is set correctly in `capacitor.config.ts`
- Check that the Android Client ID has the correct package name

### Facebook Login Error

- Verify the App ID and Client Token in `strings.xml`
- Ensure the key hash is added to Facebook Developer Console
- Check that the app is in "Live" mode (not Development) for production

### Network Error on Emulator

- Ensure `cleartext: true` is set in `capacitor.config.ts`
- Check that the network security config allows 10.0.2.2
- Verify the Next.js server is running on port 3000

### Database Connection Error

- Verify PostgreSQL is running
- Check the `DATABASE_URL` in `.env`
- Ensure the database exists

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── [...nextauth]/route.ts  # NextAuth handlers
│   │   │       └── logout-everywhere/route.ts
│   │   ├── login/page.tsx                   # Login page
│   │   └── page.tsx                         # Landing page
│   ├── components/
│   │   └── LogoutButton.tsx
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── auth.config.ts              # NextAuth config
│   │   │   ├── auth.ts                     # NextAuth exports
│   │   │   ├── capacitor-auth.ts           # Native SDK wrappers
│   │   │   └── verify-tokens.ts            # Token verification
│   │   └── db/
│   │       ├── models/
│   │       │   ├── User.ts                 # User model
│   │       │   └── index.ts
│   │       └── sequelize.ts                # DB connection
│   └── types/
│       └── capacitor-plugins.d.ts          # Plugin types
├── android/                                 # Capacitor Android project
├── capacitor.config.ts                      # Capacitor configuration
├── .env.example                             # Environment template
└── SETUP.md                                 # This file
```
