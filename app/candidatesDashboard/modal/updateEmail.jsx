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
import { CheckCircle, Eye, EyeOff, X, XCircle } from "lucide-react";

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const RESTRICTED_DOMAINS = ['example.com', 'test.com', 'invalid.com'];

const UpdateEmail = ({
  showModal,
  setShowModal,
  candidateEmail,
  candidatePassword,
  candidateAlternateEmail,
  fetchProfile,
}) => {
  const { data: session } = useSession();
  const [selectedEmailType, setSelectedEmailType] = useState(""); // "primary" or "alternate"
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isValidatingDomain, setIsValidatingDomain] = useState(false);
  const [isValidDomain, setIsValidDomain] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [currentEmailPinCode, setCurrentEmailPinCode] = useState("");
  const [newEmailPinCode, setNewEmailPinCode] = useState("");
  const [enteredPinCode, setEnteredPinCode] = useState("");
  const [enteredNewPinCode, setEnteredNewPinCode] = useState("");
  const [isPinCodeSent, setIsPinCodeSent] = useState(false);
  const [isNewEmailPinCodeSent, setIsNewEmailPinCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [isPinCodeVerified, setIsPinCodeVerified] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("appearance");
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [showPassword, setShowPassword] = useState(false);

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
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

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
        // console.log("User ID:", userId);

        const formData = new FormData();
        formData.append("operation", "checkPasswordExists");
        formData.append(
          "json",
          JSON.stringify({ userId })
        );

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
  }, []);

  // Email validation and sanitization
  const sanitizeEmail = (email) => {
    return email.trim().toLowerCase();
  };

  const validateEmail = (email) => {
    if (!email) {
      return "Email is required";
    }

    const sanitizedEmail = sanitizeEmail(email);
    
    if (!EMAIL_REGEX.test(sanitizedEmail)) {
      return "Please enter a valid email address";
    }

    const domain = sanitizedEmail.split('@')[1];
    
    if (RESTRICTED_DOMAINS.includes(domain)) {
      return "This email domain is not allowed";
    }

    return "";
  };

  const checkEmailDomain = async (email) => {
    try {
      setIsValidatingDomain(true);
      setIsValidDomain(false);
      const domain = email.split('@')[1];
      
      // Check domain MX records
      const response = await axios.post('/api/validateEmailDomain', { domain });
      
      if (!response.data.isValid) {
        setEmailError("This email domain appears to be invalid or non-existent");
        setIsValidDomain(false);
        return false;
      }
      
      setIsValidDomain(true);
      return true;
    } catch (error) {
      console.error('Error validating email domain:', error);
      setEmailError("Unable to verify email domain. Please try again.");
      setIsValidDomain(false);
      return false;
    } finally {
      setIsValidatingDomain(false);
    }
  };

  const handleEmailChange = async (e) => {
    const newValue = e.target.value;
    setNewEmail(newValue);
    
    // Clear previous errors
    setEmailError("");
    
    // Basic validation
    const validationError = validateEmail(newValue);
    if (validationError) {
      setEmailError(validationError);
      return;
    }
    
    // Debounce domain check
    if (newValue && !validationError) {
      const timeoutId = setTimeout(async () => {
        await checkEmailDomain(newValue);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };

  // Request OTP to be sent to current email after verifying current password
  const requestPinCodeToCurrentEmail = async () => {
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    setRequestLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const getUserIdFromCookie = () => {
        const tokenData = getDataFromCookie("auth_token");
        if (tokenData && tokenData.userId) {
          return tokenData.userId;
        }
        return null;
      };
      const cand_id = session?.user?.id || getUserIdFromCookie();

      // console.log("User ID:", cand_id);

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

      // console.log("Verify password data:", verifyPasswordData);

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
        // Start the timer immediately after first OTP is sent
        setResendTimer(60);
        setCanResend(false);
        toast.success("PIN code sent to your current email.", {
          position: "bottom-left",
        });
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
      setEmailError("Please enter a new email.");
      return;
    }

    const validationError = validateEmail(newEmail);
    if (validationError) {
      setEmailError(validationError);
      return;
    }

    const isValidDomain = await checkEmailDomain(newEmail);
    if (!isValidDomain) {
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
        // Start the timer immediately after first OTP is sent
        setResendTimer(60);
        setCanResend(false);
        toast.success("PIN code sent to your new email.", {
          position: "bottom-left",
        });
      } else {
        toast.error(data.error || "Failed to send PIN code to new email.");
      }
    } catch (error) {
      console.error("Error sending OTP to new email:", error);
      toast.error("An error occurred while sending PIN code to the new email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendNewEmailOTP = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResendTimer(60);
    await verifyPinCodeAndSendToNewEmail();
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
      const getUserIdFromCookie = () => {
        const tokenData = getDataFromCookie("auth_token");
        if (tokenData && tokenData.userId) {
          return tokenData.userId;
        }
        return null;
      };

      const userId = session?.user?.id || getUserIdFromCookie();

      const formData = new FormData();
      formData.append("operation", "updateEmailPassword");
      formData.append(
        "json",
        JSON.stringify({
          email: selectedEmailType === "primary" ? newEmail : candidateEmail,
          alternateEmail: selectedEmailType === "alternate" ? newEmail : candidateAlternateEmail,
          password: candidatePassword,
          cand_id: userId,
          updateType: selectedEmailType, // Add this to indicate which email is being updated
        })
      );

      const response = await axios.post(url, formData);

      if (response.data.success) {
        toast.success(`${selectedEmailType === "primary" ? "Primary" : "Alternate"} email updated successfully.`);
        await fetchProfile();
        setShowModal(false);
      } else {
        toast.error(response.data.error || "Failed to update email.");
      }
    } catch (error) {
      console.error("Error updating email:", error);
      toast.error("An error occurred while updating.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedEmailType("");
    setNewEmail("");
    setCurrentPassword("");
    setCurrentEmailPinCode("");
    setNewEmailPinCode("");
    setEnteredPinCode("");
    setEnteredNewPinCode("");
    setIsPinCodeSent(false);
    setIsNewEmailPinCodeSent(false);
    setIsPinCodeVerified(false);
  };

  const handleClose = () => {
    resetForm();
    setShowModal(false);
  };

  return (
    <>
      <Toaster position="bottom-left" />
      <div className={`modal ${showModal ? "block" : "hidden"}`}>
        <div
          className={`modal-content bg-gray-200 p-6 rounded-lg shadow-lg w-full relative ${
            isDarkMode ? "bg-gray-700" : ""
          }`}
        >
          <X
            className="absolute top-4 right-4 cursor-pointer"
            onClick={handleClose}
          />
          <h3
            className={`text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-800"
            } mb-4`}
          >
            Email Management
          </h3>

          {/* Email Selection Step */}
          {!selectedEmailType && (
              <div className="space-y-4">
                {/* Primary Email Card */}
                <div 
                  className={`group p-4 rounded-lg transition-all duration-200 ${
                    isDarkMode 
                      ? "bg-gray-800 hover:bg-gray-750" 
                      : "bg-white hover:bg-gray-50"
                  } border ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  } hover:shadow-lg`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-medium ${isDarkMode ? "text-green-400" : "text-green-600"}`}>
                          Primary Email
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isDarkMode 
                            ? "bg-green-900/30 text-green-400" 
                            : "bg-green-100 text-green-700"
                        }`}>
                          Main
                        </span>
                      </div>
                      <p className={`text-base font-medium ${isDarkMode ? "text-white" : "text-gray-900"} break-all`}>
                        {candidateEmail}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedEmailType("primary")}
                      className={`flex items-center gap-2 min-w-[100px] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isDarkMode 
                          ? "bg-gray-700 hover:bg-gray-600 text-white" 
                          : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                      } hover:shadow-md`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Update
                    </button>
                  </div>
                </div>

                {/* Alternate Email Card */}
                <div 
                  className={`group p-4 rounded-lg transition-all duration-200 ${
                    isDarkMode 
                      ? "bg-gray-800 hover:bg-gray-750" 
                      : "bg-white hover:bg-gray-50"
                  } border ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  } hover:shadow-lg`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-medium ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}>
                          Alternate Email
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isDarkMode 
                            ? "bg-blue-900/30 text-blue-400" 
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          Backup
                        </span>
                      </div>
                      {candidateAlternateEmail ? (
                        <p className={`text-base font-medium ${isDarkMode ? "text-white" : "text-gray-900"} break-all`}>
                          {candidateAlternateEmail}
                        </p>
                      ) : (
                        <p className={`text-sm italic ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          No alternate email set
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedEmailType("alternate")}
                      className={`flex items-center gap-2 min-w-[100px] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isDarkMode 
                          ? "bg-gray-700 hover:bg-gray-600 text-white" 
                          : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                      } hover:shadow-md`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        {candidateAlternateEmail ? (
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        )}
                      </svg>
                      {candidateAlternateEmail ? "Update" : "Add"}
                    </button>
                  </div>
                </div>

                {/* Info Section */}
                <div className={`flex items-start gap-3 p-4 rounded-lg ${
                  isDarkMode 
                    ? "bg-blue-900/20 border-blue-800/30" 
                    : "bg-blue-50 border-blue-100"
                } border`}>
                  <svg 
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="space-y-1">
                    <p className={`text-sm ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                      <span className="font-medium">Security Note:</span> Updating your email requires verification of:
                    </p>
                    <ul className={`text-sm ${isDarkMode ? "text-blue-300" : "text-blue-700"} list-disc list-inside ml-1 space-y-1`}>
                      <li>Your current password</li>
                      <li>Your current email address</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

          {/* Password Verification Step */}
          {selectedEmailType && requiresPassword === null ? (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
            </div>
          ) : selectedEmailType && !requiresPassword ? (
            <div className={`p-4 sm:p-5 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="text-center">
                <div className={`mx-auto flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full ${
                  isDarkMode 
                    ? 'bg-red-900/20 text-red-500' 
                    : 'bg-red-100 text-red-600'
                } mb-3 sm:mb-4`}>
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className={`text-base sm:text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Password Required
                </h3>
                <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  Please set up your password first before updating your email address.
                </p>
                <button
                  onClick={() => setSelectedEmailType("")}
                  className={`w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Go Back
                </button>
              </div>
            </div>
          ) : selectedEmailType && requiresPassword && !isPinCodeSent && (
            <div className={`p-4 sm:p-5 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className={`text-base sm:text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Update {selectedEmailType === 'primary' ? 'Primary' : 'Alternate'} Email
                  </h4>
                  <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Please verify your current password
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedEmailType("");
                    setCurrentPassword("");
                  }}
                  className={`p-1.5 rounded-md transition-all ${
                    isDarkMode 
                      ? 'hover:bg-gray-700 text-gray-400' 
                      : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} mb-4`}>
                <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Current Email:
                </span>
                <p className={`mt-1 text-sm sm:text-base font-medium break-all ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedEmailType === 'primary' ? candidateEmail : (candidateAlternateEmail || 'Not set')}
                </p>
              </div>

              <div className="mb-4">
                <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className={`w-full px-3 py-2 text-sm rounded-md transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } border focus:ring-2 focus:ring-blue-500/20 focus:outline-none`}
                    required
                  />
                  <button
                    type="button"
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-colors duration-200 ${
                      isDarkMode
                        ? "text-gray-400 hover:text-gray-300 hover:bg-gray-600"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                onClick={requestPinCodeToCurrentEmail}
                disabled={requestLoading || loading}
                className={`w-full py-2 px-4 text-xs sm:text-sm font-medium rounded-md transition-all ${
                  isDarkMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {requestLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  'Send OTP to Current Primary Email'
                )}
              </button>

              <div className={`mt-4 p-2.5 sm:p-3 rounded-lg text-xs sm:text-sm ${
                isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-blue-50 text-blue-700'
              } border ${isDarkMode ? 'border-gray-600' : 'border-blue-100'}`}>
                <span className="font-medium">Note:</span> A verification code will be sent to your current email address.
              </div>
            </div>
          )}

          {/* Step 2: Enter and verify OTP from current email */}
          {isPinCodeSent && !isPinCodeVerified && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-0 shadow-lg`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Verify Current Email
                    </h4>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Enter the verification code sent to your current email
                    </p>
                  </div>
                </div>

                {/* Current Email Display */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} mb-6`}>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Current Email Address:
                  </span>
                  <p className={`mt-1 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {candidateEmail}
                  </p>
                </div>

                {/* OTP Input */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={enteredPinCode}
                    onChange={(e) => setEnteredPinCode(e.target.value)}
                    placeholder="Enter 10 digit code"
                    maxLength={10}
                    className={`w-full px-4 py-2 rounded-lg transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                    } border focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-center tracking-wider`}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={verifyPinCode}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={loading || !enteredPinCode}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Verify Code'
                    )}
                  </button>

                  <button
                    onClick={requestPinCodeToCurrentEmail}
                    disabled={!canResend || requestLoading}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
                  </button>
                </div>

                {/* Info Message */}
                <div className={`mt-6 p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50'
                } border ${isDarkMode ? 'border-gray-600' : 'border-blue-100'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                    <span className="font-medium">Note:</span> Please check your email inbox for the verification code. If you do not see it, check your spam folder.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Enter new email */}
          {isPinCodeVerified && !isNewEmailPinCodeSent && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-0 shadow-lg`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Enter New Email Address
                    </h4>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Please enter your new email address
                    </p>
                  </div>
                </div>

                {/* Email Input */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    New Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={handleEmailChange}
                      placeholder="Enter your new email"
                      className={`w-full px-4 py-2 rounded-lg transition-colors duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      } border ${emailError ? 'border-red-500' : isValidDomain ? 'border-green-500' : 'focus:border-blue-500'} focus:ring-2 focus:ring-blue-500/20 focus:outline-none`}
                    />
                    {isValidatingDomain && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                    {!isValidatingDomain && newEmail && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {!emailError && isValidDomain ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {emailError && (
                    <p className="mt-2 text-sm text-red-500">
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={verifyPinCodeAndSendToNewEmail}
                  className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  disabled={loading || !newEmail || emailError || isValidatingDomain || !isValidDomain}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Code...
                    </span>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Enter and verify OTP from new email */}
          {isNewEmailPinCodeSent && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-0 shadow-lg`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Verify New Email
                    </h4>
                    <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Enter the verification code sent to your new email
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsNewEmailPinCodeSent(false);
                      setNewEmail("");
                      setEnteredNewPinCode("");
                    }}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isDarkMode 
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {/* New Email Display */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} mb-6`}>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    New Email Address:
                  </span>
                  <p className={`mt-1 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {newEmail}
                  </p>
                </div>

                {/* OTP Input */}
                <div className="mb-6">
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={enteredNewPinCode}
                    onChange={(e) => setEnteredNewPinCode(e.target.value)}
                    placeholder="Enter 10 digit code"
                    maxLength={10}
                    className={`w-full px-4 py-2 rounded-lg transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } border focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-center tracking-wider`}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleSubmit}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={loading || !enteredNewPinCode}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Verify Code'
                    )}
                  </button>

                  <button
                    onClick={handleResendNewEmailOTP}
                    disabled={!canResend || loading}
                    className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
                  </button>
                </div>

                {/* Info Message */}
                <div className={`mt-6 p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50'
                } border ${isDarkMode ? 'border-gray-600' : 'border-blue-100'}`}>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                    <span className="font-medium">Note:</span> Please check your new email inbox for the verification code. If you do not see it, check your spam folder.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UpdateEmail;
