"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import secureLocalStorage from "react-secure-storage";

const page = () => {
  const router = useRouter();

  useEffect(() => {
    const userLevel = retrieveData("user_level");
    const userName = retrieveData("first_name");
    const userId = retrieveData("user_id");
    const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

    if (!userLevel || !userName || !userId || !url) {
      sessionStorage.clear();

      router.push("/");
      return;
    }

    switch (userLevel) {
      case "100.0":
        router.push("/admin/dashboard");
        break;
      case "2":
        router.push("/superAdminDashboard");
        break;
      case "supervisor":
        router.push("/supervisorDashboard");
        break;
      case "1.0":
        router.push("/candidatesDashboard");
        break;
      default:
        console.log("Unexpected user level, redirecting to landing area.");
        router.push("/");
    }
  }, [router]);

  return (
    <>
      <h1>Admin Dashboard</h1>
    </>
  );
};

export default page;
