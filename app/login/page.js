"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";
import {
  storeDataInSession,
  storeDataInCookie,
  getDataFromCookie,
  getDataFromSession,
  getDataFromLocal,
  storeDataInLocal,
} from "../utils/storageUtils";
import ForgotPassword from "../candidatesDashboard/modal/forgotPassword";
import { FcGoogle } from "react-icons/fc";
import { lineSpinner } from "ldrs";

lineSpinner.register();

export default function Login(user) {
  const { data: session } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const router = useRouter();
  const [captchaImage, setCaptchaImage] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [buttonText, setButtonText] = useState("Log In");
  const usernameRef = useRef(null);
  const captchaInputRef = useRef(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0); // Track failed attempts
  const [isLocked, setIsLocked] = useState(false); // Track if the login is locked

  // useEffect(() => {
  //   const getUserLevelFromCookie = () => {
  //     const tokenData = getDataFromCookie("auth_token");
  //     if (tokenData && tokenData.userLevel) {
  //       return tokenData.userLevel;
  //     }
  //     return null; // Return null if userId is not found or tokenData is invalid
  //   };

  //   const userLevel = getUserLevelFromCookie();
  //   console.log("User Level:", userLevel);

  //   switch (userLevel) {
  //     case "100":
  //     case "100.0":
  //       router.replace("/admin/dashboard");
  //       break;
  //     case "2":
  //       router.replace("/superAdminDashboard");
  //       break;
  //     case "supervisor":
  //       router.replace("/supervisorDashboard");
  //       break;
  //     case "1": // If stored as an integer, it will be "1" as a string
  //     case "1.0": // This covers cases where it might be stored as "1.0"
  //       router.replace("/candidatesDashboard");
  //       break;
  //     default:
  //       router.replace("/login");
  //   }
  // }, []);

  useEffect(() => {
    if (session?.user?.userLevel) {
      setIsRedirecting(true);
      setTimeout(() => {
        if (session.user.userLevel === "1.0") {
          router.push("/candidatesDashboard");
        } else if (session.user.userLevel === "100.0") {
          router.push("/admin/dashboard");
        }
      }, 2000);
    }
  }, [session, router]);

  const generateCaptcha = useCallback(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 150;
    canvas.height = 50;
    ctx.fillStyle = "#01472B";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < 5; i++) {
      text += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#FFFFFF";
    for (let i = 0; i < text.length; i++) {
      ctx.fillText(text[i], 20 + i * 25, 30 + Math.random() * 10);
    }

    setCaptchaImage(canvas.toDataURL());
    setCaptchaText(text);
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please enter both username and password.");
      return;
    }
    generateCaptcha();
    setCaptchaInput("");
    setShowCaptcha(true);
  };

  const handleCaptchaValidation = async (e) => {
    e.preventDefault();
    if (captchaInput !== captchaText) {
      toast.error("Incorrect CAPTCHA. Try again.");
      generateCaptcha();
      setCaptchaInput("");
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });
    setLoading(false);
    if (result?.error) {
      toast.error("Invalid credentials. Try again.");
    }
  };

  useEffect(() => {
    usernameRef.current.focus();
  }, []);

  useEffect(() => {
    const lockoutStatus = getDataFromLocal("isLocked");
    const lockoutTime = getDataFromLocal("lockoutTime");

    if (lockoutStatus === "true" && lockoutTime) {
      const timeElapsed = new Date().getTime() - parseInt(lockoutTime, 10);
      if (timeElapsed < 300000) {
        // 5 minutes in milliseconds
        setIsLocked(true);
        const remainingTime = 300000 - timeElapsed;
        setTimeout(() => {
          setIsLocked(false);
          storeDataInLocal("isLocked", "false");
          storeDataInLocal("lockoutTime", null);
        }, remainingTime);
      } else {
        storeDataInLocal("isLocked", "false");
        storeDataInLocal("lockoutTime", null);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#01472B] flex items-center justify-center px-4">
      <div className="bg-[#01472B] p-8 rounded-lg w-full max-w-4xl flex flex-col md:flex-row items-center">
        {/* Logo Section */}
        <div className="flex items-center justify-center w-full md:w-1/2 mb-8 md:mb-0 md:pl-8 order-1 md:order-2">
          <Image
            src="/assets/images/logoDelmonte.jpg"
            alt="Del Monte"
            width={500}
            height={500}
            className="rounded-3xl object-cover hidden md:block"
          />
          <Image
            src="/assets/images/delmontes.png"
            alt="Del Monte"
            width={100}
            height={100}
            className="rounded-3xl object-cover block md:hidden mb-6 top-0 h-auto w-auto"
            priority
          />
        </div>

        {/* Login Form */}
        <div className="flex flex-col justify-center w-full md:w-1/2 order-2 md:order-1">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 slide-up">
            Del Monte
          </h2>
          <p className="text-green-200 mb-6 slide-up">Log In to your account</p>

          {/* Show login form if user is NOT logged in */}
          {!session ? (
            <form
              onSubmit={showCaptcha ? handleCaptchaValidation : handleLogin}
            >
              <div className="mb-4">
                <label className="block text-green-200 mb-2" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#0E5A35] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 slide-up text-white"
                  required
                  autoFocus
                  ref={usernameRef}
                />
              </div>
              <div className="mb-4">
                <label className="block text-green-200 mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#0E5A35] placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 slide-up text-white"
                  required
                />
              </div>
              {showCaptcha && (
                <div className="mb-4">
                  <img src={captchaImage} alt="Captcha" className="mb-2" />
                  <input
                    type="text"
                    placeholder="Enter CAPTCHA"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="w-full p-3 bg-[#0E5A35] text-white"
                    ref={captchaInputRef}
                  />
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-[#0B864A] hover:bg-green-500 text-green-100 py-3 rounded-lg transition duration-200 slide-up"
                disabled={loading}
              >
                {loading ? "Logging in..." : buttonText}
              </button>
            </form>
          ) : (
            <div className="text-white">
              <p>Welcome, {session.user.name}!</p>
              <button
                onClick={() => signOut()}
                className="mt-4 text-green-300 hover:underline"
              >
                Logout
              </button>
            </div>
          )}

          {/* Google Login Button */}
          {!session && (
            <>
              <div className="flex items-center justify-center mt-4 slide-up">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-2 text-gray-500 text-sm">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <a
                href="http://localhost:3001/api/auth/google"
                className="flex items-center justify-center text-gray-100 text-base slide-up mt-4 cursor-pointer font-semibold py-3 rounded-lg w-full transition-colors duration-300 bg-transparent hover:bg-green-200 hover:text-gray-800 shadow-md"
              >
                <FcGoogle className="mr-2" size={24} />
                Login with Google
              </a>
            </>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <ForgotPassword
          showModal={showForgotPasswordModal}
          setShowModal={setShowForgotPasswordModal}
          candidateEmail={username}
        />
      )}

      {/* Redirecting Loader */}
      {isRedirecting && (
        <div className="fixed inset-0 bg-[#01472B] bg-opacity-90 flex items-center justify-center z-50">
          <p className="text-white text-xl font-semibold mt-4">
            Redirecting...
          </p>
        </div>
      )}

      <Toaster position="bottom-left" />
    </div>
  );
}
