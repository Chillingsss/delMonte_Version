"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { getDataFromCookie } from "@/app/utils/storageUtils";
import { FaArrowRight, FaBars, FaLock, FaUserLock } from "react-icons/fa";
import { HiMiniBarsArrowDown } from "react-icons/hi2";
import { FaRegCheckCircle } from "react-icons/fa";
import { BsArrowReturnRight } from "react-icons/bs";
import UpdateEducBac from "./update/updateEducBac";
import UpdateSkill from "./update/updateSkill";
import UpdateTraining from "./update/updateTraining";
import UpdateKnowledge from "./update/updateKnowledge";
import UpdateLicense from "./update/updateLicense";
import {
	MoreHoriz,
	Edit,
	Trash2,
	Plus,
	Settings,
	Lock,
	CheckIcon,
} from "lucide-react";
import { Check, X } from "lucide-react";
import UpdateEmpHis from "./update/updateEmpHis";
import { Toaster, toast } from "react-hot-toast";
import ConfirmationModal from "../components/ConfirmationModal";
import VerificationEmailUpdate from "./verificationEmailUpdate";
import UpdateEmailPassword from "./update/updatePassword";
import UpdateResume from "./update/updateResume";
import UpdatePassword from "./update/updatePassword";
import UpdateEmail from "./update/updateEmail";
import DatePicker from "react-datepicker";
import { endOfDay } from "date-fns";
import Image from "next/image";
import { FileText, Download } from "lucide-react";
import mammoth from "mammoth";
import PersonalInformation from "./profile/Personalinformation";
import EducationalBackground from "./profile/EducationalBackground";
import EmploymentHistory from "./profile/EmploymentHistory";
import Skill from "./profile/Skill";
import Training from "./profile/Training";
import Knowledge from "./profile/Knowledge";
import License from "./profile/License";
import Resume from "./profile/Resume";

