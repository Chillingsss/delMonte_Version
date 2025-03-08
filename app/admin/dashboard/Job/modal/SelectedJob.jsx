import {
  getDataFromSession,
  removeData,
  retrieveData,
  storeData,
  storeDataInSession,
} from "@/app/utils/storageUtils";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Spinner from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import InterviewPage from "../Interview/InterviewPage";
import ViewApplicants from "../ViewApplicants/ViewApplicants";
import ExamPage from "../Exam/ExamPage";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import JobDetails from "./JobDetails";
import UpdateJobMaster from "./UpdateJobMaster";
import BackgroundCheckPage from "../BackgroundCheck/BackgroundCheckPage";
import JobOfferPage from "../JobOffer/JobOfferPage";
import DecisionPendingPage from "../DecisionPending/DecisionPendingPage";
import EmployedPage from "../Employed/EmployedPage";
import ReapplyPage from "../Reapplied/ReapplyPage";
import MedicalPage from "../Medical/MedicalPage";
import { useSession } from "next-auth/react";
import { getDataFromCookie } from '@/app/utils/storageUtils';


function SelectedJob({ open, onHide, jobId, getJobs }) {
  const { data: session } = useSession();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(1);

  const getSelectedJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jsonData = { jobId: jobId };
      const formData = new FormData();
      formData.append("operation", "getSelectedJobs");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("RES DATA ni getSelectedJobs: ", res.data);
      if (res.data !== 0) {
        const response = res.data;
        console.log("res ni RESDATA: ", response);
        storeDataInSession("jobTotalPoints", response.jobTotalPoints);
        storeDataInSession("jobTitle", response.jobMaster[0].jobM_title);
        // storeData("interviewPassing", response.passingPercentage);
        setData(res.data);
        if (res.data.exam !== 0) {
          const response = res.data.exam;
          storeDataInSession("examId", response.examMaster[0].exam_id);
        }
      }
    } catch (error) {
      toast.error("Network error");
      console.log("error: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (open) {
      getSelectedJobs();
      storeDataInSession("jobId", jobId);
    }
  }, [getSelectedJobs, jobId, open]);

  const getUserIdFromCookie = () => {
    const tokenData = getDataFromCookie("auth_token");
    if (tokenData && tokenData.userId) {
      return tokenData.userId;
    }
    return null;
  };

  const handleChangeStatus = async (id, status) => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const userId = session?.user?.id || getUserIdFromCookie();
      const jsonData = {
        jobId: getDataFromSession("jobId"),
        candId: id,
        status: status,
        hrId: userId
      };
      console.log("jsonData: ", jsonData);
      const formData = new FormData();
      formData.append("json", JSON.stringify(jsonData));
      formData.append("operation", "changeApplicantStatus");
      const res = await axios.post(url, formData);
      console.log("InterviewPage.jsx => handleChangeStatus(): ", res.data);
      if (res.data !== 1) {
        toast.error("There's something wrong");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("InterviewPage.jsx => handleChangeStatus(): " + error);
    }
  };

  const handleClose = () => {
    sessionStorage.clear();
    getJobs();
    // removeData("jobId");
    // removeData("selectedStatus");
    // removeData("jobEducation");
    // removeData("jobTraining");
    // removeData("jobKnowledge");
    // removeData("jobSkill");
    // removeData("jobExperience");
    // removeData("jobMaster");
    // removeData("duties");
    // removeData("jobTotalPoints");
    onHide();
  };
  // bg-[#107343] dark:bg-background
  return (
    <>
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent
          side="bottom"
          className="flex flex-col h-screen md:h-[90vh] overflow-y-auto"
        >
          <SheetTitle />
          <SheetDescription />
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <SheetHeader className="mb-4">
                <SheetTitle>
                  <div className="flex items-center">
                    {data.jobMaster[0].jobM_title}
                    <UpdateJobMaster
                      title={data.jobMaster[0].jobM_title}
                      description={data.jobMaster[0].jobM_description}
                      getSelectedJobs={getSelectedJobs}
                    />
                  </div>
                </SheetTitle>
                <SheetDescription className="text-start">
                  {data.jobMaster[0].jobM_description}
                </SheetDescription>
              </SheetHeader>
              <Card className="p-1 w-full md:p-2 dark:bg-[#1c1917] flex-grow">
                <Tabs
                  defaultValue={selectedTab}
                  className="flex flex-col h-full"
                  onValueChange={(value) => setSelectedTab(value)}
                >
                  <ScrollArea className="overflow-x-auto">
                    <TabsList className="flex md:flex-wrap gap-2">
                      <TabsTrigger value={1}>Details</TabsTrigger>
                      <TabsTrigger value={2}>Pending</TabsTrigger>
                      <TabsTrigger value={3}>Interview</TabsTrigger>
                      <TabsTrigger value={4}>Exam</TabsTrigger>
                      <TabsTrigger value={5}>Background Check</TabsTrigger>
                      <TabsTrigger value={6}>Medical</TabsTrigger>
                      <TabsTrigger value={7}>Decision Pending</TabsTrigger>
                      <TabsTrigger value={8}>Offer</TabsTrigger>
                      <TabsTrigger value={9}>Employed</TabsTrigger>
                      <TabsTrigger value={10}>Reapplied</TabsTrigger>
                    </TabsList>
                  </ScrollArea>
                  <ScrollArea className="flex-grow overflow-y-auto">
                    <TabsContent value={1} className="h-full">
                      <JobDetails getSelectedJobs={getSelectedJobs} />
                    </TabsContent>
                    <TabsContent value={2}>
                      <ViewApplicants handleChangeStatus={handleChangeStatus} />
                    </TabsContent>
                    <TabsContent value={3}>
                      <InterviewPage handleChangeStatus={handleChangeStatus} />
                    </TabsContent>
                    <TabsContent value={4}>
                      <ExamPage handleChangeStatus={handleChangeStatus} />
                    </TabsContent>
                    <TabsContent value={5}>
                      <BackgroundCheckPage handleChangeStatus={handleChangeStatus} />
                    </TabsContent>
                    <TabsContent value={6}>
                      <MedicalPage handleChangeStatus={handleChangeStatus} />
                    </TabsContent>
                    <TabsContent value={7}>
                      <DecisionPendingPage handleChangeStatus={handleChangeStatus} />
                    </TabsContent>
                    <TabsContent value={8}>
                      <JobOfferPage handleChangeStatus={handleChangeStatus} />
                    </TabsContent>
                    <TabsContent value={9}>
                      <EmployedPage handleChangeStatus={handleChangeStatus} />
                    </TabsContent>
                    <TabsContent value={10}>
                      <ReapplyPage />
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </Card>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

export default SelectedJob;
