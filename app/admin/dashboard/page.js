"use client"
import React, { useEffect, useState } from 'react'
import AdminDashboard from './AdminDashboard'
import AdminSidebar from './AdminSidebar';
import { CardTitle } from '@/components/ui/card';
import AdminJobs from './Job/AdminJobs';
import { ModeToggle } from '@/components/ui/mode-toggle';
import CourseCategoryMaster from './Masterfiles/CourseCategoryMaster';
import CourseMaster from './Masterfiles/CourseMaster';
import InstitutionMaster from './Masterfiles/InstitutionMaster';
import KnowledgeMaster from './Masterfiles/KnowledgeMaster';
import LicenseMaster from './Masterfiles/LicenseMaster';
import LicenseTypeMaster from './Masterfiles/LicenseTypeMaster';
import SkillsMaster from './Masterfiles/SkillsMaster';
import TrainingMaster from './Masterfiles/TrainingMaster';
import GeneralExam from './Masterfiles/GeneralExam';
import InterviewCategoryMaster from './Masterfiles/InterviewCategoryMaster';
import InterviewCriteriaMaster from './Masterfiles/InterviewCriteriaMaster';
import { useRouter } from 'next/navigation';
import { retrieveData } from '@/app/utils/storageUtils';

export default function Page() {
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

  const userLevel = retrieveData("user_level");

  // const userName = retrieveData("first_name");
  // const userId = retrieveData("user_id");

  // if (!userLevel) {
  //   sessionStorage.clear();
  //   router.push("/");
  //   return;
  // }


  const handleChangeView = (index) => {
    setViewIndex(index);
  }

  return (
    <div className='bg-background h-screen'>
      <AdminSidebar changeView={handleChangeView} />
      <main className="sm:ps-20 px-5 py-3">
        <div className='flex justify-end'>
          <ModeToggle />
        </div>
        <CardTitle className="text-3xl py-3">{adminViews[viewIndex].title}</CardTitle>
        {adminViews[viewIndex].view}
      </main>
    </div>
  )
}
