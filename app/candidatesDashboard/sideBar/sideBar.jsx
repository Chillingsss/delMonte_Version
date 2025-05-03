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
	getDataFromCookie,
} from "../../utils/storageUtils";
import { useRouter } from "next/navigation";
import ExamModal from "../exam/exam";
import JobOfferModal from "../modal/jobOffer";
import CancelJobModal from "../modal/cancelJobApplied";
import {
	fetchAppliedJobs,
	fetchJobs,
	fetchNotification,
} from "@/app/utils/apiFunctions";

const Sidebar = ({
	isDarkMode,
	isMenuOpen,
	setIsMenuOpen,
	appliedJobs,
	examResults,
	setAppliedJobs,
	setExamResults,
	setJobs,
	setNotification,
	setUnreadNotificationCount,
	setProfile,
	setLoading,
	openJobOfferModal,
}) => {
	const { data: session, status } = useSession();
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
	// const fetchJobOffer = async (jobMId) => {
	// 	try {
	// 		const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
	// 		const getUserIdFromCookie = () => {
	// 			const tokenData = getDataFromCookie("auth_token");
	// 			if (tokenData && tokenData.userId) {
	// 				return tokenData.userId;
	// 			}
	// 			return null; // Return null if userId is not found or tokenData is invalid
	// 		};
	// 		const userId = session?.user?.id || getUserIdFromCookie();
	// 		console.log("User ID:", userId);

	// 		console.log("jobMId", jobMId);
	// 		const formData = new FormData();
	// 		formData.append("operation", "getJobOffer");
	// 		formData.append(
	// 			"json",
	// 			JSON.stringify({ cand_id: userId, jobM_id: jobMId })
	// 		);

	// 		console.log("formData", formData);

	// 		const response = await axios.post(url, formData);

	// 		console.log("Job offer response:", response.data);

	// 		if (response.data.error) {
	// 			console.error(response.data.error);
	// 		} else {
	// 			const jobOffer = response.data[0];
	// 			setJobOfferDetails(jobOffer);
	// 			setIsJobOfferModalOpen(true);
	// 		}
	// 	} catch (error) {
	// 		console.error("Error fetching job offer:", error);
	// 	}
	// };

	// // Function to open job offer modal
	// const openJobOfferModal = (appId, jobMId) => {
	// 	console.log("Opening job offer modal for app ID:", appId);
	// 	console.log("jobMId", jobMId);
	// 	setAppId(appId);
	// 	fetchJobOffer(jobMId);
	// };

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
		fetchAppliedJobs(session, setAppliedJobs);

		fetchNotification(session, setNotification, setUnreadNotificationCount);

		fetchJobs(session, setJobs);
		fetchProfiles(session, setProfile, setLoading);
	};

	return (
		<>
			<div
				ref={sidebarRef}
				className={`fixed top-0 left-0 h-full rounded-r-lg flex flex-col transform transition-transform duration-300 ease-in-out z-50
      ${isMenuOpen ? "translate-x-0 w-60" : "-translate-x-full w-72"}
      ${isDarkMode ? "bg-[#004F39]" : "bg-[#004F39]"}
      md:w-72 md:translate-x-0`}
			>
				<div
					onClick={refreshTransaction}
					className="flex justify-center items-center cursor-pointer"
				>
					<img
						src="/assets/images/delmontes.png"
						alt="Del Monte Logo"
						className="h-[100px] md:h-[130px] w-auto"
					/>
				</div>

				<div className="p-5">
					<div className="mt-16">
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
													: "bg-[#1E7D57] text-white hover:bg-green-600"
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
													openJobOfferModal(
														job.app_id,
														job.jobM_id,
														setJobOfferDetails,
														setIsJobOfferModalOpen
													);
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

					<div className="mt-6 h-72">
						{examResults.length > 0 && (
							<div className="mt-6 h-72 relative">
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
													: "bg-[#1E7D57] text-white"
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
					setAppliedJobs={setAppliedJobs}
					setJobs={setJobs}
					session={session}
					setNotification={setNotification}
					setUnreadNotificationCount={setUnreadNotificationCount}
					setExamResults={setExamResults}
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
					openJobOfferModal={openJobOfferModal}
					setAppliedJobs={setAppliedJobs}
					setJobs={setJobs}
					session={session}
					setNotification={setNotification}
					setUnreadNotificationCount={setUnreadNotificationCount}
					appId={appId}
					isDarkMode={isDarkMode}
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
					session={session}
					setNotification={setNotification}
					setUnreadNotificationCount={setUnreadNotificationCount}
					onClose={() => setShowCancelModal(false)}
				/>
			)}
		</>
		// </div>
	);
};

export default Sidebar;
