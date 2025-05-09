// hooks/useInactivityLogout.js
"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

const THIRTY_MINUTES_MS = 30 * 60 * 1000; // 30 minutes in milliseconds
const CHECK_INTERVAL = 30 * 1000; // Check every 30 seconds

export function useInactivityLogout() {
  const { data: session } = useSession();
  const timeoutRef = useRef(null);
  const activityTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!session) return;

    function clearAuthCookies() {
      const cookies = document.cookie.split(";");

      cookies.forEach((cookie) => {
        const cookieName = cookie.split("=")[0].trim();
        if (cookieName.startsWith("next-auth")) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        }
      });
    }

    async function handleLogout() {
      try {
        await signOut({
          redirect: false,
          callbackUrl: "/",
        });
        clearAuthCookies();
        sessionStorage.clear();
        window.dispatchEvent(new Event("session-expired"));
        window.location.href = "/";
      } catch (error) {
        console.error("Logout error:", error);
        window.location.href = "/";
      }
    }

    function checkInactivity() {
      const currentTime = Date.now();
      const timeSinceLastActivity = currentTime - activityTimeRef.current;

      // Only check inactivity timeout, not session expiry
      if (timeSinceLastActivity >= THIRTY_MINUTES_MS) {
        handleLogout();
        return;
      }
    }

    function resetTimer() {
      activityTimeRef.current = Date.now();
    }

    // Set up activity listeners
    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "DOMMouseScroll",
      "mousewheel",
      "touchmove",
      "MSPointerMove",
      "touchstart",
      "touchend",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Start interval to check inactivity
    const intervalId = setInterval(checkInactivity, CHECK_INTERVAL);

    // Initial activity timestamp
    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearInterval(intervalId);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [session]);
}
