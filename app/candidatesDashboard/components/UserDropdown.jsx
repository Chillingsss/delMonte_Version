// app/candidatesDashboard/components/UserDropdown.jsx
import React from "react";
import { User, Sun, Moon, Lock, LogOut } from "lucide-react";

const UserDropdown = ({
	isOpen,
	profile,
	handleViewProfileClick,
	toggleTheme,
	handleLogout,
	isDarkMode,
	handleClickSecuritySettings,
}) => {
	return (
		isOpen && (
			<div
				className={`absolute right-0 top-14 w-60 rounded-lg shadow-lg overflow-hidden z-50
                  ${isDarkMode ? "bg-gray-800" : "bg-white"}
                  border ${isDarkMode ? "border-gray-700" : "border-gray-200"}
                `}
			>
				{/* User Info Section */}
				<div className={`p-4 ${isDarkMode ? "bg-gray-900/50" : "bg-gray-50"}`}>
					<div className="flex items-center gap-3">
						<div
							className={`w-10 h-10 rounded-full overflow-hidden border-2 ${
								isDarkMode ? "border-green-600" : "border-green-500"
							}`}
						>
							{profile.candidateInformation?.cand_profPic ? (
								<img
									src={`${process.env.NEXT_PUBLIC_API_URL}uploads/${profile.candidateInformation.cand_profPic}`}
									alt="Profile"
									className="w-full h-full object-cover"
								/>
							) : (
								<div
									className={`w-full h-full flex items-center justify-center ${
										isDarkMode ? "bg-gray-700" : "bg-gray-100"
									}`}
								>
									<span
										className={`text-sm font-semibold ${
											isDarkMode ? "text-gray-300" : "text-gray-700"
										}`}
									>
										{profile.candidateInformation &&
											profile.candidateInformation.cand_firstname &&
											profile.candidateInformation.cand_firstname
												.split(" ")
												.map((name, index, arr) =>
													index === 0 || index === arr.length - 1
														? name.slice(0, 1).toUpperCase()
														: ""
												)
												.join("")}
									</span>
								</div>
							)}
						</div>
						<div>
							<p
								className={`font-medium ${
									isDarkMode ? "text-gray-200" : "text-gray-900"
								}`}
							>
								{profile.candidateInformation?.cand_firstname}{" "}
							</p>
							<p
								className={`text-xs ${
									isDarkMode ? "text-gray-400" : "text-gray-600"
								}`}
							>
								Candidate
							</p>
						</div>
					</div>
				</div>

				{/* Menu Items */}
				<div className="p-2">
					<button
						onClick={() =>
							handleViewProfileClick(profile.candidateInformation?.cand_id)
						}
						className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
							isDarkMode
								? "hover:bg-gray-700 text-gray-200"
								: "hover:bg-gray-100 text-gray-700"
						}`}
					>
						<User className="w-4 h-4" />
						View Profile
					</button>

					<button
						onClick={toggleTheme}
						className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
							isDarkMode
								? "hover:bg-gray-700 text-gray-200"
								: "hover:bg-gray-100 text-gray-700"
						}`}
					>
						{isDarkMode ? (
							<Sun className="w-4 h-4" />
						) : (
							<Moon className="w-4 h-4" />
						)}
						{isDarkMode ? "Light Mode" : "Dark Mode"}
					</button>

					<button
						onClick={() => handleClickSecuritySettings()}
						className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
							isDarkMode
								? "hover:bg-gray-700 text-gray-200"
								: "hover:bg-gray-100 text-gray-700"
						}`}
					>
						<Lock className="w-4 h-4" />
						Security Settings
					</button>

					<button
						onClick={handleLogout}
						className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
							isDarkMode
								? "hover:bg-gray-700 text-red-400"
								: "hover:bg-gray-100 text-red-600"
						}`}
					>
						<LogOut className="w-4 h-4" />
						Log Out
					</button>
				</div>
			</div>
		)
	);
};

export default UserDropdown;
