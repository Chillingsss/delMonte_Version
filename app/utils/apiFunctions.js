import axios from "axios";
import { getDataFromCookie } from "./storageUtils";

export const fetchProfiles = async (session, setProfile, setLoading) => {
	try {
		const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

		const getUserIdFromCookie = () => {
			if (typeof window !== "undefined") {
				// Check if running in the browser
				const tokenData = getDataFromCookie("auth_token");
				if (tokenData && tokenData.userId) {
					return tokenData.userId;
				}
			}
			return null; // Return null if userId is not found or tokenData is invalid
		};

		const userId = session?.user?.id || getUserIdFromCookie();
		console.log("User IDss:", userId);
		const jsonData = { cand_id: userId };

		const formData = new FormData();
		formData.append("operation", "getCandidateProfile");
		formData.append("json", JSON.stringify(jsonData));

		const response = await axios.post(url, formData);
		console.log("res", response.data);
		setProfile(response.data);
		setLoading(false);
	} catch (error) {
		setLoading(false);
	}
};

export const fetchJobs = async (session, setJobs) => {
	try {
		const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

		const getUserIdFromCookie = () => {
			if (typeof window !== "undefined") {
				const tokenData = getDataFromCookie("auth_token");
				if (tokenData && tokenData.userId) {
					return tokenData.userId;
				}
			}
			return null;
		};

		const userId = session?.user?.id || getUserIdFromCookie();
		console.log("User ID:", userId);

		const formData = new FormData();
		formData.append("operation", "getActiveJob");
		formData.append("json", JSON.stringify({ cand_id: userId }));

		const response = await axios.post(url, formData);

		if (Array.isArray(response.data)) {
			console.log("Setting jobs:", response.data);
			setJobs(response.data);
		} else {
			console.error("Invalid data format:", response.data);
		}
	} catch (error) {
		console.error(
			"Error fetching jobs:",
			error.response?.data || error.message || error
		);
	}
};

export const fetchAppliedJobs = async (session, setAppliedJobs) => {
	try {
		const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
		const getUserIdFromCookie = () => {
			if (typeof window !== "undefined") {
				const tokenData = getDataFromCookie("auth_token");
				if (tokenData && tokenData.userId) {
					return tokenData.userId;
				}
			}
			return null; // Return null if userId is not found or tokenData is invalid
		};
		const userId = session?.user?.id || getUserIdFromCookie();
		console.log("User ID:", userId);

		const formData = new FormData();
		formData.append("operation", "getAppliedJobs");
		formData.append("json", JSON.stringify({ cand_id: userId }));

		const response = await axios.post(url, formData);

		if (response.data.error) {
			console.error(response.data.error);
		} else {
			setAppliedJobs(response.data);
			console.log("Applied jobs:", response.data);
			// const passingpoints = response.data.passing_points;
			// localStorage.setItem("passing", passingpoints);
			// localStorage.setItem("app_id", response.data[0].app_id);
		}
	} catch (error) {
		console.error("Error fetching applied jobs:", error);
	}
};

export const fetchReappliedJobs = async (session, setReappliedJobs) => {
	try {
		const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
		const getUserIdFromCookie = () => {
			if (typeof window !== "undefined") {
				const tokenData = getDataFromCookie("auth_token");
				if (tokenData && tokenData.userId) {
					return tokenData.userId;
				}
			}
			return null; // Return null if userId is not found or tokenData is invalid
		};
		const userId = session?.user?.id || getUserIdFromCookie();
		console.log("User ID:", userId);

		const formData = new FormData();
		formData.append("operation", "getReappliedJobs");
		formData.append("json", JSON.stringify({ cand_id: userId }));

		const response = await axios.post(url, formData);

		if (response.data.error) {
			console.error(response.data.error);
		} else {
			setReappliedJobs(response.data);
			// console.log("Reapplied jobs:", response.data);
			// const passingpoints = response.data.passing_points;
			// localStorage.setItem("passing", passingpoints);
			// localStorage.setItem("app_id", response.data[0].app_id);
		}
	} catch (error) {
		console.error("Error fetching reapplied jobs:", error);
	}
};

export const fetchNotification = async (
	session,
	setNotification,
	setUnreadNotificationCount
) => {
	try {
		const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
		const getUserIdFromCookie = () => {
			if (typeof window !== "undefined") {
				const tokenData = getDataFromCookie("auth_token");
				if (tokenData && tokenData.userId) {
					return tokenData.userId;
				}
			}
			return null; // Return null if userId is not found or tokenData is invalid
		};
		const userId = session?.user?.id || getUserIdFromCookie();
		console.log("User ID:", userId);

		const formData = new FormData();
		formData.append("operation", "getNotification");
		formData.append("json", JSON.stringify({ cand_id: userId }));

		const response = await axios.post(url, formData);
		console.log("Notification response:", response.data);

		// Ensure response.data is an array
		const notifications = Array.isArray(response.data) ? response.data : [];
		setNotification(notifications);

		// Calculate unread notifications
		const unreadCount = notifications.reduce((count, notif) => {
			return count + (notif.notification_read === 0 ? 1 : 0);
		}, 0);

		setUnreadNotificationCount(unreadCount);
	} catch (error) {
		console.error("Error fetching notifications:", error);
		setNotification([]);
		setUnreadNotificationCount(0);
	}
};

export const fetchExamResult = async (session, setExamResults) => {
	try {
		const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
		const getUserIdFromCookie = () => {
			if (typeof window !== "undefined") {
				const tokenData = getDataFromCookie("auth_token");
				if (tokenData && tokenData.userId) {
					return tokenData.userId;
				}
			}
			return null; // Return null if userId is not found or tokenData is invalid
		};
		const userId = session?.user?.id || getUserIdFromCookie();
		console.log("User ID:", userId);

		const formData = new FormData();
		formData.append("operation", "fetchExamResult");
		formData.append("json", JSON.stringify({ cand_id: userId }));
		const examResultsResponse = await axios.post(url, formData);

		console.log("exam result", examResultsResponse.data);

		setExamResults(examResultsResponse.data);
	} catch (error) {
		console.error("Error fetching data:", error);
	}
};

export const fetchJobOffer = async (session, jobMId, setJobOfferDetails, setIsJobOfferModalOpen) => {
	try {
		const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
		const getUserIdFromCookie = () => {
			if (typeof window !== "undefined") {
				const tokenData = getDataFromCookie("auth_token");
				if (tokenData && tokenData.userId) {
					return tokenData.userId;
				}
			}
			return null; // Return null if userId is not found or tokenData is invalid
		};
		const userId = session?.user?.id || getUserIdFromCookie();
		console.log("User ID:", userId);

		const data = {
			cand_id: userId,
			jobM_id: jobMId,
		};

		console.log("jobMId", jobMId);
		const formData = new FormData();
		formData.append("operation", "getJobOffer");
		formData.append("json", JSON.stringify(data));

		console.log("formData", data);

		const response = await axios.post(url, formData);

		console.log("Job offer response:", response.data);

		if (response.data.error) {
			console.error(response.data.error);
		} else {
			const jobOffer = response.data[0];
			setJobOfferDetails(jobOffer);
			setIsJobOfferModalOpen(true);
		}
	} catch (error) {
		console.error("Error fetching job offer:", error);
	}
};
