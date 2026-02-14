"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  signInWithGoogle,
  signInWithFacebook,
  isNativePlatform,
  getPlatform,
} from "@/lib/auth/capacitor-auth";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<"google" | "facebook" | "test" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNative, setIsNative] = useState<boolean | null>(null);
  const [platform, setPlatform] = useState<string>("");
  const [showTestLogin, setShowTestLogin] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  // Check platform on client side only to avoid hydration mismatch
  useEffect(() => {
    setIsNative(isNativePlatform());
    setPlatform(getPlatform());
  }, []);

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    setLoading(provider);
    setError(null);

    try {
      // Get token from native SDK
      const result =
        provider === "google" ? await signInWithGoogle() : await signInWithFacebook();

      if (!result.success) {
        setError(result.error || `${provider} login failed`);
        setLoading(null);
        return;
      }

      // Send token to NextAuth
      const signInResult = await signIn("social-login", {
        provider,
        token: result.token,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Authentication failed. Please try again.");
        setLoading(null);
        return;
      }

      // Redirect to home page on success
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(null);
    }
  };

  const handleTestLogin = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading("test");
    setError(null);

    try {
      const signInResult = await signIn("test-login", {
        email: testEmail,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Test login failed. Please try again.");
        setLoading(null);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Test login error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(null);
    }
  };

  // Show loading state until we know the platform
  if (isNative === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
          <p className="mt-2 text-gray-600">Sign in to continue</p>
          {!isNative && (
            <p className="mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              Running on {platform}. Use test login below or native app for social login.
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => handleSocialLogin("google")}
            disabled={loading !== null || !isNative}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading === "google" ? "Signing in..." : "Continue with Google"}
          </button>

          <button
            onClick={() => handleSocialLogin("facebook")}
            disabled={loading !== null || !isNative}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-transparent rounded-lg shadow-sm bg-[#1877F2] text-white hover:bg-[#166FE5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {loading === "facebook" ? "Signing in..." : "Continue with Facebook"}
          </button>
        </div>

        {/* Test Login for Web Development */}
        {!isNative && (
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowTestLogin(!showTestLogin)}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              {showTestLogin ? "Hide" : "Show"} Test Login (Development Only)
            </button>

            {showTestLogin && (
              <div className="mt-4 space-y-3">
                <input
                  type="email"
                  placeholder="Enter test email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleTestLogin}
                  disabled={loading !== null}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading === "test" ? "Signing in..." : "Test Login"}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="text-center text-sm text-gray-500">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
