"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";

const INACTIVITY_TIME_LIMIT = 2 * 60 * 1000; // 2 minutes

export function useInactivityLogout() {
  useEffect(() => {
    let timeout;

    function clearCookies() {
      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, "") // Trim spaces
          .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"); // Expire immediately
      });
    }

    async function handleLogout() {
      await signOut({ redirect: false }); // ✅ Ensure signOut() completes
      clearCookies(); // 🛑 Delete cookies

      // ✅ Dispatch an event so all tabs receive logout update
      window.dispatchEvent(new Event("session-expired"));

      window.location.href = "/"; // ✅ Redirect to login
    }

    function resetTimer() {
      clearTimeout(timeout);
      timeout = setTimeout(handleLogout, INACTIVITY_TIME_LIMIT);
    }

    // Detect user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("scroll", resetTimer);

    // Listen for session expiration in all tabs
    window.addEventListener("session-expired", handleLogout);

    // Start initial timer
    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("scroll", resetTimer);
      window.removeEventListener("session-expired", handleLogout);
    };
  }, []);
}
