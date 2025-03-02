"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { getDataFromLocal, removeLocalData, storeDataInLocal } from "@/app/utils/storageUtils";

const ForgotPassword = ({ showModal, setShowModal, fetchProfile }) => {
  const [email, setEmail] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [enteredPinCode, setEnteredPinCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPinCodeSent, setIsPinCodeSent] = useState(false);
  const [candId, setCandId] = useState(null);
  const [hrId, setHrId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    noSpace: false,
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [targetNumber, setTargetNumber] = useState(Math.floor(Math.random() * 21) + 40);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const modalRef = useRef(null);

  useEffect(() => {
    const storedPinData = getDataFromLocal('forgotPasswordPinData');
    if (storedPinData) {
      setPinCode(storedPinData.pinCode);
      setIsPinCodeSent(true);
      setCandId(storedPinData.candId);
      setHrId(storedPinData.hrId);
      setEmail(storedPinData.email);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  useEffect(() => {
    // Check if all conditions are met
    const isValid = 
      passwordValid && 
      confirmPasswordValid && 
      enteredPinCode === pinCode && 
      enteredPinCode !== "" && 
      Object.values(passwordChecks).every(Boolean) &&
      isEmailValid;
    
    setIsFormValid(isValid);
  }, [passwordValid, confirmPasswordValid, enteredPinCode, pinCode, passwordChecks, isEmailValid]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  const restrictedDomains = [
    'example.com',
    'test.com',
    'invalid.com',
    'temporary.com',
    'disposable.com'
  ];

  const validateEmail = async (email) => {
    setIsCheckingEmail(true);
    setEmailError("");
    setIsEmailValid(false);

    // Basic sanitization
    const sanitizedEmail = email.trim().toLowerCase();

    // Basic format check
    if (!emailRegex.test(sanitizedEmail)) {
      setEmailError("Please enter a valid email address");
      setIsCheckingEmail(false);
      return false;
    }

    // Check for restricted domains
    const domain = sanitizedEmail.split('@')[1];
    if (restrictedDomains.includes(domain)) {
      setEmailError("This email domain is not allowed");
      setIsCheckingEmail(false);
      return false;
    }

    try {
      // Check domain validity using the validateEmailDomain endpoint
      const response = await axios.post('/api/validateEmailDomain', {
        domain: domain // Send only the domain part
      });

      const isValid = response.data.isValid;
      setIsEmailValid(isValid);

      if (!isValid) {
        setEmailError("This email domain does not exist");
      }

      return isValid;
    } catch (error) {
      console.error("Error validating email domain:", error);
      setEmailError("Error validating email. Please try again.");
      setIsEmailValid(false);
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleEmailChange = async (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setShowCaptcha(false);
    setCaptchaVerified(false);
    setSliderPosition(0);
    setTargetNumber(Math.floor(Math.random() * 21) + 40);

    if (newEmail) {
      await validateEmail(newEmail);
    } else {
      setEmailError("Email is required");
      setIsEmailValid(false);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordValid(validatePassword(value));
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordValid(value === newPassword);
  };

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setSliderPosition(value);
  };

  const handleSliderComplete = () => {
    if (sliderPosition === targetNumber) {
      setCaptchaVerified(true);
      toast.success("CAPTCHA verified successfully!", {
        duration: 4000,
        position: "bottom-left",
        style: {
          background: "#065F46",
          color: "#F8FAFC",
          borderRadius: "10px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: "500",
          border: "1px solid #22C55E",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        },
      });
    } else {
      setCaptchaVerified(false);
      toast.error("Please match the exact number", {
        duration: 4000,
        position: "bottom-left",
        style: {
          background: "#013220",
          color: "#F8FAFC",
          borderRadius: "10px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: "500",
          border: "1px solid #DC2626",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        },
      });
      setSliderPosition(0);
    }
  };

  const handleEmailContinue = async () => {
    if (!email) {
      toast.error("⚠️ Please enter your email.", {
        duration: 4000,
        position: "bottom-left",
        style: {
          background: "#013220",
          color: "#F8FAFC",
          borderRadius: "10px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: "500",
          border: "1px solid #DC2626",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        },
      });
      return;
    }

    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const formData = new FormData();
      formData.append("operation", "checkEmailExists");
      formData.append("json", JSON.stringify({ email }));

      const response = await axios.post(url, formData);
      const data = response.data;

      if (data.exists) {
        setShowCaptcha(true);
        toast.success("Email verified successfully!", {
          duration: 4000,
          position: "bottom-left",
          style: {
            background: "#065F46",
            color: "#F8FAFC",
            borderRadius: "10px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "500",
            border: "1px solid #22C55E",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          },
        });
      } else {
        toast.error("Email not found. Please check your email address.", {
          duration: 4000,
          position: "bottom-left",
          style: {
            background: "#013220",
            color: "#F8FAFC",
            borderRadius: "10px",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: "500",
            border: "1px solid #DC2626",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          },
        });
      }
    } catch (error) {
      console.error("Error checking email:", error);
      toast.error("An error occurred while verifying email.", {
        duration: 4000,
        position: "bottom-left",
        style: {
          background: "#013220",
          color: "#F8FAFC",
          borderRadius: "10px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: "500",
          border: "1px solid #DC2626",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        },
      });
    }
  };

  const showErrorToast = (message) => {
    toast(message, {
      duration: 4000,
      position: "bottom-left",
      style: {
        background: "#013220",
        color: "#F8FAFC",
        borderRadius: "10px",
        padding: "12px 16px",
        fontSize: "14px",
        fontWeight: "500",
        border: "1px solid #DC2626",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
      },
    });
  };

  const showSuccessToast = (message) => {
    toast(message, {
      duration: 4000,
      position: "bottom-left",
      icon: <Check className="text-green-500 w-6 h-6" />,
      style: {
        background: "#065F46",
        color: "#F8FAFC",
        borderRadius: "10px",
        padding: "12px 16px",
        fontSize: "14px",
        fontWeight: "500",
        border: "1px solid #22C55E",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
      },
    });
  };

  const requestPinCode = async () => {
    if (requestLoading) return;
    setRequestLoading(true);
    setCanResend(false);
    setResendTimer(60);

    if (!email) {
      showErrorToast("⚠️ Please enter your email.");
      setRequestLoading(false);
      return;
    }

    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const formData = new FormData();
      formData.append("operation", "getPinCodeUpdate");
      formData.append("json", JSON.stringify({ email }));

      const response = await axios.post(url, formData);
      const data = response.data;

      if (data.pincode) {
        const pinData = {
          pinCode: data.pincode,
          candId: data.candId,
          hrId: data.hrId,
          email: email
        };
        storeDataInLocal('forgotPasswordPinData', pinData);

        setPinCode(data.pincode);
        setIsPinCodeSent(true);
        setCandId(data.candId);
        setHrId(data.hrId);
        showSuccessToast("PIN code sent to your email.");

        console.log("pincode", data.pincode);
      } else if (data.error) {
        showErrorToast(data.error);
      } else {
        showErrorToast("Failed to send PIN code.");
      }
    } catch (error) {
      console.error("Error requesting PIN code:", error);
      toast.error("An error occurred while requesting the PIN code.");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();

    if (enteredPinCode !== pinCode) {
      showErrorToast("Invalid PIN code.");
      return;
    }

    if (!passwordValid) {
      showErrorToast("Password does not meet the criteria.");
      return;
    }

    if (!confirmPasswordValid) {
      showErrorToast("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

      const formData = new FormData();
      formData.append("operation", "updatePassword");
      formData.append(
        "json",
        JSON.stringify({
          cand_id: candId,
          hr_id: hrId,
          password: newPassword,
        })
      );

      const response = await axios.post(url, formData);
      const data = response.data;

      if (data.success) {
        showSuccessToast("Password updated successfully.");
        setShowModal(false);
        removeLocalData('forgotPasswordPinData');
      } else if (data.error) {
        toast.error(data.error);
      } else {
        toast.error("Failed to update password.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("An error occurred while updating the password.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPasswordChange = () => {
    removeLocalData('forgotPasswordPinData');
    setIsPinCodeSent(false);
    setPinCode("");
    setEnteredPinCode("");
    setNewPassword("");
    setConfirmPassword("");
    setCandId(null);
    setHrId(null);
    setShowCaptcha(false);
    setCaptchaVerified(false);
    setSliderPosition(0);
    setTargetNumber(Math.floor(Math.random() * 21) + 40);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal, setShowModal]);

  const validatePassword = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[@$!%*?&]/.test(password),
      noSpace: !/\s/.test(password), // Check for absence of whitespace
    };
    setPasswordChecks(checks);
    return Object.values(checks).every(Boolean);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
        showModal ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        ref={modalRef}
        className="modal-content bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl w-[450px] relative transform transition-all duration-300 scale-100"
      >
        {!isPinCodeSent && (
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <X size={20} />
          </button>
        )}
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Reset Your Password
        </h3>
        {!isPinCodeSent ? (
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-normal mb-2">
              Email:
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your email"
                className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border ${
                  email
                    ? isEmailValid && !emailError
                      ? "border-green-500 focus:ring-green-500"
                      : "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-green-500"
                } focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
                required
              />
              {isCheckingEmail && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="animate-spin h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              {email && !isCheckingEmail && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isEmailValid && !emailError ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )}
                </div>
              )}
            </div>
            {emailError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{emailError}</p>
            )}
            {!showCaptcha ? (
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={handleEmailContinue}
                  disabled={!isEmailValid || emailError || isCheckingEmail}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 w-full ${
                    !isEmailValid || emailError || isCheckingEmail
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <span className="flex items-center justify-center w-full">Continue</span>
                </button>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-md space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Verify that you are human
                    </h3>
                    <div className="space-y-6">
                      <div className="text-center text-gray-700 dark:text-gray-300 font-medium">
                        Move the slider to {targetNumber}
                      </div>
                      <div className="relative pt-1">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={sliderPosition}
                          onChange={handleSliderChange}
                          onMouseUp={handleSliderComplete}
                          onTouchEnd={handleSliderComplete}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #059669 0%, #059669 ${sliderPosition}%, #e5e7eb ${sliderPosition}%, #e5e7eb 100%)`,
                          }}
                        />
                        <div className="absolute -bottom-6 w-full flex justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>0</span>
                          <span>50</span>
                          <span>100</span>
                        </div>
                      </div>
                      <div className="text-center text-xl font-bold text-gray-900 dark:text-white mt-8">
                        {sliderPosition}
                      </div>
                      {captchaVerified && (
                        <div className="flex items-center justify-center text-green-600 dark:text-green-400 font-medium space-x-2">
                          <Check size={20} />
                          <span>Verification successful</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-6">
                  {captchaVerified && (
                    <button
                      type="button"
                      onClick={requestPinCode}
                      className={`w-full px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2
                        ${requestLoading || !captchaVerified
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'}`}
                      disabled={requestLoading || !captchaVerified}
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
                        <span>Send OTP</span>
                      )}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmitPasswordChange}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-normal">
                Enter PIN Code (sent to your email):
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="pinCode"
                  value={enteredPinCode}
                  onChange={(e) => setEnteredPinCode(e.target.value)}
                  placeholder="Enter PIN Code"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                  required
                />
                <div className="mt-3 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={requestPinCode}
                    className={`text-sm transition-colors duration-200 flex items-center justify-center space-x-2
                      ${canResend && !requestLoading
                        ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-500'
                        : 'text-gray-400 cursor-not-allowed'}`}
                    disabled={!canResend || requestLoading}
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
                      <span>{canResend ? "Resend OTP" : `Resend OTP in ${formatTime(resendTimer)}`}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="mb-4 relative">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-normal">
                New Password:
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-white"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              <ul className="space-y-2 mt-4">
                {Object.entries(passwordChecks).map(([check, isValid]) => (
                  <li
                    key={check}
                    className={`flex items-center space-x-2 text-sm ${
                      isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {isValid ? (
                      <Check size={16} className="flex-shrink-0" />
                    ) : (
                      <X size={16} className="flex-shrink-0" />
                    )}
                    <span>
                      {check === 'length' && 'At least 8 characters'}
                      {check === 'uppercase' && 'One uppercase letter'}
                      {check === 'lowercase' && 'One lowercase letter'}
                      {check === 'number' && 'One number'}
                      {check === 'specialChar' && 'One special character (@$!%*?&)'}
                      {check === 'noSpace' && 'No spaces allowed'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-4 relative">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-normal">
                Confirm New Password:
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border transition-all duration-200 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                    confirmPassword
                      ? confirmPasswordValid
                        ? "border-green-500 focus:ring-green-500"
                        : "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-green-500"
                  }`}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-between space-x-4 mt-8">
              <button
                type="button"
                onClick={handleCancelPasswordChange}
                className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2
                  ${loading || !isFormValid
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-green-600 hover:bg-green-700 text-white'}`}
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span>Save New Password</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
