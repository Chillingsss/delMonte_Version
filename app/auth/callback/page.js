"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react"; // ✅ Import NextAuth session
import { lineSpinner } from "ldrs";
import {
  storeDataInCookie,
  storeDataInSession,
} from "@/app/utils/storageUtils";

lineSpinner.register();

export default function Callback() {
  const { data: session, status } = useSession(); // ✅ Get session data
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token");
  const cand_id =
    searchParams.get("cand_id") !== "null" ? searchParams.get("cand_id") : null;
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
  const adm_id = searchParams.get("adm_id") || null;
  const adm_userLevel =
    searchParams.get("adm_userLevel") !== "null"
      ? searchParams.get("adm_userLevel")
      : null;

  useEffect(() => {
    if (token) {
      console.log(
        "Setting cookies and session storage, then redirecting to dashboard..."
      );

      // Create a token object with user details
      const tokenData = {
        userId: cand_id || adm_id,
        timestamp: new Date().getTime(),
        userLevel: cand_userLevel || adm_userLevel,
      };

      // ✅ Store in Cookies & Session Storage
      storeDataInCookie("auth_token", tokenData, 3600);
      storeDataInSession("user", tokenData); // ✅ Now storing in session

      // Redirect based on user level
      const userLevel = cand_userLevel || adm_userLevel;
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
  }, [
    token,
    cand_id,
    firstname,
    lastname,
    cand_userLevel,
    adm_id,
    adm_userLevel,
    router,
  ]);

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
