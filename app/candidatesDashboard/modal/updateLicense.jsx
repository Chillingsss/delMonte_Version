"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { getDataFromCookie } from "@/app/utils/storageUtils";
import Select from "react-select";
import { Toaster, toast } from "react-hot-toast";

const UpdateLicense = ({
  showLicenseModal,
  setShowLicenseModal,
  selectedLicense,
  licenses,
  licenseType,
  fetchProfile,
  fetchLicense,
}) => {
  const { data: session } = useSession();
  const [data, setData] = useState({
    license_id: selectedLicense?.license_id || "",
    license_masterId: selectedLicense?.license_masterId || "",
    license_number: selectedLicense?.license_number || "",
    license_master_name: selectedLicense?.license_master_name || "",
    license_type_name: selectedLicense?.license_type_name || "",
    customLicenseType: "",
    customLicenseMaster: "",
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

  const [error, setError] = useState(""); // State for error message

  useEffect(() => {
    if (selectedLicense) {
      setData({
        license_id: selectedLicense?.license_id || "",
        license_masterId: selectedLicense?.license_masterId || "",
        license_number: selectedLicense?.license_number || "",
        license_master_name: selectedLicense?.license_master_name || "",
        license_type_name: selectedLicense?.license_type_name || "",
        customLicenseType: "",
        customLicenseMaster: "",
      });
    }
  }, [selectedLicense]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Validate custom license type input
    if (name === "customLicenseType") {
      if (
        licenseType.some(
          (existingType) =>
            existingType.license_type_name.toLowerCase() === value.toLowerCase()
        )
      ) {
        setError("This license type already exists."); // Set error message
      } else {
        setError(""); // Clear error if no issue
      }
    }

    // Validate custom license master input
    if (name === "customLicenseMaster") {
      if (
        licenses.some(
          (existingMaster) =>
            existingMaster.license_master_name.toLowerCase() ===
            value.toLowerCase()
        )
      ) {
        setError("This license master already exists."); // Set error message
      } else {
        setError(""); // Clear error if no issue
      }
    }
  };

  const handleLicenseTypeChange = (selectedOption) => {
    const isCustom = selectedOption?.value === "custom";
    setData((prevData) => ({
      ...prevData,
      license_type_id: selectedOption
        ? isCustom
          ? "custom"
          : selectedOption.value
        : "",
      license_type_name: isCustom ? "" : selectedOption?.label || "",
      customLicenseType: isCustom ? prevData.customLicenseType : "",
    }));
    setError(""); // Clear error when selecting a different option
  };

  const handleLicenseMasterChange = (selectedOption) => {
    const isCustom = selectedOption?.value === "custom";
    setData((prevData) => ({
      ...prevData,
      license_master_id: selectedOption
        ? isCustom
          ? "custom"
          : selectedOption.value
        : "",
      license_master_name: isCustom ? "" : selectedOption?.label || "",
      customLicenseMaster: isCustom ? prevData.customLicenseMaster : "",
    }));
    setError(""); // Clear error when selecting a different option
  };

  const handleSave = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

      const userId = session.user.id;

      console.log("User ID:", userId);

      // Validate custom license type before saving
      if (
        data.customLicenseType &&
        licenseType.some(
          (existingType) =>
            existingType.license_type_name.toLowerCase() ===
            data.customLicenseType.toLowerCase()
        )
      ) {
        toast.error(
          "Please choose the existing license type from the dropdown."
        ); // Updated toast call
        return; // Prevent saving
      }

      // Validate custom license master before saving
      if (
        data.customLicenseMaster &&
        licenses.some(
          (existingMaster) =>
            existingMaster.license_master_name.toLowerCase() ===
            data.customLicenseMaster.toLowerCase()
        )
      ) {
        toast.error(
          "Please choose the existing license master from the dropdown."
        ); // Updated toast call
        return; // Prevent saving
      }

      const updatedLicense = {
        cand_id: userId,
        license: [
          {
            license_id: data.license_id,
            license_masterId:
              data.license_master_id ||
              (data.customLicenseMaster
                ? "custom"
                : selectedLicense.license_masterId),
            license_type_id:
              data.license_type_id ||
              (data.customLicenseType
                ? "custom"
                : selectedLicense.license_type_id),
            license_number: data.license_number,
            customLicenseType: data.customLicenseType || data.license_type_name,
            customLicenseMaster:
              data.customLicenseMaster || data.license_master_name,
          },
        ],
      };

      console.log("Update:", updatedLicense);

      const formData = new FormData();
      formData.append("operation", "updateCandidateLicense");
      formData.append("json", JSON.stringify(updatedLicense));

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data === 1) {
        console.log("License updated successfully.");
        toast.success("License updated successfully."); // Updated toast call
        if (fetchProfile) {
          fetchProfile();
        }
        if (fetchLicense) {
          fetchLicense();
        }
        setShowLicenseModal(false);
      } else {
        console.error("Failed to update license:", response.data);
        toast.error("Failed to update license."); // Updated toast call
      }
    } catch (error) {
      console.error("Error updating license:", error);
      toast.error("An error occurred while updating the license."); // Updated toast call
    }
  };

  const getSelectedOption = (options, value) =>
    options.find((option) => option.value === value) || null;

  const licenseOptions = useMemo(() => {
    return [
      { value: "custom", label: "Other (Specify)" },
      ...licenses.map((license) => ({
        value: license.license_master_id,
        label: license.license_master_name,
      })),
    ];
  }, [licenses]);

  const selectedLicenseOption = useMemo(() => {
    return getSelectedOption(
      [
        ...licenses.map((license) => ({
          value: license.license_master_id,
          label: license.license_master_name,
        })),
      ],
      data.license_master_id
    );
  }, [licenses, data.license_master_id]);

  const licenseTypeOptions = useMemo(() => {
    return [
      { value: "custom", label: "Other (Specify)" },
      ...licenseType.map((type) => ({
        value: type.license_type_id,
        label: type.license_type_name,
      })),
    ];
  }, [licenseType]);

  const selectedLicenseType = useMemo(() => {
    return getSelectedOption(
      [
        ...licenseType.map((type) => ({
          value: type.license_type_id,
          label: type.license_type_name,
        })),
      ],
      data.license_type_id
    );
  }, [licenseType, data.license_type_id]);

  return (
    <div className={`modal ${showLicenseModal ? "block" : "hidden"}`}>
      <div
        className={`modal-content ${
          isDarkMode ? "bg-gray-700" : "bg-gray-200"
        } p-6 rounded-lg shadow-lg`}
      >
        <h3
          className={
            "text-xl font-semibold " +
            (isDarkMode ? "text-white" : "text-gray-800") +
            " mb-4"
          }
        >
          Update License
        </h3>

        <div className="mb-4">
          <label
            className={`block text-${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            } text-sm font-normal`}
          >
            License Type:
          </label>
          <div className="flex items-center">
            <Select
              name="license_type_id"
              value={selectedLicenseType}
              onChange={handleLicenseTypeChange}
              options={licenseTypeOptions}
              placeholder={data.license_type_name || "Select License Type"}
              isSearchable
              className="w-full text-black"
              menuPlacement="auto"
              menuPosition="fixed"
              blurInputOnSelect
              isOptionDisabled={(option) => option.isDisabled}
            />
            {data.license_type_id && (
              <button
                className="ml-2 text-red-500"
                onClick={() => handleLicenseTypeChange(null)}
              >
                Clear
              </button>
            )}
          </div>
          {data.license_type_id === "custom" && (
            <div>
              <input
                type="text"
                name="customLicenseType"
                value={data.customLicenseType}
                onChange={handleInputChange}
                placeholder="Enter custom license type"
                className={`w-full mt-2 border-b-2 pb-2 bg-transparent ${
                  error ? "border-red-500" : "border-black"
                }`}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}{" "}
              {/* Display error message */}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label
            className={`block text-sm font-normal ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            License Master ID:
          </label>
          <div className="flex items-center">
            <Select
              name="license_master_id"
              value={selectedLicenseOption}
              onChange={handleLicenseMasterChange}
              options={licenseOptions}
              placeholder={data.license_master_name || "Select License Master"}
              isSearchable
              className="w-full text-black"
              menuPlacement="auto"
              menuPosition="fixed"
              blurInputOnSelect
              isOptionDisabled={(option) => option.isDisabled}
            />
            {data.license_master_id && (
              <button
                className="ml-2 text-red-500"
                onClick={() => handleLicenseMasterChange(null)}
              >
                Clear
              </button>
            )}
          </div>
          {data.license_master_id === "custom" && (
            <div>
              <input
                type="text"
                name="customLicenseMaster"
                value={data.customLicenseMaster}
                onChange={handleInputChange}
                placeholder="Enter custom license master"
                className={`w-full mt-2 border-b-2 pb-2 bg-transparent ${
                  error ? "border-red-500" : "border-black"
                }`}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}{" "}
              {/* Display error message */}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label
            className={`block text-sm font-normal ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            License Number:
          </label>
          <input
            type="text"
            name="license_number"
            value={data.license_number}
            onChange={handleInputChange}
            className={`w-full mt-2 border-b-2 pb-2 bg-transparent ${
              isDarkMode ? "border-gray-200" : "border-black"
            }`}
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setShowLicenseModal(false)}
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

export default UpdateLicense;
