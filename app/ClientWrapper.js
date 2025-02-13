"use client"; // ✅ Ensures this runs on the client side

import { useInactivityLogout } from "./useInactivityLogout";

export default function ClientWrapper({ children }) {
  useInactivityLogout(); // ✅ Now it works!

  return <>{children}</>;
}
