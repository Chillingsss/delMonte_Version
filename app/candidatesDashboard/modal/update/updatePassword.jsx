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
import { fetchProfiles } from "@/app/utils/apiFunctions";

const UpdatePassword = ({
	showModal,
	setShowModal,
	candidateEmail,
	setProfile,
	setLoading,
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
	const [loadings, setLoadings] = useState(false);
	const [requestLoading, setRequestLoading] = useState(false);
	const [requiresPassword, setRequiresPassword] = useState(true);
	const [passwordChecks, setPasswordChecks] = useState({
		length: false,
		uppercase: false,
		lowercase: false,
		number: false,
		specialChar: false,
		noSpace: false,
	});
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [isDarkMode, setIsDarkMode] = useState(() => {
		const savedTheme = localStorage.getItem("appearance");
		if (savedTheme === "dark") return true;
		if (savedTheme === "light") return false;
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	});
	const [resendTimer, setResendTimer] = useState(0);
	const [canResend, setCanResend] = useState(true);

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
				// console.log("User ID:", userId);

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
	}, []);

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

	// Check if passwords match
	const checkPasswordsMatch = (confirmPassword) => {
		setPasswordsMatch(password === confirmPassword);
	};

	const requestPinCode = async () => {
		if (requestLoading || !canResend) return;
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
				setResendTimer(60); // Start the 60-second timer
				setCanResend(false);
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

		setLoadings(true);

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
				fetchProfiles(session, setProfile, setLoading);
				setShowModal(false);
			} else {
				toast.error("Failed to update email/password.");
			}
		} catch (error) {
			console.error("Error updating email/password:", error);
			toast.error("An error occurred while updating.");
		} finally {
			setLoadings(false);
		}
	};

	return (
		<div className={`modal ${showModal ? "block" : "hidden"}`}>
			<div
				className={`modal-content ${
					isDarkMode ? "bg-gray-800" : "bg-gray-100"
				} p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-lg mx-auto relative border ${
					isDarkMode ? "border-gray-700" : "border-gray-200"
				}`}
			>
				<button
					onClick={() => setShowModal(false)}
					className={`absolute top-4 right-4 p-2 rounded-lg transition-all duration-200 ${
						isDarkMode
							? "hover:bg-gray-700 text-gray-400 hover:text-white"
							: "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
					}`}
				>
					<X className="w-5 h-5" />
				</button>

				<h3
					className={`text-xl font-semibold ${
						isDarkMode ? "text-white" : "text-gray-800"
					} mb-6`}
				>
					Update Password
				</h3>

				<form onSubmit={handleSubmit} className="space-y-6">
					{requiresPassword && (
						<div className="space-y-2">
							<label
								className={`block text-sm font-medium ${
									isDarkMode ? "text-gray-300" : "text-gray-700"
								}`}
							>
								Current Password
							</label>
							<div className="relative">
								<input
									type={showNewPassword ? "text" : "password"}
									value={currentPassword}
									onChange={(e) => setCurrentPassword(e.target.value)}
									placeholder="Enter your current password"
									className={`w-full px-4 py-2.5 rounded-lg transition-colors duration-200 ${
										isDarkMode
											? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
											: "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
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
									onClick={() => setShowNewPassword(!showNewPassword)}
								>
									{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							</div>
						</div>
					)}

					<div className="space-y-2">
						<button
							type="button"
							onClick={requestPinCode}
							className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
								!canResend && resendTimer > 0
									? isDarkMode
										? "bg-gray-700 text-gray-300"
										: "bg-gray-200 text-gray-600"
									: isDarkMode
									? "bg-blue-600 hover:bg-blue-700 text-white"
									: "bg-blue-500 hover:bg-blue-600 text-white"
							} disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${
								isDarkMode
									? "focus:ring-blue-500 focus:ring-offset-gray-800"
									: "focus:ring-blue-500 focus:ring-offset-white"
							}`}
							disabled={
								requestLoading ||
								loadings ||
								(!canResend && resendTimer > 0) ||
								(requiresPassword && !currentPassword)
							}
						>
							{requestLoading ? (
								<span className="flex items-center justify-center">
									<svg
										className="animate-spin -ml-1 mr-2 h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Sending OTP...
								</span>
							) : (
								<>
									{isPinCodeSent
										? resendTimer > 0
											? `Resend OTP (${resendTimer}s)`
											: "Resend OTP"
										: "Send OTP to Current Primary Email"}
								</>
							)}
						</button>

						{/* Info Section */}
						<div
							className={`flex items-start gap-3 p-4 rounded-lg ${
								isDarkMode
									? "bg-blue-900/20 border-blue-800/30"
									: "bg-blue-50 border-blue-100"
							} border`}
						>
							<svg
								className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
									isDarkMode ? "text-blue-400" : "text-blue-600"
								}`}
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clipRule="evenodd"
								/>
							</svg>
							<div className="space-y-1">
								<p
									className={`text-sm ${
										isDarkMode ? "text-blue-300" : "text-blue-700"
									}`}
								>
									<span className="font-medium">Security Note:</span> Updating
									your password requires verification of:
								</p>
								<ul
									className={`text-sm ${
										isDarkMode ? "text-blue-300" : "text-blue-700"
									} list-disc list-inside ml-1 space-y-1`}
								>
									<li>Your current password</li>
									<li>Your current primary email address</li>
								</ul>
							</div>
						</div>
					</div>

					{isPinCodeSent && (
						<div className="space-y-6 pt-2">
							<div className="space-y-2">
								<label
									className={`block text-sm font-medium ${
										isDarkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									New Password
								</label>
								<div className="relative">
									<input
										type={showNewPassword ? "text" : "password"}
										value={password}
										onChange={handlePasswordChange}
										placeholder="Enter your new password"
										className={`w-full px-4 py-2.5 rounded-lg transition-colors duration-200 ${
											isDarkMode
												? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
												: "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
										} border ${
											password
												? passwordValid
													? "border-green-500 focus:border-green-500"
													: "border-red-500 focus:border-red-500"
												: isDarkMode
												? "border-gray-600"
												: "border-gray-300"
										} focus:ring-2 focus:ring-opacity-20 focus:outline-none ${
											passwordValid
												? "focus:ring-green-500"
												: password
												? "focus:ring-red-500"
												: "focus:ring-blue-500"
										}`}
									/>
									<button
										type="button"
										className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-colors duration-200 ${
											isDarkMode
												? "text-gray-400 hover:text-gray-300 hover:bg-gray-600"
												: "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
										}`}
										onClick={() => setShowNewPassword(!showNewPassword)}
									>
										{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								</div>

								<ul className="space-y-1.5 mt-3">
									{Object.entries({
										length: "At least 8 characters",
										uppercase: "One uppercase letter",
										lowercase: "One lowercase letter",
										number: "One number",
										specialChar: "One special character (@$!%*?&)",
										noSpace: "No spaces allowed",
									}).map(([key, text]) => (
										<li
											key={key}
											className={`flex items-center text-sm ${
												passwordChecks[key]
													? isDarkMode
														? "text-green-400"
														: "text-green-600"
													: isDarkMode
													? "text-red-400"
													: "text-red-600"
											}`}
										>
											<span className="mr-2">
												{passwordChecks[key] ? "✓" : "×"}
											</span>
											{text}
										</li>
									))}
								</ul>
							</div>

							<div className="space-y-2">
								<label
									className={`block text-sm font-medium ${
										isDarkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Confirm Password
								</label>
								<input
									type="password"
									value={confirmPassword}
									onChange={(e) => {
										setConfirmPassword(e.target.value);
										checkPasswordsMatch(e.target.value);
									}}
									placeholder="Confirm your new password"
									className={`w-full px-4 py-2.5 rounded-lg transition-colors duration-200 ${
										isDarkMode
											? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
											: "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
									} border ${
										confirmPassword
											? passwordsMatch
												? "border-green-500 focus:border-green-500"
												: "border-red-500 focus:border-red-500"
											: isDarkMode
											? "border-gray-600"
											: "border-gray-300"
									} focus:ring-2 focus:ring-opacity-20 focus:outline-none ${
										passwordsMatch
											? "focus:ring-green-500"
											: confirmPassword
											? "focus:ring-red-500"
											: "focus:ring-blue-500"
									}`}
								/>
								{confirmPassword && (
									<p
										className={`text-sm mt-1.5 ${
											passwordsMatch
												? isDarkMode
													? "text-green-400"
													: "text-green-600"
												: isDarkMode
												? "text-red-400"
												: "text-red-600"
										}`}
									>
										{passwordsMatch
											? "✓ Passwords match"
											: "× Passwords do not match"}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<label
									className={`block text-sm font-medium ${
										isDarkMode ? "text-gray-300" : "text-gray-700"
									}`}
								>
									Verification Code
								</label>
								<input
									type="text"
									value={enteredPinCode}
									onChange={(e) => setEnteredPinCode(e.target.value)}
									placeholder="Enter the verification code"
									className={`w-full px-4 py-2.5 rounded-lg transition-colors duration-200 ${
										isDarkMode
											? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
											: "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
									} border focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-center tracking-wider`}
									maxLength={10}
									required
								/>
								<p
									className={`text-sm mt-1.5 ${
										isDarkMode ? "text-gray-400" : "text-gray-600"
									}`}
								>
									Enter the verification code sent to your email
								</p>
							</div>

							<div className="pt-2">
								<button
									type="submit"
									className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
										isDarkMode
											? "bg-green-600 hover:bg-green-700 text-white"
											: "bg-green-500 hover:bg-green-600 text-white"
									} disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${
										isDarkMode
											? "focus:ring-green-500 focus:ring-offset-gray-800"
											: "focus:ring-green-500 focus:ring-offset-white"
									}`}
									disabled={
										loadings ||
										!passwordValid ||
										!passwordsMatch ||
										!enteredPinCode
									}
								>
									{loadings ? (
										<span className="flex items-center justify-center">
											<svg
												className="animate-spin -ml-1 mr-2 h-4 w-4"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
											Updating...
										</span>
									) : (
										"Update Password"
									)}
								</button>
							</div>
						</div>
					)}
				</form>
			</div>
			<Toaster position="bottom-left" />
		</div>
	);
};

export default UpdatePassword;
