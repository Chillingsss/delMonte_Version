import React, { useRef, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faInfoCircle,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faUserTie,
  faPencilRuler,
  faUserTimes,
  faUserCheck,
} from "@fortawesome/free-solid-svg-icons";
import { MdOutlineCancel } from "react-icons/md";
import { TbPencilX } from "react-icons/tb";
import axios from "axios";
import {
  storeDataInSession,
  removeSessionData,
  getDataFromSession,
  getDataFromCookie,
} from "../../utils/storageUtils";
import { useRouter } from "next/navigation";
import ExamModal from "../exam/exam";
import JobOfferModal from "../modal/jobOffer";
import CancelJobModal from "../modal/cancelJobApplied";
import { X } from "lucide-react";

const AppliedJobs = ({
  isDarkMode,
  fetchAppliedJobs,
  fetchExamResult,
  fetchJobs,
  fetchNotification,
  fetchProfiles,
  appliedJob,
  onClose,
}) => {
  console.log("appliedJobs", appliedJob);
  const { data: session, status } = useSession();
  const router = useRouter();
  const dropdownUsernameRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [selectedJobMId, setSelectedJobMId] = useState(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState(null);
  const [selectedJobPercentage, setSelectedJobPercentage] = useState(null);
  const [selectedJobPassingPoints, setSelectedJobPassingPoints] =
    useState(null);
  const [appId, setAppId] = useState(null);
  const [jobMId, setJobMId] = useState(null);
  const [jobTitle, setJobTitle] = useState(null);
  const [jobAppId, setJobAppId] = useState(null);
  const [isJobOfferModalOpen, setIsJobOfferModalOpen] = useState(false);
  const [jobOfferDetails, setJobOfferDetails] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [jobToCancel, setJobToCancel] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutsideUsername = (event) => {
    if (
      dropdownUsernameRef.current &&
      !dropdownUsernameRef.current.contains(event.target)
    ) {
      setIsUserDropdownOpen(false);
    }
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
      setIsUserDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("mousedown", handleClickOutsideUsername);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mousedown", handleClickOutsideUsername);
    };
  }, []);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return (
          <FontAwesomeIcon
            icon={faClock}
            className="text-yellow-500 animate-pulse"
          />
        );
      case "cancelled":
        return (
          <MdOutlineCancel className="text-red-500 animate-pulse text-xl" />
        );
      case "accept":
        return (
          <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
        );
      case "rejected":
        return (
          <FontAwesomeIcon icon={faTimesCircle} className="text-red-500" />
        );
      case "interview":
        return <FontAwesomeIcon icon={faUserTie} className="text-blue-400" />;
      case "exam":
        return (
          <FontAwesomeIcon icon={faPencilRuler} className="text-blue-400" />
        );
      case "background check":
        return (
          <FontAwesomeIcon icon={faUserCheck} className="text-yellow-500" />
        );
      case "decision pending":
        return (
          <FontAwesomeIcon icon={faInfoCircle} className="text-yellow-500" />
        );
      case "failed exam":
        return <TbPencilX className="text-red-500 text-xl animate-pulse" />;
      case "job offer":
        return (
          <FontAwesomeIcon icon={faUserCheck} className="text-green-500" />
        );
      case "decline offer":
        return <FontAwesomeIcon icon={faUserTimes} className="text-red-500" />;
      case "employed":
        return (
          <FontAwesomeIcon
            icon={faUserTie}
            className="text-blue-300 animate-bounce animate-infinite"
          />
        );

      default:
        return (
          <FontAwesomeIcon
            icon={faSpinner}
            className="text-gray-300 animate-spin"
          />
        );
    }
  };

  const openExamModal = (
    jobMId,
    jobTitle,
    jobAppId,
    jobPercentage,
    jobPassingPoints
  ) => {
    setSelectedJobMId(jobMId);
    setSelectedJobTitle(jobTitle);
    setSelectedJobPercentage(jobPercentage);
    setIsExamModalOpen(true);
    setSelectedJobPassingPoints(jobPassingPoints);
    // storeData("jobMId", jobMId);
    storeDataInSession("app_id", jobAppId);
    // storeData("pass_percentage", jobPassingPoints);
  };

  const closeExamModal = () => {
    setIsExamModalOpen(false);
    setSelectedJobMId(null);
  };

  // Function to fetch job offer details
  const fetchJobOffer = async (jobMId) => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const getUserIdFromCookie = () => {
        const tokenData = getDataFromCookie("auth_token");
        if (tokenData && tokenData.userId) {
          return tokenData.userId;
        }
        return null; // Return null if userId is not found or tokenData is invalid
      };
      const userId = session?.user?.id || getUserIdFromCookie();
      console.log("User ID:", userId);

      console.log("jobMId", jobMId);
      const formData = new FormData();
      formData.append("operation", "getJobOffer");
      formData.append(
        "json",
        JSON.stringify({ cand_id: userId, jobM_id: jobMId })
      );

      console.log("formData", formData);

      const response = await axios.post(url, formData);

      console.log("Job offer response:", response.data);

      if (response.data.error) {
        console.error(response.data.error);
      } else {
        const jobOffer = response.data[0];
        setJobOfferDetails(jobOffer);
        setIsJobOfferModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching job offer:", error);
    }
  };

  // Function to open job offer modal
  const openJobOfferModal = (appId, jobMId) => {
    console.log("Opening job offer modal for app ID:", appId);
    console.log("jobMId", jobMId);
    setAppId(appId);
    fetchJobOffer(jobMId);
  };

  const openCancelJobAppliedModal = (appId, jobMId, jobTitle) => {
    setJobAppId(appId);
    setJobMId(jobMId);
    setJobTitle(jobTitle);
    // setJobToCancel({ jobMId, jobTitle });
    setShowCancelModal(true);

    // storeData("appId", appId);
    // storeData("jobMId", jobMId);
    // console.log("jobToCancel", appId, jobMId, jobTitle);
  };

  const refreshTransaction = () => {
    if (fetchAppliedJobs) {
      fetchAppliedJobs();
    }
    if (fetchNotification) {
      fetchNotification();
    }
    if (fetchJobs) {
      fetchJobs();
    }
    if (fetchProfiles) {
      fetchProfiles();
    }
  };
  return (
    <>
      <div
        className={`fixed inset-0 ${
          isDarkMode ? "bg-gray-900/95" : "bg-gray-100/85"
        } backdrop-blur-sm flex flex-col items-center justify-start pt-8 z-50`}
      >
        <div className="w-full max-w-3xl px-4 relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute -top-2 right-6 p-2 rounded-full transition-colors duration-200 ${
              isDarkMode
                ? "text-gray-400 hover:text-white hover:bg-gray-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
            }`}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <img
              src="/assets/images/delmontes.png"
              alt="Del Monte Logo"
              className="h-[100px] md:h-[130px] w-auto hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={refreshTransaction}
            />
          </div>

          {/* Main Content Section */}
          <div
            className={`w-full rounded-lg shadow-lg overflow-hidden ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="p-6">
              <h3
                className={`text-xl font-bold tracking-tight ${
                  isDarkMode ? "text-[#43CD8A]" : "text-[#43CD8A]"
                }`}
              >
                List of Applied Jobs
              </h3>
            </div>

            <div className="px-6 pb-6">
              <div
                className={`max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin ${
                  isDarkMode
                    ? "scrollbar-thumb-green-500 scrollbar-track-gray-700"
                    : "scrollbar-thumb-green-500 scrollbar-track-gray-200"
                }`}
              >
                {appliedJob.length > 0 ? (
                  appliedJob
                    .filter(
                      (job) => job.status_name.toLowerCase() !== "reapply"
                    )
                    .map((job, index) => (
                      <div
                        key={index}
                        className={`mb-3 p-4 rounded-lg border transition-all duration-300 hover:shadow-lg ${
                          isDarkMode
                            ? "bg-gray-700/50 border-gray-600 hover:bg-gray-600"
                            : "bg-white border-green-100 hover:border-green-300"
                        }`}
                        onClick={() => {
                          if (job.status_name.toLowerCase() === "exam") {
                            openExamModal(
                              job.jobM_id,
                              job.jobM_title,
                              job.app_id,
                              job.jobM_passpercentage,
                              job.passing_points
                            );
                          } else if (
                            job.status_name.toLowerCase() === "job offer"
                          ) {
                            openJobOfferModal(job.app_id, job.jobM_id);
                          } else if (
                            job.status_name.toLowerCase() === "pending"
                          ) {
                            openCancelJobAppliedModal(
                              job.app_id,
                              job.jobM_id,
                              job.jobM_title
                            );
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4
                              className={`font-semibold text-lg mb-1 ${
                                isDarkMode ? "text-white" : "text-gray-800"
                              }`}
                            >
                              {job.jobM_title}
                            </h4>
                            <span
                              className={`text-sm ${
                                isDarkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              Updated on: {job.appS_date}
                            </span>
                          </div>

                          <div
                            className={`flex items-center px-3 py-1 rounded-full ${
                              isDarkMode ? "bg-gray-800" : "bg-green-50"
                            }`}
                          >
                            {getStatusIcon(job.status_name)}
                            <span
                              className={`ml-2 text-sm font-medium ${
                                isDarkMode ? "text-green-400" : "text-green-600"
                              }`}
                            >
                              {job.status_name}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div
                    className={`p-8 text-center rounded-lg ${
                      isDarkMode
                        ? "bg-gray-700/50 text-gray-300"
                        : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    <p className="text-lg font-medium">No applied jobs found</p>
                    <p className="text-sm mt-2">
                      Your applications will appear here once you apply for
                      positions
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isExamModalOpen && (
        <ExamModal
          jobMId={selectedJobMId}
          jobTitle={selectedJobTitle}
          jobPercentage={selectedJobPercentage}
          jobPassingPoints={selectedJobPassingPoints}
          fetchAppliedJobs={fetchAppliedJobs}
          fetchJobs={fetchJobs}
          fetchNotification={fetchNotification}
          fetchExamResult={fetchExamResult}
          startTimer={isExamModalOpen}
          onClose={() => {
            closeExamModal();
            removeSessionData("app_id");
          }}
        />
      )}
      {isJobOfferModalOpen && (
        <JobOfferModal
          jobOfferDetails={jobOfferDetails}
          fetchJobOffer={fetchJobOffer}
          fetchAppliedJobs={fetchAppliedJobs}
          fetchJobs={fetchJobs}
          fetchNotification={fetchNotification}
          appId={appId}
          onClose={() => {
            setIsJobOfferModalOpen(false);
            setAppId(null);
          }}
        />
      )}
      {showCancelModal && (
        <CancelJobModal
          // jobTitle={jobToCancel.jobTitle}
          jobAppId={jobAppId}
          jobTitle={jobTitle}
          jobMId={jobMId}
          onCancel={showCancelModal}
          fetchAppliedJobs={fetchAppliedJobs}
          fetchJobs={fetchJobs}
          fetchNotification={fetchNotification}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </>
  );
};

export default AppliedJobs;
