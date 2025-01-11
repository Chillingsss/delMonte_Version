"use client";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import LandingArea from "./landingArea/page";
import Signup from "./signup/Signup";

import { storeData, retrieveData } from "./utils/storageUtils";
import { ThemeProvider } from "./candidatesDashboard/components/ThemeContext";

export default function Home() {
  return (
    <>
      <div className="bg-[#f4f7fc]">
        <LandingArea />
      </div>
    </>
  );
}
