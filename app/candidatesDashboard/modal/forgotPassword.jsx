"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Check, Eye, EyeOff, X } from "lucide-react";

const ForgotPassword = ({ showModal, setShowModal, fetchProfile }) => {
  const [email, setEmail] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [enteredPinCode, setEnteredPinCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPinCodeSent, setIsPinCodeSent] = useState(false);
  const [candId, setCandId] = useState(null);
  const [admId, setAdmId] = useState(null);
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

  const modalRef = useRef(null);

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

  const showErrorToast = (message) => {
    toast(message, {
      duration: 4000,
      position: "bottom-left",
      style: {
        background: "#013220", // Darker green for contrast
        color: "#F8FAFC", // Light text for readability
        borderRadius: "10px",
        padding: "12px 16px",
        fontSize: "14px",
        fontWeight: "500",
        border: "1px solid #DC2626", // Red border for error emphasis
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow for depth
      },
    });
  };

  const showSuccessToast = (message) => {
    toast(message, {
      duration: 4000,
      position: "bottom-left",
      icon: <Check className="text-green-500 w-6 h-6" />,
      style: {
        background: "#065F46", // Dark green for success
        color: "#F8FAFC", // Light text for readability
        borderRadius: "10px",
        padding: "12px 16px",
        fontSize: "14px",
        fontWeight: "500",
        border: "1px solid #22C55E", // Green border for success emphasis
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow for depth
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
      console.log("Data:", data);

      if (data.pincode) {
        setPinCode(data.pincode);
        setIsPinCodeSent(true);
        setCandId(data.candId);
        setAdmId(data.admId);
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
          password: newPassword,
        })
      );

      console.log("Sending data:", {
        cand_id: candId,
        adm_id: admId,
        password: newPassword,
      });

      const response = await axios.post(url, formData);
      const data = response.data;

      console.log("data change:", data);

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
        className="modal-content bg-[#EAE9E7] p-5 rounded-lg shadow-lg w-96 relative" // Added relative positioning
      >
        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-800"
        >
          <X size={24} />{" "}
          {/* Use the X icon from Lucid React with a specified size */}
        </button>
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-2 rounded-md bg-transparent border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 slide-up text-[#151513]"
              required
            />
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={requestPinCode}
                className="p-2 rounded-lg bg-[#004F39] text-white"
                disabled={requestLoading}
              >
                {requestLoading ? "Sending..." : "SEND OTP"}
              </button>
              {/* <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg bg-red-500 text-white"
              >
                Cancel
              </button> */}
            </div>
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
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg bg-transparent text-[#151513] border border-[#151513] hover:bg-red-500 hover:text-white"
              >
                Cancel
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
