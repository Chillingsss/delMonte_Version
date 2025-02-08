"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  getDataFromSession,
  getDataFromCookie,
} from "@/app/utils/storageUtils";
import Select, { components } from "react-select";
import { Toaster, toast } from "react-hot-toast";

// Custom Option Component
const CustomOption = (props) => {
  return (
    <components.Option
      {...props}
      className={`custom-option ${props.isSelected ? "is-selected" : ""}`}
      style={{ cursor: "pointer" }}
    >
      {props.children}
    </components.Option>
  );
};

const UpdateSkill = ({
  showModal,
  setShowModal,
  selectedSkill,
  skills,
  fetchProfile,
  fetchSkills,
}) => {
  const { data: session } = useSession();
  const [data, setData] = useState({
    skills_id: "",
    skillId: "",
    customSkill: "",
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

  console.log("selectedSkill:", selectedSkill);

  const [error, setError] = useState("");
  const [isNewSkill, setIsNewSkill] = useState(true);

  useEffect(() => {
    if (showModal) {
      if (selectedSkill && Object.keys(selectedSkill).length > 0) {
        // If editing an existing skill
        setData({
          skills_id: selectedSkill.skills_id || "",
          skillId: selectedSkill.skills_perSId || "",
          customSkill: "", // Reset customSkill on selection change
        });
        setIsNewSkill(false); // Set to false when editing
      } else {
        // If adding a new skill
        setData({
          skills_id: "",
          skillId: "",
          customSkill: "",
        });
        setIsNewSkill(true); // Set to true when adding
      }
    }
  }, [showModal, selectedSkill]); // Add showModal and selectedSkill to dependencies

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });

    // Validate custom skill input
    if (name === "customSkill") {
      if (
        skills.some(
          (skill) => skill.perS_name.toLowerCase() === value.toLowerCase()
        )
      ) {
        setError("This skill already exists."); // Set error message
      } else {
        setError(""); // Clear error if no issue
      }
    }
  };

  const handleSelectChange = (selectedOption, fieldName) => {
    setData((prevData) => ({
      ...prevData,
      [fieldName]: selectedOption ? selectedOption.value : "",
      customSkill:
        selectedOption && selectedOption.value === "custom"
          ? ""
          : prevData.customSkill,
    }));
  };

  const handleSave = async () => {
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
        candidateId: userId,
        skills: [
          {
            skills_id: data.skills_id,
            skillId: data.skillId || (data.customSkill ? "custom" : ""),
            customSkill: data.customSkill,
          },
        ],
      };

      const formData = new FormData();
      formData.append("operation", "updateCandidateSkills");
      formData.append("json", JSON.stringify(updatedData));

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data === 1) {
        toast.success("Skill updated successfully!");
        if (fetchProfile) {
          fetchProfile();
        }
        if (fetchSkills) {
          fetchSkills();
        }
      } else {
        toast.error("Failed to update skill.");
      }
    } catch (error) {
      toast.error("An error occurred while updating the skill.");
    } finally {
      setShowModal(false);
    }
  };

  const getSelectedOption = (options, value) =>
    options.find((option) => option.value === value) || null;

  const skillOptions = useMemo(() => {
    return [
      { value: "custom", label: "Other (Specify)" },
      ...skills.map((skill) => ({
        value: skill.perS_id,
        label: skill.perS_name,
      })),
    ];
  }, [skills]);

  const selectedSkillOption = useMemo(() => {
    return getSelectedOption(
      skills.map((skill) => ({
        value: skill.perS_id,
        label: skill.perS_name,
      })),
      data.skillId || selectedSkill?.skills_perSId
    );
  }, [skills, data.skillId, selectedSkill]);

  return (
    <div className={`modal ${showModal ? "block" : "hidden"}`}>
      <div
        className={`modal-content ${
          isDarkMode ? "bg-gray-700" : "bg-gray-200"
        } p-6 rounded-lg shadow-lg`}
      >
        <h3
          className={`text-xl font-semibold ${
            isDarkMode ? "text-white" : "text-gray-800"
          } mb-4`}
        >
          {isNewSkill ? "Add New Skill" : "Update Skill"}
        </h3>

        <div className="mb-4">
          <label
            className={`block ${
              isDarkMode ? "text-white" : "text-gray-600"
            } text-sm font-normal`}
          >
            Skill Name:
          </label>
          <div className="flex items-center">
            <Select
              name="skillId"
              value={selectedSkillOption}
              onChange={(option) => handleSelectChange(option, "skillId")}
              options={skillOptions}
              placeholder="Select Skill"
              isSearchable
              className="w-full text-black"
              menuPlacement="auto"
              menuPosition="fixed"
              blurInputOnSelect
              isOptionDisabled={(option) => option.isDisabled}
            />
            {data.skillId && (
              <button
                className="ml-2 text-red-500"
                onClick={() => handleSelectChange(null, "skillId")}
              >
                Clear
              </button>
            )}
          </div>
          {data.skillId === "custom" && (
            <input
              type="text"
              name="customSkill"
              value={data.customSkill}
              onChange={handleInputChange}
              placeholder="Enter custom skill"
              className={`w-full mt-2 border-b-2 pb-2 ${
                error ? "border-red-500" : "border-black"
              } bg-transparent`}
            />
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowModal(false)}
            className="mr-2 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
      <Toaster position="bottom-left" />
    </div>
  );
};

export default UpdateSkill;
