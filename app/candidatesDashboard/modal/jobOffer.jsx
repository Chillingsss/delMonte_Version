import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Toaster, toast } from "react-hot-toast";
import { tailChase } from "ldrs";
import { getDataFromCookie } from "@/app/utils/storageUtils";
import {
	fetchAppliedJobs,
	fetchJobs,
	fetchNotification,
} from "@/app/utils/apiFunctions";

const JobOfferModal = ({
	jobOfferDetails,
	onClose,
	setAppliedJobs,
	setNotification,
	setUnreadNotificationCount,
	appId,
	setJobs,
	isDarkMode,
}) => {
	const { data: session } = useSession();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const [responseType, setResponseType] = useState("");

	useEffect(() => {
		if (typeof window === "undefined") return; // ✅ Safe check inside effect

		tailChase.register();
	}, []);

	if (!jobOfferDetails) return null;

	const handleResponse = async (status) => {
		try {
			const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
			const getUserIdFromCookie = () => {
				const tokenData = getDataFromCookie("auth_token");
				if (tokenData && tokenData.userId) {
					return tokenData.userId;
				}
				return null; // Return null if userId is not found or tokenData is invalid
			};
			const userId = session?.user?.id || getUserIdFromCookie();
			console.log("User ID:", userId);

			const jsonData = {
				job_offer_id: jobOfferDetails.joboffer_id,
				status: status,
				app_id: appId,
				cand_id: userId,
			};

			const formData = new FormData();
			formData.append("operation", "insertCandidateJobOfferResponse");
			formData.append("json", JSON.stringify(jsonData));

			const response = await fetch(url, {
				method: "POST",
				body: formData,
			});

			const data = await response.json();

			if (data.error) {
				console.error(data.error);
				toast.error(data.error);
			} else {
				setResponseType(status);

				fetchAppliedJobs(session, setAppliedJobs);

				fetchNotification(session, setNotification, setUnreadNotificationCount);

				fetchJobs(session, setJobs);

				setIsRedirecting(true);
				setTimeout(() => {
					setIsRedirecting(false);
					onClose();
				}, 5000);
			}
		} catch (error) {
			console.error("Error submitting response:", error);
			toast.error("Error submitting response: " + error.message);
		}
	};

	return (
		<div className="relative">
			<div
				className={`fixed inset-0 z-50 overflow-y-auto ${
					isDarkMode
						? "bg-black bg-opacity-50 backdrop-blur-[4px]"
						: "bg-black bg-opacity-50 backdrop-blur-[4px]"
				}`}
				aria-labelledby="modal-title"
				role="dialog"
				aria-modal="true"
			>
				<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
					<div
						className={`fixed inset-0 ${
							isDarkMode ? "bg-black" : "bg-gray-900"
						} bg-opacity-75 transition-opacity`}
						aria-hidden="true"
					></div>
					<span
						className="hidden sm:inline-block sm:align-middle sm:h-screen"
						aria-hidden="true"
					>
						&#8203;
					</span>
					<div
						className={`inline-block align-bottom ${
							isDarkMode ? "bg-gray-800" : "bg-white"
						} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full`}
					>
						<div
							className={`bg-${
								isDarkMode ? "gray-800" : "white"
							} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}
						>
							<div className="sm:flex sm:items-start">
								<div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
									<div className="flex justify-between items-center mb-4">
										<h3
											className={`text-lg sm:text-2xl leading-6 font-bold text-${
												isDarkMode ? "gray-300" : "gray-900"
											}`}
											id="modal-title"
										>
											Job Offer Details
										</h3>
										<button
											onClick={onClose}
											className={`text-${
												isDarkMode ? "gray-400" : "gray-400"
											} hover:text-${
												isDarkMode ? "gray-500" : "gray-500"
											} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${
												isDarkMode ? "indigo-500" : "indigo-500"
											}`}
										>
											<span className="sr-only">Close</span>
											<svg
												className="h-6 w-6"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												aria-hidden="true"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									</div>
									<div
										className={`mt-4 bg-${
											isDarkMode ? "gray-700" : "gray-50"
										} p-6 rounded-lg shadow-md`}
									>
										<h4
											className={`text-lg sm:text-xl font-semibold text-${
												isDarkMode ? "gray-200" : "gray-800"
											} mb-3`}
										>
											{jobOfferDetails.jobM_title}
										</h4>
										<div className="space-y-3 text-sm">
											<p className="flex justify-between">
												<span
													className={`font-medium text-${
														isDarkMode ? "gray-400" : "gray-700"
													}`}
												>
													Salary:
												</span>
												<span
													className={`text-${
														isDarkMode ? "gray-300" : "gray-600"
													}`}
												>
													{jobOfferDetails.joboffer_salary}
												</span>
											</p>
											<p className="flex justify-between">
												<span
													className={`font-medium text-${
														isDarkMode ? "gray-400" : "gray-700"
													}`}
												>
													Document:
												</span>
												<span
													className={`text-${
														isDarkMode ? "gray-300" : "gray-600"
													}`}
												>
													{jobOfferDetails.joboffer_document}
												</span>
											</p>
											<p className="flex justify-between">
												<span
													className={`font-medium text-${
														isDarkMode ? "gray-400" : "gray-700"
													}`}
												>
													Expiry Date:
												</span>
												<span
													className={`text-${
														isDarkMode ? "gray-300" : "gray-600"
													}`}
												>
													{new Date(
														jobOfferDetails.joboffer_expiryDate
													).toLocaleDateString()}
												</span>
											</p>

											<p className="flex justify-between">
												<span
													className={`font-medium text-${
														isDarkMode ? "gray-400" : "gray-700"
													}`}
												>
													Date:
												</span>
												<span
													className={`text-${
														isDarkMode ? "gray-300" : "gray-600"
													}`}
												>
													{new Date(
														jobOfferDetails.statusjobO_date
													).toLocaleDateString()}
												</span>
											</p>

											<p className="flex justify-between">
												<span
													className={`font-medium text-${
														isDarkMode ? "gray-400" : "gray-700"
													}`}
												>
													Status:
												</span>
												<span
													className={`text-${
														isDarkMode ? "gray-300" : "gray-600"
													}`}
												>
													{jobOfferDetails.jobofferS_name}
												</span>
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div
							className={`bg-${
								isDarkMode ? "gray-800" : "gray-50"
							} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}
						>
							<button
								type="button"
								onClick={() => handleResponse("accept")}
								className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-lg px-4 py-2 ${
									isDarkMode ? "bg-green-600" : "bg-green-600"
								} text-base font-medium text-white hover:${
									isDarkMode ? "bg-green-700" : "bg-green-700"
								} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${
									isDarkMode ? "green-500" : "green-500"
								} sm:ml-3 sm:w-auto sm:text-sm transition duration-200 ease-in-out transform hover:scale-105`}
							>
								Accept
							</button>
							<button
								type="button"
								onClick={() => handleResponse("decline")}
								className={`mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-lg px-4 py-2 ${
									isDarkMode ? "bg-red-600" : "bg-red-600"
								} text-base font-medium text-white hover:${
									isDarkMode ? "bg-red-700" : "bg-red-700"
								} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${
									isDarkMode ? "red-500" : "red-500"
								} sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition duration-200 ease-in-out transform hover:scale-105`}
							>
								Decline
							</button>
						</div>
					</div>
				</div>
				{isRedirecting && (
					<div className="fixed inset-0 bg-[#01472B] bg-opacity-90 flex items-center justify-center z-50">
						<div className="text-center">
							<l-tail-chase
								size="40"
								speed="2.1"
								color="#ffffff"
							></l-tail-chase>
							<p className="text-white text-xl font-semibold mt-4">
								{responseType === "accept"
									? "Congratulations!"
									: "Thank you for your response"}
							</p>
							<p className="text-green-300 mt-2">
								{responseType === "accept"
									? "We're preparing your onboarding details. Welcome aboard!"
									: "We appreciate your prompt response and wish you success in your future endeavors"}
							</p>
						</div>
					</div>
				)}
			</div>
			<Toaster position="bottom-left" />
		</div>
	);
};

export default JobOfferModal;
