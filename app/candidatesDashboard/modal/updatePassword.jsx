"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { retrieveDataFromCookie,
  retrieveDataFromSession,
  storeDataInCookie,
  storeDataInSession,
  removeDataFromCookie,
  removeDataFromSession,
  retrieveData,
  getDataFromSession} from "@/app/utils/storageUtils";
import { Toaster, toast } from "react-hot-toast"; // Updated import
import { Input } from "@/components/ui/input";
import { X } from "lucide-react"; // Added import for X icon

const UpdatePassword = ({
  showModal,
  setShowModal,
  candidateEmail,
  candidatePassword,
  candidateAlternateEmail,
  fetchProfile,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [enteredPinCode, setEnteredPinCode] = useState("");
  const [alternateEmail, setAlternateEmail] = useState("");
  const [isPinCodeSent, setIsPinCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

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

  // Password validation function
  const validatePassword = (password) => {
    const hasNumber = /\d/;
    const isValid = password.length >= 8 && hasNumber.test(password);
    setPasswordValid(isValid);
  };

  // Check if passwords match
  const checkPasswordsMatch = (confirmPassword) => {
    setPasswordsMatch(password === confirmPassword);
  };

  const requestPinCode = async () => {
    if (requestLoading) return;
    setRequestLoading(true);

    if (!currentPassword) {
      toast.error("Please enter your current password.");
      setRequestLoading(false);
      return;
    }

    if (currentPassword !== candidatePassword) {
      toast.error("Current password is incorrect.");
      setRequestLoading(false);
      return;
    }

    console.log("Password is correct, proceeding to request PIN code...");

    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const formData = new FormData();
      formData.append("operation", "getPinCodeUpdate");

      const emailToUse =
        alternateEmail === candidateAlternateEmail
          ? alternateEmail
          : candidateEmail;
      formData.append("json", JSON.stringify({ email: emailToUse }));

      console.log("Email to use for PIN code request:", emailToUse);

      const response = await axios.post(url, formData);
      const data = response.data;

      if (data.pincode) {
        setPinCode(data.pincode);
        setIsPinCodeSent(true); // Show the Save button
        toast.success("PIN code sent to the provided email.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (enteredPinCode !== pinCode) {
      toast.error("Invalid PIN code.");
      return;
    }

    if (!password) {
      toast.error("Please provide at least a new email or new password.");
      return;
    }

    if (password && !passwordValid) {
      toast.error(
        "Password must be at least 5 characters long and contain a number."
      );
      return;
    }

    if (password && !passwordsMatch) {
      toast.error("Passwords do not match.");
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
          email: email || candidateEmail,
          password: password || candidatePassword,
          cand_id: cand_id,
        })
      );

      const response = await axios.post(url, formData);

      if (response.data.success) {
        toast.success("Password updated successfully.");
        await fetchProfile();
        setShowModal(false);
      } else {
        toast.error("Failed to update email/password.");
      }
    } catch (error) {
      console.error("Error updating email/password:", error);
      toast.error("An error occurred while updating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal ${showModal ? "block" : "hidden"}`}>
      <div className={`modal-content ${isDarkMode ? "bg-gray-700" : "bg-gray-200"} p-6 rounded-lg shadow-lg w-full relative`}>
        <X
          className="absolute top-4 right-4 cursor-pointer"
          onClick={() => setShowModal(false)}
        />
        <h3 className={`text-xl font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-800"} mb-4`}>
          Update Password
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className={`block ${isDarkMode ? "text-gray-300" : "text-gray-600"} text-sm font-normal`}>
              Current Password:
            </label>
            <input
              type="password"
              name="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter Current Password"
              className={`w-full p-2 border rounded-lg mt-1 ${isDarkMode ? "bg-gray-600" : "bg-white"}`}
              required
            />
          </div>
          <div className="mb-4">
            <button
              type="button"
              onClick={requestPinCode}
              className={`p-2 rounded-lg bg-blue-500 text-white mt-2 ${isDarkMode ? "bg-blue-600" : ""}`}
              disabled={requestLoading || loading}
            >
              {requestLoading ? "Sending..." : "SEND OTP"}
            </button>
          </div>
          {isPinCodeSent && (
            <>
              <div className="mb-4">
                <label className={`block ${isDarkMode ? "text-gray-300" : "text-gray-600"} text-sm font-normal`}>
                  New Password:
                </label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                  placeholder="Enter New Password"
                  className={`w-full p-2 border rounded-lg mt-1 ${isDarkMode ? "bg-gray-700" : "bg-white"} ${
                    passwordValid ? "border-green-500" : "border-red-500"
                  }`}
                />
                <p
                  className={`text-sm mt-1 ${
                    passwordValid ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {passwordValid
                    ? "Password is valid."
                    : "Password must be at least 8 characters long and contain at least one number."}
                </p>
              </div>
              <div className="mb-4">
                <label className={`block ${isDarkMode ? "text-gray-300" : "text-gray-600"} text-sm font-normal`}>
                  Confirm Password:
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    checkPasswordsMatch(e.target.value);
                  }}
                  placeholder="Confirm Password"
                  className={`w-full p-2 border rounded-lg mt-1 ${isDarkMode ? "bg-gray-600" : "bg-white"} ${
                    passwordsMatch ? "border-green-500" : "border-red-500"
                  }`}
                />
                <p
                  className={`text-sm mt-1 ${
                    passwordsMatch ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {passwordsMatch
                    ? "Passwords match."
                    : "Passwords do not match."}
                </p>
              </div>
              <div className="mb-4">
                <label className={`block ${isDarkMode ? "text-gray-300" : "text-gray-600"} text-sm font-normal`}>
                  Enter PIN Code (sent to the provided email):
                </label>
                <input
                  type="text"
                  name="pinCode"
                  value={enteredPinCode}
                  onChange={(e) => setEnteredPinCode(e.target.value)}
                  placeholder="Enter PIN Code"
                  className={`w-full p-2 border rounded-lg mt-1 ${isDarkMode ? "bg-gray-600" : "bg-white"}`}
                  required
                />
              </div>
            </>
          )}
          <div className="flex justify-between">
            {isPinCodeSent && (
              <button
                type="submit"
                className="p-2 rounded-lg bg-green-500 text-white"
                disabled={loading}
              >
                {loading ? "Updating..." : "Save"}
              </button>
            )}
          </div>
        </form>
      </div>
      <Toaster position="bottom-left" /> {/* Add Toaster component */}
    </div>
  );
};

export default UpdatePassword;
