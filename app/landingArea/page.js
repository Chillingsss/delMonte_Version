"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import JobDetailsModal from "./modal/jobDetails";
import { getDataFromCookie, getDataFromSession } from "../utils/storageUtils";
import { Briefcase } from "lucide-react";
import { lineSpinner } from "ldrs";

lineSpinner.register();

export default function LandingArea() {
  const [job, setJob] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const handleDetailsClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  useEffect(() => {
    // Retrieve the user level from session storage
    const getUserLevelFromCookie = () => {
      const tokenData = getDataFromCookie("auth_token");
      if (tokenData && tokenData.userLevel) {
        return tokenData.userLevel;
      }
      return null; // Return null if userId is not found or tokenData is invalid
    };

    const userLevel = getUserLevelFromCookie();
    console.log("User Level:", userLevel);

    // Redirect based on the user level
    switch (userLevel) {
      case "100":
      case "100.0":
        router.replace("/admin/dashboard");
        break;
      case "2":
        router.replace("/superAdminDashboard");
        break;
      case "supervisor":
        router.replace("/supervisorDashboard");
        break;
      case "1": // Handle both "1" and "1.0" cases
      case "1.0":
        router.replace("/candidatesDashboard");
        break;
      default:
        router.replace("/"); // Redirect to the home page or login page
    }
  }, [router]);

  async function fetchJobs() {
    try {
      // console.log("Fetching jobs...");
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

      const formData = new FormData();
      formData.append("operation", "getActiveJobs");
      const response = await axios.post(url, formData);

      // console.log("Response:", response);
      // console.log("Response data:", response.data);

      if (Array.isArray(response.data)) {
        // console.log("Setting jobs:", response.data);
        setJob(response.data);
      } else if (response.data.error) {
        // console.error("Server error:", response.data.error);
        setError("Error fetching jobs: " + response.data.error);
      } else {
        // console.error("Invalid data format:", response.data);
        setError("Unexpected data format received from server.");
      }
    } catch (error) {
      // console.error(
      //   "Error fetching jobs:",
      //   error.response || error.message || error
      // );
      setError("Error fetching jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, [job]);

  return (
    <div className="min-h-screen bg-[#f4f7fc]">
      <div className="p-4 flex justify-between items-center text-center text-white fixed top-0 left-0 z-10 w-full h-20 sm:h-24 md:h-32 bg-[#116b40] slide-up">
        <img
          src="/assets/images/delMontes.png"
          alt="Del Monte Logo"
          className="h-10 sm:h-10 md:h-[120px] w-auto"
        />

        <div className="flex justify-center items-center h-full">
          <h1 className="text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl font-semibold">
            Explore Exciting Careers at Del Monte
          </h1>
        </div>

        <Link href="/login">
          <button className="bg-green-500 text-white px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm md:text-base rounded-md">
            Log In
          </button>
        </Link>
      </div>

      <div className="p-8 mt-[calc(4rem+8px)] sm:mt-[calc(5rem+8px)] md:mt-[calc(6rem+8px)] lg:mt-[calc(7rem+8px)] overflow-y-auto">
        <h2 className="text-3xl font-semibold text-[#188C54] mb-6">
          Active Jobs
        </h2>

        {loading ? (
          <div className="flex items-center justify-center h-64 flex-col">
            <div className="text-center">
              <l-line-spinner
                size="40"
                speed="1.75"
                color="black"
              ></l-line-spinner>
              <p className="text-green-700 mt-2">
                Please wait while we load available jobs
              </p>
            </div>
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : job.length === 0 ? (
          <p className="text-center text-gray-500">No jobs available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {job.map((job) => (
              <div
                key={job.jobM_id}
                className="rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl bg-white"
              >
                <div className="p-4 h-20 flex items-center justify-start bg-[#188C54]">
                  <Briefcase className="w-6 h-6 text-white mr-2" />

                  <h3 className="text-xl font-semibold text-white truncate">
                    {job.jobM_title}
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex items-center space-x-2 text-sm mt-4 text-black">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>{job.Total_Applied} Applicants</span>
                  </div>

                  <div className="flex items-center space-x-1 text-sm mb-5 text-black">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{job.jobM_createdAt}</span>
                  </div>

                  <button
                    onClick={() => handleDetailsClick(job)}
                    className="w-full px-4 py-2 rounded-md font-semibold transition-colors duration-300 bg-[#188C54] hover:bg-green-600 text-white shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isModalOpen && (
        <JobDetailsModal
          job={selectedJob}
          onCloses={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
