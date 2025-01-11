"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
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
  setupInactivityMonitoring,
} from "../utils/storageUtils";

import {
  faChevronDown,
  faMoon,
  faSun,
  faSignOutAlt,
  faInfoCircle,
  faUser,
  faBell,
  faTimes,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBellSlash,
  faUser as faUserRegular,
  faBell as faBellRegular,
} from "@fortawesome/free-regular-svg-icons";
import Sidebar from "./sideBar/sideBar";
import secureLocalStorage from "react-secure-storage";
import JobDetailsModal from "./modal/jobDetails";
import ViewProfile from "./modal/viewProfile";
import ExamModal from "./exam/exam";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { MdClose, MdRefresh } from "react-icons/md";
import { FaBell } from "react-icons/fa";
import JobOfferModal from "./modal/jobOffer";
import CancelJobModal from "./modal/cancelJobApplied";
import {
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { SearchIcon, XCircleIcon, Briefcase, User } from "lucide-react";
import { UserIcon } from "@heroicons/react/24/solid";
import { lineSpinner } from "ldrs";
import { set } from "date-fns";

lineSpinner.register();

export default function DashboardCandidates() {
  const [jobs, setJobs] = useState([]);
  const dropdownUsernameRef = useRef(null);
  const dropdownUsernameMobileRef = useRef(null);

  const [notification, setNotification] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [appliedJobsLoading, setAppliedJobsLoading] = useState(true);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isUserDropdownOpenMobile, setIsUserDropdownOpenMobile] =
    useState(false);

  const dropdownNotificationRef = useRef(null);
  const dropdownNotificationRefMobile = useRef(null);

  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
    useState(false);
  const [
    isNotificationDropdownOpenMobile,
    setIsNotificationDropdownOpenMobile,
  ] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(false);

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

  const [examResults, setExamResults] = useState([]);

  const [isJobOfferModalOpen, setIsJobOfferModalOpen] = useState(false);
  const [jobOfferDetails, setJobOfferDetails] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [jobToCancel, setJobToCancel] = useState(null);

  const [reappliedJobs, setReappliedJobs] = useState([]);

  const [mounted, setMounted] = useState(false);

  const [profile, setProfile] = useState({
    candidateInformation: {},
    educationalBackground: [],
    employmentHistory: {},
    skills: [],
    training: [],
  });

  const [isInactive, setIsInactive] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const fetchProfiles = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

      const cand_id = retrieveData("user_id");

      const jsonData = { cand_id: cand_id };

      const formData = new FormData();
      formData.append("operation", "getCandidateProfile");
      formData.append("json", JSON.stringify(jsonData));

      const response = await axios.post(url, formData);
      console.log("res", response.data);
      setProfile(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const filteredJobs = jobs.filter((job) => {
    const jobData = [
      job.jobM_title?.toLowerCase(),
      job.course_categoryName?.toLowerCase(),
      job.duties_text?.toLowerCase(),
      job.jknow_text?.toLowerCase(),
      job.jobM_createdAt?.toLowerCase(),
      job.jobM_description?.toLowerCase(),
      job.jskills_text?.toLowerCase(),
      job.jwork_responsibilities?.toLowerCase(),
      job.knowledge_name?.toLowerCase(),
      job.license_master_name?.toLocaleString()?.toLowerCase(),
      job.perT_name?.toLowerCase(),
    ];

    return jobData.some((data) => data?.includes(searchQuery.toLowerCase()));
  });

  useEffect(() => {
    // Debug: Log all cookies
    // console.log('All Cookies:', document.cookie);

    const token = retrieveDataFromCookie("auth_token");
    // console.log('Retrieved token:', token);

    if (!token) {
      // console.log('No token found, logging out');
      handleLogout();
      return;
    }

    try {
      // Decode and verify token
      const decodedToken = JSON.parse(atob(token));
      // console.log('Decoded token:', decodedToken);

      const tokenTimestamp = decodedToken.timestamp;
      const currentTime = new Date().getTime();
      const tokenAge = currentTime - tokenTimestamp;
      // console.log('Token age (ms):', tokenAge);

      // Check if token is expired (24 hours = 86400000 milliseconds)
      if (tokenAge > 86400000) {
        // console.log('Token expired');
        handleLogout();
        return;
      }

      // Verify user level matches
      // const storedUserLevel = retrieveData("user_level");
      // // console.log('Stored user level:', storedUserLevel);
      // // console.log('Token user level:', decodedToken.userLevel);

      // if (decodedToken.userLevel !== storedUserLevel) {
      //   // console.log('User level mismatch');
      //   handleLogout();
      //   return;
      // }
    } catch (error) {
      console.error("Token validation failed:", error);
      handleLogout();
      return;
    }

    // Token is valid, continue with normal flow
    const encodedToken = retrieveDataFromCookie("auth_token");
    const tokenData = encodedToken ? JSON.parse(atob(encodedToken)) : null;
    const userLevel = tokenData?.userLevel;
    const userName = retrieveDataFromCookie("first_name");
    // const userId = retrieveData("user_id");
    // const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
    // const token = retrieveDataFromCookie("auth_token");
    // const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
    // const userLevel = retrieveDataFromCookie("auth_token");

    if (!token) {
      sessionStorage.clear();

      // Clear all cookies
      document.cookie.split(";").forEach((cookie) => {
        const cookieName = cookie.split("=")[0].trim();
        document.cookie = `${cookieName}=;max-age=0;path=/;secure;samesite=Strict`;
      });

      router.push("/");
      return;
    }

    switch (userLevel) {
      case "100.0":
        router.replace("/admin/dashboard");
        break;
      case "2":
        router.replace("/superAdminDashboard");
        break;
      case "supervisor":
        router.replace("/supervisorDashboard");
        break;
      case "1.0":
        router.replace("/candidatesDashboard");
        break;
      default:
        // console.log("Unexpected user level, redirecting to landing area.");
        router.replace("/");
    }

    const name = retrieveDataFromCookie("name");
    // const lastName = retrieveData("last_name");
    setUserName(`${name}`);
  }, [router]);

  // useEffect(() => {
  //   localStorage.setItem("theme", isDarkMode ? "darks" : "light");
  //   console.log("Setting theme:", isDarkMode ? "darks" : "light");
  // }, [isDarkMode]);

  // const [isDarkMode, setIsDarkMode] = useState(() => {
  //   const savedTheme = localStorage.getItem("theme");
  //   return savedTheme === "darks";
  // });

  const handleViewProfileClick = (candId) => {
    setSelectedCandidateId(candId);
    setIsUserDropdownOpen(false);
    setIsProfileModalOpen(true);
    setIsMenuOpen(false);
    // setIsDarkMode(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);

    setSelectedCandidateId(null);
  };

  const fetchJobs = useCallback(async () => {
    // setLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const candId = retrieveData("user_id");

      const formData = new FormData();
      formData.append("operation", "getActiveJob");
      formData.append("json", JSON.stringify({ cand_id: candId }));

      const response = await axios.post(url, formData);

      if (Array.isArray(response.data)) {
        console.log("Setting jobs:", response.data);
        setJobs(response.data);
      } else {
        console.error("Invalid data format:", response.data);
        setError("Unexpected data format received from server.");
      }
    } catch (error) {
      console.error(
        "Error fetching jobs:",
        error.response || error.message || error
      );
      setError("Error fetching jobs");
    } finally {
      // setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchProfiles();
  }, []);

  const fetchNotification = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const candId = retrieveData("user_id");

      const formData = new FormData();
      formData.append("operation", "getNotification");
      formData.append("json", JSON.stringify({ cand_id: candId }));

      const response = await axios.post(url, formData);
      console.log("Notification response:", response.data);

      // Ensure response.data is an array
      const notifications = Array.isArray(response.data) ? response.data : [];
      setNotification(notifications);

      // Calculate unread notifications
      const unreadCount = notifications.reduce((count, notif) => {
        return count + (notif.notification_read === 0 ? 1 : 0);
      }, 0);

      setUnreadNotificationCount(unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotification([]);
      setUnreadNotificationCount(0);
    }
  };

  useEffect(() => {
    fetchNotification();
  }, []);

  const markNotificationsAsRead = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const candId = retrieveData("user_id");

      const formData = new FormData();
      formData.append("operation", "markNotificationsAsRead");
      formData.append("json", JSON.stringify({ cand_id: candId }));
      await axios.post(url, formData);

      // Reset the count to zero on the frontend
      setUnreadNotificationCount(0);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
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

  const getInitialThemeOption = () => {
    const savedThemeOption = localStorage.getItem("themeOption");
    return savedThemeOption ? savedThemeOption : "system";
  };

  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    const theme = isDarkMode ? "dark" : "light";
    localStorage.setItem("appearance", theme);
    document.body.className = theme;
    // console.log("Setting theme:", theme);
  }, [isDarkMode]);

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const handleDetailsClick = (job) => {
    storeData("jobId", job.jobM_id);
    // console.log("Selected job:", job);

    setSelectedJob(job);
    setIsModalOpen(true);
  };

  // const first_name = secureLocalStorage.getItem("first_name");
  // const updatedFirstName = first_name.toUpperCase();
  // secureLocalStorage.setItem("first_name", updatedFirstName);
  const userId = retrieveData("user_id");

  // useEffect(() => {
  //   try {
  //     console.log('Checking authentication...');
  //     const token = retrieveDataFromCookie("auth_token");
  //     console.log('Retrieved token:', token);

  //     if (!token) {
  //       console.log('No token found, logging out');
  //       handleLogout();
  //       return;
  //     }

  //     // Decode and verify token
  //     const decodedToken = JSON.parse(atob(token));
  //     console.log('Decoded token:', decodedToken);

  //     // Verify token expiration
  //     const tokenAge = new Date().getTime() - decodedToken.timestamp;
  //     if (tokenAge > 86400000) { // 24 hours
  //       console.log('Token expired');
  //       handleLogout();
  //       return;
  //     }

  //     // Verify user type and level
  //     const storedUserId = retrieveData("user_id");
  //     const storedUserLevel = retrieveData("user_level");

  //     if (decodedToken.userId !== storedUserId ||
  //         decodedToken.userLevel !== storedUserLevel) {
  //       console.log('User data mismatch', {
  //         tokenUserId: decodedToken.userId,
  //         storedUserId,
  //         tokenLevel: decodedToken.userLevel,
  //         storedLevel: storedUserLevel
  //       });
  //       handleLogout();
  //       return;
  //     }

  //     // If we're on the wrong dashboard, redirect
  //     if (decodedToken.type !== 'candidate') {
  //       console.log('Wrong dashboard type:', decodedToken.type);
  //       switch (decodedToken.type) {
  //         case 'admin':
  //           router.push("/admin/dashboard");
  //           break;
  //         case 'supervisor':
  //           router.push("/supervisorDashboard");
  //           break;
  //       }
  //       return;
  //     }

  //     console.log('Authentication successful');

  //   } catch (error) {
  //     console.error('Authentication error:', error);
  //     handleLogout();
  //   }
  // }, []);

  const handleLogout = () => {
    // console.log('Executing logout');
    sessionStorage.clear();
    document.cookie.split(";").forEach((cookie) => {
      const cookieName = cookie.split("=")[0].trim();
      document.cookie = `${cookieName}=;max-age=0;path=/;secure;samesite=Strict`;
    });
    router.push("/");
  };

  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const logoutChannel = new BroadcastChannel("logout_channel");

      logoutChannel.onmessage = (event) => {
        if (event.data === "LOGOUT") {
          // Clear sessionStorage
          sessionStorage.clear();
          // Redirect to login
          router.push("/");
        }
      };

      return () => {
        logoutChannel.close();
      };
    }
  }, [router]);

  const fetchJobOffer = async (jobMId) => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const candId = retrieveData("user_id");
      // const appId = localStorage.getItem("app_id");

      const data = {
        cand_id: candId,
        jobM_id: jobMId,
      };

      console.log("jobMId", jobMId);
      const formData = new FormData();
      formData.append("operation", "getJobOffer");
      formData.append("json", JSON.stringify(data));

      console.log("formData", data);

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
    storeData("app_id", jobAppId);
    // storeData("pass_percentage", jobPassingPoints);
  };

  const closeExamModal = () => {
    setIsExamModalOpen(false);
    setSelectedJobMId(null);
  };

  // Function to open job offer modal
  const openJobOfferModal = (appId, jobMId) => {
    // console.log("Opening job offer modal for app ID:", appId);
    // console.log("jobMId", jobMId);
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

  const fetchAppliedJobs = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

      const personalInfoId = retrieveData("user_id");
      // console.log("cand ID:", personalInfoId);

      if (!personalInfoId) {
        // console.error("No cand_id found in localStorage.");
        return;
      }

      const formData = new FormData();
      formData.append("operation", "getAppliedJobs");
      formData.append("json", JSON.stringify({ cand_id: personalInfoId }));

      const response = await axios.post(url, formData);

      if (response.data.error) {
        console.error(response.data.error);
      } else {
        setAppliedJobs(response.data);
        console.log("Applied jobs:", response.data);
        // const passingpoints = response.data.passing_points;
        // localStorage.setItem("passing", passingpoints);
        // localStorage.setItem("app_id", response.data[0].app_id);
      }
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
    }
  };

  const fetchReappliedJobs = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

      const personalInfoId = retrieveData("user_id");
      // console.log("cand ID:", personalInfoId);

      if (!personalInfoId) {
        // console.error("No cand_id found in localStorage.");
        return;
      }

      const formData = new FormData();
      formData.append("operation", "getReappliedJobs");
      formData.append("json", JSON.stringify({ cand_id: personalInfoId }));

      const response = await axios.post(url, formData);

      if (response.data.error) {
        console.error(response.data.error);
      } else {
        setReappliedJobs(response.data);
        // console.log("Reapplied jobs:", response.data);
        // const passingpoints = response.data.passing_points;
        // localStorage.setItem("passing", passingpoints);
        // localStorage.setItem("app_id", response.data[0].app_id);
      }
    } catch (error) {
      console.error("Error fetching reapplied jobs:", error);
    }
  };

  const fetchExamResult = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const candId = retrieveData("user_id");

      const formData = new FormData();
      formData.append("operation", "fetchExamResult");
      formData.append("json", JSON.stringify({ cand_id: candId }));
      const examResultsResponse = await axios.post(url, formData);

      console.log("exam result", examResultsResponse.data);

      setExamResults(examResultsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAppliedJobs();
    fetchExamResult();
    fetchReappliedJobs();
  }, []);

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
    setIsNotificationDropdownOpen(false);
  };

  const toggleUserDropdownMobile = () => {
    setIsUserDropdownOpenMobile(!isUserDropdownOpenMobile);
    setIsNotificationDropdownOpenMobile(false);
  };

  const toggleNotificationDropdown = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
    setIsUserDropdownOpen(false);
    if (!isNotificationDropdownOpen) {
      markNotificationsAsRead();
    }
  };

  const toggleNotificationDropdownMobile = () => {
    setIsNotificationDropdownOpenMobile(!isNotificationDropdownOpenMobile);
    setIsUserDropdownOpenMobile(false);
    if (!isNotificationDropdownOpenMobile) {
      markNotificationsAsRead();
    }
  };

  const handleClickOutsideUsername = (event) => {
    if (
      dropdownUsernameRef.current &&
      !dropdownUsernameRef.current.contains(event.target)
    ) {
      setIsUserDropdownOpen(false);
      // setIsUserDropdownOpenMobile(false);
    }
  };

  const handleClickOutsideUsernameMobile = (event) => {
    if (
      dropdownUsernameMobileRef.current &&
      !dropdownUsernameMobileRef.current.contains(event.target)
    ) {
      // setIsUserDropdownOpen(false);
      setIsUserDropdownOpenMobile(false);
    }
  };

  const handleClickOutsideNotification = (event) => {
    if (
      dropdownNotificationRef.current &&
      !dropdownNotificationRef.current.contains(event.target)
    ) {
      setIsNotificationDropdownOpen(false);
    }
  };

  const handleClickOutsideNotificationMobile = (event) => {
    if (
      dropdownNotificationRefMobile.current &&
      !dropdownNotificationRefMobile.current.contains(event.target)
    ) {
      setIsNotificationDropdownOpenMobile(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsideUsername);
    document.addEventListener("mousedown", handleClickOutsideUsernameMobile);
    document.addEventListener("mousedown", handleClickOutsideNotification);
    document.addEventListener(
      "mousedown",
      handleClickOutsideNotificationMobile
    );
    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutsideUsernameMobile
      );
      document.removeEventListener("mousedown", handleClickOutsideUsername);
      document.removeEventListener("mousedown", handleClickOutsideNotification);
      document.removeEventListener(
        "mousedown",
        handleClickOutsideNotificationMobile
      );
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

  // console.log("name", userName);

  // Setup inactivity monitoring
  useEffect(() => {
    const cleanup = setupInactivityMonitoring();
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const refreshTransactions = async () => {
    setIsLoading(true);
    setTimeout(async () => {
      await fetchAppliedJobs();
      await fetchReappliedJobs();
      await fetchProfiles();
      await fetchNotification();
      await fetchJobs();
      setIsLoading(false);
    }, 2000);
  };


  useEffect(() => {
    const handleUserActivity = () => {
      setIsInactive(false);
      sessionStorage.setItem("isInactive", "false");
    };

    const inactivityTimeout = setTimeout(() => {
      setIsInactive(true);
      sessionStorage.setItem("isInactive", "true");
    }, 3000);

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);

    return () => {
      clearTimeout(inactivityTimeout);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
    };
  }, []);

  return (
    <div
      className={`flex min-h-screen flex-col md:flex-row ${
        isDarkMode ? "bg-[#1C1919] text-white" : "bg-[#d8d8d8] text-gray-900"
      }`}
    >
      <div
        className={`md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-[#0A6338] dark:bg-[#0A6338]`}
      >
        <div className="flex items-center">
          <button
            className="text-white focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            {isMenuOpen ? (
              <MdClose className="w-8 h-8" />
            ) : (
              <HiOutlineMenuAlt2 className="w-8 h-8" />
            )}{" "}
          </button>
          <img
            src="/assets/images/delMontes.png"
            alt="Del Monte Logo"
            className="h-10 w-auto ml-2"
            onClick={refreshTransactions}
          />
        </div>

        <div
          className="flex items-center relative"
          ref={(el) => {
            dropdownUsernameMobileRef.current = el;
            dropdownNotificationRefMobile.current = el;
          }}
        >
          <div className="relative mr-4">
            <div className="w-48">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className={`block w-full px-4 py-2 rounded-2xl focus:outline-none focus:border-green-500 pl-10 ${
                  isDarkMode
                    ? "bg-transparent text-gray-800"
                    : "bg-transparent text-gray-800"
                }`}
                placeholder="Search active jobs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => {
                toggleNotificationDropdownMobile();
              }}
              className={`text-2xl md:text-3xl mr-4 slide-up ${
                isDarkMode ? "text-[#93B1A6]" : "text-[#93B1A6]"
              }`}
            >
              <FontAwesomeIcon
                icon={isNotificationDropdownOpenMobile ? faBell : faBellRegular}
              />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <button
              onClick={toggleUserDropdownMobile}
              className={`rounded-full transition-all duration-200 ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-300 hover:bg-gray-400"
              } border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
            >
              {/* Profile Image/Initials and Dropdown Arrow */}
              <div className="flex items-center">
                <div
                  className={`relative w-9 h-9 rounded-full overflow-hidden border-2 ${
                    isDarkMode ? "border-green-600" : "border-green-500"
                  }`}
                >
                  {profile.candidateInformation?.cand_profPic ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}uploads/${profile.candidateInformation.cand_profPic}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <span
                        className={`text-sm font-semibold ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {userName
                          .split(" ")
                          .map((name, index) =>
                            index === 0 ||
                            index === userName.split(" ").length - 1
                              ? name.slice(0, 1).toUpperCase()
                              : ""
                          )
                          .join("")}
                      </span>
                    </div>
                  )}

                  {/* Online Status Indicator */}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>

                {/* Dropdown Arrow with transition */}
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`w-3.5 h-3.5 transition-transform duration-200 ml-2 mr-2 ${
                    isUserDropdownOpenMobile ? "rotate-180" : ""
                  } ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                />
              </div>
            </button>
          </div>

          {isNotificationDropdownOpenMobile && (
            <div
              // ref={dropdownNotificationRefMobile}
              className={`absolute w-80 right-0 z-10 top-14 ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-2xl transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-2`}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 ${
                        isDarkMode ? "text-[#188C54]" : "text-[#188C54]"
                      }`}
                    >
                      {/* Updated Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-full h-full"
                      >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                    </div>
                    <div>
                      <h3
                        className={`text-lg font-semibold ${
                          isDarkMode ? "text-[#188C54]" : "text-[#0A6338]"
                        }`}
                      >
                        Notifications
                      </h3>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-[#93B1A6]" : "text-[#0A6338]"
                        }`}
                      >
                        Earlier Today
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleNotificationDropdownMobile}
                    className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-[600px] overflow-y-auto scrollbar-custom">
                <div className="p-4 space-y-4">
                  {notification.length > 0 ? (
                    notification.map((result, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          if (result.status_name.toLowerCase() === "exam") {
                            // Ensure examResults is an array before using find
                            const examId = Array.isArray(examResults)
                              ? examResults.find(
                                  (exam) => exam.jobM_id === result.jobM_id
                                )
                              : null;

                            if (examId) {
                              toast.error(
                                `You already took an exam for ${result.jobM_title}`
                              );
                            } else {
                              openExamModal(
                                result.jobM_id,
                                result.jobM_title,
                                result.app_id,
                                result.jobM_passpercentage
                              );
                            }
                          } else if (
                            result.status_name.toLowerCase() === "job offer"
                          ) {
                            const jobOfferResponse = appliedJobs.find(
                              (job) =>
                                job.jobM_id === result.jobM_id &&
                                (job.status_name.toLowerCase() === "accept" ||
                                  job.status_name.toLowerCase() === "decline")
                            );
                            if (jobOfferResponse) {
                              toast.error(
                                `You have already responded to the job offer for ${result.jobM_title}`
                              );
                            } else {
                              openJobOfferModal(result.app_id, result.jobM_id);
                            }
                          } else if (
                            result.status_name.toLowerCase() === "pending"
                          ) {
                            openCancelJobAppliedModal(
                              result.app_id,
                              result.jobM_id,
                              result.jobM_title
                            );
                          }
                        }}
                        className={`group relative rounded-lg transition-all duration-200 hover:scale-[1.01] cursor-pointer
                            ${
                              isDarkMode
                                ? "bg-[#101010] text-green-200"
                                : "bg-[#0A6338] text-white"
                            } hover:shadow-lg`}
                      >
                        <div className="p-4 space-y-3 shadow-sm hover:shadow-md">
                          {/* Header with Logo and Date */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-white p-1 flex items-center justify-center shadow-sm">
                                <img
                                  src="/assets/images/delMontes.png"
                                  alt="Del Monte Logo"
                                  className="h-8 w-auto object-contain"
                                />
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-white">
                                  {result.jobM_title}
                                </h4>
                                <span className="inline-block px-2 py-1 text-xs bg-white/20 rounded-full mt-1">
                                  {result.status_name}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs opacity-80">
                              {result.notification_date}
                            </span>
                          </div>

                          {/* Notification Message */}
                          <p className="text-sm leading-relaxed opacity-90">
                            {result.notification_message}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py- 8 text-gray-500">
                      <div className="w-12 h-12 mb-3 text-gray-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                      </div>
                      <p className="text-base font-medium">
                        No notifications yet
                      </p>
                      <p className="text-sm text-gray-400">
                        We'll notify you when something arrives
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* <div ref={dropdownUsernameMobileRef}> */}
          {isUserDropdownOpenMobile && (
            <div
              // ref={dropdownUsernameMobileRef}
              className={`absolute right-0 top-14 w-60 rounded-lg shadow-lg overflow-hidden z-10
                  ${isDarkMode ? "bg-gray-800" : "bg-white"}
                  border ${isDarkMode ? "border-gray-700" : "border-gray-200"}
                `}
            >
              {/* User Info Section */}
              <div
                className={`p-4 ${
                  isDarkMode ? "bg-gray-900/50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
                      isDarkMode ? "border-green-600" : "border-green-500"
                    }`}
                  >
                    {profile.candidateInformation?.cand_profPic ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}uploads/${profile.candidateInformation.cand_profPic}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        <span
                          className={`text-sm font-semibold ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {userName
                            .split(" ")
                            .map((name, index) =>
                              index === 0 ||
                              index === userName.split(" ").length - 1
                                ? name.slice(0, 1).toUpperCase()
                                : ""
                            )
                            .join("")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        isDarkMode ? "text-gray-200" : "text-gray-900"
                      }`}
                    >
                      {userName}
                    </p>
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Candidate
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button
                  onClick={() => handleViewProfileClick(userId)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-200"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <User className="w-4 h-4" />
                  View Profile
                </button>

                <button
                  onClick={toggleTheme}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-gray-200"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={isDarkMode ? faSun : faMoon}
                    className="w-4 h-4"
                  />
                  {isDarkMode ? "Light Mode" : "Dark Mode"}
                </button>

                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                    isDarkMode
                      ? "hover:bg-gray-700 text-red-400"
                      : "hover:bg-gray-100 text-red-600"
                  }`}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          )}
          {/* </div> */}
        </div>
      </div>
      <Sidebar
        userName={userName}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        appliedJobs={appliedJobs}
        examResults={examResults}
        fetchExamResult={fetchExamResult}
        fetchAppliedJobs={fetchAppliedJobs}
        fetchJobs={fetchJobs}
        fetchNotification={fetchNotification}
        fetchProfiles={fetchProfiles}
        handleLogout={handleLogout}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        ref={sidebarRef}
        handleViewProfileClick={handleViewProfileClick}
        openExamModal={openExamModal}
        refreshTransactions={refreshTransactions}
      />
      {/* Main Content */}
      <div
        className={`flex-1 p-8 ${
          isDarkMode ? "bg-[#101010] text-white" : "bg-[#F4F7FC] text-gray-900"
        } overflow-y-auto scrollbar-custom md:mt-0 md:ml-72 mt-16`}
      >
        <div
          className={`justify-between items-center mb-8 fixed top-0 left-0 right-0 z-20 ${
            isDarkMode ? "bg-[#101010]" : "bg-[#F4F7FC]"
          } px-5 py-5 hidden md:flex`}
        >
          <div className="flex items-center relative">
            <h1
              className={`text-2xl md:text-4xl font-semibold slide-up ml-72  ${
                isDarkMode ? "text-[#188C54]" : "text-[#0A6338]"
              }`}
            >
              Active Jobs
            </h1>

            <button
              className={isDarkMode ? "text-[#188C54]" : "text-black"}
              onClick={refreshTransactions}
            >
              <div className="flex item-center">
                <MdRefresh className="ml-2 text-2xl " />
              </div>
            </button>
          </div>

          {isLoading && (
            <div className="fixed z-70 flex items-center justify-center h-screen w-screen">
              <l-line-spinner
                size="40"
                stroke="3"
                speed="1"
                color={isDarkMode ? "#188C54" : "#000000"}
              ></l-line-spinner>
            </div>
          )}

          <div
            className="flex items-center relative"
            ref={(el) => {
              dropdownUsernameRef.current = el;
              dropdownNotificationRef.current = el;
            }}
          >
            <div className="relative w-full mr-0 md:mr-5 hidden md:flex">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                className={`block w-full px-4 py-2 border-2 rounded-2xl focus:outline-none focus:border-green-500 pl-10 ${
                  isDarkMode
                    ? "bg-gray-800 text-gray-200"
                    : "bg-white text-gray-800"
                }`}
                placeholder="Search active jobs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  toggleNotificationDropdown();
                }}
                className={`text-2xl md:text-3xl mr-5 slide-up hidden md:flex ${
                  isDarkMode ? "text-[#93B1A6]" : "text-[#0A6338]"
                }`}
              >
                <FontAwesomeIcon
                  icon={isNotificationDropdownOpen ? faBell : faBellRegular}
                />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
            </div>
            <div className="relative">
              <button
                onClick={toggleUserDropdown}
                className={`rounded-full transition-all duration-200 hidden md:flex ${
                  isDarkMode
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-gray-300 hover:bg-gray-400"
                } border ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
              >
                {/* Profile Image/Initials and Dropdown Arrow */}
                <div className="flex items-center">
                  <div
                    className={`relative w-12 h-12 rounded-full overflow-hidden border-2 ${
                      isDarkMode ? "border-green-600" : "border-green-500"
                    }`}
                  >
                    {profile.candidateInformation?.cand_profPic ? (
                      <img
                        src={`http://localhost/php-delmonte/api/uploads/${profile.candidateInformation.cand_profPic}`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-100"
                        }`}
                      >
                        <span
                          className={`text-sm font-semibold ${
                            isDarkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {userName
                            .split(" ")
                            .map((name, index) =>
                              index === 0 ||
                              index === userName.split(" ").length - 1
                                ? name.slice(0, 1).toUpperCase()
                                : ""
                            )
                            .join("")}
                        </span>
                      </div>
                    )}

                    {/* Online Status Indicator */}
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>

                  {/* Dropdown Arrow with transition */}
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`w-3.5 h-3.5 transition-transform duration-200 ml-2 mr-2 ${
                      isUserDropdownOpen ? "rotate-180" : ""
                    } ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                  />
                </div>
              </button>

              {/* Dropdown Menu */}
            </div>

            {isNotificationDropdownOpen && (
              <div
                className={`absolute top-14 w-96 right-0 z-50 ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                } rounded-lg shadow-2xl transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-2`}
              >
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 ${
                          isDarkMode ? "text-[#188C54]" : "text-[#188C54]"
                        }`}
                      >
                        {/* Updated Icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-full h-full"
                        >
                          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                      </div>
                      <div>
                        <h3
                          className={`text-xl font-semibold ${
                            isDarkMode ? "text-[#188C54]" : "text-[#0A6338]"
                          }`}
                        >
                          Notifications
                        </h3>
                        <p
                          className={`text-sm ${
                            isDarkMode ? "text-[#93B1A6]" : "text-[#0A6338]"
                          }`}
                        >
                          Earlier Today
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={toggleNotificationDropdown}
                      className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 6L6 18M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div className="max-h-[600px] overflow-y-auto scrollbar-custom">
                  <div className="p-4 space-y-4">
                    {notification.length > 0 ? (
                      notification.map((result, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            if (result.status_name.toLowerCase() === "exam") {
                              // Ensure examResults is an array before using find
                              const examId = Array.isArray(examResults)
                                ? examResults.find(
                                    (exam) => exam.jobM_id === result.jobM_id
                                  )
                                : null;

                              if (examId) {
                                toast.error(
                                  `You already took an exam for ${result.jobM_title}`
                                );
                              } else {
                                openExamModal(
                                  result.jobM_id,
                                  result.jobM_title,
                                  result.app_id,
                                  result.jobM_passpercentage
                                );
                              }
                            } else if (
                              result.status_name.toLowerCase() === "job offer"
                            ) {
                              const jobOfferResponse = appliedJobs.find(
                                (job) =>
                                  job.jobM_id === result.jobM_id &&
                                  (job.status_name.toLowerCase() === "accept" ||
                                    job.status_name.toLowerCase() === "decline")
                              );
                              if (jobOfferResponse) {
                                toast.error(
                                  `You have already responded to the job offer for ${result.jobM_title}`
                                );
                              } else {
                                openJobOfferModal(
                                  result.app_id,
                                  result.jobM_id
                                );
                              }
                            } else if (
                              result.status_name.toLowerCase() === "pending"
                            ) {
                              openCancelJobAppliedModal(
                                result.app_id,
                                result.jobM_id,
                                result.jobM_title
                              );
                            }
                          }}
                          className={`group relative rounded-lg transition-all duration-200 hover:scale-[1.01] cursor-pointer
                            ${
                              isDarkMode
                                ? "bg-[#101010] text-green-200"
                                : "bg-[#0A6338] text-white"
                            } hover:shadow-lg`}
                        >
                          <div className="p-4 space-y-3 shadow-sm hover:shadow-md">
                            {/* Header with Logo and Date */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-white p-1 flex items-center justify-center shadow-sm">
                                  <img
                                    src="/assets/images/delMontes.png"
                                    alt="Del Monte Logo"
                                    className="h-8 w-auto object-contain"
                                  />
                                </div>
                                <div>
                                  <h4 className="text-xl font-semibold text-white">
                                    {result.jobM_title}
                                  </h4>
                                  <span className="inline-block px-2 py-1 text-xs bg-white/20 rounded-full mt-1">
                                    {result.status_name}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs opacity-80">
                                {result.notification_date}
                              </span>
                            </div>

                            {/* Notification Message */}
                            <p className="text-sm leading-relaxed opacity-90">
                              {result.notification_message}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py- 8 text-gray-500">
                        <div className="w-12 h-12 mb-3 text-gray-300">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                          </svg>
                        </div>
                        <p className="text-base font-medium">
                          No notifications yet
                        </p>
                        <p className="text-sm text-gray-400">
                          We'll notify you when something arrives
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isUserDropdownOpen && (
              <div
                className={`absolute right-0 top-14 w-60 rounded-lg shadow-lg overflow-hidden z-50
                  ${isDarkMode ? "bg-gray-800" : "bg-white"}
                  border ${isDarkMode ? "border-gray-700" : "border-gray-200"}
                `}
              >
                {/* User Info Section */}
                <div
                  className={`p-4 ${
                    isDarkMode ? "bg-gray-900/50" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
                        isDarkMode ? "border-green-600" : "border-green-500"
                      }`}
                    >
                      {profile.candidateInformation?.cand_profPic ? (
                        <img
                          src={`http://localhost/php-delmonte/api/uploads/${profile.candidateInformation.cand_profPic}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center ${
                            isDarkMode ? "bg-gray-700" : "bg-gray-100"
                          }`}
                        >
                          <span
                            className={`text-sm font-semibold ${
                              isDarkMode ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {userName
                              .split(" ")
                              .map((name, index) =>
                                index === 0 ||
                                index === userName.split(" ").length - 1
                                  ? name.slice(0, 1).toUpperCase()
                                  : ""
                              )
                              .join("")}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p
                        className={`font-medium ${
                          isDarkMode ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        {userName}
                      </p>
                      <p
                        className={`text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Candidate
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    onClick={() => handleViewProfileClick(userId)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      isDarkMode
                        ? "hover:bg-gray-700 text-gray-200"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    View Profile
                  </button>

                  <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      isDarkMode
                        ? "hover:bg-gray-700 text-gray-200"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={isDarkMode ? faSun : faMoon}
                      className="w-4 h-4"
                    />
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                  </button>

                  <button
                    onClick={handleLogout}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                      isDarkMode
                        ? "hover:bg-gray-700 text-red-400"
                        : "hover:bg-gray-100 text-red-600"
                    }`}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Add margin to the top of the content to prevent jumping */}
        <div className="mt-20 hidden md:flex">
          {" "}
          {/* Adjust this value based on the height of your header */}
          {/* Your main content goes here */}
        </div>

        <div className="md:hidden mb-10 flex items-center justify-between">
          <h1
            className={`text-2xl md:text-4xl font-semibold slide-up ${
              isDarkMode ? "text-[#188C54]" : "text-[#0A6338]"
            }`}
          >
            Active Jobs
          </h1>

          {isLoading && (
            <div className="fixed z-70 flex items-center justify-center h-screen w-screen">
              <l-line-spinner
                size="40"
                stroke="3"
                speed="1"
                color={isDarkMode ? "#188C54" : "#000000"}
              ></l-line-spinner>
            </div>
          )}

          <button
            className={isDarkMode ? "text-[#188C54]" : "text-black"}
            onClick={refreshTransactions}
          >
            <div className="flex item-center">
              <MdRefresh className="ml-2 text-2xl " />
            </div>
          </button>
        </div>
        {/* Jobs Display */}
        {loading ? (
          <div className="flex items-center justify-center h-64 flex-col">
            <l-line-spinner
              size="40"
              stroke="3"
              speed="1"
              color={isDarkMode ? "#ffffff" : "#000000"}
            ></l-line-spinner>
            <p
              className={`mt-2 ${
                isDarkMode ? "text-green-300" : "text-gray-700"
              }`}
            >
              Please wait while we load your jobs
            </p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <p
            className={`text-center ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No jobs match your search.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, index) => (
              <div
                key={index}
                className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl ${
                  isDarkMode
                    ? "bg-gray-800 text-gray-200"
                    : "bg-white text-gray-800"
                }`}
              >
                <div
                  className={`p-4 h-20 flex items-center justify-start ${
                    isDarkMode ? "bg-[#188C54]" : "bg-[#188C54]"
                  }`}
                >
                  <Briefcase className="w-6 h-6 text-white mr-2" />
                  <h3 className="text-xl font-semibold text-white truncate">
                    {job.jobM_title}
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex items-center space-x-2 text-sm mt-4">
                    <UserGroupIcon className="w-5 h-5 text-gray-400" />
                    <span>{job.Total_Applied} Applicants</span>
                    {job.Is_Applied !== 0 && (
                      <span className="flex items-center">
                        {(() => {
                          const jobApplications = Array.isArray(appliedJobs)
                            ? appliedJobs.filter(
                                (aj) => aj.jobM_id === job.jobM_id
                              )
                            : [];
                          const hasFailed =
                            jobApplications.length > 0 &&
                            jobApplications.some(
                              (aj) => aj.status_name === "Failed Exam"
                            );
                          const hasReapply = jobApplications.some(
                            (aj) => aj.status_name === "Reapply"
                          );
                          const hasCancelled = jobApplications.some(
                            (aj) => aj.status_name === "Cancelled"
                          );
                          const hasApplied = jobApplications.some(
                            (aj) => aj.status_name === "Applied"
                          );
                          const hasDeclinedOffer =
                            jobApplications.length > 0 &&
                            jobApplications.some(
                              (aj) => aj.status_name === "Decline Offer"
                            );
                          const isEmployed =
                            jobApplications.length > 0 &&
                            jobApplications.some(
                              (aj) => aj.status_name === "Employed"
                            );
                          const hasActiveStatus =
                            jobApplications.length > 0 &&
                            jobApplications.some((aj) =>
                              [
                                "Pending",
                                "Processed",
                                "Exam",
                                "Interview",
                                "Job Offer",
                                "Background Check",
                                "Decision Pending",
                              ].includes(aj.status_name)
                            );

                          if (isEmployed) {
                            return (
                              <>
                                <UserIcon className="w-5 h-5 mr-1 text-blue-600" />
                                Employed
                              </>
                            );
                          } else if (hasDeclinedOffer) {
                            return (
                              <>
                                <XCircleIcon className="w-5 h-5 mr-1 text-red-500" />
                                Decline Offer
                              </>
                            );
                          } else if (hasReapply && hasCancelled) {
                            return (
                              <>
                                <XCircleIcon className="w-5 h-5 mr-1 text-red-500" />
                                Cancelled
                              </>
                            );
                          } else if (hasFailed) {
                            return (
                              <>
                                <XCircleIcon className="w-5 h-5 mr-1 text-red-500" />
                                Failed Exam
                              </>
                            );
                          } else if (hasReapply && hasActiveStatus) {
                            return (
                              <>
                                <CheckCircleIcon className="w-5 h-5 mr-1 text-blue-500" />
                                Reapplied
                              </>
                            );
                          } else if (hasReapply && hasDeclinedOffer) {
                            return (
                              <>
                                <CheckCircleIcon className="w-5 h-5 mr-1 text-blue-500" />
                                Reapplied
                              </>
                            );
                          } else if (!hasReapply && hasActiveStatus) {
                            return (
                              <>
                                <CheckCircleIcon className="w-5 h-5 mr-1 text-green-500" />
                                Applied
                              </>
                            );
                          }
                        })()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 text-sm mb-5">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <span>{job.jobM_createdAt}</span>
                  </div>
                  <div className="mb-5"></div>

                  <button
                    onClick={() => handleDetailsClick(job)}
                    className={`w-full px-4 py-2 rounded-md font-semibold transition-colors duration-300 ${
                      isDarkMode
                        ? "bg-[#188C54] hover:bg-green-600 text-white"
                        : "bg-[#188C54] hover:bg-green-600 text-white"
                    }`}
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
          fetchJobs={fetchJobs}
          fetchAppliedJobs={fetchAppliedJobs}
          fetchNotification={fetchNotification}
          appliedJobs={appliedJobs}
          onClosedd={() => {
            setIsModalOpen(false);b
            removeData("jobId");
          }}
        />
      )}
      {isProfileModalOpen && (
        <ViewProfile
          isOpen={isProfileModalOpen}
          onClose={handleCloseProfileModal}
          candId={selectedCandidateId}
          fetchProfiles={fetchProfiles}
          profile={profile}
        />
      )}
      {isExamModalOpen && (
        <ExamModal jobMId={selectedJobMId} onClose={closeExamModal} />
      )}

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
            removeData("app_id");
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

      <Toaster position="bottom-left" />
    </div>
  );
}
