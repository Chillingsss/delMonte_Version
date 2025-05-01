"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { hourglass } from "ldrs";
import { getDataFromSession } from "@/app/utils/storageUtils";
import "react-toastify/dist/ReactToastify.css";
import { Toaster, toast } from "react-hot-toast";
import ViewProfile from "./viewProfile";
import { X } from "lucide-react";
import {
	getFileType,
	extractTextFromPdf,
	convertDocxToText,
} from "@/app/utils/documentUtils";
import { handleJobApplication } from "@/app/utils/jobApplicationUtils";

const JobDetailsModal = ({
	job,
	onClosedd,
	fetchJobs,
	fetchAppliedJobs,
	fetchNotification,
	appliedJobs,
	profile,
}) => {
	const { data: session } = useSession();
	const modalRef = useRef(null);
	const [error, setError] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState(null);
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
	const [isRedirecting, setIsRedirecting] = useState(false);
	const [resumeText, setResumeText] = useState("");
	const [resumeLoading, setResumeLoading] = useState(false);
	const [resumeError, setResumeError] = useState(null);
	const [jobQualifications, setJobQualifications] = useState(null);
	const [progress, setProgress] = useState(0);

	const getJobQualifications = async () => {
		setIsLoading(true);
		try {
			const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
			const formData = new FormData();
			formData.append("operation", "getJobQualification");
			formData.append(
				"json",
				JSON.stringify({ jobId: getDataFromSession("jobId") })
			);
			console.log(
				"Fetching qualifications for jobId:",
				getDataFromSession("jobId")
			);
			const response = await axios.post(url, formData);
			setJobQualifications(response.data || []);
			console.log("Qualifications data:", response.data);
		} catch (error) {
			console.error("Detailed error in getJobQualifications:", error);
			toast.error("Failed to fetch job qualifications");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		getJobQualifications();
	}, []);

	// Add useEffect to handle resume text extraction
	useEffect(() => {
		const extractResumeText = async () => {
			if (profile?.resume?.[0]?.canres_file) {
				setResumeLoading(true);
				setResumeError(null);
				try {
					const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}serve-file.php?file=${profile.resume[0].canres_file}`;
					const fileType = getFileType(fileUrl);
					let text = "";

					if (fileType === "pdf") {
						text = await extractTextFromPdf(fileUrl);
						console.log("Extracted PDF Text:", text);
					} else if (fileType === "docx") {
						text = await convertDocxToText(fileUrl);
						console.log("Extracted DOCX Text:", text);
					}

					setResumeText(text);
					console.log("Final Extracted Text:", text);
				} catch (err) {
					setResumeError(err.message);
					console.error("Error extracting resume text:", err);
				} finally {
					setResumeLoading(false);
				}
			}
		};

		extractResumeText();
	}, [profile?.resume]);

	console.log("profile:", profile);

	useEffect(() => {
		// ✅ Ensure `lineSpinner.register()` runs only in the client
		if (typeof window !== "undefined") {
			hourglass.register();
		}
	}, []);

	const handleApply = async () => {
		setIsLoading(true);
		setProgress(0);

		try {
			// Simulate progress updates
			const progressInterval = setInterval(() => {
				setProgress((prev) => {
					if (prev >= 100) {
						clearInterval(progressInterval);
						return 100;
					}
					return prev + 25;
				});
			}, 1000);

			// Pass the job object to handleJobApplication
			await handleJobApplication({
				profile,
				setIsLoading,
				setError,
				setSuccess,
				setIsProfileModalOpen,
				setIsRedirecting,
				session,
				fetchAppliedJobs,
				fetchNotification,
				fetchJobs,
				onClosedd,
				resumeText,
				jobQualifications,
			});

			clearInterval(progressInterval);
			setProgress(100);
		} catch (error) {
			setError(error.message);
			toast.error(error.message);
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
					className={`sticky top-0 left-0 right-0 z-10 pb-4 border-b ${
						isDarkMode ? "bg-[#1D1D1D] text-gray-200" : "bg-white text-black"
					} border-gray-200`}
				>
					<div className="flex items-center justify-between px-4">
						<div className="w-8" /> {/* Spacer to help center the title */}
						<h2 className="text-xl font-bold text-[#0A6338] flex-1 text-center">
							{job.jobM_title}
						</h2>
						<button
							onClick={onClosedd}
							className="text-[#004F39] transition-transform duration-300 ease-in-out hover:scale-105 hover:-translate-y-1"
						>
							<X size={24} />
						</button>
					</div>
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
					} flex justify-end`}
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

			{isLoading && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-[4px] flex items-center justify-center z-50">
					<div
						className={`p-6 rounded-2xl shadow-xl w-96 border ${
							isDarkMode
								? "bg-gray-900 border-gray-800"
								: "bg-white border-gray-200"
						} transform transition-all duration-300 scale-100 hover:scale-[1.02]`}
					>
						<div className="space-y-6">
							{/* Header */}
							<div className="text-center">
								<h3
									className={`text-lg font-semibold ${
										isDarkMode ? "text-gray-200" : "text-gray-900"
									}`}
								>
									Processing Application
								</h3>
							</div>

							{/* Progress Steps */}
							<div className="relative flex justify-between mb-4">
								{["Submit", "Analyze", "Process", "Complete"].map(
									(step, index) => {
										const stepProgress = Math.floor(progress / 25);
										return (
											<div key={step} className="flex flex-col items-center">
												<div
													className={`w-8 h-8 rounded-full flex items-center justify-center ${
														index <= stepProgress
															? isDarkMode
																? "bg-green-500"
																: "bg-green-600"
															: isDarkMode
															? "bg-gray-700"
															: "bg-gray-200"
													}`}
												>
													<span
														className={`text-sm font-medium ${
															index <= stepProgress
																? "text-white"
																: isDarkMode
																? "text-gray-400"
																: "text-gray-500"
														}`}
													>
														{index + 1}
													</span>
												</div>
												<span
													className={`text-xs mt-1 ${
														isDarkMode ? "text-gray-400" : "text-gray-500"
													}`}
												>
													{step}
												</span>
											</div>
										);
									}
								)}
							</div>

							{/* Progress Bar */}
							<div className="relative pt-1">
								<div
									className={`overflow-hidden h-2 text-xs flex rounded-full ${
										isDarkMode ? "bg-gray-800" : "bg-gray-100"
									}`}
								>
									<div
										style={{ width: `${progress}%` }}
										className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
											isDarkMode ? "bg-green-500" : "bg-green-600"
										}`}
									/>
								</div>
								<div
									className={`text-center mt-2 text-sm ${
										isDarkMode ? "text-gray-200" : "text-gray-700"
									}`}
								>
									{progress < 25 && "Submitting application..."}
									{progress >= 25 && progress < 50 && "Analyzing resume..."}
									{progress >= 50 &&
										progress < 75 &&
										"Processing requirements..."}
									{progress >= 75 && "Finalizing application..."}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default JobDetailsModal;
