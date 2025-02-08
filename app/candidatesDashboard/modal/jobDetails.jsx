"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import axios from "axios";
import Link from "next/link";
import { hourglass } from "ldrs";

hourglass.register();

import {
  getDataFromSession,
  getDataFromCookie,
} from "@/app/utils/storageUtils";
// import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { revalidatePath } from "next/cache";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast"; // Import from react-hot-toast
import ViewProfile from "./viewProfile";

// import { fetchAppliedJobs } from "../sideBar/sideBar.jsx";

// import { fetchJobs } from "./candidatesDashboard/page.js";

const JobDetailsModal = ({
  job,
  onClosedd,
  fetchJobs,
  fetchAppliedJobs,
  fetchNotification,
  appliedJobs,
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const modalRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profile, setProfile] = useState(null);
  // const [AppliedJobs, setAppliedJobs] = useState([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function fetchProfile() {
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

      const jsonData = { cand_id: userId };

      const formData = new FormData();
      formData.append("operation", "getCandidateProfile");
      formData.append("json", JSON.stringify(jsonData));

      const response = await axios.post(url, formData);
      console.log("Profile response:", response.data);
      ("");
      setProfile(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfile();
    // fetchAppliedJobs();
  }, []);

  // useEffect(() => {
  //   function handleClickOutside(event) {
  //     if (modalRef.current && !modalRef.current.contains(event.target)) {
  //       onClose();
  //     }
  //     // removeData("jobId");
  //   }

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [onClose]);

  const calculateCompletionPercentage = () => {
    let totalFields = 20;
    let completedFields = 0;

    if (profile.educationalBackground.length > 0) completedFields++;
    if (profile.employmentHistory.length > 0) completedFields++;
    if (profile.skills.length > 0) completedFields++;
    if (profile.training.length > 0) completedFields++;
    if (profile.knowledge.length > 0) completedFields++;
    if (profile.license.length > 0) completedFields++;
    if (profile.resume.length > 0) completedFields++;

    if (profile.candidateInformation.cand_firstname) completedFields++;
    if (profile.candidateInformation.cand_lastname) completedFields++;
    if (profile.candidateInformation.cand_contactNo) completedFields++;
    if (profile.candidateInformation.cand_alternatecontactNo) completedFields++;
    if (profile.candidateInformation.cand_presentAddress) completedFields++;
    if (profile.candidateInformation.cand_permanentAddress) completedFields++;
    if (profile.candidateInformation.cand_dateofBirth) completedFields++;
    if (profile.candidateInformation.cand_alternateEmail) completedFields++;
    if (profile.candidateInformation.cand_sssNo) completedFields++;
    if (profile.candidateInformation.cand_tinNo) completedFields++;
    if (profile.candidateInformation.cand_philhealthNo) completedFields++;
    if (profile.candidateInformation.cand_pagibigNo) completedFields++;
    if (profile.candidateInformation.cand_profPic) completedFields++;

    return (completedFields / totalFields) * 100;
  };

  const handleApply = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    if (
      profile.candidateInformation.length === 0 ||
      profile.skills.length === 0 ||
      profile.employmentHistory.length === 0 ||
      profile.educationalBackground.length === 0 ||
      // profile.knowledge.length === 0 ||
      // profile.training.length === 0 ||
      // profile.license.length === 0 ||
      profile.resume.length === 0
    ) {
      toast.error(
        <div className="flex flex-col items-center space-y-4 p-4 bg-red-50 rounded-xl shadow-lg max-w-md mx-auto text-center">
          <div>
            <p className="text-base font-semibold text-red-800 mb-2">
              Profile Incomplete
            </p>
            <p className="text-sm text-red-600 mb-3">
              Please complete your profile information before applying to this
              job. Ensure all required sections are filled out to proceed with
              your application.
            </p>
            <div className="w-full bg-red-200 rounded-full h-2.5 mb-3">
              <div
                className="bg-red-600 h-2.5 rounded-full"
                style={{
                  width: `${calculateCompletionPercentage()}%`,
                  transition: "width 0.5s ease-in-out",
                }}
              ></div>
            </div>
            <p className="text-xs text-red-700 mb-2">
              Profile Completion: {Math.round(calculateCompletionPercentage())}%
            </p>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="w-full px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors duration-200"
          >
            Click here to Complete Profile
          </button>
        </div>,
        {
          duration: 4000,
          position: "top-center",
          style: {
            background: "transparent",
            boxShadow: "none",
            padding: "0",
          },
        }
      );
      return;
    }

    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

      const getUserIdFromCookie = () => {
        const tokenData = getDataFromCookie("auth_token");
        if (tokenData && tokenData.userId) {
          return tokenData.userId;
        }
        return null; // Return null if userId is not found or tokenData is invalid
      };

      // Example usage
      const userId = session?.user?.id || getUserIdFromCookie();
      console.log("User ID:", userId);
      const jobId = getDataFromSession("jobId");

      // console.log("user_id:", user_id, "jobId:", jobId);

      const formData = new FormData();
      formData.append("operation", "applyForJob");
      formData.append("user_id", userId);
      formData.append("jobId", jobId);

      const response = await axios.post(url, formData);

      console.log(response);

      if (response.data.success) {
        setSuccess("You have successfully applied for the job!");

        if (fetchAppliedJobs) {
          fetchAppliedJobs();
        }
        if (fetchNotification) {
          fetchNotification();
        }
        if (fetchJobs) {
          fetchJobs();
        }

        console.log("fetchAppliedJobs:", fetchAppliedJobs);
        console.log("fetchNotification:", fetchNotification);
        console.log("fetchJobs:", fetchJobs);
        // removeData("jobId");

        setIsRedirecting(true);
        getDataFromSession("jobId");

        setTimeout(() => {
          setIsRedirecting(false);
          onClosedd();
        }, 10000);
        toast.success("Applied successfully!");
      } else if (response.data.status === "duplicate") {
        toast(response.data.message, {
          icon: "⚠️",
          style: {
            border: "1px solid #FF0000",
            padding: "16px",
            color: "#FF0000",
          },
        });
        // removeData("jobId");
      } else {
        throw new Error(response.data.error || "Failed to apply for the job.");
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem("appearance");
    if (savedTheme && savedTheme !== "system") {
      return savedTheme === "dark";
    }

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return prefersDark;
  };

  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  // useEffect(() => {
  //   const theme = isDarkMode ? "dark" : "light";
  //   localStorage.setItem("theme", theme);
  //   document.body.className = theme;
  //   console.log("Setting theme:", theme);
  // }, [isDarkMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  // Toggle function to switch themes manually
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  if (!job) return null;

  const dutiesArray = job.duties_text ? job.duties_text.split("|") : [];
  const educationArray = job.course_categoryName
    ? job.course_categoryName.split("|").join(", ")
    : [];
  const workResponsibilitiesArray = job.jwork_responsibilities
    ? job.jwork_responsibilities
        .split("|")
        .map((responsibility) => responsibility.trim())
    : [];

  const workDurationsArray = job.jwork_duration
    ? job.jwork_duration.split("|").map((duration) => duration.trim())
    : [];

  const workDetailsArray = workResponsibilitiesArray.map(
    (responsibility, index) => ({
      responsibility: responsibility || "",
      duration: workDurationsArray[index] || "",
    })
  );

  // const knowledgeArray = job.jknow_text ? job.jknow_text.split("|") : [];
  const knowledgeArray = job.knowledge_name
    ? job.knowledge_name.split("|").join(", ") // Join knowledge items with a comma
    : [];

  const skillsArray = job.jskills_text ? job.jskills_text.split("|") : [];
  const trainingArray = job.perT_name
    ? job.perT_name.split("|").join(", ")
    : [];

  const licenseArray = job.license_master_name
    ? job.license_master_name.split("|").join(", ")
    : [];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isDarkMode ? "bg-black bg-opacity-80" : "bg-black bg-opacity-50"
      }`}
    >
      <div
        ref={modalRef}
        className={`relative p-6 rounded-lg max-w-4xl w-full ${
          isDarkMode ? "bg-[#1D1D1D] text-gray-200" : "bg-white text-black"
        }`}
      >
        <div
          className={`sticky top-0 left-0 right-0 ${
            isDarkMode ? "bg-[#1D1D1D]" : "bg-white"
          } z-10 pb-4 border-b ${
            isDarkMode
              ? "border-gray-700 text-gray-200"
              : "border-gray-200 text-[#0A6338]"
          } text-center`}
        >
          <h2 className="text-xl font-bold mb-4">{job.jobM_title}</h2>
        </div>

        <div
          className={`overflow-y-auto scrollbar-custom ${
            isDarkMode ? "scrollbar-thumb-gray-600" : "scrollbar-thumb-gray-300"
          }`}
          style={{ paddingBottom: "6rem", maxHeight: "70vh" }}
        >
          <h2 className="text-lg font-bold mb-4">Job Description:</h2>
          <p className="mb-8">{job.jobM_description}</p>

          {dutiesArray.length > 0 && (
            <>
              <h2 className="text-lg font-bold mb-4">
                Duties and Responsibilities:
              </h2>
              <ul className="list-disc pl-5 mb-8">
                {dutiesArray.map((duty, index) => (
                  <li key={index} className="mb-2">
                    {duty}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div>
            <h2 className="text-lg font-bold mb-4">Qualifications:</h2>

            {educationArray.length > 0 && (
              <>
                {/* <h3 className="text-md font-semibold mb-2">Education:</h3> */}
                <ul className="list-disc pl-5 mb-4">
                  <li className="mb-2">
                    Graduate of any {educationArray} courses.
                  </li>
                </ul>
              </>
            )}

            {licenseArray.length > 0 && (
              <>
                <ul className="list-disc pl-5 mb-4">
                  <li className="mb-2">
                    Having a {licenseArray} is considered an advantage.
                  </li>
                </ul>
              </>
            )}

            {trainingArray.length > 0 && (
              <>
                {/* <h3 className="text-md font-semibold mb-2">Training:</h3> */}
                <ul className="list-disc pl-5 mb-4">
                  <li className="mb-2">With training in {trainingArray} </li>
                </ul>
              </>
            )}

            <div className="job-details">
              {workDetailsArray.length > 0 && (
                <>
                  {/* <h3 className="text-md font-semibold mb-2">
                    Work Experience:
                  </h3> */}
                  <ul className="list-disc pl-5">
                    {workDetailsArray.map((detail, index) => (
                      <li key={index} className="mb-2">
                        <p>
                          At least {detail.duration} years of experience in a{" "}
                          {detail.responsibility}
                        </p>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {knowledgeArray.length > 0 && (
              <>
                {/* <h3 className="text-md font-semibold mb-2">Knowledge:</h3> */}
                <ul className="list-disc pl-5 mb-4 mt-4">
                  <li className="mb-2">Knowledge in {knowledgeArray} </li>
                </ul>
              </>
            )}

            {skillsArray.length > 0 && (
              <>
                {/* <h3 className="text-md font-semibold mb-2">Skills:</h3> */}
                <ul className="list-disc pl-5 mb-4">
                  {skillsArray.map((skill, index) => (
                    <li key={index} className="mb-2 mt-4">
                      {skill}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <div
          className={`absolute bottom-0 left-0 right-0 p-4 ${
            isDarkMode
              ? "bg-[#1D1D1D] border-gray-700"
              : "bg-white border-gray-200"
          } flex justify-between`}
        >
          {Array.isArray(appliedJobs) &&
          appliedJobs.some(
            (item) =>
              item.Is_Applied !== 0 &&
              item.jobM_id === job.jobM_id &&
              [
                "Pending",
                "Processed",
                "Interview",
                "Exam",
                "Background Check",
                "Job Offer",
                "Employed",
                "Failed Exam",
                "Decision Pending",
              ].includes(item.status_name)
          ) ? (
            <button
              className={`px-4 py-2 rounded-md relative transition-transform duration-300 ease-in-out bg-gray-400 cursor-not-allowed`}
              style={{
                boxShadow: "0 10px 15px rgba(0, 0, 0, 0.3)",
              }}
              disabled
            >
              Already Applied
            </button>
          ) : Array.isArray(appliedJobs) &&
            appliedJobs.some(
              (item) =>
                item.Is_Applied !== 0 &&
                item.jobM_id === job.jobM_id &&
                ["Cancelled", "Decline Offer"].includes(item.status_name)
            ) ? (
            <button
              onClick={handleApply}
              className={`px-4 py-2 rounded-md relative transition-transform duration-300 ease-in-out ${
                isDarkMode
                  ? "bg-green-600 text-white hover:scale-110 hover:-translate-y-1"
                  : "bg-green-700 hover:bg-[#0A6338] text-white hover:scale-110 hover:-translate-y-1"
              }`}
              style={{
                boxShadow: "0 10px 15px rgba(0, 0, 0, 0.3)",
              }}
            >
              Reapply
            </button>
          ) : (
            <button
              onClick={handleApply}
              className={`px-4 py-2 rounded-md relative transition-transform duration-300 ease-in-out ${
                isDarkMode
                  ? "bg-green-600 text-white hover:scale-110 hover:-translate-y-1"
                  : "bg-green-700 hover:bg-[#0A6338] text-white hover:scale-110 hover:-translate-y-1"
              }`}
              style={{
                boxShadow: "0 10px 15px rgba(0, 0, 0, 0.3)",
              }}
            >
              Apply
            </button>
          )}

          <button
            onClick={onClosedd}
            className={`px-4 py-2 rounded-md relative transition-transform duration-300 ease-in-out hover:scale-110 hover:-translate-y-1 ${
              isDarkMode ? "bg-gray-600 text-white" : "bg-gray-500 text-white"
            }`}
            style={{
              boxShadow: "0 10px 15px rgba(0, 0, 0, 0.3)",
            }}
          >
            Close
          </button>
        </div>
      </div>
      <Toaster position="bottom-left" />

      {isRedirecting && (
        <div className="fixed inset-0 bg-[#01472B] bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <l-hourglass
              size="40"
              bg-opacity="0.1"
              speed="1.75"
              color="white"
            ></l-hourglass>
            <p className="text-white text-xl font-semibold mt-4">
              Application Received
            </p>
            <p className="text-green-300 mt-2">
              Thank you for your application. We are currently reviewing it and
              will contact you soon to provide details on the next steps.
            </p>
            <p className="text-green-300 mt-2">
              Thank you for your interest in this position.
            </p>
          </div>
        </div>
      )}

      {isProfileModalOpen && (
        <ViewProfile
          isOpen={isProfileModalOpen}
          setShowModal={setIsProfileModalOpen}
          onClosed={() => setIsProfileModalOpen(false)}
        />
      )}
    </div>
  );
};

export default JobDetailsModal;
