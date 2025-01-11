"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  retrieveDataFromCookie,
  retrieveDataFromSession,
  storeDataInCookie,
  storeDataInSession,
  removeDataFromCookie,
  removeDataFromSession,
  retrieveData,
} from "@/app/utils/storageUtils";
import { Toaster, toast } from "react-hot-toast"; // Import React Hot Toast

const UpdateEmpHis = ({
  showModal,
  setShowModal,
  employment,
  fetchProfile,
  profile,
}) => {
  const [data, setData] = useState({
    empH_id: employment?.empH_id || "",
    empH_positionName: employment?.empH_positionName || "",
    empH_companyName: employment?.empH_companyName || "",
    empH_startdate: employment?.empH_startdate || "",
    empH_enddate: employment?.empH_enddate || "",
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

  useEffect(() => {
    if (employment) {
      setData({
        empH_id: employment.empH_id || "",
        empH_positionName: employment.empH_positionName || "",
        empH_companyName: employment.empH_companyName || "",
        empH_startdate: employment.empH_startdate || "",
        empH_enddate: employment.empH_enddate || "",
      });
    }
  }, [employment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleDateChange = (date, field) => {
    if (!date) {
      setData((prev) => ({
        ...prev,
        [field]: "",
      }));
      return;
    }

    // Adjust for timezone
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
      .toISOString()
      .split("T")[0];

    setData((prev) => ({
      ...prev,
      [field]: localDate,
    }));
  };

  const handleSave = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const cand_id = retrieveData("user_id");

      const updatedData = {
        cand_id: cand_id,
        employmentHistory: [
          {
            empH_id: data.empH_id || null,
            empH_positionName: data.empH_positionName,
            empH_companyName: data.empH_companyName,
            empH_startdate: data.empH_startdate,
            empH_enddate: data.empH_enddate,
          },
        ],
      };

      console.log("Update Employment History:", updatedData);

      const formData = new FormData();
      formData.append("operation", "updateCandidateEmploymentInfo");
      formData.append("json", JSON.stringify(updatedData));

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response:", response.data);

      if (response.data.success) {
        toast.success("Employment history updated successfully.");
        if (fetchProfile) {
          fetchProfile();
        }
        setShowModal(false);
      } else {
        console.error("Failed to update employment history:", response.data);
      }
    } catch (error) {
      console.error("Error updating employment history:", error);
    }
  };

  return (
    <>
      <Toaster position="bottom-left" />
      <div className={`modal ${showModal ? "block" : "hidden"}`}>
        <div className={`modal-content ${isDarkMode ? "bg-gray-700" : "bg-gray-200"} p-6 rounded-lg shadow-lg`}>
          <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"} mb-4`}>
            {data.empH_id
              ? "Edit Employment History"
              : "Add Employment History"}
          </h3>

          <div className={`mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
            <label className={`block text-gray-600 text-sm font-normal ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Position Name:
            </label>
            <input
              type="text"
              name="empH_positionName"
              value={data.empH_positionName}
              onChange={handleChange}
              placeholder="Enter Position Name"
              className={`w-full mt-2 border-b-2 pb-2 bg-transparent ${isDarkMode ? "border-gray-400 text-white" : "border-black"} text-black`}
            />
          </div>

          <div className={`mb-4 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
            <label className={`block text-gray-600 text-sm font-normal ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              Company Name:
            </label>
            <input
              type="text"
              name="empH_companyName"
              value={data.empH_companyName}
              onChange={handleChange}
              placeholder="Enter Company Name"
              className={`w-full mt-2 border-b-2 pb-2 bg-transparent ${isDarkMode ? "border-gray-400 text-white" : "border-black"} text-black`}
            />
          </div>

          <div className={`mb-6 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
            <label className={`block text-gray-600 text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-800"} mb-2`}>
              Start Date:
            </label>
            <div className="relative">
              <DatePicker
                selected={data.empH_startdate ? new Date(data.empH_startdate + 'T00:00:00') : null}
                onChange={(date) => handleDateChange(date, "empH_startdate")}
                dateFormat="MMM dd, yyyy"
                className={`w-full mt-2 border-b-2 pb-2 bg-transparent ${isDarkMode ? "border-gray-400 text-white" : "border-black"} text-black`}
                placeholderText="Select start date"
                maxDate={new Date()}
                showYearDropdown
                showMonthDropdown
                scrollableYearDropdown
                scrollableMonthYearDropdown
                isClearable
                customInput={
                  <input
                    className={`w-full mt-2 border-b-2 pb-2 bg-transparent ${isDarkMode ? "border-gray-400 text-white" : "border-black"} text-black`}
                  />
                }
              />

            </div>
          </div>

          <div className={`mb-6 ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
            <label className={`block text-gray-600 text-sm font-semibold ${isDarkMode ? "text-white" : "text-gray-800"} mb-2`}>
              End Date:
            </label>
            <div className="relative">
              <DatePicker
                selected={data.empH_enddate ? new Date(data.empH_enddate + 'T00:00:00') : null}
                onChange={(date) => handleDateChange(date, "empH_enddate")}
                dateFormat="MMM dd, yyyy"
                className={`w-full mt-2 border-b-2 pb-2 bg-transparent ${isDarkMode ? "border-gray-400 text-white" : "border-black"} text-black`}
                placeholderText="Select end date"
                minDate={data.empH_startdate ? new Date(data.empH_startdate + 'T00:00:00') : null}
                maxDate={new Date()}
                showYearDropdown
                showMonthDropdown
                scrollableYearDropdown
                scrollableMonthYearDropdown
                isClearable
                customInput={
                  <input
                    className={`w-full mt-2 border-b-2 pb-2 bg-transparent ${isDarkMode ? "border-gray-400 text-white" : "border-black"} text-black`}
                  />
                }
              />

            </div>
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
      </div>
    </>
  );
};

export default UpdateEmpHis;
