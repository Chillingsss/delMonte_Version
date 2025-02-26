"use client";
import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import AdminDashboard from "./AdminDashboard";
import AdminSidebar from "./AdminSidebar";
import { CardTitle } from "@/components/ui/card";
import AdminJobs from "./Job/AdminJobs";
import { ModeToggle } from "@/components/ui/mode-toggle";
import CourseCategoryMaster from "./Masterfiles/CourseCategoryMaster";
import CourseMaster from "./Masterfiles/CourseMaster";
import InstitutionMaster from "./Masterfiles/InstitutionMaster";
import KnowledgeMaster from "./Masterfiles/KnowledgeMaster";
import LicenseMaster from "./Masterfiles/LicenseMaster";
import LicenseTypeMaster from "./Masterfiles/LicenseTypeMaster";
import SkillsMaster from "./Masterfiles/SkillsMaster";
import TrainingMaster from "./Masterfiles/TrainingMaster";
import GeneralExam from "./Masterfiles/GeneralExam";
import InterviewCategoryMaster from "./Masterfiles/InterviewCategoryMaster";
import InterviewCriteriaMaster from "./Masterfiles/InterviewCriteriaMaster";
import { useRouter } from "next/navigation";
import {
  getDataFromCookie,
  getDataFromSession,
  retrieveData,
} from "@/app/utils/storageUtils";
import Spinner from "@/components/ui/spinner";

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const [viewIndex, setViewIndex] = useState(0);

  const adminViews = [
    { view: <AdminDashboard /> },
    { view: <AdminJobs /> },
    // Masterfiles
    { view: <CourseCategoryMaster /> },
    { view: <CourseMaster /> },
    { view: <InstitutionMaster /> },
    { view: <KnowledgeMaster /> },
    { view: <LicenseMaster /> },
    { view: <LicenseTypeMaster /> },
    { view: <SkillsMaster /> },
    { view: <TrainingMaster /> },
    { view: <InterviewCategoryMaster /> },
    { view: <InterviewCriteriaMaster /> },
    { view: <GeneralExam /> },
  ];

  const router = useRouter();

  // useEffect(() => {
  //   const authToken = getDataFromCookie("auth_token");

  //   if (status === "unauthenticated" && !authToken) {
  //     router.push("/");
  //   }
  // }, [status, router]);

  useEffect(() => {
    const getUserLevelFromCookie = () => {
      const tokenData = getDataFromCookie("auth_token");
      return tokenData?.userLevel || null;
    };

    const userLevel = session?.user?.userLevel || getUserLevelFromCookie();

    if (!userLevel) {
      console.log("No valid session or cookie found. Redirecting to login...");
      router.replace("/"); // Redirect to login if both are missing
      return;
    }

    if (userLevel === "1.0" && router.pathname !== "/candidatesDashboard") {
      router.replace("/candidatesDashboard");
    } else if (
      userLevel === "100.0" &&
      router.pathname !== "/admin/dashboard"
    ) {
      router.replace("/admin/dashboard");
    } else if (
      userLevel === "50.0" &&
      router.pathname !== "/manager/dashboard"
    ) {
      router.replace("/manager/dashboard");
    }
     else {
      setIsLoading(false);
    }
  }, [session, router]);

  const handleChangeView = (index) => {
    setViewIndex(index);
  };

  return (
    <>
      <div className="bg-background h-screen">

        {isLoading ?
          <div className="flex justify-center items-center h-screen">
            <Spinner />
          </div>
          :
          <>
            <AdminSidebar changeView={handleChangeView} />
            <main className="sm:ps-20 px-5 py-3">
              <div className="flex justify-end">
                <ModeToggle />
              </div>
              <CardTitle className="text-3xl py-3">
                {adminViews[viewIndex].title}
              </CardTitle>
              {adminViews[viewIndex].view}
            </main>
          </>
        }
      </div>

    </>
  );
}
