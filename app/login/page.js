"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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

  useEffect(() => {
    const userLevel = String(getDataFromSession("user_level")).trim(); // Convert to string and trim spaces

    console.log("userLevel:", userLevel); // Debugging output

    switch (userLevel) {
      case "100":
      case "100.0":
        router.replace("/admin/dashboard");
        break;
      case "2":
        router.replace("/superAdminDashboard");
        break;
      case "supervisor":
        router.replace("/supervisorDashboard");
        break;
      case "1": // If stored as an integer, it will be "1" as a string
      case "1.0": // This covers cases where it might be stored as "1.0"
        router.replace("/candidatesDashboard");
        break;
      default:
        router.replace("/login");
    }
  }, []);

  const generateCaptcha = useCallback(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 150;
    canvas.height = 50;

    ctx.fillStyle = "#01472B";
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
    ctx.fillStyle = "#FFFFFF";
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
  }, []);

  const handleLogin = async () => {
    if (!username.trim() && !password.trim()) {
      toast.error("Please enter both username and password.");
      return;
    }

    if (!username.trim()) {
      toast.error("Please enter your username.");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password.");
      return;
    }

    generateCaptcha();
    setCaptchaInput("");
    setShowCaptcha(true);

    setButtonText("Submit");
    setLoading(false);
  };

  const handleCaptchaValidation = async () => {
    if (isLocked) {
      toast.error("Too many failed attempts. Please try again later.");
      return;
    }

    if (!captchaInput) {
      toast.error("Please enter the captcha.");
      return;
    }

    if (captchaInput !== captchaText) {
      setFailedAttempts((prev) => prev + 1);
      toast.error("Invalid credentials. Please try again.");

      if (failedAttempts + 1 >= 3) {
        setIsLocked(true);
        storeDataInLocal("isLocked", true);
        storeDataInLocal("lockoutTime", new Date().getTime().toString());
        toast.error(
          "Too many failed attempts. You are locked out for 5 minutes."
        );

        setShowForgotPasswordModal(true);

        setTimeout(() => {
          setIsLocked(false);
          setFailedAttempts(0);
          storeDataInLocal("isLocked", false);
          storeDataInLocal("lockoutTime", null);
        }, 300000); // 5 minutes
      }

      generateCaptcha();
      setCaptchaInput("");
      setUsername("");
      setPassword("");
      setShowCaptcha(false);
      setButtonText("Log In");
      return;
    }

    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const formData = new FormData();
      formData.append("operation", "login");
      formData.append("json", JSON.stringify({ username, password }));

      const response = await axios.post(url, formData);

      if (response.data) {
        const user = response.data;

        setButtonText("Submit");
        setLoading(true);
        setIsRedirecting(true);

        const tokenData = {
          userId: user.adm_id || user.sup_id || user.cand_id,
          timestamp: new Date().getTime(),
          userLevel:
            user.adm_userLevel || user.sup_userLevel || user.cand_userLevel,
          type: user.adm_id
            ? "admin"
            : user.sup_id
            ? "supervisor"
            : "candidate",
        };

        console.log("Creating token with data:", tokenData);

        storeDataInCookie("auth_token", tokenData, 3600);

        if (user.adm_id) {
          storeDataInSession("user_id", user.adm_id);
          storeDataInSession("user_level", user.adm_userLevel);
          storeDataInCookie("name", user.adm_name || "", 3600);
          storeDataInCookie("email", user.adm_email || "", 3600);
        } else if (user.sup_id) {
          storeDataInSession("user_id", user.sup_id);
          storeDataInSession("user_level", user.sup_userLevel);
          storeDataInCookie("name", user.sup_name || "", 3600);
          storeDataInCookie("email", user.sup_email || "", 3600);
        } else {
          storeDataInSession("user_id", user.cand_id);
          storeDataInSession("user_level", user.cand_userLevel);
          storeDataInCookie(
            "name",
            `${user.cand_firstname || ""} ${user.cand_lastname || ""}`,
            3600
          );
        }

        // Redirect based on user type
        setTimeout(() => {
          if (user.adm_userLevel === "100.0") {
            router.push("/admin/dashboard");
          } else if (user.user_level_id === "superAdmin") {
            router.push("/superAdminDashboard");
          } else if (user.sup_userLevel === "supervisor") {
            router.push("/supervisorDashboard");
          } else {
            router.push("/candidatesDashboard");
          }
        }, 2000);
      } else {
        toast.error("Invalid Credentials. Please try again.");
        generateCaptcha();
        setCaptchaInput("");
        setUsername("");
        setPassword("");
        setShowCaptcha(false);
        setButtonText("Log In");
      }
    } catch (error) {
      toast.error("Error logging in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    usernameRef.current.focus();
  }, []);

  useEffect(() => {
    if (showCaptcha && captchaInputRef.current) {
      captchaInputRef.current.focus();
    }
  }, [showCaptcha]);

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

        <div className="flex flex-col justify-center w-full md:w-1/2 order-2 md:order-1">
          {/* <h1 className="text-2xl text-green-200 mb-2 slide-up">Welcome to</h1> */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 slide-up">
            Del Monte
          </h2>
          <p className="text-green-200 mb-6 slide-up">
            Log In to your existing account
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (buttonText === "Log In") {
                handleLogin();
              } else {
                handleCaptchaValidation();
              }
            }}
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
                <img src={captchaImage} alt="Captcha" />
                <input
                  ref={captchaInputRef}
                  type="text"
                  placeholder="Enter captcha"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className={`w-full p-3 rounded-lg bg-[#0E5A35] placeholder-gray-200 focus:outline-none focus:ring-2 ${
                    captchaInput === captchaText
                      ? "border-green-500 focus:ring-green-500"
                      : "border-red-500 focus:ring-red-500"
                  } slide-up text-white`}
                  required
                  autoFocus
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
          <div className="mt-4 text-white flex flex-col items-start">
            <p>
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="ml-2 text-green-300 hover:underline slide-up"
              >
                Create account here
              </Link>
            </p>
            <button
              className="text-green-300 hover:underline slide-up mt-2"
              onClick={() => setShowForgotPasswordModal(true)}
            >
              Forgot Password?
            </button>
            <a
              href="http://localhost:3001/api/auth/google"
              className="flex items-center justify-center text-gray-800 hover:underline slide-up mt-4 cursor-pointer bg-white  font-semibold py-2 px-4 rounded-lg shadow-md"
            >
              <FcGoogle className="mr-2" size={24} />
              Continue with Google
            </a>
          </div>
        </div>
      </div>

      {showForgotPasswordModal && (
        <ForgotPassword
          showModal={showForgotPasswordModal}
          setShowModal={setShowForgotPasswordModal}
          candidateEmail={username}
        />
      )}

      {isRedirecting && (
        <div className="fixed inset-0 bg-[#01472B] bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <l-line-spinner
              size="40"
              stroke="3"
              speed="1"
              color="#ffffff"
            ></l-line-spinner>
            <p className="text-white text-xl font-semibold mt-4">
              Redirecting...
            </p>
            <p className="text-green-300 mt-2">
              Please wait while we prepare your dashboard
            </p>
          </div>
        </div>
      )}

      <Toaster position="bottom-left" />
    </div>
  );
}
