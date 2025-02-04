"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  retrieveDataFromSession,
  getDataFromSession,
} from "@/app/utils/storageUtils";
import { Toaster, toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const UpdateEmail = ({
  showModal,
  setShowModal,
  candidateEmail,
  candidatePassword,
  candidateAlternateEmail,
  fetchProfile,
}) => {
  const [newEmail, setNewEmail] = useState(""); // new email
  const [currentPassword, setCurrentPassword] = useState("");
  const [currentEmailPinCode, setCurrentEmailPinCode] = useState("");
  const [newEmailPinCode, setNewEmailPinCode] = useState(""); // New email OTP
  const [enteredPinCode, setEnteredPinCode] = useState(""); // User-entered PIN
  const [enteredNewPinCode, setEnteredNewPinCode] = useState(""); // User-entered PIN

  const [isPinCodeSent, setIsPinCodeSent] = useState(false); // Current email OTP sent
  const [isNewEmailPinCodeSent, setIsNewEmailPinCodeSent] = useState(false); // New email OTP sent
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [isPinCodeVerified, setIsPinCodeVerified] = useState(false); // PIN code verified

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

  // Request OTP to be sent to current email after verifying current password
  const requestPinCodeToCurrentEmail = async () => {
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    setRequestLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const cand_id = getDataFromSession("user_id");

      // Verify the current password
      const verifyPasswordFormData = new FormData();
      verifyPasswordFormData.append("operation", "verifyCurrentPassword");
      verifyPasswordFormData.append(
        "json",
        JSON.stringify({ cand_id, currentPassword })
      );

      const verifyPasswordResponse = await axios.post(
        url,
        verifyPasswordFormData
      );
      const verifyPasswordData = verifyPasswordResponse.data;

      if (!verifyPasswordData.success) {
        toast.error("Current password is incorrect.");
        setRequestLoading(false);
        return;
      }

      // Request PIN code to be sent to current email
      const formData = new FormData();
      formData.append("operation", "getPinCodeUpdate");
      formData.append(
        "json",
        JSON.stringify({ email: candidateEmail }) // Change 'currentEmail' to 'email'
      );

      const response = await axios.post(url, formData);
      const data = response.data;

      if (data.pincode) {
        setCurrentEmailPinCode(data.pincode);
        setIsPinCodeSent(true);
        toast.success("PIN code sent to your current email.", {
          position: "bottom-left",
        }); // Update toast position
      } else if (data.error) {
        toast.error(data.error);
      } else {
        toast.error("Failed to send PIN code.");
      }
    } catch (error) {
      console.error("Error requesting PIN code:", error);
      toast.error("An error occurred while requesting PIN code.");
    } finally {
      setRequestLoading(false);
    }
  };

  const verifyPinCode = () => {
    if (enteredPinCode === currentEmailPinCode) {
      setIsPinCodeVerified(true);
      toast.success("PIN code verified. You can now enter your new email.");
    } else {
      toast.error("Invalid PIN code for current email.");
    }
  };

  const verifyPinCodeAndSendToNewEmail = async () => {
    if (!newEmail) {
      toast.error("Please enter a new email.");
      return;
    }

    setLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const formData = new FormData();
      formData.append("operation", "getPinCodeEmailUpdate");
      formData.append(
        "json",
        JSON.stringify({
          newEmail: newEmail, // Updated key to 'newEmail'
        })
      );

      const response = await axios.post(url, formData);
      const data = response.data;

      if (data.pincode) {
        setNewEmailPinCode(data.pincode);
        setIsNewEmailPinCodeSent(true);
        toast.success("PIN code sent to your new email.", {
          position: "bottom-left",
        }); // Update toast position
      } else {
        toast.error(data.error || "Failed to send PIN code to new email."); // Improved error handling
      }
    } catch (error) {
      console.error("Error sending OTP to new email:", error);
      toast.error("An error occurred while sending PIN code to the new email.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (enteredNewPinCode !== newEmailPinCode) {
      toast.error("Invalid PIN code for new email.");
      return;
    }

    setLoading(true);

    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const cand_id = getDataFromSession("user_id");

      const formData = new FormData();
      formData.append("operation", "updateEmailPassword");
      formData.append(
        "json",
        JSON.stringify({
          email: newEmail || candidateEmail,
          password: candidatePassword,
          cand_id: cand_id,
        })
      );

      const response = await axios.post(url, formData);

      if (response.data.success) {
        toast.success("Email updated successfully."); // Update toast position
        await fetchProfile();
        setShowModal(false);
      } else {
        toast.error("Failed to update email.");
      }
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error("An error occurred while updating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster position="bottom-left" /> {/* Add Toaster component */}
      <div className={`modal ${showModal ? "block" : "hidden"}`}>
        <div
          className={`modal-content bg-gray-200 p-6 rounded-lg shadow-lg w-full relative ${
            isDarkMode ? "bg-gray-700" : ""
          }`}
        >
          <X
            className="absolute top-4 right-4 cursor-pointer"
            onClick={() => setShowModal(false)}
          />
          <h3
            className={`text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-800"
            } mb-4`}
          >
            Update Email
          </h3>

          {/* Step 1: Enter current password */}
          {!isPinCodeSent && (
            <>
              <div className="mb-4">
                <label
                  className={`block text-${
                    isDarkMode ? "gray-300" : "gray-600"
                  } text-sm font-normal`}
                >
                  Current Password:
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter Current Password"
                  className={`w-full p-2 border rounded-lg mt-1 ${
                    isDarkMode ? "bg-gray-600" : "bg-white"
                  }`}
                  required
                />
              </div>
              <button
                onClick={requestPinCodeToCurrentEmail}
                className={`p-2 rounded-lg bg-blue-500 text-white mt-2 ${
                  isDarkMode ? "bg-blue-600" : ""
                }`}
                disabled={requestLoading || loading}
              >
                {requestLoading
                  ? "Sending OTP..."
                  : "Send OTP to Current Email"}
              </button>
            </>
          )}

          {/* Step 2: Enter and verify OTP from current email */}
          {isPinCodeSent && !isPinCodeVerified && (
            <>
              <div className="mb-4">
                <label className="block text-gray-600 text-sm font-normal">
                  Enter OTP from Current Email:
                </label>
                <input
                  type="text"
                  value={enteredPinCode}
                  onChange={(e) => setEnteredPinCode(e.target.value)}
                  placeholder="Enter OTP"
                  className={`w-full p-2 border rounded-lg mt-1 bg-white ${
                    isDarkMode ? "bg-gray-600" : ""
                  }`}
                />
              </div>
              <button
                onClick={verifyPinCode}
                className={`p-2 rounded-lg bg-green-500 text-white mt-2 ${
                  isDarkMode ? "bg-green-600" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </>
          )}

          {/* Step 3: Enter new email and send OTP to new email */}
          {isPinCodeVerified && !isNewEmailPinCodeSent && (
            <>
              <div className="mb-4">
                <label
                  className={`block text-${
                    isDarkMode ? "gray-300" : "gray-600"
                  } text-sm font-normal`}
                >
                  New Email:
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter New Email"
                  className={`w-full p-2 border rounded-lg mt-1 ${
                    isDarkMode ? "bg-gray-600" : "bg-white"
                  }`}
                  required
                />
              </div>
              <button
                onClick={verifyPinCodeAndSendToNewEmail}
                className={`p-2 rounded-lg bg-green-500 text-white mt-2 ${
                  isDarkMode ? "bg-green-600" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Send OTP to New Email"}
              </button>
            </>
          )}

          {/* Step 4: Enter and verify OTP from new email */}
          {isNewEmailPinCodeSent && (
            <>
              <div className="mb-4">
                <label
                  className={`block text-${
                    isDarkMode ? "gray-300" : "gray-600"
                  } text-sm font-normal`}
                >
                  Enter OTP from New Email:
                </label>
                <input
                  type="text"
                  value={enteredNewPinCode}
                  onChange={(e) => setEnteredNewPinCode(e.target.value)}
                  placeholder="Enter OTP"
                  className={`w-full p-2 border rounded-lg mt-1 bg-white ${
                    isDarkMode ? "bg-gray-600" : ""
                  }`}
                />
              </div>
              <button
                onClick={handleSubmit}
                className={`p-2 rounded-lg bg-green-500 text-white mt-2 ${
                  isDarkMode ? "bg-green-600" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UpdateEmail;