const ViewProfile = ({ isOpen, onClose, onClosed, fetchProfiles }) => {
	const { data: session } = useSession();
	const [profile, setProfile] = useState({
		candidateInformation: {},
		educationalBackground: [],
		employmentHistory: {},
		skills: [],
		training: [],
		license: [],
		resume: [],
	});

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
	const [showResumeModal, setShowResumeModal] = useState(false);
	const [selectedResume, setSelectedResume] = useState(null);
	const [loading, setLoading] = useState(true);
	const [activeSection, setActiveSection] = useState("Personal Information");
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
	const [isEditingEducationalInfo, setIsEditingEducationalInfo] =
		useState(false);
	const [selectedEducation, setSelectedEducation] = useState(null);
	const [showModalUpdateEduc, setShowModalUpdateEduc] = useState(false);

	const [isEditingEmploymentInfo, setIsEditingEmploymentInfo] = useState(false);
	const [isEditingSkills, setIsEditingSkills] = useState(false);
	const [isEditingTraining, setIsEditingTraining] = useState(false);
	const [isEditingknowledge, setIsEditingknowledge] = useState(false);
	const [isEditinglicense, setIsEditinglicense] = useState(false);

	const [editData, setEditData] = useState({});
	const modalRef = useRef(null);

	const [courses, setCourses] = useState([]);
	const [institutions, setInstitutions] = useState([]);
	const [courseTypes, setCourseTypes] = useState([]);
	const [courseCategory, setCourseCategory] = useState([]);

	const [selectedEmployment, setSelectedEmployment] = useState(null);
	const [showEmploymentModal, setShowEmploymentModal] = useState(false);

	const [updateTrigger, setUpdateTrigger] = useState(false);

	const [selectedSkill, setSelectedSkill] = useState(null);
	const [showSkillModal, setShowSkillModal] = useState(false);
	const [skills, setSkills] = useState([]);

	const [selectedTraining, setSelectedTraining] = useState(null);
	const [showTrainingModal, setShowTrainingModal] = useState(false);
	const [trainings, settrainings] = useState([]);

	const [selectedKnowlegde, setSelectedKnowledge] = useState(null);
	const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
	const [knowledges, setKnowledges] = useState([]);

	const [selectedLicense, setSelectedLicense] = useState(null);
	const [showLicenseModal, setShowLicenseModal] = useState(false);
	const [licenses, setLicense] = useState([]);
	const [licenseType, setLicenseType] = useState([]);
	const [resumes, setResumes] = useState([]);

	const [selectedIndex, setSelectedIndex] = useState(null);
	const [showAddModal, setShowAddModal] = useState(false);

	const [showVerificationModal, setShowVerificationModal] = useState(false);
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [showEmailModal, setShowEmailModal] = useState(false);

	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	// Add this near your other state declarations
	const [isImageModalOpen, setIsImageModalOpen] = useState(false);
	const [zoomLevel, setZoomLevel] = useState(1);

	// Add these near your other state declarations
	const [isTrainingImageModalOpen, setIsTrainingImageModalOpen] =
		useState(false);
	const [selectedTrainingImage, setSelectedTrainingImage] = useState(null);
	const [trainingZoomLevel, setTrainingZoomLevel] = useState(1);

	// Add these near your other state declarations
	const [isResumeImageModalOpen, setIsResumeImageModalOpen] = useState(false);
	const [selectedResumeImage, setSelectedResumeImage] = useState(null);
	const [resumeZoomLevel, setResumeZoomLevel] = useState(1);

	const [selectedDiplomaImage, setSelectedDiplomaImage] = useState(null);
	const [isDiplomaImageModalOpen, setIsDiplomaImageModalOpen] = useState(false);
	const [diplomaZoomLevel, setDiplomaZoomLevel] = useState(1);

	const handleEditClick = (education, index) => {
		setSelectedEducation(education);
		setSelectedIndex(index);
		setShowModalUpdateEduc(true);
	};

	const handleEditSkillClick = (skill, index) => {
		setSelectedSkill(skill);
		setSelectedIndex(index);
		setShowSkillModal(true);
	};

	const handleEditTrainingClick = (train, index) => {
		setSelectedTraining(train);
		setSelectedIndex(index);

		setShowTrainingModal(true);
	};

	const handleEditKnowledgeClick = (know, index) => {
		setSelectedKnowledge(know);
		setSelectedIndex(index);
		setShowKnowledgeModal(true);
	};

	const handleEditLicenseClick = (lic, index) => {
		setSelectedLicense(lic);
		setSelectedIndex(index);

		setShowLicenseModal(true);
	};

	const handleEditResumeClick = (res, index) => {
		setSelectedResume(res);
		setSelectedIndex(index);

		setShowResumeModal(true);
	};

	const settingsRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (settingsRef.current && !settingsRef.current.contains(event.target)) {
				setIsSettingsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const [isModalOpen, setIsModalOpen] = useState(false);
	// const [isModalConfirmOpen, setIsModalConfirmOpen] = useState(false);

	const [currentDeleteId, setCurrentDeleteId] = useState(null);

	const handleDeleteClick = (id) => {
		setCurrentDeleteId(id);
		setIsModalOpen(true);
		// setIsModalConfirmOpen(true);
	};

	const fetchCourses = async () => {
		try {
			const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

			const formData = new FormData();
			formData.append("operation", "getCourses");

			const coursesResponse = await axios.post(url, formData);

			setCourses(coursesResponse.data);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	const fetchInstitutions = async () => {
		try {
			const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

			const formData = new FormData();
			formData.append("operation", "getInstitution");

			const institutionsResponse = await axios.post(url, formData);

			setInstitutions(institutionsResponse.data);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	const fetchCourseTypes = async () => {
		try {
			const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

			const formData = new FormData();
			formData.append("operation", "getCourseType");

			const courseTypesResponse = await axios.post(url, formData);

			setCourseTypes(courseTypesResponse.data);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	const fetchCourseCategorys = async () => {
		try {
			const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

			const formData = new FormData();
			formData.append("operation", "getCourseCategory");
			const courseCategorysResponse = await axios.post(url, formData);
			setCourseCategory(courseCategorysResponse.data);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	const fetchSkills = async () => {
		try {
			const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

			const formData = new FormData();
			formData.append("operation", "getSkills");
			const skillsResponse = await axios.post(url, formData);
			setSkills(skillsResponse.data);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	const fetchTraining = async () => {
		try {
			const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

			const formData = new FormData();
			formData.append("operation", "getTraining");
			const trainingResponse = await axios.post(url, formData);
			settrainings(trainingResponse.data);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	const fetchKnowledge = async () => {
		try {
			const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

			const formData = new FormData();
			formData.append("operation", "getKnowledge");
			const knowledgeResponse = await axios.post(url, formData);
			setKnowledges(knowledgeResponse.data);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	const fetchLicense = async () => {
		try {
			const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

			const formData = new FormData();
			formData.append("operation", "getLicense");
			const licenseResponse = await axios.post(url, formData);
			setLicense(licenseResponse.data);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	const fetchLicenseType = async () => {
		try {
			const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

			const formData = new FormData();
			formData.append("operation", "getLicenseType");
			const licenseResponse = await axios.post(url, formData);
			setLicenseType(licenseResponse.data);
		} catch (error) {
			console.error("Error fetching data:", error);
		}
	};

	useEffect(() => {
		fetchCourses();
		fetchInstitutions();
		fetchCourseTypes();
		fetchCourseCategorys();
		fetchSkills();
		fetchTraining();
		fetchKnowledge();
		fetchLicense();
		fetchLicenseType();
	}, []);

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
			console.log("res", response.data);
			setProfile(response.data);
			setLoading(false);
		} catch (error) {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchProfile();
	}, [updateTrigger]);

	// useEffect(() => {
	//   function handleClickOutside(event) {
	//     if (modalRef.current && !modalRef.current.contains(event.target)) {
	//     if (onClose) {
	//       onClose();
	//     } else {
	//       onClosed();
	//     }
	//     }
	//   }

	//   if (isOpen) {
	//     document.addEventListener("mousedown", handleClickOutside);
	//   }

	//   return () => {
	//     document.removeEventListener("mousedown", handleClickOutside);
	//   };
	// }, [isOpen, onClose, onClosed]);

	const handleSectionClick = (section) => {
		setActiveSection(section);
		setIsSidebarOpen(false); // Close the sidebar on mobile after selecting a section
	};

	const handleEditPersonalClick = () => {
		setIsEditingPersonalInfo(true);
		setEditData({
			...profile,
			candidateInformation: {
				...profile.candidateInformation,
				cand_profPic: profile.candidateInformation?.cand_profPic || null,
			},
		});
	};

	const handleEditEmploymentClick = () => {
		setIsEditingEmploymentInfo(true);
		setEditData(profile);
	};

	const handleChangeNotArray = (e) => {
		const { name, value } = e.target;
		const nameParts = name.split(".");

		// Handle cases where nameParts can have 2 parts
		const [parentKey, key] = nameParts;

		setEditData((prevData) => ({
			...prevData,
			[parentKey]: {
				...(prevData[parentKey] || {}),
				[key]: value,
			},
		}));
	};

	if (!isOpen) return null;

	const handleDropdownChange = (e, index, field) => {
		const value = e.target.value;
		const newData = [...editData.educationalBackground];
		newData[index][field] = value;
		handleChange({
			target: {
				name: `educationalBackground[${index}].${field}`,
				value: newData,
			},
		});
	};

	// Handle input change
	const handleChange = (e) => {
		const { name, value } = e.target;
		const nameParts = name.match(/([^[\].]+)|(?=\[\d+\])/g);

		if (nameParts.length < 3) {
			console.error("Unexpected name format", name);
			return;
		}

		const [parentKey, index, key] = nameParts;
		const idx = parseInt(index, 10);

		setEditData((prevData) => {
			if (Array.isArray(prevData[parentKey])) {
				const updatedArray = prevData[parentKey].map((item, i) =>
					i === idx ? { ...item, [key]: value } : item
				);

				return {
					...prevData,
					[parentKey]: updatedArray,
				};
			} else {
				return {
					...prevData,
					[parentKey]: {
						...prevData[parentKey],
						[key]: value,
					},
				};
			}
		});
	};

	const handleSavePersonalInfo = async () => {
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

			const formData = new FormData();
			formData.append("operation", "updateCandidatePersonalInfo");

			// Handle profile picture upload if it's a new file
			if (editData.candidateInformation?.cand_profPic instanceof File) {
				formData.append(
					"profile_picture",
					editData.candidateInformation.cand_profPic
				);
			}

			// Create a copy of the data for JSON
			const dataForJson = {
				...editData,
				userId,
				candidateInformation: {
					...editData.candidateInformation,
					cand_profPic:
						editData.candidateInformation?.cand_profPic instanceof File
							? editData.candidateInformation.cand_profPic.name // New file case
							: editData.candidateInformation?.cand_profPic ??
							  profile.candidateInformation?.cand_profPic ??
							  null, // Keep existing or fallback
				},
			};

			// Debug logs
			console.log(
				"Current profile picture:",
				profile.candidateInformation?.cand_profPic
			);
			console.log(
				"Edit data picture:",
				editData.candidateInformation?.cand_profPic
			);
			console.log("Final data being sent:", dataForJson);

			formData.append("json", JSON.stringify(dataForJson));

			const response = await axios.post(url, formData);

			if (response.data.success) {
				// Update the profile state with the correct image data
				const updatedProfile = {
					...dataForJson,
					candidateInformation: {
						...dataForJson.candidateInformation,
						cand_profPic:
							dataForJson.candidateInformation.cand_profPic ||
							profile.candidateInformation?.cand_profPic,
					},
				};
				setProfile(updatedProfile);
				setIsEditingPersonalInfo(false);
				toast.success("Profile updated successfully");

				if (fetchProfiles) {
					fetchProfiles();
				}
			} else if (response.data.error) {
				toast.error("Error updating profile: " + response.data.error);
			} else {
				toast.error("Unexpected response from server.");
			}
		} catch (error) {
			console.error("Update error:", error);
			toast.error("Error updating profile: " + error.message);
		}
	};

	const handleSaveEmploymentInfo = async () => {
		try {
			const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
			const getUserIdFromCookie = () => {
				const tokenData = getDataFromCookie("auth_token");
				if (tokenData && tokenData.userId) {
					return tokenData.userId;
				}
				return null; // Return null if userId is not found or tokenData is invalid
			};

			const cand_id = session?.user?.id || getUserIdFromCookie();

			const updatedData = { ...editData, cand_id };

			console.log("Sending data:", updatedData);

			const formData = new FormData();
			formData.append("operation", "updateCandidateEmploymentInfo");
			formData.append("json", JSON.stringify(updatedData));

			const response = await axios.post(url, formData);

			if (response.data.success) {
				setProfile(updatedData);
				setIsEditingEmploymentInfo(false);
				console.log("Profile updated successfully");
			} else if (response.data.error) {
				console.error("Error updating profile:", response.data.error);
			} else {
				console.error("Unexpected response from server:", response.data);
			}
		} catch (error) {
			console.error("Error updating profile:", error);
		}
	};

	const handleEducationDeleteClick = async () => {
		if (currentDeleteId == null) return;

		try {
			const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

			const userId = session?.user?.id || getUserIdFromCookie();

			console.log("User ID:", userId);

			const updatedData = {
				candidateId: userId,
				educationalBackground: [
					{
						educId: currentDeleteId,
						deleteFlag: true,
					},
				],
			};

			console.log("Sending data:", updatedData);

			const formData = new FormData();
			formData.append("candidateId", userId); // Use userId here
			formData.append("operation", "updateEducationalBackground");
			formData.append("json", JSON.stringify(updatedData));

			const response = await axios.post(url, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			console.log(response.data);

			if (response.data === 1) {
				toast.success("Education record deleted successfully.");
				fetchProfile();
				console.log(
					`Education record with ID ${currentDeleteId} deleted successfully.`
				);
			} else {
				console.error("Failed to delete the education record.");
			}
		} catch (error) {
			console.error(
				"An error occurred while deleting the education record:",
				error
			);
		} finally {
			setIsModalOpen(false);
			setCurrentDeleteId(null);
		}
	};

	const handleConfirmEmployementHistoryDelete = async () => {
		console.log("currentDeleteId", currentDeleteId);
		if (currentDeleteId == null) return;

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
			employmentHistory: [
				{
					empH_id: currentDeleteId,
					deleteFlag: true,
				},
			],
		};

		console.log("Sending data:", updatedData);

		try {
			const formData = new FormData();
			formData.append("cand_id", userId);
			formData.append("operation", "updateCandidateEmploymentInfo");
			formData.append("json", JSON.stringify(updatedData));

			const response = await axios.post(url, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			console.log("asd", response.data);

			if (response.data.success) {
				toast.success("Employment record deleted successfully.");
				fetchProfile(); // Assume fetchProfile is defined to refresh the data
			} else {
				toast.error("Failed to delete the employment record.");
			}
		} catch (error) {
			toast.error("An error occurred while deleting the employment record.");
		} finally {
			setIsModalOpen(false);
			setCurrentDeleteId(null);
		}
	};

	const handleConfirmSkillDelete = async () => {
		if (currentDeleteId == null) return;

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
			candidateId: userId,
			skills: [
				{
					skills_id: currentDeleteId,
					deleteFlag: true,
				},
			],
		};

		try {
			const formData = new FormData();
			formData.append("candidateId", userId);
			formData.append("operation", "updateCandidateSkills");
			formData.append("json", JSON.stringify(updatedData));

			const response = await axios.post(url, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (response.data === 1) {
				toast.success("Skill record deleted successfully.");
				fetchProfile(); // Assume fetchProfile is defined to refresh the data
			} else {
				toast.error("Failed to delete the skill record.");
			}
		} catch (error) {
			toast.error("An error occurred while deleting the skill record.");
		} finally {
			setIsModalOpen(false);
			setCurrentDeleteId(null);
		}
	};

	const handleConfirmTrainingDelete = async () => {
		if (currentDeleteId == null) return;

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
			training: [
				{
					training_id: currentDeleteId,
					deleteFlag: true,
				},
			],
		};

		console.log("fck", updatedData);

		try {
			const formData = new FormData();
			formData.append("cand_id", userId);
			formData.append("operation", "updateCandidateTraining");
			formData.append("json", JSON.stringify(updatedData));

			const response = await axios.post(url, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (response.data === 1) {
				toast.success("Training record deleted successfully.");
				fetchProfile();
			} else {
				toast.error("Failed to delete the Training record.");
			}
		} catch (error) {
			toast.error("An error occurred while deleting the skill record.");
		} finally {
			setIsModalOpen(false);
			setCurrentDeleteId(null);
		}
	};

	const handleConfirmKnowledgeDelete = async () => {
		if (currentDeleteId == null) return;

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
			knowledge: [
				{
					canknow_id: currentDeleteId,
					deleteFlag: true,
				},
			],
		};

		console.log("fck", updatedData);

		try {
			const formData = new FormData();
			formData.append("cand_id", userId);
			formData.append("operation", "updateCandidateKnowledge");
			formData.append("json", JSON.stringify(updatedData));

			const response = await axios.post(url, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (response.data === 1) {
				toast.success("Knowledge record deleted successfully.");
				fetchProfile();
			} else {
				toast.error("Failed to delete the Knowledge record.");
			}
		} catch (error) {
			toast.error("An error occurred while deleting the skill record.");
		} finally {
			setIsModalOpen(false);
			setCurrentDeleteId(null);
		}
	};

	const handleConfirmLicenseDelete = async () => {
		if (currentDeleteId == null) return;

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
			license: [
				{
					license_id: currentDeleteId,
					deleteFlag: true,
				},
			],
		};

		console.log("fck", updatedData);

		try {
			const formData = new FormData();
			formData.append("cand_id", userId);
			formData.append("operation", "updateCandidateLicense");
			formData.append("json", JSON.stringify(updatedData));

			const response = await axios.post(url, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (response.data === 1) {
				toast.success("License record deleted successfully.");
				fetchProfile();
			} else {
				toast.error("Failed to delete the License record.");
			}
		} catch (error) {
			toast.error("An error occurred while deleting the license record.");
		} finally {
			setIsModalOpen(false);
			setCurrentDeleteId(null);
		}
	};

	const handleConfirmResumeDelete = async () => {
		if (currentDeleteId == null) return;

		const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
		const getUserIdFromCookie = () => {
			const tokenData = getDataFromCookie("auth_token");
			if (tokenData && tokenData.userId) {
				return tokenData.userId;
			}
			return null; // Return null if userId is not found or tokenData is invalid
		};
		const userId = session?.user?.id;

		console.log("User ID:", userId);

		const updatedData = {
			cand_id: userId,
			resume: [
				{
					canres_id: currentDeleteId,
					deleteFlag: true,
				},
			],
		};

		try {
			const formData = new FormData();
			formData.append("cand_id", userId);
			formData.append("operation", "updateCandidateResume");
			formData.append("json", JSON.stringify(updatedData));

			const response = await axios.post(url, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (response.data === 1) {
				toast.success("Resume record deleted successfully.");
				fetchProfile();
			} else {
				toast.error("Failed to delete the Resume record.");
				console.error("Server response:", response.data);
			}
		} catch (error) {
			toast.error("An error occurred while deleting the resume record.");
			console.error("Error details:", error);
		} finally {
			setIsModalOpen(false);
			setCurrentDeleteId(null);
		}
	};

	// Function to handle opening the modal
	const handleSaveClick = () => {
		setShowVerificationModal(true);
	};

	// Function to handle closing the modal after verification
	const handleVerificationSubmit = (code) => {
		console.log("Verification code submitted:", code);

		setShowVerificationModal(false);
	};

	const handleEditPasswordClick = () => {
		setShowPasswordModal(true);
	};

	const handleEditEmailClick = () => {
		setShowEmailModal(true);
	};

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

	const handleAddEducation = () => {
		setSelectedEducation({});
		setShowAddModal(true);
	};

	const renderSection = () => {
		switch (activeSection) {
			case "Personal Information":
				return (
					<PersonalInformation
						profile={profile}
						setProfile={setProfile}
						isDarkMode={isDarkMode}
						setIsDarkMode={setIsDarkMode}
						handleEditPasswordClick={handleEditPasswordClick}
						handleEditEmailClick={handleEditEmailClick}
						setIsSettingsOpen={setIsSettingsOpen}
						isSettingsOpen={isSettingsOpen}
						setShowPasswordModal={setShowPasswordModal}
						setShowEmailModal={setShowEmailModal}
						showPasswordModal={showPasswordModal}
						showEmailModal={showEmailModal}
						isImageModalOpen={isImageModalOpen}
						setIsImageModalOpen={setIsImageModalOpen}
						zoomLevel={zoomLevel}
						setZoomLevel={setZoomLevel}
						isEditingPersonalInfo={isEditingPersonalInfo}
						setIsEditingPersonalInfo={setIsEditingPersonalInfo}
						handleEditPersonalClick={handleEditPersonalClick}
						editData={editData}
						setEditData={setEditData}
						handleChangeNotArray={handleChangeNotArray}
						handleSavePersonalInfo={handleSavePersonalInfo}
					/>
				);

			case "Educational Background":
				return (
					<EducationalBackground
						profile={profile}
						setProfile={setProfile}
						fetchProfile={fetchProfile}
						isDarkMode={isDarkMode}
						setIsDarkMode={setIsDarkMode}
						handleAddEducation={handleAddEducation}
						showAddModal={showAddModal}
						setShowAddModal={setShowAddModal}
						selectedEducation={selectedEducation}
						courses={courses}
						institutions={institutions}
						courseTypes={courseTypes}
						courseCategory={courseCategory}
						fetchCourses={fetchCourses}
						fetchInstitutions={fetchInstitutions}
						fetchCourseTypes={fetchCourseTypes}
						fetchCourseCategorys={fetchCourseCategorys}
						handleEditClick={handleEditClick}
						handleDeleteClick={handleDeleteClick}
						handleEducationDeleteClick={handleEducationDeleteClick}
						isModalOpen={isModalOpen}
						setIsModalOpen={setIsModalOpen}
						selectedIndex={selectedIndex}
						showModalUpdateEduc={showModalUpdateEduc}
						setShowModalUpdateEduc={setShowModalUpdateEduc}
						setSelectedDiplomaImage={setSelectedDiplomaImage}
						setIsDiplomaImageModalOpen={setIsDiplomaImageModalOpen}
					/>
				);

			case "Employment History":
				return (
					<EmploymentHistory
						profile={profile}
						isDarkMode={isDarkMode}
						fetchProfile={fetchProfile}
						showAddModal={showAddModal}
						setShowAddModal={setShowAddModal}
						handleDeleteClick={handleDeleteClick}
						isModalOpen={isModalOpen}
						setIsModalOpen={setIsModalOpen}
						isEditingEmploymentInfo={isEditingEmploymentInfo}
						setIsEditingEmploymentInfo={setIsEditingEmploymentInfo}
						editData={editData}
						handleChange={handleChange}
						handleSaveEmploymentInfo={handleSaveEmploymentInfo}
						handleEditEmploymentClick={handleEditEmploymentClick}
						handleConfirmEmployementHistoryDelete={
							handleConfirmEmployementHistoryDelete
						}
					/>
				);

			case "Skills":
				return (
					<Skill
						profile={profile}
						isDarkMode={isDarkMode}
						fetchProfile={fetchProfile}
						showAddModal={showAddModal}
						setShowAddModal={setShowAddModal}
						handleDeleteClick={handleDeleteClick}
						isModalOpen={isModalOpen}
						setIsModalOpen={setIsModalOpen}
						setSelectedSkill={setSelectedSkill}
						selectedSkill={selectedSkill}
						skills={skills}
						fetchSkills={fetchSkills}
						handleEditSkillClick={handleEditSkillClick}
						handleConfirmSkillDelete={handleConfirmSkillDelete}
						showSkillModal={showSkillModal}
						setShowSkillModal={setShowSkillModal}
						setUpdateTrigger={setUpdateTrigger}
						selectedIndex={selectedIndex}
					/>
				);

			case "Training":
				return (
					<Training
						profile={profile}
						isDarkMode={isDarkMode}
						fetchProfile={fetchProfile}
						showAddModal={showAddModal}
						setShowAddModal={setShowAddModal}
						handleDeleteClick={handleDeleteClick}
						isModalOpen={isModalOpen}
						setIsModalOpen={setIsModalOpen}
						setSelectedTraining={setSelectedTraining}
						selectedTraining={selectedTraining}
						trainings={trainings}
						fetchTraining={fetchTraining}
						handleEditTrainingClick={handleEditTrainingClick}
						selectedIndex={selectedIndex}
						setSelectedTrainingImage={setSelectedTrainingImage}
						setIsTrainingImageModalOpen={setIsTrainingImageModalOpen}
						handleConfirmTrainingDelete={handleConfirmTrainingDelete}
					/>
				);

			case "Knowledge":
				return (
					<Knowledge
						profile={profile}
						isDarkMode={isDarkMode}
						fetchProfile={fetchProfile}
						showAddModal={showAddModal}
						setShowAddModal={setShowAddModal}
						handleDeleteClick={handleDeleteClick}
						isModalOpen={isModalOpen}
						setIsModalOpen={setIsModalOpen}
						showKnowledgeModal={showKnowledgeModal}
						setShowKnowledgeModal={setShowKnowledgeModal}
						selectedKnowlegde={selectedKnowlegde}
						setSelectedKnowledge={setSelectedKnowledge}
						knowledges={knowledges}
						fetchKnowledge={fetchKnowledge}
						handleConfirmKnowledgeDelete={handleConfirmKnowledgeDelete}
						handleEditKnowledgeClick={handleEditKnowledgeClick}
						selectedIndex={selectedIndex}
					/>
				);

			case "License":
				return (
					<License
						profile={profile}
						isDarkMode={isDarkMode}
						fetchProfile={fetchProfile}
						showAddModal={showAddModal}
						setShowAddModal={setShowAddModal}
						handleDeleteClick={handleDeleteClick}
						isModalOpen={isModalOpen}
						setIsModalOpen={setIsModalOpen}
						showLicenseModal={showLicenseModal}
						setShowLicenseModal={setShowLicenseModal}
						selectedLicense={selectedLicense}
						setSelectedLicense={setSelectedLicense}
						selectedIndex={selectedIndex}
						licenses={licenses}
						fetchLicense={fetchLicense}
						handleConfirmLicenseDelete={handleConfirmLicenseDelete}
						handleEditLicenseClick={handleEditLicenseClick}
						licenseType={licenseType}
					/>
				);

			case "Resume":
				return (
					<Resume
						profile={profile}
						isDarkMode={isDarkMode}
						fetchProfile={fetchProfile}
						showAddModal={showAddModal}
						setShowAddModal={setShowAddModal}
						handleDeleteClick={handleDeleteClick}
						isModalOpen={isModalOpen}
						setIsModalOpen={setIsModalOpen}
						setSelectedResume={setSelectedResume}
						selectedResume={selectedResume}
						handleConfirmResumeDelete={handleConfirmResumeDelete}
						handleEditResumeClick={handleEditResumeClick}
						selectedIndex={selectedIndex}
						setSelectedResumeImage={setSelectedResumeImage}
						setIsResumeImageModalOpen={setIsResumeImageModalOpen}
						showResumeModal={showResumeModal}
						setShowResumeModal={setShowResumeModal}
						getFileType={getFileType}
						DocxPreview={DocxPreview}
					/>
				);

			default:
				return <div>Select a section to view.</div>;
		}
	};

	// Add this function to handle zoom
	const handleZoom = (direction) => {
		if (direction === "in" && zoomLevel < 3) {
			setZoomLevel((prev) => prev + 0.25);
		} else if (direction === "out" && zoomLevel > 0.5) {
			setZoomLevel((prev) => prev - 0.25);
		}
	};

	// Add this function to handle training image zoom
	const handleTrainingZoom = (direction) => {
		if (direction === "in" && trainingZoomLevel < 3) {
			setTrainingZoomLevel((prev) => prev + 0.25);
		} else if (direction === "out" && trainingZoomLevel > 0.5) {
			setTrainingZoomLevel((prev) => prev - 0.25);
		}
	};

	// Add this function to handle resume image zoom
	const handleResumeZoom = (direction) => {
		if (direction === "in" && resumeZoomLevel < 3) {
			setResumeZoomLevel((prev) => prev + 0.25);
		} else if (direction === "out" && resumeZoomLevel > 0.5) {
			setResumeZoomLevel((prev) => prev - 0.25);
		}
	};

	// Add this function to handle diploma image zoom
	const handleDiplomaZoom = (direction) => {
		if (direction === "in" && diplomaZoomLevel < 3) {
			setDiplomaZoomLevel((prev) => prev + 0.25);
		} else if (direction === "out" && diplomaZoomLevel > 0.5) {
			setDiplomaZoomLevel((prev) => prev - 0.25);
		}
	};

	// Add this helper function near the top of your component
	const getFileType = (filename) => {
		const extension = filename.split(".").pop().toLowerCase();
		if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
			return "image";
		} else if (extension === "pdf") {
			return "pdf";
		} else if (extension === "docx") {
			return "docx";
		} else if (extension === "doc") {
			return "document";
		}
		return "unknown";
	};

	const openResumeModal = (resume) => {
		setSelectedResume(resume);
		setShowResumeModal(true);
	};

	const closeResumeModal = () => {
		setShowResumeModal(false);
		setSelectedResume(null);
	};

	// Add a new function to convert DOCX to text
	const convertDocxToText = async (fileUrl) => {
		try {
			console.log("Fetching DOCX from:", fileUrl);
			const response = await fetch(fileUrl);

			if (!response.ok) {
				console.error(
					"Failed to fetch DOCX file:",
					response.status,
					response.statusText
				);
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const arrayBuffer = await response.arrayBuffer();
			console.log("File size:", arrayBuffer.byteLength, "bytes");

			if (arrayBuffer.byteLength === 0) {
				throw new Error("Empty file received");
			}

			const result = await mammoth.extractRawText({ arrayBuffer });

			if (!result.value) {
				throw new Error("No text content extracted");
			}

			console.log("Text extraction successful, length:", result.value.length);
			return result.value;
		} catch (error) {
			console.error("Detailed error in convertDocxToText:", error);
			if (error.messages) {
				console.error("Mammoth messages:", error.messages);
			}
			throw error; // Propagate the error to be handled by the component
		}
	};

	// Add a new DocxPreview component
	const DocxPreview = ({ fileUrl }) => {
		const [text, setText] = useState("");
		const [loading, setLoading] = useState(true);
		const [error, setError] = useState(null);

		useEffect(() => {
			const loadDocx = async () => {
				try {
					setLoading(true);
					setError(null);
					const extractedText = await convertDocxToText(fileUrl);

					if (!extractedText || extractedText.trim().length === 0) {
						throw new Error("No text content found in document");
					}

					setText(extractedText);
				} catch (error) {
					console.error("Error in DocxPreview:", error);
					setError(error.message || "Failed to load document");
					setText("");
				} finally {
					setLoading(false);
				}
			};

			loadDocx();
		}, [fileUrl]);

		if (loading) {
			return (
				<div className="flex items-center justify-center py-4">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
					<span className="ml-2">Loading document...</span>
				</div>
			);
		}

		if (error) {
			return (
				<div className="text-center py-4 text-red-500">
					<div className="mb-2">Error: {error}</div>
					<div className="text-sm">
						Please ensure the document is a valid DOCX file and try again.
					</div>
				</div>
			);
		}

		return (
			<div className="prose max-w-none dark:prose-invert">
				<div className="whitespace-pre-wrap font-sans p-4 bg-white dark:bg-gray-800 rounded-lg">
					{text || "No content available"}
				</div>
			</div>
		);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
			<div
				ref={modalRef}
				className="flex flex-col md:flex-row w-full md:w-3/4 lg:w-2/3 h-screen md:h-full"
			>
				{loading ? (
					<div>Loading...</div>
				) : (
					<>
						{/* Hamburger icon for mobile */}

						{/* Sidebar (hidden on mobile unless toggled) */}
						<aside
							className={`${
								isSidebarOpen
									? "block fixed inset-0 z-20 transition-transform transform"
									: "hidden"
							} md:block w-full md:w-1/3 p-4 md:rounded-l-lg ${
								isDarkMode ? "bg-[#004F39]" : "bg-[#004F39]"
							} text-white`}
						>
							<div className="flex items-center justify-between mb-10">
								{/* Added space between div */}
								<div className="flex flex-col">
									<h2 className="text-xl md:text-2xl font-semibold ">
										Account Details
									</h2>
									{calculateCompletionPercentage() === 100 ? (
										<div className="flex items-center">
											<FaRegCheckCircle className="h-5 w-5 text-green-400 mr-2 mt-1" />
											<p className="text-gray-300 text-base">Fully Completed</p>
										</div>
									) : (
										<p className="text-gray-300 text-base">
											Your profile is{" "}
											{calculateCompletionPercentage().toFixed(0)}% complete.
										</p>
									)}
								</div>

								{isSidebarOpen && (
									<button
										className={`text-4xl ${
											isDarkMode ? "text-white" : "text-gray-300"
										}`}
										onClick={() => setIsSidebarOpen(false)} // Close sidebar
									>
										&times; {/* "X" character */}
									</button>
								)}
							</div>

							<ul>
								{[
									"Personal Information",
									"Educational Background",
									"Employment History",
									"Skills",
									"Training",
									"Knowledge",
									"License",
									"Resume",
								].map((section) => (
									<li
										key={section}
										className={`cursor-pointer py-2 px-4 ${
											activeSection === section ? "bg-green-600" : ""
										} rounded-md mb-2`}
										onClick={() => handleSectionClick(section)}
									>
										{section}
									</li>
								))}
							</ul>
						</aside>

						<main
							className={`flex-1 p-3 md:p-4 md:rounded-r-lg relative h-screen md:h-auto max-h-screen overflow-y-auto scrollbar-custom ${
								isDarkMode ? "bg-[#1A202C]" : "bg-[#F4F7FC]"
							}`}
						>
							<div className="flex justify-between items-center mt-2">
								<button
									className={`md:hidden p-4 ${
										isDarkMode ? "text-gray-300" : "text-gray-600"
									}`}
									onClick={() => setIsSidebarOpen(!isSidebarOpen)}
								>
									<HiMiniBarsArrowDown size={34} />
								</button>
								<div className="flex-grow"></div>
								<button
									onClick={() => {
										if (onClose) {
											onClose();
										} else if (onClosed) {
											onClosed();
										}
									}}
									className={`text-3xl ${
										isDarkMode
											? "text-gray-300 hover:text-gray-100"
											: "text-gray-600 hover:text-gray-900"
									}`}
								>
									<BsArrowReturnRight />
								</button>
							</div>

							<div className="flex-1 overflow-y-auto scrollbar-custom">
								{/* Card for renderSection */}
								<div
									className={`p-1 rounded-lg shadow-md ${
										isDarkMode ? "bg-[#1A202C]" : ""
									}`}
								>
									{renderSection()}
								</div>
							</div>
						</main>
					</>
				)}
			</div>

			<Toaster position="bottom-left" />

			{/* Training Image Modal */}
			{isTrainingImageModalOpen && selectedTrainingImage && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
					onClick={() => {
						setIsTrainingImageModalOpen(false);
						setTrainingZoomLevel(1); // Reset zoom when closing
					}}
				>
					<div className="relative max-w-6xl max-h-[90vh] p-2">
						<img
							src={`${process.env.NEXT_PUBLIC_API_URL}uploads/${selectedTrainingImage}`}
							alt="Training"
							className="max-w-full max-h-[85vh] object-contain transition-transform duration-200"
							style={{ transform: `scale(${trainingZoomLevel})` }}
							onClick={(e) => e.stopPropagation()}
						/>

						{/* Zoom Controls */}
						<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-50 p-2 rounded-lg">
							<button
								className="text-white hover:text-green-400 disabled:text-gray-500"
								onClick={(e) => {
									e.stopPropagation();
									handleTrainingZoom("out");
								}}
								disabled={trainingZoomLevel <= 0.5}
								title="Zoom Out"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M20 12H4"
									/>
								</svg>
							</button>

							<span className="text-white text-sm">
								{(trainingZoomLevel * 100).toFixed(0)}%
							</span>

							<button
								className="text-white hover:text-green-400 disabled:text-gray-500"
								onClick={(e) => {
									e.stopPropagation();
									handleTrainingZoom("in");
								}}
								disabled={trainingZoomLevel >= 3}
								title="Zoom In"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
							</button>
						</div>

						{/* Close button */}
						<button
							className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
							onClick={(e) => {
								e.stopPropagation();
								setIsTrainingImageModalOpen(false);
								setTrainingZoomLevel(1); // Reset zoom when closing
							}}
						>
							<X className="w-6 h-6" />
						</button>
					</div>
				</div>
			)}

			{/* Resume Image Modal */}
			{isResumeImageModalOpen && selectedResumeImage && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
					onClick={() => {
						setIsResumeImageModalOpen(false);
						setResumeZoomLevel(1); // Reset zoom when closing
					}}
				>
					<div className="relative max-w-6xl max-h-[90vh] p-2">
						<img
							src={`${process.env.NEXT_PUBLIC_API_URL}uploads/${selectedResumeImage}`}
							alt="Resume"
							className="max-w-full max-h-[85vh] object-contain transition-transform duration-200"
							style={{ transform: `scale(${resumeZoomLevel})` }}
							onClick={(e) => e.stopPropagation()}
						/>

						{/* Zoom Controls */}
						<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-50 p-2 rounded-lg">
							<button
								className="text-white hover:text-green-400 disabled:text-gray-500"
								onClick={(e) => {
									e.stopPropagation();
									handleResumeZoom("out");
								}}
								disabled={resumeZoomLevel <= 0.5}
								title="Zoom Out"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M20 12H4"
									/>
								</svg>
							</button>

							<span className="text-white text-sm">
								{(resumeZoomLevel * 100).toFixed(0)}%
							</span>

							<button
								className="text-white hover:text-green-400 disabled:text-gray-500"
								onClick={(e) => {
									e.stopPropagation();
									handleResumeZoom("in");
								}}
								disabled={resumeZoomLevel >= 3}
								title="Zoom In"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
							</button>
						</div>

						{/* Close button */}
						<button
							className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
							onClick={(e) => {
								e.stopPropagation();
								setIsResumeImageModalOpen(false);
								setResumeZoomLevel(1); // Reset zoom when closing
							}}
						>
							<X className="w-6 h-6" />
						</button>
					</div>
				</div>
			)}

			{/* Diploma Image Modal */}
			{isDiplomaImageModalOpen && selectedDiplomaImage && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
					onClick={() => {
						setIsDiplomaImageModalOpen(false);
						setDiplomaZoomLevel(1); // Reset zoom when closing
					}}
				>
					<div className="relative max-w-6xl max-h-[90vh] p-2">
						<img
							src={`${process.env.NEXT_PUBLIC_API_URL}uploads/diplomas/${selectedDiplomaImage}`}
							alt="Diploma"
							className="max-w-full max-h-[85vh] object-contain transition-transform duration-200"
							style={{ transform: `scale(${diplomaZoomLevel})` }}
							onClick={(e) => e.stopPropagation()}
						/>

						{/* Zoom Controls */}
						<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-50 p-2 rounded-lg">
							<button
								className="text-white hover:text-green-400 disabled:text-gray-500"
								onClick={(e) => {
									e.stopPropagation();
									handleDiplomaZoom("out");
								}}
								disabled={diplomaZoomLevel <= 0.5}
								title="Zoom Out"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M20 12H4"
									/>
								</svg>
							</button>

							<span className="text-white text-sm">
								{(diplomaZoomLevel * 100).toFixed(0)}%
							</span>

							<button
								className="text-white hover:text-green-400 disabled:text-gray-500"
								onClick={(e) => {
									e.stopPropagation();
									handleDiplomaZoom("in");
								}}
								disabled={diplomaZoomLevel >= 3}
								title="Zoom In"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 4v16m8-8H4"
									/>
								</svg>
							</button>
						</div>

						{/* Close button */}
						<button
							className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
							onClick={(e) => {
								e.stopPropagation();
								setIsDiplomaImageModalOpen(false);
								setDiplomaZoomLevel(1); // Reset zoom when closing
							}}
						>
							<X className="w-6 h-6" />
						</button>
					</div>
				</div>
			)}

			{showResumeModal && selectedResume && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white dark:bg-gray-800 rounded-lg w-3/4 h-3/4 p-6 relative">
						<button
							onClick={closeResumeModal}
							className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						>
							<X className="h-6 w-6" />
						</button>
						<div className="flex flex-col h-full">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-xl font-semibold dark:text-white">
									Resume Preview
								</h3>
								<a
									href={selectedResume.resumeUrl}
									download
									className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
								>
									<Download className="h-4 w-4" />
									Download
								</a>
							</div>
							<div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
								<div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
									<pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200">
										{selectedResume.resumeText}
									</pre>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ViewProfile;
