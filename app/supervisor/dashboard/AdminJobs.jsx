import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  CheckCircle,
  Circle,
  Edit,
  EllipsisVertical,
  Filter,
  Plus,
  Settings,
  XCircle,
} from "lucide-react";
import Spinner from "@/components/ui/spinner";
import AddJob from "./AddJob";
import {
  getDataFromSession,
  removeData,
  retrieveData,
} from "@/app/utils/storageUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SelectedJob from "./modal/SelectedJob";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Switch } from "@/components/ui/switch";
import ShowAlert from "@/components/ui/show-alert";
import UpdateJobModal from "./UpdateJobDetails/UpdateJobModal";

function AdminJobs() {
  const [allJobs, setAllJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(1);
  const [isAddJob, setIsAddJob] = useState(false);
  const [showSelectedJobModal, setShowSelectedJobModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(0);
  const [selectedJobStatus, setSelectedJobStatus] = useState(0);
  const closeShowSelectedJobModal = () => {
    setShowSelectedJobModal(false);
  };
  const openShowSelectedJobModal = (jobId) => {
    setSelectedJobId(jobId);
    setShowSelectedJobModal(true);
  };

  const handleSwitchView = async () => {
    if (isAddJob) {
      await getAllJobs();
      setIsAddJob(false);
    } else {
      setIsAddJob(true);
    }
  };

  const getAllJobs = async () => {
    setIsLoading(true);
    try {
      const url = getDataFromSession("url") + "admin.php";
      const formData = new FormData();
      formData.append("operation", "getAllJobs");
      const res = await axios.post(url, formData);
      console.log("RES DATA ni getAllJobs: ", res.data);
      if (res.data !== 0) {
        setAllJobs(res.data);
        setJobs(res.data);
      } else {
        setJobs([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("AdminJobs.jsx => getAllJobs(): " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJobStatusSwitch = async () => {
    setIsLoading(true);
    try {
      const url = getDataFromSession("url") + "admin.php";
      const jsonData = {
        jobId: selectedJobId,
        status: selectedJobStatus,
      };
      const formData = new FormData();
      formData.append("json", JSON.stringify(jsonData));
      formData.append("operation", "handleJobStatusSwitch");
      const res = await axios.post(url, formData);
      console.log("RES DATA ni handleJobStatusSwitch: ", res.data);
      getAllJobs();
      if (res.data === 1) {
        toast.success("Job status updated");
      } else {
        toast.error("Failed to update job status");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("AdminJobs.jsx => handleJobStatusSwitch(): " + error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllJobs();
  }, []);

  useEffect(() => {
    if (selectedStatus === -1) {
      setJobs(allJobs);
    } else {
      const filteredJobs = allJobs.filter(
        (job) => job.jobM_status === selectedStatus
      );
      setJobs(filteredJobs);
    }
  }, [allJobs, selectedStatus]);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const handleShowAlert = (message, status, jobId) => {
    setSelectedJobStatus(status === 1 ? 0 : 1);
    setSelectedJobId(jobId);
    setAlertMessage(message);
    setShowAlert(true);
  };
  const handleCloseAlert = (status) => {
    if (status === 1) {
      handleJobStatusSwitch();
    }
    setSelectedJobStatus(0);
    setSelectedJobId(0);
    setShowAlert(false);
  };

  return (
    <>
      <div className={`flex justify-between ${isAddJob ? "hidden" : ""}`}>
        <Button className="mb-3" onClick={handleSwitchView}>
          {/* {isAddJob ? <ArrowLeft className="h-4 w-4 mr-1" /> : <PlusCircle className="h-4 w-4 mr-1" />} */}
          {/* {isAddJob ? "Back" : "Add Job"} */}
          <Plus className="h-4 w-4 mr-1" />
          Add Job
        </Button>
        <DropdownMenu className="mb-3 mx-3">
          <DropdownMenuTrigger asChild>
            <Button>
              <Filter className="mr-2 h-4 w-4" /> Filter{" "}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Select Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSelectedStatus(-1)}>
              <Briefcase className="mr-2 h-4 w-4" /> All Jobs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedStatus(1)}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Active
              Jobs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedStatus(0)}>
              <XCircle className="mr-2 h-4 w-4 text-gray-500" /> Inactive Jobs
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className={isAddJob ? "" : "hidden mb-3"}>
        <Breadcrumb className="flex ">
          <BreadcrumbList>
            <BreadcrumbItem>
              <div
                className="cursor-pointer hover:text-primary"
                onClick={handleSwitchView}
              >
                Job List
              </div>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Add Job</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {isLoading ? (
        <Spinner />
      ) : isAddJob ? (
        <AddJob handleSwitchView={handleSwitchView} />
      ) : (
        <Card className="w-full">
          <CardContent className="grid grid-cols-1 gap-3 xl:grid-cols-3 mt-3">
            {jobs.map((job, index) => (
              <Card
                key={index}
                className="flex flex-col justify-between h-full border-2 border-secondary shadow-lg dark:border-[#0c0a09]"
              >
                <CardTitle className="relative bg-[#0e5a35] dark:bg-[#0e4028] w-full p-10 rounded-t-lg text-white">
                  {job.jobM_title}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        className="absolute top-3 right-3 hover:text-primary hover:bg-transparent  bg-trasparent text-white"
                      >
                        <Settings className="cursor-pointer" />
                        <span className="sr-only">Toggle user menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel> Actions </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {/* <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />

                        </DropdownMenuItem>
                        <DropdownMenuSeparator /> */}
                      <DropdownMenuItem
                        className="cursor-pointer flex items-center"
                        onClick={() =>
                          handleShowAlert(
                            `Are you sure you want to ${
                              job.jobM_status === 0 ? "activate" : "deactivate"
                            } ${job.jobM_title}?`,
                            job.jobM_status,
                            job.jobM_id
                          )
                        }
                      >
                        <Switch
                          className="mr-2"
                          checked={job.jobM_status === 1}
                        />
                        {job.jobM_status === 1 ? "Active" : "Inactive"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardTitle>

                <CardContent className="flex-grow bg-[#def6db] dark:bg-[#1c1917]">
                  <div className="flex items-center gap-2 mb-2 mt-4">
                    <Circle
                      className={`h-4 w-4 ${
                        job.Total_Applied === 0
                          ? "text-gray-400"
                          : "text-green-500"
                      }`}
                    />
                    <span
                      className={`text-sm font-bold ${
                        job.Total_Applied === 0
                          ? "text-gray-400"
                          : "text-green-500"
                      }`}
                    >
                      {job.Total_Applied > 0
                        ? `${job.Total_Applied} Applicants`
                        : "No Applicants"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-[#def6db] dark:bg-[#1c1917] rounded-b-lg">
                  <Button
                    className="bg-[#188c54] text-white"
                    onClick={() => openShowSelectedJobModal(job.jobM_id)}
                  >
                    View
                  </Button>
                  <div className="flex items-center gap-2 mb-2">
                    <Circle
                      className={`h-4 w-4 ${
                        job.jobM_status === 1
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        job.jobM_status === 1
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    >
                      {job.jobM_status === 1 ? "Active" : "Inactive"}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
      {showSelectedJobModal && (
        <SelectedJob
          open={showSelectedJobModal}
          onHide={closeShowSelectedJobModal}
          jobId={selectedJobId}
        />
      )}
      <ShowAlert
        open={showAlert}
        onHide={handleCloseAlert}
        message={alertMessage}
      />
    </>
  );
}

export default AdminJobs;
