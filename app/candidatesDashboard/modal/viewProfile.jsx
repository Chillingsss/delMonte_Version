"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  retrieveDataFromCookie,
  retrieveDataFromSession,
  storeDataInCookie,
  storeDataInSession,
  removeDataFromCookie,
  removeDataFromSession,
  retrieveData,
  getDataFromSession,
  getDataFromCookie,
} from "@/app/utils/storageUtils";
import { FaArrowRight, FaBars } from "react-icons/fa";
import { HiMiniBarsArrowDown } from "react-icons/hi2";
import { FaRegCheckCircle } from "react-icons/fa";
import { BsArrowReturnRight } from "react-icons/bs";
import UpdateEducBac from "./updateEducBac";
import UpdateSkill from "./updateSkill";
import UpdateTraining from "./updateTraining";
import UpdateKnowledge from "./updateKnowledge";
import UpdateLicense from "./updateLicense";
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
import UpdateEmpHis from "./updateEmpHis";
import { Toaster, toast } from "react-hot-toast";
import ConfirmationModal from "../components/ConfirmationModal";
import VerificationEmailUpdate from "./verificationEmailUpdate";
import UpdateEmailPassword from "./updatePassword";
import UpdateResume from "./updateResume";
import UpdatePassword from "./updatePassword";
import UpdateEmail from "./updateEmail";
import DatePicker from "react-datepicker";
import { endOfDay } from "date-fns";

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

  const [selectedResume, setSelectedResume] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
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
      const userId = session.user.id;

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
      const userId = session.user.id;

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
      const cand_id = session.user.id;

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

      const userId = session.user.id;

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
    const userId = session.user.id;

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
    const userId = session.user.id;

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
    const userId = session.user.id;

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
    const userId = session.user.id;

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
    const userId = session.user.id;

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
    const userId = session.user.id;

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
          <div
            className={`p-6 space-y-6 ${
              isDarkMode ? "bg-[#1A202C] text-white" : "bg-[#F4F7FC]"
            }`}
          >
            <h3
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-800"
              } mb-6`}
            >
              Personal Information
            </h3>

            <div
              className="relative flex items-end justify-end"
              ref={settingsRef}
            >
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`p-2 rounded-full ${
                  isDarkMode
                    ? "bg-gray-700 text-white hover:bg-gray-500"
                    : "bg-gray-200 text-gray-600"
                } hover:bg-gray-300 transition-colors duration-200 flex items-center justify-end`}
              >
                <Settings className="w-6 h-6" />
              </button>

              {isSettingsOpen && (
                <div
                  className={`absolute right-0 top-full mt-2 w-60 ${
                    isDarkMode ? "bg-gray-800 text-white" : "bg-white"
                  } rounded-md shadow-2xl z-10 p-3`}
                >
                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleEditPersonalClick();
                        setIsSettingsOpen(false);
                      }}
                      className={`flex items-center px-4 py-2 text-sm ${
                        isDarkMode ? "text-white" : "text-gray-700"
                      } hover:bg-gray-400 hover:text-white w-full text-left`}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Personal Information
                    </button>
                    <button
                      onClick={() => {
                        handleEditPasswordClick();
                        setIsSettingsOpen(false);
                      }}
                      className={`flex items-center px-4 py-2 text-sm ${
                        isDarkMode ? "text-white" : "text-gray-700"
                      } hover:bg-gray-400 hover:text-white w-full text-left`}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </button>

                    <button
                      onClick={() => {
                        handleEditEmailClick();
                        setIsSettingsOpen(false);
                      }}
                      className={`flex items-center px-4 py-2 text-sm ${
                        isDarkMode ? "text-white" : "text-gray-700"
                      } hover:bg-gray-400 hover:text-white w-full text-left`}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Change Email
                    </button>
                  </div>
                </div>
              )}
            </div>

            {showPasswordModal && (
              <UpdatePassword
                showModal={showPasswordModal}
                setShowModal={setShowPasswordModal}
                fetchProfile={fetchProfile}
                candidateEmail={profile.candidateInformation.cand_email}
                candidatePassword={profile.candidateInformation.cand_password}
                candidateAlternateEmail={
                  profile.candidateInformation.cand_alternateEmail
                }
              />
            )}

            {showEmailModal && (
              <UpdateEmail
                showModal={showEmailModal}
                setShowModal={setShowEmailModal}
                fetchProfile={fetchProfile}
                candidateEmail={profile.candidateInformation.cand_email}
                candidatePassword={profile.candidateInformation.cand_password}
                candidateAlternateEmail={
                  profile.candidateInformation.cand_alternateEmail
                }
              />
            )}

            {isEditingPersonalInfo && (
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={handleSavePersonalInfo}
                  className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 ${
                    isDarkMode ? "bg-gray-700" : ""
                  }`}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditingPersonalInfo(false)}
                  className={`px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 ${
                    isDarkMode ? "bg-gray-800" : ""
                  }`}
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-3">
                <div
                  className={`w-32 h-32 rounded-full overflow-hidden border-4 ${
                    isDarkMode ? "border-gray-600" : "border-green-500"
                  } cursor-pointer hover:opacity-90 transition-opacity`}
                  onClick={() =>
                    profile.candidateInformation?.cand_profPic &&
                    setIsImageModalOpen(true)
                  }
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
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`text-4xl ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {profile.candidateInformation?.cand_firstname?.[0]?.toUpperCase() ||
                          "?"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Modal */}
              {isImageModalOpen &&
                profile.candidateInformation?.cand_profPic && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
                    onClick={() => {
                      setIsImageModalOpen(false);
                      setZoomLevel(1); // Reset zoom when closing
                    }}
                  >
                    <div className="relative max-w-6xl max-h-[90vh] p-2">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}uploads/${profile.candidateInformation.cand_profPic}`}
                        alt="Profile"
                        className="max-w-full max-h-[85vh] object-contain transition-transform duration-200"
                        style={{ transform: `scale(${zoomLevel})` }}
                        onClick={(e) => e.stopPropagation()}
                      />

                      {/* Zoom Controls */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-50 p-2 rounded-lg">
                        <button
                          className="text-white hover:text-green-400 disabled:text-gray-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleZoom("out");
                          }}
                          disabled={zoomLevel <= 0.5}
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
                          {(zoomLevel * 100).toFixed(0)}%
                        </span>

                        <button
                          className="text-white hover:text-green-400 disabled:text-gray-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleZoom("in");
                          }}
                          disabled={zoomLevel >= 3}
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
                          setIsImageModalOpen(false);
                          setZoomLevel(1); // Reset zoom when closing
                        }}
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}

              {isEditingPersonalInfo && (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex flex-col items-center gap-2 relative">
                    <button
                      onClick={() =>
                        document
                          .getElementById("upload-options")
                          .classList.toggle("hidden")
                      }
                      className={`cursor-pointer px-4 py-2 rounded-lg ${
                        isDarkMode
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-green-500 hover:bg-green-600"
                      } flex items-center gap-2 text-white`}
                    >
                      <Edit className="w-5 h-5" />
                      <span>Choose Upload Method</span>
                    </button>

                    {/* Dropdown menu - updated positioning */}
                    <div
                      id="upload-options"
                      className={`hidden absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-48 rounded-md shadow-lg ${
                        isDarkMode ? "bg-gray-800" : "bg-white"
                      } ring-1 ring-black ring-opacity-5 z-50`}
                    >
                      <div className="py-1">
                        {/* Camera option */}
                        <button
                          onClick={() => {
                            // Create video element
                            const video = document.createElement("video");
                            video.setAttribute("playsinline", "");
                            video.setAttribute("autoplay", "");
                            video.classList.add(
                              "camera-preview",
                              "rounded-lg",
                              "max-w-full",
                              "h-auto"
                            );

                            // Create canvas for capturing
                            const canvas = document.createElement("canvas");

                            // Create preview image element
                            const previewImg = document.createElement("img");
                            previewImg.classList.add(
                              "rounded-lg",
                              "max-w-full",
                              "h-auto",
                              "hidden"
                            );

                            // Create camera container
                            const cameraContainer =
                              document.createElement("div");
                            cameraContainer.classList.add(
                              "fixed",
                              "inset-0",
                              "z-50",
                              "flex",
                              "flex-col",
                              "items-center",
                              "justify-center",
                              "bg-black",
                              "bg-opacity-75",
                              "p-4"
                            );

                            // Create buttons container
                            const buttonsContainer =
                              document.createElement("div");
                            buttonsContainer.classList.add(
                              "flex",
                              "gap-4",
                              "mt-4"
                            );

                            // Add video and preview image
                            cameraContainer.appendChild(video);
                            cameraContainer.appendChild(previewImg);
                            cameraContainer.appendChild(buttonsContainer);

                            // Add capture button
                            const captureBtn = document.createElement("button");
                            captureBtn.textContent = "Take Photo";
                            captureBtn.classList.add(
                              "px-4",
                              "py-2",
                              "bg-green-500",
                              "text-white",
                              "rounded-lg",
                              "hover:bg-green-600"
                            );
                            buttonsContainer.appendChild(captureBtn);

                            // Add close button
                            const closeBtn = document.createElement("button");
                            closeBtn.textContent = "Cancel";
                            closeBtn.classList.add(
                              "px-4",
                              "py-2",
                              "bg-red-500",
                              "text-white",
                              "rounded-lg",
                              "hover:bg-red-600"
                            );
                            buttonsContainer.appendChild(closeBtn);

                            // Add retake button (initially hidden)
                            const retakeBtn = document.createElement("button");
                            retakeBtn.textContent = "Retake";
                            retakeBtn.classList.add(
                              "px-4",
                              "py-2",
                              "bg-yellow-500",
                              "text-white",
                              "rounded-lg",
                              "hover:bg-yellow-600",
                              "hidden"
                            );
                            buttonsContainer.appendChild(retakeBtn);

                            // Add use photo button (initially hidden)
                            const usePhotoBtn =
                              document.createElement("button");
                            usePhotoBtn.textContent = "Use Photo";
                            usePhotoBtn.classList.add(
                              "px-4",
                              "py-2",
                              "bg-green-500",
                              "text-white",
                              "rounded-lg",
                              "hover:bg-green-600",
                              "hidden"
                            );
                            buttonsContainer.appendChild(usePhotoBtn);

                            document.body.appendChild(cameraContainer);

                            // Get camera stream
                            const startCamera = () => {
                              const handleSuccess = (stream) => {
                                let objectUrl; // To store legacy object URL if needed

                                // Handle both modern and legacy video sources
                                if ("srcObject" in video) {
                                  video.srcObject = stream;
                                } else {
                                  // Fallback for older browsers
                                  objectUrl =
                                    window.URL.createObjectURL(stream);
                                  video.src = objectUrl;
                                }

                                // Ensure video plays and handle errors
                                video.play().catch((err) => {
                                  console.error("Error playing video:", err);
                                  handleError(err);
                                });

                                // Handle capture button
                                captureBtn.onclick = () => {
                                  canvas.width = video.videoWidth;
                                  canvas.height = video.videoHeight;
                                  canvas
                                    .getContext("2d")
                                    .drawImage(video, 0, 0);

                                  previewImg.src =
                                    canvas.toDataURL("image/jpeg");
                                  video.classList.add("hidden");
                                  previewImg.classList.remove("hidden");

                                  captureBtn.classList.add("hidden");
                                  retakeBtn.classList.remove("hidden");
                                  usePhotoBtn.classList.remove("hidden");
                                };

                                // Cleanup function for both modern and legacy streams
                                const cleanup = () => {
                                  stream
                                    .getTracks()
                                    .forEach((track) => track.stop());
                                  if (objectUrl) {
                                    window.URL.revokeObjectURL(objectUrl);
                                  }
                                };

                                // Handle retake button
                                retakeBtn.onclick = () => {
                                  video.classList.remove("hidden");
                                  previewImg.classList.add("hidden");
                                  captureBtn.classList.remove("hidden");
                                  retakeBtn.classList.add("hidden");
                                  usePhotoBtn.classList.add("hidden");
                                };

                                // Handle use photo button
                                usePhotoBtn.onclick = () => {
                                  canvas.toBlob((blob) => {
                                    const filename = `camera-capture-${Date.now()}-${Math.random()
                                      .toString(36)
                                      .substring(2, 8)}.jpg`;
                                    const file = new File([blob], filename, {
                                      type: "image/jpeg",
                                    });

                                    setEditData((prev) => ({
                                      ...prev,
                                      candidateInformation: {
                                        ...prev.candidateInformation,
                                        cand_profPic: file,
                                      },
                                    }));

                                    cleanup();
                                    cameraContainer.remove();
                                    document
                                      .getElementById("upload-options")
                                      .classList.add("hidden");
                                  }, "image/jpeg");
                                };

                                // Handle close button
                                closeBtn.onclick = () => {
                                  cleanup();
                                  cameraContainer.remove();
                                  document
                                    .getElementById("upload-options")
                                    .classList.add("hidden");
                                };
                              };

                              const handleError = (err) => {
                                console.error("Camera Error:", err);
                                alert(
                                  "Camera access failed. Please ensure permissions are granted and try again."
                                );
                                cameraContainer.remove();
                              };

                              // Feature detection with proper error handling
                              try {
                                if (navigator.mediaDevices?.getUserMedia) {
                                  navigator.mediaDevices
                                    .getUserMedia({ video: true })
                                    .then(handleSuccess)
                                    .catch(handleError);
                                } else {
                                  const legacyGetUserMedia =
                                    navigator.getUserMedia ||
                                    navigator.webkitGetUserMedia ||
                                    navigator.mozGetUserMedia ||
                                    navigator.msGetUserMedia;

                                  if (legacyGetUserMedia) {
                                    legacyGetUserMedia.call(
                                      navigator,
                                      { video: true },
                                      handleSuccess,
                                      handleError
                                    );
                                  } else {
                                    throw new Error("Camera API not supported");
                                  }
                                }
                              } catch (error) {
                                alert(
                                  "This browser doesn't support camera access. Please try modern browsers like Chrome, Firefox, or Edge."
                                );
                                console.error("Camera API Unavailable:", error);
                                cameraContainer.remove();
                              }
                            };

                            // Start camera with proper video element attributes
                            // Make sure your HTML video element includes these attributes:
                            // <video autoplay playsinline></video>
                            startCamera();
                          }}
                          className={`w-full text-left px-4 py-2 text-sm cursor-pointer ${
                            isDarkMode
                              ? "text-gray-200 hover:bg-gray-700"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Use Camera
                          </div>
                        </button>

                        {/* File upload option - keep this as is */}
                        <label
                          htmlFor="file-upload"
                          className={`block px-4 py-2 text-sm cursor-pointer ${
                            isDarkMode
                              ? "text-gray-200 hover:bg-gray-700"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Choose File
                          </div>
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/jpeg, image/png, image/heic, image/heif"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                console.log("File selected:", file);
                                setEditData((prev) => ({
                                  ...prev,
                                  candidateInformation: {
                                    ...prev.candidateInformation,
                                    cand_profPic: file,
                                    originalProfPic:
                                      profile.candidateInformation
                                        ?.cand_profPic, // Store original image name
                                  },
                                }));
                              }
                              document
                                .getElementById("upload-options")
                                .classList.add("hidden");
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* File selection display */}
                  <div className="text-sm text-gray-500">
                    {editData.candidateInformation?.cand_profPic instanceof File
                      ? `New file selected: ${editData.candidateInformation.cand_profPic.name}`
                      : editData.candidateInformation?.cand_profPic
                      ? `Current file: ${editData.candidateInformation.cand_profPic}`
                      : profile.candidateInformation?.cand_profPic
                      ? `Current file: ${profile.candidateInformation.cand_profPic}`
                      : "No file selected"}
                  </div>

                  {/* Preview of selected/captured image */}
                  {(editData.candidateInformation?.cand_profPic ||
                    profile.candidateInformation?.cand_profPic) && (
                    <div className="relative w-32 h-32 mb-4">
                      <img
                        src={
                          editData.candidateInformation?.cand_profPic instanceof
                          File
                            ? URL.createObjectURL(
                                editData.candidateInformation.cand_profPic
                              )
                            : editData.candidateInformation?.cand_profPic
                            ? `${process.env.NEXT_PUBLIC_API_URL}uploads/${editData.candidateInformation.cand_profPic}`
                            : `${process.env.NEXT_PUBLIC_API_URL}uploads/${profile.candidateInformation.cand_profPic}`
                        }
                        alt="Profile Preview"
                        className="w-full h-full object-cover rounded-full border-4 border-green-500"
                        onError={(e) => {
                          console.error("Image failed to load:", e);
                          e.target.src = "fallback-image-url.jpg";
                        }}
                      />
                      <button
                        onClick={() => {
                          setEditData((prev) => ({
                            ...prev,
                            candidateInformation: {
                              ...prev.candidateInformation,
                              cand_profPic: null,
                            },
                          }));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        title="Remove image"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
                  isDarkMode ? "bg-gray-700 text-white" : ""
                }`}
              >
                <label
                  className={`text-gray-600 block text-sm font-normal ${
                    isDarkMode ? "text-white " : ""
                  }`}
                >
                  Name:
                </label>
                {isEditingPersonalInfo ? (
                  <>
                    <input
                      type="text"
                      name="candidateInformation.cand_lastname"
                      value={editData.candidateInformation?.cand_lastname || ""}
                      onChange={handleChangeNotArray}
                      className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
                        isDarkMode ? "bg-gray-700 text-white" : ""
                      }`}
                    />
                    <input
                      type="text"
                      name="candidateInformation.cand_firstname"
                      value={
                        editData.candidateInformation?.cand_firstname || ""
                      }
                      onChange={handleChangeNotArray}
                      className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
                        isDarkMode ? "bg-gray-700 text-white" : ""
                      }`}
                    />
                    <input
                      type="text"
                      name="candidateInformation.cand_middlename"
                      value={
                        editData.candidateInformation?.cand_middlename || ""
                      }
                      onChange={handleChangeNotArray}
                      className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
                        isDarkMode ? "bg-gray-700 text-white" : ""
                      }`}
                    />
                  </>
                ) : (
                  <p
                    className={`text-gray-800 font-semibold mt-1 ${
                      isDarkMode ? "text-white" : ""
                    }`}
                  >
                    {profile.candidateInformation?.cand_lastname || "N/A"},{" "}
                    {profile.candidateInformation?.cand_firstname || "N/A"}{" "}
                    {profile.candidateInformation?.cand_middlename || "N/A"}
                  </p>
                )}
              </div>

              <div
                className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
                  isDarkMode ? "bg-gray-700 text-white" : ""
                }`}
              >
                <label
                  className={`block text-gray-600 text-sm font-normal ${
                    isDarkMode ? "text-white" : ""
                  }`}
                >
                  Alternate Email Address:
                </label>
                {isEditingPersonalInfo ? (
                  <input
                    type="email"
                    name="candidateInformation.cand_alternateEmail"
                    value={
                      editData.candidateInformation?.cand_alternateEmail || ""
                    }
                    onChange={handleChangeNotArray}
                    className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
                      isDarkMode ? "bg-gray-700 text-white" : ""
                    }`}
                  />
                ) : (
                  <p
                    className={`text-gray-800 font-semibold mt-1 ${
                      isDarkMode ? "text-white" : ""
                    }`}
                  >
                    {profile.candidateInformation?.cand_alternateEmail || "N/A"}
                  </p>
                )}
              </div>
            </div>

            {/* contact no */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
                  isDarkMode ? "bg-gray-700 text-white" : ""
                }`}
              >
                <label
                  className={`block text-gray-600 text-sm font-normal ${
                    isDarkMode ? "text-white" : ""
                  }`}
                >
                  Contact No:
                </label>
                {isEditingPersonalInfo ? (
                  <>
                    <input
                      type="number"
                      name="candidateInformation.cand_contactNo"
                      value={
                        editData.candidateInformation?.cand_contactNo || ""
                      }
                      onChange={handleChangeNotArray}
                      className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
                        isDarkMode ? "bg-gray-700 text-white" : ""
                      }`}
                    />
                  </>
                ) : (
                  <p
                    className={`text-gray-800 font-semibold mt-1 ${
                      isDarkMode ? "text-white" : ""
                    }`}
                  >
                    {profile.candidateInformation?.cand_contactNo || "N/A"}
                  </p>
                )}
              </div>
              <div
                className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
                  isDarkMode ? "bg-gray-700 text-white" : ""
                }`}
              >
                <label
                  className={`block text-gray-600 text-sm font-normal ${
                    isDarkMode ? "text-white" : ""
                  }`}
                >
                  Alternate Contact No:
                </label>
                {isEditingPersonalInfo ? (
                  <input
                    type="number"
                    name="candidateInformation.cand_alternatecontactNo"
                    value={
                      editData.candidateInformation?.cand_alternatecontactNo ||
                      ""
                    }
                    onChange={handleChangeNotArray}
                    className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
                      isDarkMode ? "bg-gray-700 text-white" : ""
                    }`}
                  />
                ) : (
                  <p
                    className={`text-gray-800 font-semibold mt-1 ${
                      isDarkMode ? "text-white" : ""
                    }`}
                  >
                    {profile.candidateInformation?.cand_alternatecontactNo ||
                      "N/A"}
                  </p>
                )}
              </div>
            </div>

            {/* email address */}

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div> */}

            {/* Address */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
                  isDarkMode ? "bg-gray-700 text-white" : ""
                }`}
              >
                <label
                  className={`block text-gray-600 text-sm font-normal ${
                    isDarkMode ? "text-white" : ""
                  }`}
                >
                  Present Address:
                </label>
                {isEditingPersonalInfo ? (
                  <>
                    <input
                      type="text"
                      name="candidateInformation.cand_presentAddress"
                      value={
                        editData.candidateInformation?.cand_presentAddress || ""
                      }
                      onChange={handleChangeNotArray}
                      className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
                        isDarkMode ? "bg-gray-700 text-white" : ""
                      }`}
                    />
                  </>
                ) : (
                  <p
                    className={`text-gray-800 font-semibold mt-1 ${
                      isDarkMode ? "text-white" : ""
                    }`}
                  >
                    {profile.candidateInformation?.cand_presentAddress || "N/A"}
                  </p>
                )}
              </div>
              <div
                className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
                  isDarkMode ? "bg-gray-700 text-white" : ""
                }`}
              >
                <label
                  className={`block text-gray-600 text-sm font-normal ${
                    isDarkMode ? "text-white" : ""
                  }`}
                >
                  Permanent Address:
                </label>
                {isEditingPersonalInfo ? (
                  <input
                    type="text"
                    name="candidateInformation.cand_permanentAddress"
                    value={
                      editData.candidateInformation?.cand_permanentAddress || ""
                    }
                    onChange={handleChangeNotArray}
                    className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
                      isDarkMode ? "bg-gray-700 text-white" : ""
                    }`}
                  />
                ) : (
                  <p
                    className={`text-gray-800 font-semibold mt-1 ${
                      isDarkMode ? "text-white" : ""
                    }`}
                  >
                    {profile.candidateInformation?.cand_permanentAddress ||
                      "N/A"}
                  </p>
                )}
              </div>
            </div>

            {/* date of birth */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
                  isDarkMode ? "bg-gray-700 text-white" : ""
                }`}
              >
                <label
                  className={`block text-gray-600 text-sm font-normal ${
                    isDarkMode ? "text-white" : ""
                  }`}
                >
                  Date of Birth:
                </label>
                {isEditingPersonalInfo ? (
                  <>
                    <input
                      type="date"
                      name="candidateInformation.cand_dateofBirth"
                      value={
                        editData.candidateInformation?.cand_dateofBirth || ""
                      }
                      onChange={handleChangeNotArray}
                      className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
                        isDarkMode ? "bg-gray-700 text-white" : ""
                      }`}
                    />
                  </>
                ) : (
                  <p
                    className={`text-gray-800 font-semibold mt-1 ${
                      isDarkMode ? "text-white" : ""
                    }`}
                  >
                    {profile.candidateInformation?.cand_dateofBirth || "N/A"}
                  </p>
                )}
              </div>
              <div
                className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
                  isDarkMode ? "bg-gray-700 text-white" : ""
                }`}
              >
                <label
                  className={`block text-gray-600 text-sm font-normal mb-2 ${
                    isDarkMode ? "text-white" : ""
                  }`}
                >
                  Gender:
                </label>
                {isEditingPersonalInfo ? (
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="candidateInformation.cand_sex"
                        value="Male"
                        checked={
                          editData.candidateInformation?.cand_sex === "Male"
                        }
                        onChange={handleChangeNotArray}
                        className="form-radio h-5 w-5 text-green-600"
                      />
                      <span
                        className={`ml-2 text-gray-700 ${
                          isDarkMode ? "text-white" : ""
                        }`}
                      >
                        Male
                      </span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="candidateInformation.cand_sex"
                        value="Female"
                        checked={
                          editData.candidateInformation?.cand_sex === "Female"
                        }
                        onChange={handleChangeNotArray}
                        className="form-radio h-5 w-5 text-green-600"
                      />
                      <span
                        className={`ml-2 text-gray-700 ${
                          isDarkMode ? "text-white" : ""
                        }`}
                      >
                        Female
                      </span>
                    </label>
                  </div>
                ) : (
                  <p
                    className={`text-gray-800 font-semibold mt-1 ${
                      isDarkMode ? "text-white" : ""
                    }`}
                  >
                    {profile.candidateInformation?.cand_sex || "N/A"}
                  </p>
                )}
              </div>
            </div>

            {/* sss no and tin no */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
                  isDarkMode ? "bg-gray-700 text-white" : ""
                }`}
              >
                <label
                  className={`block text-gray-600 text-sm font-normal ${
                    isDarkMode ? "text-white" : ""
                  }`}
                >
                  SSS NO:
                </label>
                {isEditingPersonalInfo ? (
                  <>
                    <input
                      type="number"
                      name="candidateInformation.cand_sssNo"
                      value={editData.candidateInformation?.cand_sssNo || ""}
                      onChange={handleChangeNotArray}
                      className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
                        isDarkMode ? "bg-gray-700 text-white" : ""
                      }`}
                    />
                  </>
                ) : (
                  <p
                    className={`text-gray-800 font-semibold mt-1 ${
                      isDarkMode ? "text-white" : ""
                    }`}
                  >
                    {profile.candidateInformation?.cand_sssNo || "N/A"}
                  </p>
                )}
              </div>
              <div
                className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
                  isDarkMode ? "bg-gray-700 text-white" : ""
                }`}
              >
                <label
                  className={`block text-gray-600 text-sm font-normal ${
                    isDarkMode ? "text-white" : ""
                  }`}
                >
                  TIN NO:
                </label>
                {isEditingPersonalInfo ? (
                  <input
                    type="gender"
                    name="candidateInformation.cand_tinNo"
                    value={editData.candidateInformation?.cand_tinNo || ""}
                    onChange={handleChangeNotArray}
                    className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
                      isDarkMode ? "bg-gray-700 text-white" : ""
                    }`}
                  />
                ) : (
                  <p
                    className={`text-gray-800 font-semibold mt-1 ${
                      isDarkMode ? "text-white" : ""
                    }`}
                  >
                    {profile.candidateInformation?.cand_tinNo || "N/A"}
                  </p>
                )}
              </div>
            </div>

            {/* philhealt ug pagibig no */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
                  isDarkMode ? "bg-gray-700 text-white" : ""
                }`}
              >
                <label
                  className={`block text-gray-600 text-sm font-normal ${
                    isDarkMode ? "text-white" : ""
                  }`}
                >
                  Philhealth NO:
                </label>
                {isEditingPersonalInfo ? (
                  <>
                    <input
                      type="number"
                      name="candidateInformation.cand_philhealthNo"
                      value={
                        editData.candidateInformation?.cand_philhealthNo || ""
                      }
                      onChange={handleChangeNotArray}
                      className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
                        isDarkMode ? "bg-gray-700 text-white" : ""
                      }`}
                    />
                  </>
                ) : (
                  <p
                    className={`text-gray-800 font-semibold mt-1 ${
                      isDarkMode ? "text-white" : ""
                    }`}
                  >
                    {profile.candidateInformation?.cand_philhealthNo || "N/A"}
                  </p>
                )}
              </div>
              <div
                className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
                  isDarkMode ? "bg-gray-700 text-white" : ""
                }`}
              >
                <label
                  className={`block text-gray-600 text-sm font-normal ${
                    isDarkMode ? "text-white" : ""
                  }`}
                >
                  Pagibig NO:
                </label>
                {isEditingPersonalInfo ? (
                  <input
                    type="gender"
                    name="candidateInformation.cand_pagibigNo"
                    value={editData.candidateInformation?.cand_pagibigNo || ""}
                    onChange={handleChangeNotArray}
                    className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
                      isDarkMode ? "bg-gray-700 text-white" : ""
                    }`}
                  />
                ) : (
                  <p
                    className={`text-gray-800 font-semibold mt-1 ${
                      isDarkMode ? "text-white" : ""
                    }`}
                  >
                    {profile.candidateInformation?.cand_pagibigNo || "N/A"}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case "Educational Background":
        return (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <h3
              className={`text-lg sm:text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-800"
              } sm:mb-6`}
            >
              Educational Background
            </h3>

            <div className="flex justify-end">
              <button
                onClick={handleAddEducation}
                className={`p-2 flex items-center ${
                  isDarkMode
                    ? "bg-green-700 text-white"
                    : "bg-green-500 text-white"
                } rounded-lg hover:bg-green-600 transform hover:scale-105 hover:-translate-y-1 hover:rotate-2 transition-all duration-300 ease-in-out`}
              >
                <Plus className="w-5 h-5 mr-2" />

                <span>Add New Educational Background</span>
              </button>
            </div>

            {/* Add Modal */}
            {showAddModal && (
              <UpdateEducBac
                showModalUpdateEduc={showAddModal}
                setShowModalUpdateEduc={setShowAddModal}
                selectedEducation={selectedEducation} // Pass the selectedEducation
                courses={courses}
                institutions={institutions}
                courseTypes={courseTypes}
                courseCategory={courseCategory}
                fetchProfile={fetchProfile}
                fetchCourses={fetchCourses}
                fetchInstitutions={fetchInstitutions}
                fetchCourseTypes={fetchCourseTypes}
                fetchCourseCategorys={fetchCourseCategorys}
              />
            )}

            {Array.isArray(profile.educationalBackground) &&
            profile.educationalBackground.length > 0 ? (
              profile.educationalBackground.map((education, index) => (
                <div
                  key={index}
                  className="relative grid grid-cols-1 gap-4 md:grid-cols-1 md:gap-6 pb-4 sm:pb-6"
                >
                  <div className="relative">
                    {/* Edit Icon Button */}
                    <div className="absolute top-0 right-0">
                      <button
                        onClick={() => handleEditClick(education, index)}
                        className={`p-2 rounded-full ${
                          isDarkMode
                            ? "bg-gray-700 text-white"
                            : "bg-gray-200 text-black"
                        } hover:bg-gray-800 hover:text-white`}
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteClick(education.educ_back_id)
                        }
                        className={`p-2 rounded-full ${
                          isDarkMode
                            ? "bg-gray-700 text-white"
                            : "bg-gray-200 text-black"
                        } hover:bg-gray-800 hover:text-white`}
                        title="Edit"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <ConfirmationModal
                        isOpen={isModalOpen}
                        onRequestClose={() => setIsModalOpen(false)}
                        onConfirm={handleEducationDeleteClick}
                        message="Are you sure you want to delete this educational background?"
                      />
                    </div>

                    {/* Course */}
                    <div
                      className={`bg-gray-200 p-3 sm:p-4 rounded-lg shadow-lg ${
                        isDarkMode ? "bg-gray-700 text-white" : ""
                      }`}
                    >
                      <label
                        className={`block text-gray-600 text-sm font-normal ${
                          isDarkMode ? "text-white" : ""
                        }`}
                      >
                        Course:
                      </label>
                      <p
                        className={`text-gray-800 font-semibold mb-5 mt-1 ${
                          isDarkMode ? "text-white" : ""
                        }`}
                      >
                        {education.courses_name || "N/A"}
                      </p>
                      <label
                        className={`block text-gray-600 text-sm font-normal mt-2 ${
                          isDarkMode ? "text-white" : ""
                        }`}
                      >
                        Course Category:
                      </label>
                      <p
                        className={`text-gray-800 font-semibold mb-5 mt-1 ${
                          isDarkMode ? "text-white" : ""
                        }`}
                      >
                        {education.course_categoryName || "N/A"}
                      </p>
                      <label
                        className={`block text-gray-600 text-sm font-normal mt-2 ${
                          isDarkMode ? "text-white" : ""
                        }`}
                      >
                        Institution:
                      </label>
                      <p
                        className={`text-gray-800 font-semibold mb-5 mt-1 ${
                          isDarkMode ? "text-white" : ""
                        }`}
                      >
                        {education.institution_name || "N/A"}
                      </p>
                      <label
                        className={`block text-gray-600 text-sm font-normal mt-2 ${
                          isDarkMode ? "text-white" : ""
                        }`}
                      >
                        Date Graduated:
                      </label>
                      <p
                        className={`text-gray-800 font-semibold mb-5 mt-1 ${
                          isDarkMode ? "text-white" : ""
                        }`}
                      >
                        {education.educ_dategraduate || "N/A"}
                      </p>
                    </div>

                    {/* Modal */}
                    {selectedIndex === index && showModalUpdateEduc && (
                      <div className="col-span-1 md:col-span-2 mt-4">
                        <div className="bg-transparent rounded-lg p-6 w-full">
                          <UpdateEducBac
                            showModalUpdateEduc={showModalUpdateEduc}
                            setShowModalUpdateEduc={setShowModalUpdateEduc}
                            selectedEducation={selectedEducation}
                            courses={courses}
                            courseTypes={courseTypes}
                            courseCategory={courseCategory}
                            institutions={institutions}
                            fetchProfile={fetchProfile}
                            fetchCourses={fetchCourses}
                            fetchInstitutions={fetchInstitutions}
                            fetchCourseTypes={fetchCourseTypes}
                            fetchCourseCategorys={fetchCourseCategorys}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm sm:text-base text-gray-600">
                No educational background available.
              </p>
            )}
          </div>
        );

      case "Employment History":
        return (
          <div className="p-6 space-y-6">
            <h3
              className={`text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-800"
              } mb-6`}
            >
              Employment History
            </h3>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowAddModal(true);
                }}
                className={`p-2 flex items-center ${
                  isDarkMode
                    ? "bg-green-700 text-white"
                    : "bg-green-500 text-white"
                } rounded-lg hover:bg-green-600 transform hover:scale-105 hover:-translate-y-1 hover:rotate-2 transition-all duration-300 ease-in-out mb-5`}
              >
                <Plus className="w-5 h-5 mr-2" />
                <span>Add New Employment History</span>
              </button>
            </div>

            {showAddModal && (
              <div className="col-span-1 md:col-span-1 mt-4">
                <div className="bg-transparent rounded-lg p-6 w-full">
                  <UpdateEmpHis
                    showModal={showAddModal}
                    setShowModal={setShowAddModal}
                    employment={""}
                    fetchProfile={fetchProfile}
                    profile={profile}
                  />
                </div>
              </div>
            )}

            {Array.isArray(profile.employmentHistory) &&
            profile.employmentHistory.length > 0 ? (
              profile.employmentHistory.map((employment, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-1 gap-4 pb-4"
                >
                  <div className="relative">
                    <div className="absolute top-0 right-0">
                      {isEditingEmploymentInfo ? (
                        <>
                          <div className="flex space-x-2">
                            <button
                              onClick={handleSaveEmploymentInfo}
                              className={`p-2 rounded-lg ${
                                isDarkMode
                                  ? "bg-green-700 text-white"
                                  : "bg-green-500 text-white"
                              } flex items-center space-x-2`}
                            >
                              <Check className="w-4 h-4" />
                              <span>Save</span>{" "}
                            </button>
                            <button
                              onClick={() => setIsEditingEmploymentInfo(false)}
                              className={`p-2 rounded-lg ${
                                isDarkMode
                                  ? "bg-red-700 text-white"
                                  : "bg-red-500 text-white"
                              } flex items-center space-x-2`}
                            >
                              <X className="w-4 h-4" />
                              <span>Cancel</span>{" "}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleEditEmploymentClick}
                            className={`p-2 rounded-full ${
                              isDarkMode
                                ? "bg-gray-700 text-white"
                                : "bg-gray-200 text-black"
                            } hover:bg-gray-800 hover:text-white`}
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteClick(employment.empH_id)
                            }
                            className={`p-2 rounded-full ${
                              isDarkMode
                                ? "bg-gray-700 text-white"
                                : "bg-gray-200 text-black"
                            } hover:bg-gray-800 hover:text-white`}
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>

                          <ConfirmationModal
                            isOpen={isModalOpen}
                            onRequestClose={() => setIsModalOpen(false)}
                            onConfirm={handleConfirmEmployementHistoryDelete}
                            message="Are you sure you want to delete this employment record?"
                          />
                        </>
                      )}
                    </div>

                    <div
                      className={`bg-gray-200 p-4 rounded-lg  shadow-lg ${
                        isDarkMode ? "bg-gray-700 text-white" : ""
                      }`}
                    >
                      <label
                        className={`block text-sm font-normal ${
                          isDarkMode ? "text-white" : "text-gray-600"
                        }`}
                      >
                        Position Name:
                      </label>
                      {isEditingEmploymentInfo ? (
                        <input
                          type="text"
                          name={`employmentHistory.${index}.empH_positionName`}
                          value={
                            editData.employmentHistory?.[index]
                              ?.empH_positionName ||
                            employment.empH_positionName ||
                            ""
                          }
                          onChange={handleChange}
                          className={`text-gray-800 font-semibold mt-1 w-full pb-2 bg-transparent ${
                            isDarkMode ? "text-white" : ""
                          }`}
                        />
                      ) : (
                        <p
                          className={`text-gray-800 font-semibold mt-1 mb-5 ${
                            isDarkMode ? "text-white" : ""
                          }`}
                        >
                          {employment.empH_positionName || "N/A"}
                        </p>
                      )}

                      <label
                        className={`block text-sm font-normal ${
                          isDarkMode ? "text-white" : "text-gray-600"
                        }`}
                      >
                        Company Name:
                      </label>
                      {isEditingEmploymentInfo ? (
                        <input
                          type="text"
                          name={`employmentHistory.${index}.empH_companyName`}
                          value={
                            editData.employmentHistory?.[index]
                              ?.empH_companyName ||
                            employment.empH_companyName ||
                            "N/A"
                          }
                          onChange={handleChange}
                          className={`text-gray-800 font-semibold mt-1 w-full pb-2 bg-transparent ${
                            isDarkMode ? "text-white" : ""
                          }`}
                        />
                      ) : (
                        <p
                          className={`text-gray-800 font-semibold mt-1 mb-5 ${
                            isDarkMode ? "text-white" : ""
                          }`}
                        >
                          {employment.empH_companyName || "N/A"}
                        </p>
                      )}

                      <label
                        className={`block text-sm font-normal ${
                          isDarkMode ? "text-white" : "text-gray-600"
                        }`}
                      >
                        Start Date:
                      </label>
                      {isEditingEmploymentInfo ? (
                        <DatePicker
                          selected={
                            editData.employmentHistory?.[index]?.empH_startdate
                              ? new Date(
                                  editData.employmentHistory[
                                    index
                                  ].empH_startdate
                                )
                              : null
                          }
                          onChange={(date) =>
                            handleChange({
                              target: {
                                name: `employmentHistory.${index}.empH_startdate`,
                                value: date,
                              },
                            })
                          }
                          dateFormat="yyyy-MM-dd"
                          className={`w-full mt-2 border-b-2 pb-2 bg-transparent px-2 py-2 ${
                            isDarkMode
                              ? "border-gray-400 text-white"
                              : "border-black"
                          } text-black`}
                          placeholderText="Select start date"
                          maxDate={new Date()}
                          showYearDropdown
                          showMonthDropdown
                          scrollableYearDropdown
                          scrollableMonthYearDropdown
                          yearDropdownItemNumber={100} // Added for consistency
                          isClearable
                          customInput={
                            <input
                              className={`w-full mt-2 border-b-2 pb-2 bg-transparent ${
                                isDarkMode
                                  ? "border-gray-400 text-white"
                                  : "border-black"
                              } text-black`}
                            />
                          }
                        />
                      ) : (
                        <p
                          className={`text-gray-800 font-semibold mt-1 mb-5 ${
                            isDarkMode ? "text-white" : ""
                          }`}
                        >
                          {employment.empH_startdate
                            ? new Date(
                                employment.empH_startdate
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      )}

                      <label
                        className={`block text-sm font-normal ${
                          isDarkMode ? "text-white" : "text-gray-600"
                        }`}
                      >
                        End Date:
                      </label>
                      {isEditingEmploymentInfo ? (
                        <DatePicker
                          selected={
                            editData.employmentHistory?.[index]?.empH_enddate
                              ? new Date(
                                  editData.employmentHistory[index].empH_enddate
                                )
                              : null
                          }
                          onChange={(date) =>
                            handleChange({
                              target: {
                                name: `employmentHistory.${index}.empH_enddate`,
                                value: date,
                              },
                            })
                          }
                          dateFormat="yyyy-MM-dd"
                          className={`text-gray-800 font-semibold mt-1 w-full pb-2 bg-transparent ${
                            isDarkMode ? "text-white" : ""
                          }`}
                          placeholderText="Select end date"
                          maxDate={new Date()}
                          showYearDropdown
                          showMonthDropdown
                          scrollableYearDropdown
                          scrollableMonthYearDropdown
                          isClearable
                          customInput={
                            <input
                              className={`w-full mt-2 border-b-2 pb-2 bg-transparent ${
                                isDarkMode
                                  ? "border-gray-400 text-white"
                                  : "border-black"
                              } text-black`}
                            />
                          }
                        />
                      ) : (
                        <p
                          className={`text-gray-800 font-semibold mt-1 mb-5 ${
                            isDarkMode ? "text-white" : ""
                          }`}
                        >
                          {employment.empH_enddate
                            ? new Date(
                                employment.empH_enddate
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No employment history available.</p>
            )}
          </div>
        );

      case "Skills":
        return (
          <div className="p-4 space-y-4">
            <h3
              className="text-xl font-semibold mb-4"
              style={{ color: isDarkMode ? "white" : "" }}
            >
              Skills
            </h3>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSelectedSkill({});
                  setShowAddModal(true);
                }}
                className={`mb-4 p-2 flex items-center bg-green-500 text-white rounded-lg hover:bg-green-600 transform hover:scale-105 hover:-translate-y-1 hover:rotate-2 transition-all duration-300 ease-in-out ${
                  isDarkMode ? "bg-green-700 hover:bg-green-800" : ""
                }`}
              >
                <Plus
                  className="w-5 h-5 mr-2"
                  style={{ color: isDarkMode ? "white" : "" }}
                />
                <span style={{ color: isDarkMode ? "white" : "" }}>
                  Add New Skill
                </span>
              </button>
            </div>

            {showAddModal && (
              <div className="col-span-1 md:col-span-1 mt-4">
                <div className="bg-transparent rounded-lg p-6 w-full">
                  <UpdateSkill
                    showModal={showAddModal}
                    setShowModal={setShowAddModal}
                    skill={selectedSkill}
                    // setUpdateTrigger={setUpdateTrigger}
                    skills={skills}
                    fetchProfile={fetchProfile}
                    profile={profile}
                    fetchSkills={fetchSkills}
                  />
                </div>
              </div>
            )}

            {Array.isArray(profile.skills) && profile.skills.length > 0 ? (
              profile.skills.map((skill, index) => (
                <div
                  key={index}
                  className="relative grid grid-cols-1 md:grid-cols-1 gap-4 pb-4"
                >
                  <div className="absolute top-0 right-0">
                    <button
                      onClick={() => handleEditSkillClick(skill, index)}
                      className={`p-2 rounded-full ${
                        isDarkMode
                          ? "bg-gray-700 text-white hover:bg-gray-800"
                          : "bg-gray-200 text-black hover:bg-gray-600"
                      }`}
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleDeleteClick(skill.skills_id)}
                      className={`p-2 rounded-full ${
                        isDarkMode
                          ? "bg-gray-700 text-white hover:bg-gray-800"
                          : "bg-gray-200 text-black hover:bg-gray-600"
                      }`}
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <ConfirmationModal
                      isOpen={isModalOpen}
                      onRequestClose={() => setIsModalOpen(false)}
                      onConfirm={handleConfirmSkillDelete}
                      message="Are you sure you want to delete this skill record?"
                    />
                  </div>

                  <div
                    className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
                      isDarkMode ? "bg-gray-700 text-white" : ""
                    }`}
                  >
                    <label
                      className={`block text-sm font-normal ${
                        isDarkMode ? "text-white" : "text-gray-600"
                      }`}
                    >
                      Skills:
                    </label>
                    <p
                      className={`text-gray-800 font-semibold mt-1 ${
                        isDarkMode ? "text-white" : ""
                      }`}
                    >
                      {skill.perS_name || "N/A"}
                    </p>
                  </div>

                  {/* Modal */}
                  {selectedIndex === index && showSkillModal && (
                    <div className="col-span-1 md:col-span-1 mt-4">
                      <div className="bg-transparent rounded-lg p-6 w-full">
                        <UpdateSkill
                          showModal={showSkillModal}
                          setShowModal={setShowSkillModal}
                          selectedSkill={selectedSkill}
                          setUpdateTrigger={setUpdateTrigger}
                          skills={skills}
                          fetchProfile={fetchProfile}
                          profile={profile}
                          fetchSkills={fetchSkills}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No skills available.</p>
            )}
          </div>
        );

      case "Training":
        return (
          <div className="p-4 space-y-4">
            <h3
              className={`text-xl font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-black"
              }`}
            >
              Training
            </h3>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSelectedTraining({}); // Empty object for adding new skill
                  setShowAddModal(true);
                }}
                className={`mb-4 p-2 flex items-center rounded-lg hover:scale-105 hover:-translate-y-1 hover:rotate-2 transition-all duration-300 ease-in-out ${
                  isDarkMode
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                <Plus className="w-5 h-5 mr-2" />
                <span>Add New Training</span>
              </button>
            </div>

            {showAddModal && (
              <div className="col-span-1 md:col-span-1 mt-4">
                <div className="bg-transparent rounded-lg p-6 w-full">
                  <UpdateTraining
                    showModal={showAddModal}
                    setShowModal={setShowAddModal}
                    train={selectedTraining}
                    trainings={trainings}
                    fetchProfile={fetchProfile}
                    profile={profile}
                    fetchTraining={fetchTraining}
                  />
                </div>
              </div>
            )}

            {Array.isArray(profile.training) && profile.training.length > 0 ? (
              profile.training.map((train, index) => (
                <div
                  key={index}
                  className="relative grid grid-cols-1 md:grid-cols-1 gap-4 pb-4"
                >
                  <div className="relative">
                    {/* Edit Icon Button */}
                    <div className="absolute top-0 right-0">
                      <button
                        onClick={() => handleEditTrainingClick(train, index)}
                        className={`p-2 rounded-full ${
                          isDarkMode
                            ? "bg-gray-700 text-white hover:bg-gray-800"
                            : "bg-gray-200 text-black hover:bg-gray-600"
                        }`}
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(train.training_id)}
                        className={`p-2 rounded-full ${
                          isDarkMode
                            ? "bg-gray-700 text-white hover:bg-gray-800"
                            : "bg-gray-200 text-black hover:bg-gray-600"
                        }`}
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <ConfirmationModal
                        isOpen={isModalOpen}
                        onRequestClose={() => setIsModalOpen(false)}
                        onConfirm={handleConfirmTrainingDelete}
                        message="Are you sure you want to delete this Training record?"
                      />
                    </div>

                    <div
                      className={`bg-gray-200 p-4 rounded-lg  shadow-lg ${
                        isDarkMode ? "bg-gray-700 text-white" : ""
                      }`}
                    >
                      <label
                        className={`block text-sm font-normal ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Training:
                      </label>
                      <p
                        className={`font-semibold mt-1 ${
                          isDarkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        {train.perT_name || "N/A"}
                      </p>

                      {train.training_image && (
                        <div className="mt-4">
                          <label
                            className={`block text-sm font-normal ${
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            Training Image:
                          </label>
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}uploads/${train.training_image}`}
                            alt={train.perT_name}
                            className="mt-2 max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              setSelectedTrainingImage(train.training_image);
                              setIsTrainingImageModalOpen(true);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedIndex === index && showTrainingModal && (
                    <div className="col-span-1 md:col-span-1 mt-4">
                      <div className="bg-transparent rounded-lg p-6 w-full">
                        <UpdateTraining
                          showModal={showTrainingModal}
                          setShowModal={setShowTrainingModal}
                          train={selectedTraining}
                          trainings={trainings}
                          fetchProfile={fetchProfile}
                          fetchTraining={fetchTraining}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No Training available.</p>
            )}
          </div>
        );

      case "Knowledge":
        return (
          <div className="p-4 space-y-4">
            <h3
              className={`text-xl font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-black"
              }`}
            >
              Knowledge
            </h3>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSelectedKnowledge({}); // Empty object for adding new skill
                  setShowAddModal(true);
                }}
                className={
                  isDarkMode
                    ? "p-2 flex items-center bg-green-500 text-white rounded-lg hover:bg-green-600 transform hover:scale-105 hover:-translate-y-1 hover:rotate-2 transition-all duration-300 ease-in-out"
                    : "p-2 flex items-center bg-green-500 text-white rounded-lg hover:bg-green-600 transform hover:scale-105 hover:-translate-y-1 hover:rotate-2 transition-all duration-300 ease-in-out"
                }
              >
                <Plus className="w-5 h-5 mr-2" />
                <span>Add New Knowledge</span>
              </button>
            </div>

            {showAddModal && (
              <div className="col-span-1 md:col-span-1 mt-4">
                <div className="bg-transparent rounded-lg p-6 w-full">
                  <UpdateKnowledge
                    showModal={showAddModal}
                    setShowModal={setShowAddModal}
                    know={selectedKnowlegde}
                    knowledges={knowledges}
                    fetchProfile={fetchProfile}
                    profile={profile}
                    handleConfirmKnowledgeDelete={handleConfirmKnowledgeDelete}
                    fetchKnowledge={fetchKnowledge}
                  />
                </div>
              </div>
            )}

            {Array.isArray(profile.knowledge) &&
            profile.knowledge.length > 0 ? (
              profile.knowledge.map((know, index) => (
                <div
                  key={index}
                  className={`relative grid grid-cols-1 md:grid-cols-1 gap-4 pb-4 -b ${
                    isDarkMode ? "-gray-700" : "-gray-300"
                  }`}
                >
                  <div className="relative">
                    {/* Edit Icon Button */}
                    <div className="absolute top-0 right-0">
                      <button
                        onClick={() => handleEditKnowledgeClick(know, index)}
                        className={`p-2 rounded-full ${
                          isDarkMode
                            ? "bg-gray-700 text-white hover:bg-gray-800"
                            : "bg-gray-200 text-black hover:bg-gray-600"
                        }`}
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" /> {/* Lucide Edit Icon */}
                      </button>

                      <button
                        onClick={() => handleDeleteClick(know.canknow_id)}
                        className={`p-2 rounded-full ${
                          isDarkMode
                            ? "bg-gray-700 text-white hover:bg-gray-800"
                            : "bg-gray-200 text-black hover:bg-gray-600"
                        }`}
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <ConfirmationModal
                        isOpen={isModalOpen}
                        onRequestClose={() => setIsModalOpen(false)}
                        onConfirm={handleConfirmKnowledgeDelete}
                        message="Are you sure you want to delete this Knowledge record?"
                      />
                    </div>

                    <div
                      className={`bg-gray-200 p-4 rounded-lg  shadow-lg ${
                        isDarkMode
                          ? "bg-gray-700 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      <label
                        className={`block text-gray-600 text-sm font-normal ${
                          isDarkMode ? "text-white" : "text-gray-600"
                        }`}
                      >
                        Knowledge:
                      </label>
                      <p
                        className={`text-gray-800 font-semibold mt-1 ${
                          isDarkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {know.knowledge_name || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Modal */}
                  {selectedIndex === index && showKnowledgeModal && (
                    <div className="col-span-1 md:col-span-1 mt-4">
                      <div
                        className={`bg-transparent rounded-lg p-6 w-full ${
                          isDarkMode ? "bg-gray-800" : ""
                        }`}
                      >
                        <UpdateKnowledge
                          showModal={showKnowledgeModal}
                          setShowModal={setShowKnowledgeModal}
                          know={selectedKnowlegde}
                          knowledges={knowledges}
                          fetchProfile={fetchProfile}
                          handleConfirmKnowledgeDelete
                          fetchKnowledge={fetchKnowledge}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No Knowledge available.</p>
            )}
          </div>
        );

      case "License":
        return (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <h3
              className={`text-lg sm:text-xl font-semibold ${
                isDarkMode ? "text-white" : "text-gray-800"
              } sm:mb-6`}
            >
              License
            </h3>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSelectedLicense({});
                  setShowAddModal(true);
                }}
                className={`p-2 flex items-center rounded-lg hover:scale-105 hover:-translate-y-1 hover:rotate-2 transition-all duration-300 ease-in-out ${
                  isDarkMode
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-green-500 text-black hover:bg-green-600"
                }`}
              >
                <Plus className="w-5 h-5 mr-2" />
                <span>Add New License</span>
              </button>
            </div>

            {showAddModal && (
              <div className="col-span-1 md:col-span-1 mt-4">
                <div className="bg-transparent rounded-lg p-6 w-full">
                  <UpdateLicense
                    showLicenseModal={showAddModal}
                    setShowLicenseModal={setShowAddModal}
                    selectedLicense={selectedLicense}
                    licenses={licenses}
                    licenseType={licenseType}
                    fetchProfile={fetchProfile}
                    profile={profile}
                    fetchLicense={fetchLicense}
                  />
                </div>
              </div>
            )}

            {Array.isArray(profile.license) && profile.license.length > 0 ? (
              profile.license.map((lic, index) => (
                <div
                  key={index}
                  className="relative grid grid-cols-1 gap-4 md:grid-cols-1 md:gap-6 pb-4 sm:pb-6 -b -gray-300"
                >
                  <div className="relative">
                    <div className="absolute top-0 right-0">
                      <button
                        onClick={() => handleEditLicenseClick(lic, index)}
                        className={`p-2 rounded-full ${
                          isDarkMode
                            ? "bg-gray-700 text-white hover:bg-gray-800"
                            : "bg-gray-200 text-black hover:bg-gray-600"
                        }`}
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(lic.license_id)}
                        className={`p-2 rounded-full ${
                          isDarkMode
                            ? "bg-gray-700 text-white hover:bg-gray-800"
                            : "bg-gray-200 text-black hover:bg-gray-600"
                        }`}
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <ConfirmationModal
                        isOpen={isModalOpen}
                        onRequestClose={() => setIsModalOpen(false)}
                        onConfirm={handleConfirmLicenseDelete}
                        message="Are you sure you want to delete this License record?"
                      />
                    </div>

                    {/* License Name */}
                    <div
                      className={`bg-gray-200 p-3 sm:p-4 rounded-lg  shadow-lg ${
                        isDarkMode
                          ? "bg-gray-700 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      <label
                        className={`block text-sm font-normal ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        License name:
                      </label>
                      <p
                        className={`font-semibold mt-1 mb-5 ${
                          isDarkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        {lic.license_master_name || "N/A"}
                      </p>

                      <label
                        className={`block text-sm font-normal ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        License Type:
                      </label>
                      <p
                        className={`font-semibold mt-1 mb-5 ${
                          isDarkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        {lic.license_type_name || "N/A"}
                      </p>

                      <label
                        className={`block text-sm font-normal ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        License number:
                      </label>
                      <p
                        className={`font-semibold mt-1 mb-3 ${
                          isDarkMode ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        {lic.license_number || "N/A"}
                      </p>
                    </div>

                    {/* Modal */}
                    {selectedIndex === index && showLicenseModal && (
                      <div className="col-span-1 md:col-span-2 mt-4">
                        <div className="bg-transparent rounded-lg p-6 w-full">
                          <UpdateLicense
                            showLicenseModal={showLicenseModal}
                            setShowLicenseModal={setShowLicenseModal}
                            selectedLicense={selectedLicense}
                            licenses={licenses}
                            licenseType={licenseType}
                            fetchProfile={fetchProfile}
                            fetchLicense={fetchLicense}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm sm:text-base text-gray-600">
                No licenses available.
              </p>
            )}
          </div>
        );

      case "Resume":
        return (
          <div className="p-4 space-y-4">
            <h3 className="text-xl font-semibold mb-4">Resume</h3>

            {/* Show Add New Resume button only if there are no resumes */}
            {Array.isArray(profile.resume) && profile.resume.length === 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowAddModal(true);
                    setSelectedResume({});
                  }}
                  className={`p-2 flex items-center rounded-lg hover:scale-105 hover:-translate-y-1 hover:rotate-2 transition-all duration-300 ease-in-out ${
                    isDarkMode
                      ? "bg-green-700 text-white hover:bg-green-600"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  <span>Add New Resume</span>
                </button>
              </div>
            )}

            {showAddModal && (
              <div className="col-span-1 md:col-span-1 mt-4">
                <div className="bg-transparent rounded-lg p-6 w-full">
                  <UpdateResume
                    showModal={showAddModal}
                    setShowModal={setShowAddModal}
                    res={selectedResume}
                    fetchProfile={fetchProfile}
                    profile={profile}
                  />
                </div>
              </div>
            )}

            {Array.isArray(profile.resume) && profile.resume.length > 0 ? (
              profile.resume.map((res, index) => (
                <div
                  key={index}
                  className="relative grid grid-cols-1 md:grid-cols-1 gap-4 pb-4 -b -gray-300"
                >
                  <div className="relative">
                    <div className="absolute top-0 right-0">
                      <button
                        onClick={() => handleEditResumeClick(res, index)}
                        className={`p-2 rounded-full ${
                          isDarkMode
                            ? "bg-gray-700 text-white hover:bg-gray-800"
                            : "bg-gray-200 text-black hover:bg-gray-600"
                        }`}
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(res.canres_id)}
                        className={`p-2 rounded-full ${
                          isDarkMode
                            ? "bg-gray-700 text-white hover:bg-gray-800"
                            : "bg-gray-200 text-black hover:bg-gray-600"
                        }`}
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <ConfirmationModal
                        isOpen={isModalOpen}
                        onRequestClose={() => setIsModalOpen(false)}
                        onConfirm={handleConfirmResumeDelete}
                        message="Are you sure you want to delete this Resume record?"
                      />
                    </div>

                    <div
                      className={`bg-gray-200 p-4 rounded-lg  shadow-lg ${
                        isDarkMode
                          ? "bg-gray-700 text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      {res.canres_image && (
                        <div className="mt-4">
                          <label
                            className={`block text-sm font-normal ${
                              isDarkMode ? "text-white" : "text-gray-600"
                            }`}
                          >
                            Resume Image:
                          </label>
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}uploads/${res.canres_image}`}
                            alt={res.canres_name}
                            className="mt-2 max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              setSelectedResumeImage(res.canres_image);
                              setIsResumeImageModalOpen(true);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedIndex === index && showResumeModal && (
                    <div className="col-span-1 md:col-span-1 mt-4">
                      <div className="bg-transparent rounded-lg p-6 w-full">
                        <UpdateResume
                          showModal={showResumeModal}
                          setShowModal={setShowResumeModal}
                          res={selectedResume}
                          fetchProfile={fetchProfile}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No Resume available.</p>
            )}
          </div>
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById("upload-options");
      if (
        dropdown &&
        !dropdown.contains(event.target) &&
        !event.target.closest("button")
      ) {
        dropdown.classList.add("hidden");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Cleanup function for object URLs
    return () => {
      if (editData.candidateInformation?.cand_profPic instanceof File) {
        URL.revokeObjectURL(
          URL.createObjectURL(editData.candidateInformation.cand_profPic)
        );
      }
    };
  }, [editData.candidateInformation?.cand_profPic]);

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
                isDarkMode ? "bg-gray-700" : "bg-[#0A6338]"
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
    </div>
  );
};

export default ViewProfile;
