"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  signOutFromGoogle,
  signOutFromFacebook,
} from "@/lib/auth/capacitor-auth";

export default function LogoutButton() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Sign out from native SDKs
      await Promise.all([signOutFromGoogle(), signOutFromFacebook()]);
      // Sign out from NextAuth without redirect
      await signOut({ redirect: false });
      // Manually navigate to login
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setLoading(false);
    }
  };

  const handleLogoutEverywhere = async () => {
    setLoading(true);
    try {
      // Invalidate all sessions on backend
      const response = await fetch("/api/auth/logout-everywhere", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to invalidate sessions");
      }

      // Sign out from native SDKs
      await Promise.all([signOutFromGoogle(), signOutFromFacebook()]);
      // Sign out from NextAuth without redirect
      await signOut({ redirect: false });
      // Manually navigate to login
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout everywhere error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            Logout
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </>
        )}
      </button>

      {showMenu && !loading && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
            >
              Logout
            </button>
            <button
              onClick={handleLogoutEverywhere}
              className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-b-lg border-t border-gray-100"
            >
              Logout from all devices
            </button>
          </div>
        </>
      )}
    </div>
  );
}
