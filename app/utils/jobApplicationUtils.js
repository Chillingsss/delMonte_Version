import { toast } from "react-hot-toast";
import axios from "axios";
import { getDataFromSession, getDataFromCookie } from "./storageUtils";
import calculateCompletionPercentage from "../candidatesDashboard/components/CalculateCompletionPercentage";

export const handleJobApplication = async ({
	profile,
	setIsLoading,
	setError,
	setSuccess,
	setIsProfileModalOpen,
	setIsRedirecting,
	session,
	fetchAppliedJobs,
	fetchNotification,
	fetchJobs,
	onClosedd,
	resumeText,
	job,
}) => {
	setIsLoading(true);
	setError(null);
	setSuccess(null);

	if (
		profile.candidateInformation.length === 0 ||
		profile.skills.length === 0 ||
		profile.employmentHistory.length === 0 ||
		profile.educationalBackground.length === 0 ||
		profile.resume.length === 0
	) {
		toast.error(
			<div className="flex flex-col items-center space-y-4 p-4 bg-red-50 rounded-xl shadow-lg max-w-md mx-auto text-center">
				<div>
					<p className="text-base font-semibold text-red-800 mb-2">
						Profile Incomplete
					</p>
					<p className="text-sm text-red-600 mb-3">
						Please complete your profile information before applying to this
						job. Ensure all required sections are filled out to proceed with
						your application.
					</p>
					<div className="w-full bg-red-200 rounded-full h-2.5 mb-3">
						<div
							className="bg-red-600 h-2.5 rounded-full"
							style={{
								width: `${calculateCompletionPercentage(profile)}%`,
								transition: "width 0.5s ease-in-out",
							}}
						></div>
					</div>
					<p className="text-xs text-red-700 mb-2">
						Profile Completion:{" "}
						{Math.round(calculateCompletionPercentage(profile))}%
					</p>
				</div>
				<button
					onClick={() => setIsProfileModalOpen(true)}
					className="w-full px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors duration-200"
				>
					Click here to Complete Profile
				</button>
			</div>,
			{
				duration: 4000,
				position: "top-center",
				style: {
					background: "transparent",
					boxShadow: "none",
					padding: "0",
				},
			}
		);
		return;
	}

	try {
		// First perform semantic analysis
		const semanticResponse = await fetch(
			"/api/semanticAnalysisResumeCandidate",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					text1: resumeText,
					text2: `${job.course_categoryName || ""}\n${
						job.jskills_text || ""
					}\n${job.jwork_responsibilities || ""}\n${job.perT_name || ""}\n${
						job.license_master_name || ""
					}`,
					threshold: 80,
				}),
			}
		);

		if (!semanticResponse.ok) {
			throw new Error(
				`Semantic analysis failed: ${semanticResponse.statusText}`
			);
		}

		const semanticResult = await semanticResponse.json();
		console.log("Semantic Analysis Result:", semanticResult);

		const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
		const getUserIdFromCookie = () => {
			const tokenData = getDataFromCookie("auth_token");
			return tokenData?.userId || null;
		};

		const userId = session?.user?.id || getUserIdFromCookie();
		const jobId = getDataFromSession("jobId");

		const formData = new FormData();
		formData.append("operation", "applyForJob");
		formData.append("user_id", userId);
		formData.append("jobId", jobId);

		// Append points from semantic analysis
		formData.append("educPoints", semanticResult.educPoints || 0);
		formData.append("empPoints", semanticResult.empPoints || 0);
		formData.append("skillPoints", semanticResult.skillPoints || 0);
		formData.append("trainingPoints", semanticResult.trainingPoints || 0);
		formData.append("licensePoints", semanticResult.licensePoints || 0);

		const response = await axios.post(url, formData);

		if (response.data.success) {
			setSuccess("You have successfully applied for the job!");

			// Show points breakdown in success toast
			toast.success(
				<div className="space-y-2">
					<p className="font-semibold">Application Submitted Successfully!</p>
					<div className="text-sm">
						<p>Qualification Match Scores:</p>
						<ul className="list-disc pl-4 mt-1">
							<li>Education: {Math.round(semanticResult.educPoints)}%</li>
							<li>Experience: {Math.round(semanticResult.empPoints)}%</li>
							<li>Skills: {Math.round(semanticResult.skillPoints)}%</li>
							<li>Training: {Math.round(semanticResult.trainingPoints)}%</li>
							<li>License: {Math.round(semanticResult.licensePoints)}%</li>
						</ul>
						{semanticResult.recommendations &&
							semanticResult.recommendations.length > 0 && (
								<div className="mt-2">
									<p className="font-semibold">Recommendations:</p>
									<ul className="list-disc pl-4 mt-1">
										{semanticResult.recommendations.map((rec, index) => (
											<li key={index}>{rec}</li>
										))}
									</ul>
								</div>
							)}
					</div>
				</div>,
				{ duration: 6000 }
			);

			if (fetchAppliedJobs) fetchAppliedJobs();
			if (fetchNotification) fetchNotification();
			if (fetchJobs) fetchJobs();

			setIsRedirecting(true);
			setTimeout(() => {
				setIsRedirecting(false);
				onClosedd();
			}, 10000);
		} else if (response.data.status === "duplicate") {
			toast(response.data.message, {
				icon: "⚠️",
				style: {
					border: "1px solid #FF0000",
					padding: "16px",
					color: "#FF0000",
				},
			});
		} else {
			throw new Error(response.data.error || "Failed to apply for the job.");
		}
	} catch (err) {
		setError(err.message);
		toast.error(err.message);
	} finally {
		setIsLoading(false);
	}
};
