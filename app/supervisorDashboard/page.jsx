"use client";

import React, { useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();

  useEffect(() => {
    const userLevel = secureLocalStorage.getItem("user_level");

    console.log("Retrieved user level from secureLocalStorage:", userLevel);

    if (!userLevel) {
      console.log("No user level found, redirecting to landing area.");
      router.push("/landingArea");
      return;
    }

    switch (userLevel) {
      case "admin":
        router.push("/adminDashboard");
        break;
      case "2":
        router.push("/superAdminDashboard");
        break;
      case "supervisor":
        router.push("/supervisorDashboard");
        break;
      case "applicant":
        router.push("/candidatesDashboard");
        break;
      default:
        console.log("Unexpected user level, redirecting to landing area.");
        router.push("/landingArea");
    }
  }, [router]);

  return (
    <>
      <h1>Supervisor Dashboard</h1>
    </>
  );
};

export default page;
