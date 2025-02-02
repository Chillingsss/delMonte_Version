import React, { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faSignOutAlt,
  faInfoCircle,
  faSun,
  faMoon,
  faUser,
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

import ViewProfile from "../modal/viewProfile";

import {
  faUser as faUserRegular,
  faCheckCircle as faCheckCircleRegular,
} from "@fortawesome/free-regular-svg-icons";

import axios from "axios";
import secureLocalStorage from "react-secure-storage";
import {
  retrieveDataFromCookie,
  retrieveDataFromSession,
  storeDataInCookie,
  storeDataInSession,
  removeDataFromCookie,
  removeDataFromSession,
  retrieveData,
  storeData,
  removeData,
  removeSessionData,
  getDataFromSession,
} from "../../utils/storageUtils"; // Import the utility functions
import { FaUserTie, FaUserTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";
import ExamModal from "../exam/exam";
import JobOfferModal from "../modal/jobOffer";
import CancelJobModal from "../modal/cancelJobApplied"; // Import the new modal component

// Import useNavigate

const Sidebar = ({
  userName,
  isDarkMode,
  setIsDarkMode,
  handleLogout,
  isMenuOpen,
  setIsMenuOpen,
  handleViewProfileClick,
  appliedJobs,
  examResults,
  fetchAppliedJobs,
  fetchExamResult,
  fetchJobs,
  fetchNotification,
  fetchProfiles,
}) => {
  const router = useRouter();
  const sidebarRef = useRef(null);
  const dropdownUsernameRef = useRef(null);
  const dropdownRef = useRef(null);

  //   const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // const [appliedJobs, setAppliedJobs] = useState([]);

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

  // const [examResults, setExamResults] = useState([]);

  const [isJobOfferModalOpen, setIsJobOfferModalOpen] = useState(false);
  const [jobOfferDetails, setJobOfferDetails] = useState(null); // State to hold job offer details

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // async function fetchAppliedJobs() {
  //   try {
  //     const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

  //     const personalInfoId = retrieveData("user_id");
  //     // console.log("cand ID:", personalInfoId);

  //     if (!personalInfoId) {
  //       // console.error("No cand_id found in localStorage.");
  //       return;
  //     }

  //     const formData = new FormData();
  //     formData.append("operation", "getAppliedJobs");
  //     formData.append("json", JSON.stringify({ cand_id: personalInfoId }));

  //     const response = await axios.post(url, formData);

  //     if (response.data.error) {
  //       console.error(response.data.error);
  //     } else {
  //       setAppliedJobs(response.data);
  //       // console.log("Applied jobs:", response.data);
  //       // const passingpoints = response.data.passing_points;
  //       // localStorage.setItem("passing", passingpoints);
  //       // localStorage.setItem("app_id", response.data[0].app_id);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching applied jobs:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  // useEffect(() => {
  //   fetchAppliedJobs();
  // }, []);

  // const fetchExamResult = async () => {
  //   try {
  //     const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
  //     const candId = retrieveData("user_id");

  //     const formData = new FormData();
  //     formData.append("operation", "fetchExamResult");
  //     formData.append("json", JSON.stringify({ cand_id: candId }));
  //     const examResultsResponse = await axios.post(url, formData);

  //     console.log("exam result", examResultsResponse.data);

  //     setExamResults(examResultsResponse.data);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  // useEffect(() => {
  //   // fetchAppliedJobs();
  //   fetchExamResult();
  // }, []);

  // const userId = retrieveData("user_id");

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
      const candId = getDataFromSession("user_id");
      // const appId = localStorage.getItem("app_id");

      console.log("jobMId", jobMId);
      const formData = new FormData();
      formData.append("operation", "getJobOffer");
      formData.append(
        "json",
        JSON.stringify({ cand_id: candId, jobM_id: jobMId })
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

  // const handleCancelJob = async () => {
  //   // if (!jobToCancel) return;
  //   const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
  //   // const { appId, jobMId } = jobToCancel;
  //   const userId = retrieveData("user_id");
  //   const appId = retrieveData("app_id");
  //   const jobMId = retrieveData("jobMId");

  //   console.log("appId", appId, jobMId);

  //   try {
  //     const formData = new FormData();
  //     formData.append("operation", "cancelJobApplied");
  //     formData.append(
  //       "json",
  //       JSON.stringify({ user_id: userId, jobId: jobMId, appId: appId })
  //     );

  //     const response = await axios.post(url, formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     if (response.data.error) {
  //       console.error(response.data.error);
  //     } else {
  //       console.log(response.data.success);
  //       fetchAppliedJobs();
  //     }
  //   } catch (error) {
  //     console.error("Error cancelling job application:", error);
  //   } finally {
  //     setShowCancelModal(false);
  //     setJobToCancel(null);
  //   }
  // };

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
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full p-5 rounded-r-lg flex flex-col transform transition-transform duration-300 ease-in-out z-50
      ${isMenuOpen ? "translate-x-0 w-60" : "-translate-x-full w-72"}
      ${isDarkMode ? "bg-[#0A6338]" : "bg-[#0A6338]"}
      md:w-72 md:translate-x-0`}
      >
        <div
          className="relative inline-block text-left"
          // ref={dropdownUsernameRef}
        >
          <div
            onClick={refreshTransaction}
            className="flex justify-center items-center mt-2 cursor-pointer"
          >
            <img
              src="/assets/images/delmontes.png"
              alt="Del Monte Logo"
              className="h-[100px] md:h-[130px] w-auto"
            />
          </div>
          {/* <button
            onClick={toggleUserDropdown}
            className={`text-lg font-bold flex justify-start items-center md:hidden ${
              isDarkMode
                ? "text-[#93B1A6] hover:text-green-300"
                : "text-[#93B1A6] hover:text-green-600"
            }`}
          >
            <FontAwesomeIcon icon={faUserRegular} className="mr-2 text-2xl" />

            {userName}
            <FontAwesomeIcon icon={faChevronDown} className="ml-2 text-sm" />
          </button>
          {isUserDropdownOpen && (
            <div
              className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl z-10
              ${
                isDarkMode
                  ? "bg-[#5C8374] text-white "
                  : "bg-gray-300 text-black"
              }`}
            >
              <div className="p-4">
                <button
                  className={`w-full mt-5 text-left py-2 text-sm flex items-center rounded-lg
                  ${
                    isDarkMode
                      ? "hover:bg-[#5C8374] text-gray-200"
                      : "hover:bg-gray-200 text-black"
                  }`}
                  onClick={() =>
                    handleViewProfileClick(retrieveData("user_id"))
                  }
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
                  View Profile
                </button>

                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-full text-left py-2 text-sm flex items-center rounded-lg mt-2 ${
                    isDarkMode
                      ? "text-white"
                      : "text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={isDarkMode ? faSun : faMoon}
                    className="mr-2"
                  />
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </button>

                <button
                  onClick={() => {
                    console.log("Logout button clicked");
                    handleLogout();
                  }}
                  className={`w-full text-left py-2 text-sm flex items-center mt-2 rounded-lg
                ${isDarkMode ? "hover:bg-green-700" : "hover:bg-gray-200"}`}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )} */}
        </div>

        <div className="mt-3">
          <div className="mt-20">
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-[#43CD8A]" : "text-[#43CD8A]"
              } mb-4`}
            >
              LIST OF APPLIED JOBS
            </h3>

            <div
              className={`max-h-60 overflow-y-auto scrollbar-custom ${
                isDarkMode
                  ? "scrollbar-thumb-green-500 scrollbar-track-green-300"
                  : ""
              }`}
            >
              {appliedJobs.length > 0 ? (
                appliedJobs
                  .filter((job) => job.status_name.toLowerCase() !== "reapply")
                  .map((job, index) => (
                    <div
                      key={index}
                      className={`mb-4 p-4 rounded-lg shadow-md flex flex-col items-start text-[15px] cursor-pointer transition-all duration-300 ${
                        isDarkMode
                          ? "bg-gray-800 text-green-200 hover:bg-green-700"
                          : "bg-[#059e54] text-white hover:bg-green-600"
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
                      <span className="flex justify-between w-full items-center">
                        <span className="flex flex-col">
                          <span className="font-medium">{job.jobM_title}</span>
                          {/* <span
                            className={`text-sm ${
                              isDarkMode ? "text-gray-800" : "text-gray-300"
                            }`}
                          >
                            {job.appS_date}
                          </span> */}
                        </span>
                        <span className="flex items-center">
                          {getStatusIcon(job.status_name)}
                          <span
                            className={`ml-2 text-xs flex flex-col ${
                              isDarkMode ? "text-green-400" : "text-gray-300"
                            } animate-pulse transition-opacity duration-800 ease-in-out`}
                          >
                            {job.status_name}
                            <span
                              className={`text-sm ${
                                isDarkMode ? "text-gray-400" : "text-gray-300"
                              }`}
                            >
                              {job.appS_date}
                            </span>
                          </span>
                        </span>
                      </span>
                    </div>
                  ))
              ) : (
                <p
                  className={`p-4 rounded-lg shadow-md ${
                    isDarkMode
                      ? "bg-[#1F2937] text-green-300"
                      : "bg-[#059e54] text-white"
                  }`}
                >
                  No applied jobs.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 h-60">
            {examResults.length > 0 && (
              <div className="mt-6 h-60 relative">
                <div className="sticky top-0">
                  <h3 className="text-xl font-semibold text-[#43CD8A]">
                    Exam Results
                  </h3>
                </div>
                <div className="mt-4 max-h-[calc(100%-48px)] overflow-y-auto scrollbar-custom">
                  {examResults.map((result, index) => (
                    <div
                      key={index}
                      className={`mb-4 p-4 rounded-lg shadow-md ${
                        isDarkMode
                          ? "bg-gray-800 text-green-200"
                          : "bg-[#059e54] text-white"
                      }`}
                    >
                      <h4 className="text-lg font-medium">
                        {result.jobM_title}
                      </h4>
                      <p className="text-sm">
                        Score:{" "}
                        <span className="font-semibold">
                          {result.examR_score}
                        </span>{" "}
                        /{" "}
                        <span className="font-semibold">
                          {result.examR_totalscore}
                        </span>
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          result.examR_status === "Passed"
                            ? "text-green-200"
                            : "text-red-500"
                        }`}
                      >
                        Status: {result.examR_status}
                      </p>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-white" : "text-gray-200"
                        }`}
                      >
                        Date: {result.examR_date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
    // </div>
  );
};

export default Sidebar;
