"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

const ForgotPassword = ({ showModal, setShowModal, fetchProfile }) => {
  const [email, setEmail] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [enteredPinCode, setEnteredPinCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPinCodeSent, setIsPinCodeSent] = useState(false);
  const [candId, setCandId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);

  const modalRef = useRef(null);

  const passwordRegex = /^(?=.*\d).{8,}$/;

  const validatePassword = (password) => {
    return passwordRegex.test(password);
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

  const requestPinCode = async () => {
    if (requestLoading) return;
    setRequestLoading(true);

    if (!email) {
      toast.error("Please enter your email.");
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
        setPinCode(data.pincode);
        setIsPinCodeSent(true);
        setCandId(data.cand_id);
        toast.success("PIN code sent to your email.");
      } else if (data.error) {
        toast.error(data.error);
      } else {
        toast.error("Failed to send PIN code.");
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
      toast.error("Invalid PIN code.");
      return;
    }

    if (!passwordValid) {
      toast.error("Password does not meet the criteria.");
      return;
    }

    if (!confirmPasswordValid) {
      toast.error("Passwords do not match.");
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
          password: newPassword,
        })
      );

      const response = await axios.post(url, formData);
      const data = response.data;

      if (data.success) {
        toast.success("Password updated successfully.");
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
        className="modal-content bg-[#01472B] p-5 rounded-lg shadow-lg w-96 relative" // Added relative positioning
      >
        <button
          type="button"
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-300" // Positioned in the top right corner
        >
          <X size={24} />{" "}
          {/* Use the X icon from Lucid React with a specified size */}
        </button>
        <h3 className="text-xl font-semibold text-gray-100 mb-4">
          Reset Your Password
        </h3>
        {!isPinCodeSent ? (
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-normal mb-2">
              Email:
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg bg-[#0E5A35]  placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 slide-up text-white"
              required
            />
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={requestPinCode}
                className="p-2 rounded-lg bg-[#0B864A] text-white"
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
              <label className="block text-gray-600 text-sm font-normal">
                Enter PIN Code (sent to your email):
              </label>
              <input
                type="text"
                name="pinCode"
                value={enteredPinCode}
                onChange={(e) => setEnteredPinCode(e.target.value)}
                placeholder="Enter PIN Code"
                className="w-full p-3 rounded-lg bg-[#0E5A35]  placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 slide-up text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-600 text-sm font-normal">
                New Password:
              </label>
              <input
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter New Password"
                className={`w-full p-3 rounded-lg bg-[#0E5A35]  placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 slide-up text-white ${
                  newPassword
                    ? passwordValid
                      ? "border-green-500"
                      : "border-red-500"
                    : ""
                }`}
                required
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
              <label className="block text-gray-600 text-sm font-normal">
                Confirm New Password:
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="Confirm New Password"
                className={`w-full p-3 rounded-lg bg-[#0E5A35]  placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 slide-up text-white ${
                  confirmPassword
                    ? confirmPasswordValid
                      ? "border-green-500"
                      : "border-red-500"
                    : ""
                }`}
                required
              />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg bg-red-500 text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="p-2 rounded-lg bg-green-500 text-white"
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
