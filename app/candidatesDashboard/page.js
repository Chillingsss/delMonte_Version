"use client";
// export const dynamic = "force-dynamic";

import React, { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import {
	storeDataInSession,
	getDataFromCookie,
	getDataFromSession,
} from "../utils/storageUtils";

import {
	faChevronDown,
	faMoon,
	faSun,
	faSignOutAlt,
	faBell,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUser as faUserRegular,
	faBell as faBellRegular,
} from "@fortawesome/free-regular-svg-icons";
import dynamic from "next/dynamic";

const Sidebar = dynamic(() => import("./sideBar/sideBar"), { ssr: false });
const JobDetailsModal = dynamic(() => import("./modal/jobDetails"), {
	ssr: false,
});
const ViewProfile = dynamic(() => import("./modal/viewProfile"), {
	ssr: false,
});
const ExamModal = dynamic(() => import("./exam/exam"), { ssr: false });
const JobOfferModal = dynamic(() => import("./modal/jobOffer"), { ssr: false });
const CancelJobModal = dynamic(() => import("./modal/cancelJobApplied"), {
	ssr: false,
});
const AppliedJobs = dynamic(() => import("./modal/appliedJobs"), {
	ssr: false,
});
import {
	CalendarIcon,
	UserGroupIcon,
	CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
	SearchIcon,
	XCircleIcon,
	Briefcase,
	User,
	X,
	Search,
} from "lucide-react";
import { UserIcon } from "@heroicons/react/24/solid";
import { lineSpinner } from "ldrs";
import Image from "next/image";
import { MdRefresh } from "react-icons/md";
import { FaLock } from "react-icons/fa";
import SecuritySettingsModal from "./modal/securitySettings";
import {
	fetchAppliedJobs,
	fetchJobs,
	fetchNotification,
	fetchProfiles,
	fetchReappliedJobs,
	fetchExamResult,
	fetchJobOffer,
	markNotificationsAsRead,
} from "../utils/apiFunctions";
import JobList from "./components/JobList";
import NotificationDropdown from "./components/NotificationDropdown";
import UserDropdown from "./components/UserDropdown";
import MobileNotificationDropdown from "./components/MobileNotificationDropdown";
import MobileUserDropdown from "./components/MobileUserDropdown";

export default function DashboardCandidates() {
	const { data: session, status } = useSession();
	const [jobs, setJobs] = useState([]);
	const dropdownUsernameRef = useRef(null);
	const dropdownUsernameMobileRef = useRef(null);

	const [notification, setNotification] = useState([]);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const sidebarRef = useRef(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const [userName, setUserName] = useState("");
	const [appliedJobs, setAppliedJobs] = useState([]);

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

	const [reappliedJobs, setReappliedJobs] = useState([]);

	const [profile, setProfile] = useState({
		candidateInformation: {},
		educationalBackground: [],
		employmentHistory: {},
		skills: [],
		training: [],
		license: [],
		resume: [],
	});

	const [isLoading, setIsLoading] = useState(false);
	const [isAppliedJobsModalOpen, setIsAppliedJobsModalOpen] = useState(false);
	const [securitySettingModalOpen, setSecuritySettingModalOpen] =
		useState(false);

	useEffect(() => {
		if (typeof window !== "undefined") {
			lineSpinner.register();
		}
		console.log("profile", profile);
	}, []);

	const getUserIdFromCookie = () => {
		if (typeof window !== "undefined") {
			const tokenData = getDataFromCookie("auth_token");
			if (tokenData && tokenData.userId) {
				return tokenData.userId;
			}
		}
		return null; // Return null if userId is not found or tokenData is invalid
	};
	const userId = session?.user?.id || getUserIdFromCookie();

	useEffect(() => {
		const getUserLevelFromCookie = () => {
			if (typeof window !== "undefined") {
				const tokenData = getDataFromCookie("auth_token");
				return tokenData?.userLevel || null;
			}
			return null;
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
		} else if (
			userLevel === "20.0" &&
			router.pathname !== "/supervisor/dashboard"
		) {
			router.replace("/supervisor/dashboard");
		} else if (
			userLevel === "10.0" &&
			router.pathname !== "/analyst/dashboard"
		) {
			router.replace("/analyst/dashboard");
		} else {
			router.replace("/");
		}
	}, []);

	// useEffect(() => {
	//   const authToken =
	//     typeof window !== "undefined" ? getDataFromCookie("auth_token") : null;

	//   if (status === "unauthenticated" && !authToken) {
	//     router.replace("/");
	//   }
	// }, [status, router]);

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

	// const userId = session.user.id;/

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

	const handleViewAppliedJobs = () => {
		setIsAppliedJobsModalOpen(true);
	};

	const handleCloseViewAppliedJobs = () => {
		setIsAppliedJobsModalOpen(false);
	};

	const getInitialTheme = () => {
		if (typeof window !== "undefined") {
			// Check if running in the browser
			const savedTheme = localStorage.getItem("theme");
			if (savedTheme && savedTheme !== "system") {
				return savedTheme === "dark";
			}
			const prefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)"
			).matches;
			return prefersDark;
		}
		return false; // Default to light mode if not in the browser
	};

	const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

	useEffect(() => {
		if (typeof window !== "undefined") {
			// Check if running in the browser
			const theme = isDarkMode ? "dark" : "light";
			localStorage.setItem("theme", theme);
			document.body.className = theme;
		}
	}, [isDarkMode]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			// Check if running in the browser
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

			const handleSystemThemeChange = (e) => {
				setIsDarkMode(e.matches);
			};

			mediaQuery.addEventListener("change", handleSystemThemeChange);

			return () => {
				mediaQuery.removeEventListener("change", handleSystemThemeChange);
			};
		}
	}, []);

	// Toggle function to switch themes manually
	const toggleTheme = () => {
		setIsDarkMode((prevMode) => !prevMode);
	};

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedJob, setSelectedJob] = useState(null);

	const handleDetailsClick = (job) => {
		storeDataInSession("jobId", job.jobM_id);
		// console.log("Selected job:", job);

		setSelectedJob(job);
		setIsModalOpen(true);
	};

	const handleLogout = async () => {
		try {
			// Clear all cookies (including API-related ones)
			document.cookie.split(";").forEach((cookie) => {
				const [name] = cookie.split("=");
				document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
				document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
			});

			// Call signOut to clear session
			await signOut({ redirect: false });

			localStorage.removeItem("savedUsername");
			localStorage.removeItem("savedPassword");

			// Force a reload to clear state and session storage
			window.location.href = "/";
		} catch (error) {
			console.error("Logout error:", error);
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

	// Function to open job offer modal
	const openJobOfferModal = (
		appId,
		jobMId,
		setJobOfferDetails,
		setIsJobOfferModalOpen
	) => {
		// console.log("Opening job offer modal for app ID:", appId);
		// console.log("jobMId", jobMId);
		setAppId(appId);
		fetchJobOffer(session, jobMId, setJobOfferDetails, setIsJobOfferModalOpen);
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

	useEffect(() => {
		if (typeof window !== "undefined") {
			fetchAppliedJobs(session, setAppliedJobs);
			fetchReappliedJobs(session, setReappliedJobs);
			fetchProfiles(session, setProfile, setLoading);
			fetchNotification(session, setNotification, setUnreadNotificationCount);
			fetchJobs(session, setJobs);
			fetchExamResult(session, setExamResults);
		}
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
			markNotificationsAsRead(session, setUnreadNotificationCount);
		}
	};

	const toggleNotificationDropdownMobile = () => {
		setIsNotificationDropdownOpenMobile(!isNotificationDropdownOpenMobile);
		setIsUserDropdownOpenMobile(false);
		if (!isNotificationDropdownOpenMobile) {
			markNotificationsAsRead(session, setUnreadNotificationCount);
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

	const refreshTransactions = async () => {
		setIsLoading(true);
		setTimeout(async () => {
			await fetchAppliedJobs(session, setAppliedJobs);
			await fetchReappliedJobs(session, setReappliedJobs);
			await fetchProfiles(session, setProfile, setLoading);
			await fetchNotification(
				session,
				setNotification,
				setUnreadNotificationCount
			);
			await fetchJobs(session, setJobs);
			setIsLoading(false);
		}, 2000);
	};

	const handleClickSecuritySettings = () => {
		setSecuritySettingModalOpen(true);
	};

	return (
		<div
			className={`flex min-h-screen flex-col md:flex-row ${
				isDarkMode ? "bg-[#1C1919] text-white" : "bg-[#EAE9E7] text-gray-900"
			}`}
		>
			<div
				className={`md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-[#004F39] dark:bg-[#004F39]`}
			>
				<div className="flex items-center">
					<Image
						width={70}
						height={70}
						src="/assets/images/delmontes.png"
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
					<div className="relative mr-4 flex item-center">
						<button
							className={`text-[#93B1A6] ${isDarkMode ? "text-[#93B1A6]" : ""}`}
							onClick={refreshTransactions}
						>
							<div className="">
								<MdRefresh className="text-3xl " />
							</div>
						</button>
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
							className={`rounded-full transition-all duration-200 shadow-xl ${
								isDarkMode
									? "bg-gray-800 hover:bg-gray-700"
									: "bg-white hover:bg-gray-400"
							}`}
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
												{profile.candidateInformation &&
													profile.candidateInformation.cand_firstname &&
													profile.candidateInformation.cand_firstname
														.split(" ")
														.map((name, index, arr) =>
															index === 0 || index === arr.length - 1
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
						<MobileNotificationDropdown
							isOpen={isNotificationDropdownOpenMobile}
							toggleDropdown={toggleNotificationDropdownMobile}
							notification={notification}
							isDarkMode={isDarkMode}
							openExamModal={openExamModal}
							openJobOfferModal={openJobOfferModal}
							openCancelJobAppliedModal={openCancelJobAppliedModal}
						/>
					)}

					{isUserDropdownOpenMobile && (
						<MobileUserDropdown
							isOpen={isUserDropdownOpenMobile}
							toggleDropdown={toggleUserDropdownMobile}
							profile={profile}
							handleViewProfileClick={handleViewProfileClick}
							toggleTheme={toggleTheme}
							handleLogout={handleLogout}
							isDarkMode={isDarkMode}
							handleClickSecuritySettings={handleClickSecuritySettings}
						/>
					)}
				</div>
			</div>
			<Sidebar
				userName={userName}
				isDarkMode={isDarkMode}
				setIsDarkMode={setIsDarkMode}
				appliedJobs={appliedJobs}
				examResults={examResults}
				setExamResults={setExamResults}
				setAppliedJobs={setAppliedJobs}
				setJobs={setJobs}
				session={session}
				setNotification={setNotification}
				setUnreadNotificationCount={setUnreadNotificationCount}
				setProfile={setProfile}
				setLoading={setLoading}
				isMenuOpen={isMenuOpen}
				setIsMenuOpen={setIsMenuOpen}
				ref={sidebarRef}
				handleViewProfileClick={handleViewProfileClick}
				openExamModal={openExamModal}
				openJobOfferModal={openJobOfferModal}
			/>
			{/* Main Content */}
			<div
				className={`flex-1 p-8 ${
					isDarkMode ? "bg-[#101010] text-white" : "bg-[#EAE9E7] text-gray-900"
				} overflow-y-auto scrollbar-custom md:mt-0 md:ml-72 mt-16`}
			>
				<div
					className={`justify-between items-center fixed top-0 left-0 right-0 z-20 ${
						isDarkMode ? "bg-[#101010]" : "bg-[#EAE9E7]"
					} px-5 py-5 hidden md:flex`}
				>
					<div className="flex items-center relative">
						<h1
							className={`text-2xl md:text-4xl font-semibold slide-up ml-72 ${
								isDarkMode ? "text-[#188C54]" : "text-[#0A6338]"
							}`}
						>
							Active Jobs
						</h1>

						<button
							className={` ${isDarkMode ? "text-[#188C54]" : "text-black"}`}
							onClick={refreshTransactions}
						>
							<div className="flex item-center">
								<MdRefresh className="ml-2 text-2xl " />
							</div>
						</button>
					</div>

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
								className={`block w-full px-4 py-2 border-2 rounded-2xl focus:outline-none border-${
									isDarkMode ? "green-500" : "gray-300"
								} pl-10 ${
									isDarkMode
										? "bg-transparent text-gray-200"
										: "bg-transparent text-gray-800"
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
								className={`rounded-full transition-all duration-200 hidden md:flex shadow-xl ${
									isDarkMode
										? "bg-gray-800 hover:bg-gray-700"
										: "bg-white hover:bg-gray-400"
								}`}
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
													{profile.candidateInformation &&
														profile.candidateInformation.cand_firstname &&
														profile.candidateInformation.cand_firstname
															.split(" ")
															.map((name, index, arr) =>
																index === 0 || index === arr.length - 1
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
							<NotificationDropdown
								isOpen={isNotificationDropdownOpen}
								toggleDropdown={toggleNotificationDropdown}
								notification={notification}
								isDarkMode={isDarkMode}
								openExamModal={openExamModal}
								openJobOfferModal={openJobOfferModal}
								openCancelJobAppliedModal={openCancelJobAppliedModal}
							/>
						)}

						{isUserDropdownOpen && (
							<UserDropdown
								isOpen={isUserDropdownOpen}
								toggleDropdown={toggleUserDropdown}
								profile={profile}
								handleViewProfileClick={handleViewProfileClick}
								toggleTheme={toggleTheme}
								handleLogout={handleLogout}
								isDarkMode={isDarkMode}
								handleClickSecuritySettings={handleClickSecuritySettings}
							/>
						)}
					</div>
				</div>
				{/* Add margin to the top of the content to prevent jumping */}
				<div className="mt-16 hidden md:flex">
					{" "}
					{/* Adjust this value based on the height of your header */}
					{/* Your main content goes here */}
				</div>

				<div className="md:hidden mb-9 flex flex-col items-start gap-3">
					<div>
						<button
							onClick={handleViewAppliedJobs}
							b
							className={`px-2 py-1 rounded-full bg-transparent text-xs border-b-2 ${
								isDarkMode
									? "text-gray-300 border-green-500"
									: "text-gray-600 border-green-700"
							}`}
						>
							Applied Jobs
						</button>
					</div>
					{/* Search Input */}
					<div className="relative w-full">
						<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
							<Search className="w-5 h-5 text-gray-400" />
						</div>
						<input
							type="text"
							name="search"
							id="search"
							className={`block w-full px-4 py-2 rounded-2xl border border-gray-400 focus:outline-none focus:border-green-500 pl-10 pr-10 ${
								isDarkMode
									? "bg-transparent text-gray-300"
									: "bg-transparent text-gray-700"
							}`}
							placeholder="Search active jobs"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
									isDarkMode
										? "text-gray-400 hover:text-gray-200"
										: "text-gray-600 hover:text-gray-800"
								}`}
							>
								<X className="w-5 h-5 transition-colors duration-150" />
							</button>
						)}
					</div>

					{/* Active Jobs Title */}
					<h1
						className={`text-2xl md:text-4xl font-semibold slide-up mt-1 ${
							isDarkMode ? "text-[#004F39]" : "text-[#004F39]"
						}`}
					>
						Active Jobs
					</h1>

					{/* Loading Spinner */}
					{/* Loading Spinner */}
				</div>

				{isLoading && (
					<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[100]">
						<l-line-spinner
							size="40"
							stroke="3"
							speed="1"
							color={isDarkMode ? "#188C54" : "#ffffff"}
						></l-line-spinner>
					</div>
				)}

				{/* Jobs Display */}
				<JobList
					loading={loading}
					filteredJobs={filteredJobs}
					appliedJobs={appliedJobs}
					isDarkMode={isDarkMode}
					handleDetailsClick={handleDetailsClick}
				/>
			</div>
			{isModalOpen && (
				<JobDetailsModal
					job={selectedJob}
					fetchJobs={fetchJobs}
					fetchAppliedJobs={fetchAppliedJobs}
					setNotification={setNotification}
					setUnreadNotificationCount={setUnreadNotificationCount}
					setAppliedJobs={setAppliedJobs}
					setJobs={setJobs}
					appliedJobs={appliedJobs}
					onClosedd={() => {
						setIsModalOpen(false);
						getDataFromSession("jobId");
					}}
					profile={profile}
				/>
			)}
			{isProfileModalOpen && (
				<ViewProfile
					isOpen={isProfileModalOpen}
					onClose={handleCloseProfileModal}
					candId={selectedCandidateId}
					profile={profile}
					setProfile={setProfile}
					loading={loading}
					setLoading={setLoading}
					isDarkMode={isDarkMode}
				/>
			)}

			{isAppliedJobsModalOpen && (
				<AppliedJobs
					isOpen={isAppliedJobsModalOpen}
					onClose={handleCloseViewAppliedJobs}
					isDarkMode={isDarkMode}
					setIsDarkMode={setIsDarkMode}
					appliedJob={appliedJobs}
					examResults={examResults}
					setExamResults={setExamResults}
					setAppliedJobs={setAppliedJobs}
					setNotification={setNotification}
					setUnreadNotificationCount={setUnreadNotificationCount}
					setProfile={setProfile}
					setLoading={setLoading}
					openExamModal={openExamModal}
					setJobs={setJobs}
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
					setAppliedJobs={setAppliedJobs}
					setNotification={setNotification}
					setUnreadNotificationCount={setUnreadNotificationCount}
					setExamResults={setExamResults}
					startTimer={isExamModalOpen}
					onClose={() => {
						closeExamModal();
						getDataFromSession("app_id");
					}}
					setJobs={setJobs}
				/>
			)}
			{isJobOfferModalOpen && (
				<JobOfferModal
					jobOfferDetails={jobOfferDetails}
					setJobOfferDetails={setJobOfferDetails}
					setIsJobOfferModalOpen={setIsJobOfferModalOpen}
					jobMId={jobMId}
					setAppliedJobs={setAppliedJobs}
					setJobs={setJobs}
					setNotification={setNotification}
					setUnreadNotificationCount={setUnreadNotificationCount}
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
					setAppliedJobs={setAppliedJobs}
					setJobs={setJobs}
					setNotification={setNotification}
					setUnreadNotificationCount={setUnreadNotificationCount}
					onClose={() => setShowCancelModal(false)}
				/>
			)}
			{securitySettingModalOpen && (
				<SecuritySettingsModal
					isOpen={securitySettingModalOpen}
					onClose={() => setSecuritySettingModalOpen(false)}
					isDarkMode={isDarkMode}
				/>
			)}

			<Toaster position="bottom-left" />
		</div>
	);
}
