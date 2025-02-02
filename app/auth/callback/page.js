// app/auth/callback/page.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import { setCookie } from "cookies-next";
import {
  storeDataInCookie,
  storeDataInSession,
} from "@/app/utils/storageUtils";

export default function Callback() {
  const router = useRouter();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token");
  const cand_id = searchParams.get("cand_id");

  const cand_userLevel = searchParams.get("cand_userLevel");

  console.log("Received User Level:", cand_userLevel);

  useEffect(() => {
    if (token) {
      console.log(
        "Setting cookies and session storage, then redirecting to dashboard..."
      );
      // Store the token in cookies
      storeDataInCookie("auth_token", token, { maxAge: 3600 });

      // Store cand_id and cand_userLevel in session storage
      if (cand_id) {
        storeDataInSession("user_id", cand_id);
        storeDataInSession("user_level", 1);
        localStorage.setItem("user_id", cand_id);
        localStorage.setItem("user_level", 1.0);
      }

      // Redirect to the dashboard
      router.push("/candidatesDashboard");
    } else {
      console.log("No token received.");
      // Optionally, redirect to an error page or login page
      router.push("/login");
    }
  }, [token, cand_id, cand_userLevel, router]);

  return <div>Authenticating...</div>;
}
