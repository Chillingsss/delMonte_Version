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
import { IoLogoGoogle } from "react-icons/io";
import { lineSpinner } from "ldrs";
import { Eye, EyeOff, XCircle } from "lucide-react";

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
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      lineSpinner.register();
    }
  }, []);

  useEffect(() => {
    const getUserLevelFromCookie = () => {
      const tokenData = getDataFromCookie("auth_token");
      return tokenData?.userLevel || null; // Return userId if found, otherwise null
    };

    const userLevel = session?.user?.userLevel || getUserLevelFromCookie(); // Prioritize session, fallback to cookie

    if (userLevel) {
      if (userLevel === "1.0") {
        router.push("/candidatesDashboard");
      } else if (userLevel === "100.0") {
        router.push("/admin/dashboard");
      }
    }
  }, [session, router]);

  const generateCaptcha = useCallback(() => {
    if (typeof window === "undefined") return; // Prevents running on the server

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 150;
    canvas.height = 50;

    ctx.fillStyle = "#EAE9E7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.strokeStyle = "#0E5A35";
      ctx.stroke();
    }

    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < 5; i++) {
      text += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#151513";
    for (let i = 0; i < text.length; i++) {
      const x = 20 + i * 25;
      const y = 30 + Math.random() * 10;
      const angle = (Math.random() - 0.5) * 0.4;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

    setCaptchaImage(canvas.toDataURL());
    setCaptchaText(text);
  }, []);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const showErrorToast = (message) => {
    toast(message, {
      duration: 4000,
      position: "bottom-left",
      style: {
        background: "#004F39", // Darker green for contrast
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

  const sanitizeInput = (input) => {
    return input.replace(/[^\w@.#$!%*?&-]/gi, ""); // Allow common special characters
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Standard email regex
  };

  const isValidPassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      password
    );
  };

  const preventSQLInjection = (input) => {
    return input.replace(/(--|;|')/g, ""); // Remove common SQL injection patterns
  };

  const handleLogin = (e) => {
    e.preventDefault();

    let sanitizedUsername = preventSQLInjection(
      sanitizeInput(username.trim().toLowerCase())
    );
    let sanitizedPassword = preventSQLInjection(sanitizeInput(password.trim()));

    if (!sanitizedUsername || !sanitizedPassword) {
      showErrorToast("⚠️ Please enter both username and password.");
      return;
    }

    if (!isValidEmail(sanitizedUsername)) {
      showErrorToast("🔒 Invalid Credentials.");
      return;
    }

    if (!isValidPassword(sanitizedPassword)) {
      showErrorToast("🔒 Invalid Credentials.");
      return;
    }

    setUsername(sanitizedUsername);
    setPassword(sanitizedPassword);

    generateCaptcha();
    setCaptchaInput("");
    setShowCaptcha(true);
  };

  const handleCaptchaValidation = async (e) => {
    e.preventDefault();

    if (captchaInput !== captchaText) {
      showErrorToast("❌ Incorrect CAPTCHA. Try again.");
      generateCaptcha();
      setCaptchaInput("");
      return;
    }

    setLoading(true);
    const response = await signIn("credentials", {
      redirect: false,
      username: sanitizeInput(username.trim().toLowerCase()),
      password: sanitizeInput(password.trim()),
    });

    setLoading(false);

    if (response?.error) {
      showErrorToast(`🔒 ${response.error}`);

      generateCaptcha();
      setCaptchaInput("");
      setUsername("");
      setPassword("");
      setShowCaptcha(false);
      setButtonText("Log In");
    } else {
      setIsRedirecting(true);
      const userLevel = response?.user?.userLevel;

      setTimeout(() => {
        if (userLevel === "1.0") {
          router.replace("/candidatesDashboard");
        } else if (userLevel === "100.0") {
          router.replace("/admin/dashboard");
        }
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAE9E7] flex items-center justify-center px-4">
      <div className="bg-[#EAE9E7] p-8 rounded-lg w-full max-w-4xl flex flex-col md:flex-row items-center">
        {/* Logo Section */}
        <div className="flex items-center justify-center w-full md:w-1/2 mb-6 md:mb-0 md:pl-8 order-1 md:order-2">
          <Image
            src="/assets/images/logoDelmonte.jpg"
            alt="Del Monte"
            width={500}
            height={500}
            className="rounded-2xl object-cover hidden md:block shadow-2xl" // Largest default shadow
          />
          <Image
            src="/assets/images/delmontes.png"
            alt="Del Monte"
            width={100}
            height={100}
            className="rounded-3xl object-cover block md:hidden top-0 h-auto w-auto"
            priority
          />
        </div>

        {/* Login Form */}
        <div className="flex flex-col justify-center w-full md:w-1/2 order-2 md:order-1">
          <h2
            className="text-3xl md:text-4xl font-bold text-[#004F39] mb-2 slide-up"
            style={{ fontFamily: "Courier New, monospace" }}
          >
            Del Monte
          </h2>
          <p className="text-gray-500 mb-6 slide-up">Log In to your account</p>

          {/* Show login form if user is NOT logged in */}
          {!session ? (
            <form
              onSubmit={showCaptcha ? handleCaptchaValidation : handleLogin}
            >
              <div className="mb-4">
                <label className="block text-gray-500 mb-2" htmlFor="username">
                  Email
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 rounded-md bg-transparent border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 slide-up text-[#151513]"
                  required
                  autoFocus
                  ref={usernameRef}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-500 mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 rounded-md bg-transparent border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 slide-up text-[#151513]"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              {showCaptcha && (
                <div className="mb-4">
                  <img src={captchaImage} alt="Captcha" />
                  <input
                    ref={captchaInputRef}
                    type="text"
                    placeholder="Enter captcha"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className={`w-full p-2 rounded-md bg-transparent border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 slide-up text-[#151513] ${
                      captchaInput === captchaText
                        ? "border-green-500 focus:ring-green-500"
                        : "border-red-500 focus:ring-red-500"
                    } slide-up`}
                    required
                    autoFocus
                  />
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-[#004F39] hover:bg-green-800 text-green-100 py-3 rounded-lg transition duration-200 slide-up"
                disabled={loading}
              >
                {loading ? "Logging in..." : buttonText}
              </button>
            </form>
          ) : (
            <div className="text-white">
              <l-line-spinner
                size="40"
                stroke="3"
                speed="1"
                color="#ffffff"
              ></l-line-spinner>
              <p className="text-green-200">You are already logged in.</p>
              <p className="mt-2">
                You are logged in as{" "}
                <span className="font-semibold">{session.user.email}</span>
              </p>
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
                className="flex items-center justify-center text-gray-500 text-base slide-up mt-4 cursor-pointer font-semibold py-3 rounded-lg w-full transition-colors duration-300 bg-transparent hover:bg-green-200 hover:text-gray-800 shadow-md"
              >
                <IoLogoGoogle className="mr-2 text-[#004F39]" size={24} />
                Login with Google
              </a>
              <div className="mt-4 text-gray-500 flex flex-col items-start">
                <p>
                  Do not have an account?{" "}
                  <Link
                    href="/signup"
                    className="ml-2 text-[#004F39] hover:underline slide-up"
                  >
                    Create account here
                  </Link>
                </p>
                <button
                  className="text-[#004F39] hover:underline slide-up mt-2"
                  onClick={() => setShowForgotPasswordModal(true)}
                >
                  Forgot Password?
                </button>
              </div>
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
          <div className="flex flex-col items-center bg-[#0E5A35] p-8 rounded-xl shadow-2xl transform animate-fade-in">
            <l-line-spinner
              size="48"
              stroke="3"
              speed="1.2"
              color="#ffffff"
            ></l-line-spinner>
            <div className="mt-6 text-center">
              <p className="text-white text-xl font-semibold animate-pulse">
                Redirecting to Dashboard...
              </p>
              <p className="text-green-200 text-sm mt-2">
                Please wait while we prepare your workspace
              </p>
            </div>
          </div>
        </div>
      )}

      <Toaster position="bottom-left" />
    </div>
  );
}
