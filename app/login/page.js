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
	removeLocalData,
} from "../utils/storageUtils";
import ForgotPassword from "../candidatesDashboard/modal/forgotPassword";
import { IoLogoGoogle } from "react-icons/io";
import { lineSpinner } from "ldrs";
import { Eye, EyeOff, XCircle } from "lucide-react";
import TwoFactorAuthModal from "../components/TwoFactorAuthModal";
import ReCAPTCHA from "react-google-recaptcha";

export default function Login(user) {
	const { data: session } = useSession();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
	const router = useRouter();
	const [captchaVerified, setCaptchaVerified] = useState(false);
	const [showCaptcha, setShowCaptcha] = useState(false);
	const [buttonText, setButtonText] = useState("Log In");
	const [captchaLoading, setCaptchaLoading] = useState(false);
	const usernameRef = useRef(null);
	const captchaRef = useRef(null);
	const [isRedirecting, setIsRedirecting] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showTwoFAInput, setShowTwoFAInput] = useState(false);
	const [twoFACode, setTwoFACode] = useState("");
	const [twoFAEmail, setTwoFAEmail] = useState("");
	const [resendLoading, setResendLoading] = useState(false);

	useEffect(() => {
		if (typeof window !== "undefined") {
			lineSpinner.register();
		}
	}, []);

	useEffect(() => {
		const getUserLevelFromCookie = () => {
			const tokenData = getDataFromCookie("auth_token");
			return tokenData?.userLevel || null;
		};

		const userLevel = session?.user?.userLevel || getUserLevelFromCookie();

		if (userLevel) {
			setShowTwoFAInput(false);
			if (userLevel === "1.0") {
				router.push("/candidatesDashboard");
			} else if (userLevel === "100.0") {
				router.push("/admin/dashboard");
			} else if (userLevel === "50.0") {
				router.push("/manager/dashboard");
			} else if (userLevel === "20.0") {
				router.push("/supervisor/dashboard");
			} else if (userLevel === "10.0") {
				router.push("/analyst/dashboard");
			}
		} else if (session) {
			setShowTwoFAInput(true);
		}
	}, [session, router]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const savedUsername = getDataFromLocal("savedUsername");
			const savedPassword = getDataFromLocal("savedPassword");
			if (savedUsername) setUsername(savedUsername);
			if (savedPassword) setPassword(savedPassword);
		}
	}, []);

	const handleCaptchaChange = (value) => {
		setCaptchaVerified(!!value);
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		setCaptchaLoading(true);

		let sanitizedUsername = sanitizeInput(username.trim());
		let sanitizedPassword = sanitizeInput(password.trim());

		// Initial validation
		if (!sanitizedUsername || !sanitizedPassword) {
			showErrorToast("⚠️ Please enter both username and password.");
			setCaptchaLoading(false);
			return;
		}

		if (!isValidEmail(sanitizedUsername)) {
			showErrorToast("🔒 Invalid Email.");
			setCaptchaLoading(false);
			return;
		}

		const isDomainReal = await isDomainValid(sanitizedUsername);
		if (!isDomainReal) {
			showErrorToast("🔒 Invalid email domain.");
			setCaptchaLoading(false);
			return;
		}

		if (!isValidPassword(sanitizedPassword)) {
			showErrorToast("🔒 Invalid Credentials.");
			setCaptchaLoading(false);
			return;
		}

		// Show CAPTCHA after initial validation
		setUsername(sanitizedUsername);
		setPassword(sanitizedPassword);
		setShowCaptcha(true);
		setCaptchaVerified(false);
		setCaptchaLoading(false);
	};

	const handleCaptchaValidation = async (e) => {
		e.preventDefault();

		if (!captchaVerified) {
			showErrorToast("Please complete the reCAPTCHA verification");
			return;
		}

		setLoading(true);
		try {
			const response = await signIn("credentials", {
				redirect: false,
				username: sanitizeInput(username.trim()),
				password: sanitizeInput(password.trim()),
			});

			if (response?.ok) {
				storeDataInLocal("savedUsername", sanitizeInput(username.trim()));
				storeDataInLocal("savedPassword", sanitizeInput(password.trim()));

				setShowTwoFAInput(true);
				setShowCaptcha(false);
				if (response?.user?.twoFA) {
					showErrorToast("📧 Check your email for the 2FA code");
				} else {
					setIsRedirecting(true);
					handleRedirect(response?.user?.userLevel);
				}
			} else if (response?.error) {
				if (response.error === "2FA code sent to your email.") {
					setShowCaptcha(false);
					setShowTwoFAInput(true);
					showErrorToast("📧 Check your email for the 2FA code");
				} else {
					showErrorToast(`🔒 ${response.error}`);
					// Reset all fields
					setUsername("");
					setPassword("");
					setShowCaptcha(true);
					setCaptchaVerified(false);
					// Reset password field visibility
					setShowNewPassword(false);
					setShowCaptcha(false);
				}
			}
		} catch (error) {
			console.error("Login error:", error);
			showErrorToast("An error occurred during login");
			// Reset all fields here too in case of error
			setUsername("");
			setPassword("");
			setShowCaptcha(true);
			setCaptchaVerified(false);
			setShowNewPassword(false);
		} finally {
			setLoading(false);
		}
	};

	const handleTwoFASubmit = async (e) => {
		if (e) e.preventDefault();

		if (!twoFACode || twoFACode.length !== 6) {
			showErrorToast("Please enter a valid 6-digit code");
			return;
		}

		setLoading(true);
		try {
			const response = await signIn("credentials", {
				redirect: false,
				username: username,
				password: password,
				twoFACode: twoFACode,
			});

			if (response?.error) {
				showErrorToast(`🔒 ${response.error}`);
				setTwoFACode("");
			} else if (response?.ok) {
				setShowTwoFAInput(false);
				setIsRedirecting(true);
				handleRedirect(response?.user?.userLevel);
				removeLocalData("savedUsername");
				removeLocalData("savedPassword");
			}
		} catch (error) {
			console.error("2FA verification error:", error);
			showErrorToast("An error occurred during 2FA verification");
		} finally {
			setLoading(false);
		}
	};

	const handleResendCode = async () => {
		setResendLoading(true);
		try {
			const response = await signIn("credentials", {
				redirect: false,
				username: username,
				password: password,
				isResend: true,
			});

			if (response?.error) {
				showErrorToast(response.error);
			} else {
				showErrorToast("📧 New code sent to your email");
			}
		} catch (error) {
			console.error("Error resending code:", error);
			showErrorToast("Failed to resend code");
		} finally {
			setResendLoading(false);
		}
	};

	const handleRedirect = (userLevel) => {
		setTimeout(() => {
			if (userLevel === "1.0") {
				router.replace("/candidatesDashboard");
			} else if (userLevel === "100.0") {
				router.replace("/admin/dashboard");
			} else if (userLevel === "50.0") {
				router.replace("/manager/dashboard");
			} else if (userLevel === "20.0") {
				router.replace("/supervisor/dashboard");
			} else if (userLevel === "10.0") {
				router.replace("/analyst/dashboard");
			}
		}, 5000);
	};

	const handleClose2FAModal = () => {
		setShowTwoFAInput(false);
		setTwoFACode("");
	};

	const clearAuthData = async () => {
		if (typeof window !== "undefined") {
			document.cookie.split(";").forEach((cookie) => {
				const [name] = cookie.split("=");
				document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
				document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
			});
		}
		await signOut({ redirect: false });
	};

	const handleCancelLogin = async () => {
		await clearAuthData();
		setShowTwoFAInput(false);
		setIsRedirecting(false);
		setTwoFACode("");
		removeLocalData("savedUsername");
		removeLocalData("savedPassword");
		router.replace("/login");
		setUsername("");
		setPassword("");
		setShowCaptcha(false);
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

	const isDomainValid = async (email) => {
		const domain = email.split("@")[1];
		try {
			const response = await fetch(
				`https://dns.google/resolve?name=${domain}&type=MX`
			);
			const data = await response.json();
			return data.Answer?.length > 0; // If MX records exist, it's a valid email domain
		} catch {
			return false;
		}
	};

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
						className="text-2xl md:text-4xl font-bold text-[#004F39] mb-2 slide-up"
						style={{ fontFamily: "Courier New, monospace" }}
					>
						Del Monte
					</h2>
					<p className="text-gray-500 mb-6 slide-up">Log In to your account</p>

					<form
						onSubmit={
							showTwoFAInput
								? handleTwoFASubmit
								: showCaptcha
								? handleCaptchaValidation
								: handleLogin
						}
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
								onChange={(e) => {
									setUsername(e.target.value.slice(0, 50));
									if (showCaptcha) {
										setShowCaptcha(false);
										setCaptchaVerified(false);
									}
								}}
								className="w-full p-2 rounded-md bg-transparent border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 slide-up text-[#151513]"
								required
								autoFocus
								ref={usernameRef}
								maxLength={50} // Also limits input length
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
									onChange={(e) => {
										setPassword(e.target.value.slice(0, 30));
										if (showCaptcha) {
											setShowCaptcha(false);
											setCaptchaVerified(false);
										}
									}}
									className="w-full p-2 rounded-md bg-transparent border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 slide-up text-[#151513]"
									required
									maxLength={30} // Ensures no more than 30 characters
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
						{showCaptcha && !showTwoFAInput && (
							<div className="mb-4">
								<div className="bg-white p-4 rounded-lg shadow-md">
									<h3 className="text-lg font-semibold text-gray-700 mb-3">
										Verify that you are human
									</h3>
									<div className="flex justify-center">
										<ReCAPTCHA
											ref={captchaRef}
											sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
											onChange={handleCaptchaChange}
										/>
									</div>
								</div>
							</div>
						)}

						<button
							type="submit"
							className={`w-full py-3 rounded-lg transition duration-200 slide-up ${
								loading ||
								captchaLoading ||
								!username.trim() ||
								!password.trim() ||
								(showCaptcha && !captchaVerified)
									? "bg-gray-400 opacity-70 cursor-not-allowed flex items-center justify-center text-white"
									: "bg-[#004F39] hover:bg-green-800 text-green-100"
							}`}
							disabled={
								loading ||
								captchaLoading ||
								!username.trim() ||
								!password.trim() ||
								(showCaptcha && !captchaVerified)
							}
						>
							{loading || captchaLoading ? (
								<l-line-spinner
									size="24"
									stroke="3"
									speed="1.2"
									color="white"
								></l-line-spinner>
							) : (
								<div className="flex items-center justify-center">
									{showTwoFAInput
										? "Verifying..."
										: showCaptcha
										? "Continue"
										: "Log In"}
								</div>
							)}
						</button>
					</form>

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

			{showTwoFAInput && (
				<TwoFactorAuthModal
					showModal={showTwoFAInput}
					onClose={handleClose2FAModal}
					onSubmit={handleTwoFASubmit}
					onCancel={handleCancelLogin}
					loading={loading}
					twoFACode={twoFACode}
					setTwoFACode={setTwoFACode}
					onResendCode={handleResendCode}
					resendLoading={resendLoading}
				/>
			)}

			{/* Redirecting Loader */}
			{isRedirecting && (
				<div className="fixed inset-0 bg-[#01472B] bg-opacity-90 flex items-center justify-center z-20">
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
