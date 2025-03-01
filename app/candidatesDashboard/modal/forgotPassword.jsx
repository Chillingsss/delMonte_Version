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
  const [admId, setAdmId] = useState(null);
  const [manId, setManId] = useState(null);
  const [supId, setSupId] = useState(null);
  const [analystId, setAnalystId] = useState(null);
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
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [targetNumber, setTargetNumber] = useState(Math.floor(Math.random() * 21) + 40);

  const modalRef = useRef(null);

  useEffect(() => {
    const storedPinData = getDataFromLocal('forgotPasswordPinData');
    if (storedPinData) {
      setPinCode(storedPinData.pinCode);
      setIsPinCodeSent(true);
      setCandId(storedPinData.candId);
      setAdmId(storedPinData.admId);
      setManId(storedPinData.manId);
      setSupId(storedPinData.supId);
      setAnalystId(storedPinData.analystId);
      setEmail(storedPinData.email);
    }
  }, []);

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setShowCaptcha(false);
    setCaptchaVerified(false);
    setSliderPosition(0);
    setTargetNumber(Math.floor(Math.random() * 21) + 40);
  };

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
          admId: data.admId,
          manId: data.manId,
          supId: data.supId,
          analystId: data.analystId,
          email: email
        };
        storeDataInLocal('forgotPasswordPinData', pinData);

        setPinCode(data.pincode);
        setIsPinCodeSent(true);
        setCandId(data.candId);
        setAdmId(data.admId);
        setManId(data.manId);
        setSupId(data.supId);
        setAnalystId(data.analystId);
        showSuccessToast("PIN code sent to your email.");
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
          adm_id: admId,
          man_id: manId,
          sup_id: supId,
          analyst_id: analystId,
          password: newPassword,
        })
      );

      const response = await axios.post(url, formData);
      const data = response.data;

      if (data.success) {
        showSuccessToast("Password updated successfully.");
        setShowModal(false);
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
    setAdmId(null);
    setManId(null);
    setSupId(null);
    setAnalystId(null);
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

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 ${
        showModal ? "" : "hidden"
      }`}
    >
      <div
        ref={modalRef}
        className="modal-content bg-[#EAE9E7] p-5 rounded-lg shadow-lg w-96 relative"
      >
        {!isPinCodeSent && (
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 text-gray-800"
          >
            <X size={24} />
          </button>
        )}
        <h3 className="text-xl font-semibold text-[#151513] mb-4">
          Reset Your Password
        </h3>
        {!isPinCodeSent ? (
          <div className="mb-4">
            <label className="block text-[#151513] text-sm font-normal mb-2">
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              className="w-full p-2 rounded-md bg-transparent border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 slide-up text-[#151513]"
              required
            />
            {!showCaptcha ? (
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={handleEmailContinue}
                  className="p-2 rounded-lg bg-[#004F39] text-white"
                >
                  Continue
                </button>
              </div>
            ) : (
              <>
                <div className="mt-4">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">
                      Verify that you are human
                    </h3>
                    <div className="space-y-4">
                      <div className="text-center text-gray-600">
                        Move the slider to {targetNumber}
                      </div>
                      <div className="relative">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={sliderPosition}
                          onChange={handleSliderChange}
                          onMouseUp={handleSliderComplete}
                          onTouchEnd={handleSliderComplete}
                          className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #004F39 0%, #004F39 ${sliderPosition}%, #e5e7eb ${sliderPosition}%, #e5e7eb 100%)`,
                          }}
                        />
                        <div className="absolute top-4 w-full flex justify-between text-xs text-gray-500">
                          <span>0</span>
                          <span>50</span>
                          <span>100</span>
                        </div>
                      </div>
                      <div className="text-center text-lg font-bold text-gray-700">
                        {sliderPosition}
                      </div>
                      {captchaVerified && (
                        <div className="text-green-600 text-center font-semibold">
                          ✓ Verification successful
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
                      className="p-2 rounded-lg bg-[#004F39] text-white"
                      disabled={requestLoading}
                    >
                      {requestLoading ? "Sending..." : "SEND OTP"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmitPasswordChange}>
            <div className="mb-4">
              <label className="block text-[#151513] text-sm font-normal">
                Enter PIN Code (sent to your email):
              </label>
              <input
                type="text"
                name="pinCode"
                value={enteredPinCode}
                onChange={(e) => setEnteredPinCode(e.target.value)}
                placeholder="Enter PIN Code"
                className="w-full p-2 rounded-md bg-transparent border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 slide-up text-[#151513]"
                required
              />
            </div>
            <div className="mb-4 relative">
              <label className="block text-[#151513] text-sm font-normal">
                New Password:
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 rounded-md bg-transparent border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 slide-up text-[#151513]"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff size={20} className="text-[#151513]" />
                  ) : (
                    <Eye size={20} className="text-[#151513]" />
                  )}
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
                    passwordChecks.uppercase ? "text-green-500" : "text-red-500"
                  }
                >
                  {passwordChecks.uppercase ? "✅" : "❌"} One uppercase letter
                </li>
                <li
                  className={
                    passwordChecks.lowercase ? "text-green-500" : "text-red-500"
                  }
                >
                  {passwordChecks.lowercase ? "✅" : "❌"} One lowercase letter
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
            <div className="mb-4 relative">
              <label className="block text-[#151513] text-sm font-normal">
                Confirm New Password:
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className={`w-full p-2 rounded-md bg-transparent border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 slide-up text-[#151513] ${
                    confirmPassword &&
                    (confirmPasswordValid
                      ? "border-green-500"
                      : "border-red-500")
                  }`}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} className="text-[#151513]" />
                  ) : (
                    <Eye size={20} className="text-[#151513]" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleCancelPasswordChange}
                className="p-2 rounded-lg bg-transparent text-[#151513] border border-[#151513] hover:bg-red-500 hover:text-white"
              >
                Cancel Password Change
              </button>
              <button
                type="submit"
                className="p-2 rounded-lg bg-green-500 text-white animation hover:bg-green-600"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save New Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
