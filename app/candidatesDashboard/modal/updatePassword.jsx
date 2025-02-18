"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  getDataFromSession,
  getDataFromCookie,
} from "@/app/utils/storageUtils";
import { Toaster, toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, X } from "lucide-react";

const UpdatePassword = ({
  showModal,
  setShowModal,
  candidateEmail,
  fetchProfile,
}) => {
  const { data: session } = useSession();
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
  const [requiresPassword, setRequiresPassword] = useState(true);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const [showNewPassword, setShowNewPassword] = useState(false);

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

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordValid(validatePassword(value));
  };

  useEffect(() => {
    // Check if the user has a password set
    const checkPasswordExists = async () => {
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

        const formData = new FormData();
        formData.append("operation", "checkPasswordExists");
        formData.append("json", JSON.stringify({ userId }));

        const response = await axios.post(url, formData);
        const data = response.data;

        if (data.passwordExists === false) {
          setRequiresPassword(false); // No password set in the database
        }
      } catch (error) {
        console.error("Error checking password existence:", error);
      }
    };

    checkPasswordExists();
  }, [checkPasswordExists]);

  const validatePassword = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[@$!%*?&]/.test(password),
    };
    setPasswordChecks(checks);
    return Object.values(checks).every(Boolean);
  };

  // Check if passwords match
  const checkPasswordsMatch = (confirmPassword) => {
    setPasswordsMatch(password === confirmPassword);
  };

  const requestPinCode = async () => {
    if (requestLoading) return;
    setRequestLoading(true);

    if (requiresPassword && !currentPassword) {
      toast.error("Please enter your current password.");
      setRequestLoading(false);
      return;
    }

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

      const formData = new FormData();

      // If password is required, verify it first
      if (requiresPassword) {
        formData.append("operation", "verifyCurrentPassword");
        formData.append("json", JSON.stringify({ cand_id, currentPassword }));

        const response = await axios.post(url, formData);
        const data = response.data;

        if (!data.success) {
          toast.error("Current password is incorrect.");
          setRequestLoading(false);
          return;
        }
      }

      // Request PIN code to be sent to the email
      formData.append("operation", "getPinCodeUpdate");
      formData.append("json", JSON.stringify({ email: candidateEmail }));

      const pinResponse = await axios.post(url, formData);
      const pinData = pinResponse.data;

      if (pinData.pincode) {
        setPinCode(pinData.pincode);
        setIsPinCodeSent(true); // Show the Save button
        toast.success("PIN code sent to the provided email.");
      } else if (pinData.error) {
        toast.error(pinData.error);
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
      toast.error("Please provide a new password.");
      return;
    }

    if (!passwordValid) {
      toast.error("Password does not meet the criteria.");
      return;
    }

    if (password && !passwordsMatch) {
      toast.error("Passwords do not match.");
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

      // Example usage
      const cand_id = session?.user?.id || getUserIdFromCookie();

      const formData = new FormData();
      formData.append("operation", "updateEmailPassword");
      formData.append(
        "json",
        JSON.stringify({
          email: email || candidateEmail,
          password: password,
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
      <div
        className={`modal-content ${
          isDarkMode ? "bg-gray-700" : "bg-gray-200"
        } p-6 rounded-lg shadow-lg w-full relative`}
      >
        <X
          className="absolute top-4 right-4 cursor-pointer"
          onClick={() => setShowModal(false)}
        />
        <h3
          className={`text-xl font-semibold ${
            isDarkMode ? "text-gray-300" : "text-gray-800"
          } mb-4`}
        >
          Update Password
        </h3>
        <form onSubmit={handleSubmit}>
          {requiresPassword && (
            <div className="mb-4 relative">
              <div className="relative">
                <label
                  className={`block ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  } text-sm font-normal`}
                >
                  Current Password:
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter Current Password"
                  className={`w-full p-2 border rounded-lg mt-1 ${
                    isDarkMode ? "bg-gray-600" : "bg-white"
                  }`}
                  required
                />
                <button
                  type="button"
                  className={`absolute right-3 top-1/2 transform ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          )}
          <div className="mb-4">
            <button
              type="button"
              onClick={requestPinCode}
              className={`p-2 rounded-lg bg-blue-500 text-white mt-2 ${
                isDarkMode ? "bg-blue-600" : ""
              }`}
              disabled={requestLoading || loading}
            >
              {requestLoading ? "Sending..." : "SEND OTP"}
            </button>
          </div>
          {isPinCodeSent && (
            <>
              <div className="mb-4">
                <div className="relative">
                  <label
                    className={`block ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    } text-sm font-normal`}
                  >
                    New Password:
                  </label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter New Password"
                    className={`w-full p-2 border rounded-lg mt-1 ${
                      isDarkMode ? "bg-gray-700" : "bg-white"
                    } ${passwordValid ? "border-green-500" : "border-red-500"}`}
                  />
                  <button
                    type="button"
                    className={`absolute right-3 top-1/2 transform ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <ul className="text-sm mt-2">
                  <li
                    className={
                      passwordChecks.length ? "text-green-500" : "text-red-500"
                    }
                  >
                    {passwordChecks.length ? "✅" : "❌"} At least 8 characters
                  </li>
                  <li
                    className={
                      passwordChecks.uppercase
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {passwordChecks.uppercase ? "✅" : "❌"} One uppercase
                    letter
                  </li>
                  <li
                    className={
                      passwordChecks.lowercase
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {passwordChecks.lowercase ? "✅" : "❌"} One lowercase
                    letter
                  </li>
                  <li
                    className={
                      passwordChecks.number ? "text-green-500" : "text-red-500"
                    }
                  >
                    {passwordChecks.number ? "✅" : "❌"} One number
                  </li>
                  <li
                    className={
                      passwordChecks.specialChar
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {passwordChecks.specialChar ? "✅" : "❌"} One special
                    character (@$!%*?&)
                  </li>
                </ul>
              </div>
              <div className="mb-4">
                <label
                  className={`block ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  } text-sm font-normal`}
                >
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
                  className={`w-full p-2 border rounded-lg mt-1 ${
                    isDarkMode ? "bg-gray-600" : "bg-white"
                  } ${passwordsMatch ? "border-green-500" : "border-red-500"}`}
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
                <label
                  className={`block ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  } text-sm font-normal`}
                >
                  Enter PIN Code (sent to the provided email):
                </label>
                <input
                  type="text"
                  name="pinCode"
                  value={enteredPinCode}
                  onChange={(e) => setEnteredPinCode(e.target.value)}
                  placeholder="Enter PIN Code"
                  className={`w-full p-2 border rounded-lg mt-1 ${
                    isDarkMode ? "bg-gray-600" : "bg-white"
                  }`}
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
