// app/candidatesDashboard/components/NotificationDropdown.jsx
import React from "react";

const NotificationDropdown = ({
	isOpen,
	toggleDropdown,
	notification,
	isDarkMode,
	openExamModal,
	openJobOfferModal,
	openCancelJobAppliedModal,
}) => {
	return (
		isOpen && (
			<div
				className={`absolute top-14 w-96 right-0 z-50 ${
					isDarkMode ? "bg-gray-800" : "bg-white"
				} rounded-lg shadow-2xl`}
			>
				{/* Header */}
				<div className="p-4 border-b border-gray-200">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div
								className={`w-6 h-6 ${
									isDarkMode ? "text-[#188C54]" : "text-[#188C54]"
								}`}
							>
								{/* Updated Icon */}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="w-full h-full"
								>
									<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
									<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
								</svg>
							</div>
							<div>
								<h3
									className={`text-xl font-semibold ${
										isDarkMode ? "text-[#188C54]" : "text-[#0A6338]"
									}`}
								>
									Notifications
								</h3>
								<p
									className={`text-sm ${
										isDarkMode ? "text-[#93B1A6]" : "text-[#0A6338]"
									}`}
								>
									Earlier Today
								</p>
							</div>
						</div>
						<button
							onClick={toggleDropdown}
							className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5 text-gray-600"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M18 6L6 18M6 6l12 12"></path>
							</svg>
						</button>
					</div>
				</div>

				{/* Notification List */}
				<div className="max-h-[600px] overflow-y-auto scrollbar-custom">
					<div className="p-4 space-y-4">
						{notification.length > 0 ? (
							notification.map((result, index) => (
								<div
									key={index}
									onClick={() => {
										/* Handle notification click logic */
									}}
									className={`group relative rounded-lg transition-all duration-200 hover:scale-[1.01] cursor-pointer ${
										isDarkMode
											? "bg-[#101010] text-green-200"
											: "bg-[#0A6338] text-white"
									} hover:shadow-lg`}
								>
									<div className="p-4 space-y-3 shadow-sm hover:shadow-md">
										{/* Header with Logo and Date */}
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="h-10 w-10 rounded-full bg-white p-1 flex items-center justify-center shadow-sm">
													<img
														src="/assets/images/delMontes.png"
														alt="Del Monte Logo"
														className="h-8 w-auto object-contain"
													/>
												</div>
												<div>
													<h4 className="text-xl font-semibold text-white">
														{result.jobM_title}
													</h4>
													<span className="inline-block px-2 py-1 text-xs bg-white/20 rounded-full mt-1">
														{result.status_name}
													</span>
												</div>
											</div>
											<span className="text-xs opacity-80">
												{result.notification_date}
											</span>
										</div>

										{/* Notification Message */}
										<p className="text-sm leading-relaxed opacity-90">
											{result.notification_message}
										</p>
									</div>
								</div>
							))
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-gray-500">
								<div className="w-12 h-12 mb-3 text-gray-300">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
									>
										<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
										<path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
									</svg>
								</div>
								<p className="text-base font-medium">No notifications yet</p>
								<p className="text-sm text-gray-400">
									We will notify you when something arrives
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		)
	);
};

export default NotificationDropdown;
