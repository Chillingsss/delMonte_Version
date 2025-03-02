"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"; // ✅ Import NextAuth session
import { lineSpinner } from "ldrs";
import {
  storeDataInCookie,
  storeDataInSession,
} from "@/app/utils/storageUtils";

export default function Callback() {
  const { data: session, status } = useSession(); // ✅ Get session data
  const router = useRouter();
  const [tokenData, setTokenData] = useState(null);

  useEffect(() => {
    // ✅ Ensure `lineSpinner.register()` runs only in the client
    if (typeof window !== "undefined") {
      lineSpinner.register();
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get("token");
      const cand_id =
        searchParams.get("cand_id") !== "null"
          ? searchParams.get("cand_id")
          : null;
      const firstname =
        searchParams.get("cand_firstname") !== "null"
          ? searchParams.get("cand_firstname")
          : null;
      const lastname =
        searchParams.get("cand_lastname") !== "null"
          ? searchParams.get("cand_lastname")
          : null;
      const cand_userLevel =
        searchParams.get("cand_userLevel") !== "null"
          ? searchParams.get("cand_userLevel")
          : null;
      const hr_id = searchParams.get("hr_id") || null;
      const hr_userLevel =
        searchParams.get("hr_userLevel") !== "null"
          ? searchParams.get("hr_userLevel")
          : null;

          console.log("hr_id", hr_id);
          console.log("hr_userLevel", hr_userLevel);

      if (token) {
        console.log(
          "Setting cookies and session storage, then redirecting to dashboard..."
        );

        // Create a token object with user details
        const tokenData = {
          userId: cand_id || hr_id,
          timestamp: new Date().getTime(),
          userLevel: cand_userLevel || hr_userLevel,
        };

        // ✅ Store in Cookies & Session Storage
        storeDataInCookie("auth_token", tokenData, 3600);
        storeDataInSession("user", tokenData); // ✅ Now storing in session

        // Redirect based on user level
        const userLevel = cand_userLevel || hr_userLevel;
        switch (userLevel) {
          case "1.0":
            router.replace("/candidatesDashboard");
            break;
          case "100.0":
            router.replace("/admin/dashboard");
            break;
          default:
            router.push("/");
        }
      } else {
        console.log("No token received.");
        router.push("/login");
      }
    }
  }, [router]);

  return (
    <div className="fixed inset-0 bg-[#01472B] flex items-center justify-center z-50">
      <div className="text-center">
        <l-line-spinner
          size="40"
          stroke="3"
          speed="1"
          color="#ffffff"
        ></l-line-spinner>
        <p className="text-white text-xl font-semibold mt-4">Redirecting...</p>
        <p className="text-green-300 mt-2">
          Please wait while we prepare your dashboard
        </p>
      </div>
    </div>
  );
}
