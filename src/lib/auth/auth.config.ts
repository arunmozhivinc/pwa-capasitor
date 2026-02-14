import type { NextAuthConfig, User as NextAuthUser, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { User } from "@/lib/db/models";
import { verifyGoogleToken, verifyFacebookToken } from "./verify-tokens";
import { initializeDatabase } from "@/lib/db/sequelize";

// Extend the built-in types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image: string | null;
      tokenVersion: number;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    tokenVersion: number;
  }
}

// Extended JWT type for internal use
interface ExtendedJWT extends JWT {
  id?: string;
  tokenVersion?: number;
}

let dbInitialized = false;

async function ensureDbInitialized(): Promise<void> {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    // Social login provider (Google/Facebook native SDK tokens)
    Credentials({
      id: "social-login",
      name: "Social Login",
      credentials: {
        provider: { label: "Provider", type: "text" },
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.provider || !credentials?.token) {
          return null;
        }

        const provider = credentials.provider as string;
        const token = credentials.token as string;

        // Verify the token based on provider
        let verificationResult;
        if (provider === "google") {
          verificationResult = await verifyGoogleToken(token);
        } else if (provider === "facebook") {
          verificationResult = await verifyFacebookToken(token);
        } else {
          console.error("Unknown provider:", provider);
          return null;
        }

        if (!verificationResult.success) {
          console.error("Token verification failed:", verificationResult.error);
          return null;
        }

        // Ensure database is initialized
        await ensureDbInitialized();

        // Find or create user - link by email
        let user = await User.findOne({
          where: { email: verificationResult.email },
        });

        if (user) {
          // Update provider ID if not set
          const updateData: Partial<{
            googleId: string;
            facebookId: string;
            name: string;
            avatarUrl: string;
          }> = {};

          if (provider === "google" && !user.googleId) {
            updateData.googleId = verificationResult.providerId;
          } else if (provider === "facebook" && !user.facebookId) {
            updateData.facebookId = verificationResult.providerId;
          }

          // Update name and avatar if provided and user doesn't have them
          if (verificationResult.name && !user.name) {
            updateData.name = verificationResult.name;
          }
          if (verificationResult.avatarUrl && !user.avatarUrl) {
            updateData.avatarUrl = verificationResult.avatarUrl;
          }

          if (Object.keys(updateData).length > 0) {
            await user.update(updateData);
          }
        } else {
          // Create new user
          user = await User.create({
            email: verificationResult.email,
            name: verificationResult.name,
            avatarUrl: verificationResult.avatarUrl,
            googleId: provider === "google" ? verificationResult.providerId : null,
            facebookId: provider === "facebook" ? verificationResult.providerId : null,
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          tokenVersion: user.tokenVersion,
        };
      },
    }),

    // Test login provider (for web development only)
    Credentials({
      id: "test-login",
      name: "Test Login",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        if (!credentials?.email) {
          return null;
        }

        const email = credentials.email as string;

        // Validate email format
        if (!email.includes("@")) {
          return null;
        }

        // Ensure database is initialized
        await ensureDbInitialized();

        // Find or create test user
        let user = await User.findOne({
          where: { email },
        });

        if (!user) {
          user = await User.create({
            email,
            name: `Test User (${email.split("@")[0]})`,
            avatarUrl: null,
            googleId: null,
            facebookId: null,
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          tokenVersion: user.tokenVersion,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }): Promise<ExtendedJWT> {
      if (user) {
        token.id = user.id;
        token.email = user.email ?? undefined;
        token.name = user.name;
        token.picture = user.image;
        token.tokenVersion = user.tokenVersion;
      }
      return token as ExtendedJWT;
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedJWT;
      return {
        ...session,
        user: {
          ...session.user,
          id: extendedToken.id ?? "",
          email: extendedToken.email ?? "",
          name: extendedToken.name ?? null,
          image: extendedToken.picture ?? null,
          tokenVersion: extendedToken.tokenVersion ?? 0,
        },
      };
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
};
