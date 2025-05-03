import React from "react";
import {
	BriefcaseIcon,
	UsersIcon,
	CalendarIcon,
	UserIcon,
	XCircleIcon,
	CheckCircleIcon,
} from "lucide-react";

const JobList = ({
	loading,
	filteredJobs,
	appliedJobs,
	isDarkMode,
	handleDetailsClick,
}) => {
	return (
		<>
			{loading ? (
				<div className="flex items-center justify-center h-64 flex-col">
					<l-line-spinner
						size="40"
						stroke="3"
						speed="1"
						color={isDarkMode ? "#ffffff" : "#000000"}
					></l-line-spinner>
					<p
						className={`mt-2 ${
							isDarkMode ? "text-green-300" : "text-gray-700"
						}`}
					>
						Please wait while we load your jobs
					</p>
				</div>
			) : filteredJobs.length === 0 ? (
				<p
					className={`text-center ${
						isDarkMode ? "text-gray-400" : "text-gray-500"
					}`}
				>
					No jobs match your search.
				</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredJobs.map((job, index) => (
						<div
							key={index}
							className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl ${
								isDarkMode
									? "bg-gray-800 text-gray-200"
									: "bg-white text-gray-800"
							}`}
						>
							<div
								className={`p-4 h-20 flex items-center justify-start ${
									isDarkMode ? "bg-[#004F39]" : "bg-[#004F39]"
								}`}
							>
								<BriefcaseIcon className="w-6 h-6 text-white mr-2" />
								<h3 className="text-xl font-semibold text-white truncate">
									{job.jobM_title}
								</h3>
							</div>

							<div className="p-4 space-y-4">
								<div className="flex items-center space-x-2 text-sm mt-4">
									<UsersIcon className="w-5 h-5 text-gray-400" />
									<span>{job.Total_Applied} Applicants</span>
									{job.Is_Applied !== 0 && (
										<span className="flex items-center">
											{(() => {
												const jobApplications = Array.isArray(appliedJobs)
													? appliedJobs.filter(
															(aj) => aj.jobM_id === job.jobM_id
													  )
													: [];
												const hasFailed =
													jobApplications.length > 0 &&
													jobApplications.some(
														(aj) => aj.status_name === "Failed Exam"
													);
												const hasReapply = jobApplications.some(
													(aj) => aj.status_name === "Reapply"
												);
												const hasCancelled = jobApplications.some(
													(aj) => aj.status_name === "Cancelled"
												);
												const hasApplied = jobApplications.some(
													(aj) => aj.status_name === "Applied"
												);
												const hasDeclinedOffer =
													jobApplications.length > 0 &&
													jobApplications.some(
														(aj) => aj.status_name === "Decline Offer"
													);
												const isEmployed =
													jobApplications.length > 0 &&
													jobApplications.some(
														(aj) => aj.status_name === "Employed"
													);
												const hasActiveStatus =
													jobApplications.length > 0 &&
													jobApplications.some((aj) =>
														[
															"Pending",
															"Processed",
															"Exam",
															"Interview",
															"Job Offer",
															"Background Check",
															"Decision Pending",
														].includes(aj.status_name)
													);

												if (isEmployed) {
													return (
														<>
															<UserIcon className="w-5 h-5 mr-1 text-blue-600" />
															Employed
														</>
													);
												} else if (hasDeclinedOffer) {
													return (
														<>
															<XCircleIcon className="w-5 h-5 mr-1 text-red-500" />
															Decline Offer
														</>
													);
												} else if (hasReapply && hasCancelled) {
													return (
														<>
															<XCircleIcon className="w-5 h-5 mr-1 text-red-500" />
															Cancelled
														</>
													);
												} else if (hasFailed) {
													return (
														<>
															<XCircleIcon className="w-5 h-5 mr-1 text-red-500" />
															Failed Exam
														</>
													);
												} else if (hasReapply && hasActiveStatus) {
													return (
														<>
															<CheckCircleIcon className="w-5 h-5 mr-1 text-blue-500" />
															Reapplied
														</>
													);
												} else if (hasReapply && hasDeclinedOffer) {
													return (
														<>
															<CheckCircleIcon className="w-5 h-5 mr-1 text-blue-500" />
															Reapplied
														</>
													);
												} else if (!hasReapply && hasActiveStatus) {
													return (
														<>
															<CheckCircleIcon className="w-5 h-5 mr-1 text-green-500" />
															Applied
														</>
													);
												}
											})()}
										</span>
									)}
								</div>

								<div className="flex items-center space-x-1 text-sm mb-5">
									<CalendarIcon className="w-5 h-5 text-gray-400" />
									<span>{job.jobM_createdAt}</span>
								</div>

								<button
									onClick={() => handleDetailsClick(job)}
									className={`w-full px-4 py-2 rounded-md font-semibold transition-colors duration-300 shadow-md ${
										isDarkMode
											? "bg-transparent hover:bg-[#004F39] text-gray-300 hover:text-gray-300 border-b-gray-300 border-b-2"
											: "bg-transparent hover:bg-[#004F39] text-gray-700 hover:text-gray-100 border-b-gray-300 border-b-2"
									}`}
								>
									View Details
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</>
	);
};

export default JobList;
