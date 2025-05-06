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
				className={`absolute right-0 top-14 w-72 rounded-xl shadow-lg overflow-hidden z-50 backdrop-blur-sm
          ${isDarkMode ? "bg-gray-800/95" : "bg-white/95"}
          border ${isDarkMode ? "border-gray-700" : "border-gray-200"}
          transition-all duration-200 ease-in-out transform
        `}
			>
				{/* User Info Section with enhanced styling */}
				<div
					className={`p-5 ${isDarkMode ? "bg-gray-900/50" : "bg-gray-50/80"}`}
				>
					<div className="flex items-center gap-4">
						<div
							className={`w-12 h-12 rounded-full overflow-hidden border-2 
                ${isDarkMode ? "border-green-500/80" : "border-green-500"}
                transition-colors duration-200 shadow-md
              `}
						>
							{profile.candidateInformation?.cand_profPic ? (
								<img
									src={`${process.env.NEXT_PUBLIC_API_URL}uploads/${profile.candidateInformation.cand_profPic}`}
									alt="Profile"
									className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
								/>
							) : (
								<div
									className={`w-full h-full flex items-center justify-center 
                    ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}
                    transition-colors duration-200
                  `}
								>
									<span
										className={`text-base font-semibold 
                      ${isDarkMode ? "text-gray-300" : "text-gray-700"}
                    `}
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
								className={`font-medium text-base
                  ${isDarkMode ? "text-gray-200" : "text-gray-900"}
                `}
							>
								{profile.candidateInformation?.cand_firstname}{" "}
							</p>
							<p
								className={`text-sm mt-0.5
                  ${isDarkMode ? "text-gray-400" : "text-gray-600"}
                `}
							>
								Candidate
							</p>
						</div>
					</div>
				</div>

				{/* Menu Items with enhanced styling */}
				<div className="p-2 space-y-1">
					<button
						onClick={() =>
							handleViewProfileClick(profile.candidateInformation?.cand_id)
						}
						className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${
								isDarkMode
									? "hover:bg-gray-700/80 text-gray-200 hover:text-white"
									: "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
							}
            `}
					>
						<User className="w-4 h-4" />
						View Profile
					</button>

					<button
						onClick={toggleTheme}
						className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${
								isDarkMode
									? "hover:bg-gray-700/80 text-gray-200 hover:text-white"
									: "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
							}
            `}
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
						className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${
								isDarkMode
									? "hover:bg-gray-700/80 text-gray-200 hover:text-white"
									: "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
							}
            `}
					>
						<Lock className="w-4 h-4" />
						Security Settings
					</button>

					<div className="px-2 my-2 border-t border-gray-200 dark:border-gray-700" />

					<button
						onClick={handleLogout}
						className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${
								isDarkMode
									? "hover:bg-red-500/10 text-red-400 hover:text-red-300"
									: "hover:bg-red-50 text-red-600 hover:text-red-700"
							}
            `}
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
