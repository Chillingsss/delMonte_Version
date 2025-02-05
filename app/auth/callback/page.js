"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { lineSpinner } from "ldrs";
import {
  storeDataInCookie,
  storeDataInSession,
} from "@/app/utils/storageUtils";

lineSpinner.register();

export default function Callback() {
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
      // Store the token in cookies
      storeDataInCookie("auth_token", token, { maxAge: 3600 });

      // Determine the user level and ID to store
      const userLevel = cand_userLevel || adm_userLevel;
      const userId = cand_id || adm_id;

      // Store user ID and userLevel in session storage
      if (userId) {
        storeDataInSession("user_id", userId);
        storeDataInSession("user_level", userLevel);
        localStorage.setItem("user_id", userId);
        localStorage.setItem("user_level", userLevel);
        localStorage.setItem("user_firstname", firstname);
        localStorage.setItem("user_lastname", lastname);
      }

      // Redirect based on user level
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
      // Optionally, redirect to an error page or login page
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
