"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
	getDataFromSession,
	getDataFromCookie,
} from "@/app/utils/storageUtils";
import { toast } from "sonner";
import Tesseract from "tesseract.js";

const UpdateResume = ({
	showModal,
	setShowModal,
	res,
	fetchProfile,
	selectedResume,
}) => {
	const { data: session } = useSession();
	const [data, setData] = useState({
		canres_id: "",
		file: null,
		canres_file: "",
	});
	const [isNewResume, setIsNewResume] = useState(true); // Track if adding a new resume
	const [profileData, setProfileData] = useState({
		candidateInfo: [],
		educationalBackground: [],
		employmentHistory: [],
		skills: [],
	});
	const [loading, setLoading] = useState(false);
	const [processingImage, setProcessingImage] = useState(false);

	const [isDarkMode, setIsDarkMode] = useState(() => {
		const savedTheme = localStorage.getItem("appearance");
		if (savedTheme === "dark") return true;
		if (savedTheme === "light") return false;
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	});

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const updateTheme = () => {
			const savedTheme = localStorage.getItem("appearance");
			if (savedTheme === "dark") {
				setIsDarkMode(true);
			} else if (savedTheme === "light") {
				setIsDarkMode(false);
			} else {
				setIsDarkMode(mediaQuery.matches);
			}
		};

		// Set initial theme
		updateTheme();

		// Listen for changes in localStorage
		const handleStorageChange = (e) => {
			if (e.key === "appearance") {
				updateTheme();
			}
		};
		window.addEventListener("storage", handleStorageChange);

		// Listen for changes in system preference
		const handleMediaQueryChange = (e) => {
			const savedTheme = localStorage.getItem("appearance");
			if (savedTheme === "system") {
				setIsDarkMode(e.matches);
			}
		};
		mediaQuery.addEventListener("change", handleMediaQueryChange);

		// Cleanup
		return () => {
			window.removeEventListener("storage", handleStorageChange);
			mediaQuery.removeEventListener("change", handleMediaQueryChange);
		};
	}, []);

	useEffect(() => {
		if (showModal) {
			// Reset data when the modal is opened
			if (isNewResume) {
				setData({
					canres_id: "",
					file: null,
					canres_file: "",
				});
			} else {
				// Populate data for editing
				setData({
					canres_id: res?.canres_id || "",
					file: null, // Keep file null to avoid resetting the input
					canres_file: res?.canres_file || "",
				});
			}
		}
	}, [showModal, res, isNewResume]);

	useEffect(() => {
		if (selectedResume) {
			setData({
				canres_id: selectedResume.canres_id || "",
				canres_file: selectedResume.canres_file || "",
			});
			setIsNewResume(false); // Set to false when editing
		}
	}, [selectedResume]);

	useEffect(() => {
		fetchProfileKeywords();
	}, []);

	const fetchProfileKeywords = async () => {
		setLoading(true);
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
			const jsonData = { cand_id: userId };
			const formData = new FormData();
			formData.append("operation", "getCandidateExpectedKeywords");
			formData.append("json", JSON.stringify(jsonData));

			const response = await axios.post(url, formData);
			if (response.data) {
				const {
					candidateInfo = [],
					educationalBackground = [],
					employmentHistory = [],
					skills = [],
				} = response.data;
				setProfileData({
					candidateInfo,
					educationalBackground,
					employmentHistory,
					skills,
				});
			} else {
				console.error("No data received from response");
			}
		} catch (error) {
			console.error("Error fetching candidate profile:", error);
		} finally {
			setLoading(false);
		}
	};

	console.log("profilekeywords", profileData);

	const allowedFileTypes = {
		"image/jpeg": "Image",
		"image/png": "Image",
		"application/pdf": "PDF",
		"application/msword": "DOC",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
			"DOCX",
	};

	const handleFileUpload = async (e) => {
		const file = e.target.files[0];
		if (file) {
			// Check if file type is allowed
			if (!allowedFileTypes[file.type]) {
				toast.error(
					"Invalid file type. Only images (JPG, PNG), PDFs, and Word documents (DOC, DOCX) are allowed."
				);
				return;
			}

			setData({
				...data,
				file: file,
				canres_file: file.name,
			});

			// Only process text extraction for images
			if (file.type.startsWith("image/")) {
				setProcessingImage(true);
				try {
					const textFromImage = await processImage(file);
					if (!validateResume(textFromImage)) {
						toast.error(
							"Resume content does not match the expected profile data."
						);
						setData({
							...data,
							file: null,
							canres_file: "",
						});
					}
				} catch (error) {
					console.error("Error processing image:", error);
					toast.error("Error processing image");
				}
				setProcessingImage(false);
			}
		} else {
			setData({
				...data,
				file: null,
				canres_file: "",
			});
		}
	};

	const processImage = async (file) => {
		const result = await Tesseract.recognize(file, "eng", {
			logger: (info) => console.log(info),
		});
		return result.data.text;
	};

	const normalizeText = (text) =>
		text
			.replace(/\n+/g, " ")
			.replace(/\s+/g, " ")
			.replace(/[-.,]/g, " ")
			.trim()
			.toLowerCase();

	const validateResume = (extractedText) => {
		const normalizedText = normalizeText(extractedText);

		// Break down full name into parts and check individually
		const fullNameParts = profileData.candidateInfo.fullName
			? profileData.candidateInfo.fullName.split(" ").map(normalizeText)
			: [];

		const expectedResumeKeywords = [
			...fullNameParts, // Add individual parts of the full name
			...profileData.educationalBackground.courses,
			...profileData.educationalBackground.institutions,
			...profileData.employmentHistory.companies,
			...profileData.employmentHistory.positions,
			...profileData.skills,
		].map(normalizeText);

		let allKeywordsPresent = true;
		expectedResumeKeywords.forEach((keyword) => {
			if (!normalizedText.includes(keyword)) {
				console.log(`Keyword not found: "${keyword}"`);
				allKeywordsPresent = false;
			}
		});

		return allKeywordsPresent;
	};

	const handleSave = async () => {
		if (
			profileData.skills.length === 0 ||
			profileData.employmentHistory.length === 0 ||
			profileData.educationalBackground.length === 0
		) {
			toast.error(
				"Please complete your profile information before uploading the resume."
			);
			return;
		}
		setLoading(true);
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

			const updatedData = {
				cand_id: userId,
				resume: [
					{
						canres_id: data.canres_id || null,
						file: data.file ? data.file.name : data.canres_file,
					},
				],
			};

			const formData = new FormData();
			formData.append("operation", "updateCandidateResume");
			formData.append("json", JSON.stringify(updatedData));

			if (data.file) {
				formData.append("resume", data.file); // Changed from 'image' to 'resume'
			}

			const response = await axios.post(url, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (response.data === 1) {
				toast.success("Resume updated successfully.");
				if (fetchProfile) {
					fetchProfile();
				}
				setShowModal(false);
			} else {
				console.error("Failed to update resume:", response.data);
			}
		} catch (error) {
			console.error("Error updating resume:", error);
			toast.error("Error updating resume");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className={`modal ${showModal ? "block" : "hidden"}`}>
			<div
				className={`modal-content ${
					isDarkMode ? "bg-gray-800" : "bg-gray-200"
				} p-6 rounded-lg shadow-lg`}
			>
				<h3
					className={`text-xl font-semibold ${
						isDarkMode ? "text-gray-300" : "text-gray-800"
					} mb-4`}
				>
					Update Resume
				</h3>
				<div className="mb-4">
					<p
						className={`text-sm ${
							isDarkMode ? "text-gray-300" : "text-gray-500"
						} mb-2`}
					>
						Choose a file (Supported formats: Images, PDF, DOC, DOCX):
					</p>
					<div className="relative w-full">
						<input
							type="file"
							accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
							onChange={handleFileUpload}
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>
						<div
							className={`flex items-center justify-center w-full p-3 border-2 border-dashed ${
								isDarkMode ? "border-gray-600" : "border-gray-300"
							} rounded-lg hover:bg-gray-100 transition-all cursor-pointer`}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className={`h-6 w-6 ${
									isDarkMode ? "text-gray-300" : "text-gray-500"
								}`}
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M3 16.5V7a2 2 0 012-2h2.586a2 2 0 011.414.586l1.828 1.828a2 2 0 001.414.586H19a2 2 0 012 2v7.5m-8 0v6m-4-6v6m8-6v6"
								/>
							</svg>
							<span
								className={`ml-2 ${
									isDarkMode ? "text-gray-300" : "text-gray-600"
								}`}
							>
								{data.file ? data.file.name : data.canres_file || "Select File"}
							</span>
						</div>
					</div>
					{/* Show preview only for images */}
					{data.file && data.file.type.startsWith("image/") && (
						<div className="mt-4">
							<img
								src={URL.createObjectURL(data.file)}
								alt="Selected Resume"
								className="w-32 h-32 object-cover rounded-lg shadow-md"
							/>
						</div>
					)}
				</div>
				<div className="flex justify-end">
					<button
						onClick={() => setShowModal(false)} // Close the modal
						className="mr-2 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						disabled={loading || processingImage}
					>
						{loading || processingImage ? "Saving..." : "Save"}
					</button>
				</div>
				{processingImage && (
					<div className="flex justify-center items-center mt-4">
						<div className="w-8 h-8 border-4 border-t-transparent border-green-500 rounded-full animate-spin"></div>
						<p className="ml-2 text-green-500">Processing image...</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default UpdateResume;
