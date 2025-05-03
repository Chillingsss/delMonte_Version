import { Edit, Lock, Plus, Settings, Trash2, X } from "lucide-react";
import React from "react";
import ConfirmationModal from "../../components/ConfirmationModal";
import UpdateLicense from "../update/updateLicense";

const License = ({
	profile,
	isDarkMode,
	setProfile,
	setLoading,
	session,
	fetchProfile,
	showAddModal,
	setShowAddModal,
	handleDeleteClick,
	isModalOpen,
	setIsModalOpen,
	showLicenseModal,
	setShowLicenseModal,
	selectedLicense,
	setSelectedLicense,
	selectedIndex,
	licenses,
	fetchLicense,
	handleConfirmLicenseDelete,
	handleEditLicenseClick,
  licenseType
}) => {
	console.log("Profile:", profile);
	return (
		<div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
			<div className="flex justify-end items-center mb-4 sm:mb-6">
				<h3
					className={`text-lg sm:text-xl font-semibold ${
						isDarkMode ? "text-white" : "text-gray-800"
					} sm:mb-6`}
				>
					License
				</h3>
				<button
					onClick={() => {
						setSelectedLicense({});
						setShowAddModal(true);
					}}
					className={`p-2 rounded-lg ${
						isDarkMode
							? "text-white hover:bg-gray-700"
							: "text-gray-800 hover:bg-gray-200 border border-gray-300"
					} transform hover:scale-105 transition-all duration-300 ease-in-out ml-auto`}
				>
					<Plus className="w-5 h-5" />
				</button>
			</div>

			{showAddModal && (
				<div className="col-span-1 md:col-span-1 mt-4">
					<div className="bg-transparent rounded-lg p-6 w-full">
						<UpdateLicense
							showLicenseModal={showAddModal}
							setShowLicenseModal={setShowAddModal}
							selectedLicense={selectedLicense}
							licenses={licenses}
							licenseType={licenseType}
							setProfile={setProfile}
							setLoading={setLoading}
							session={session}
							profile={profile}
							fetchLicense={fetchLicense}
						/>
					</div>
				</div>
			)}

			{Array.isArray(profile.license) && profile.license.length > 0 ? (
				profile.license.map((lic, index) => (
					<div
						key={index}
						className="relative grid grid-cols-1 gap-4 md:grid-cols-1 md:gap-6 pb-4 sm:pb-6 -b -gray-300"
					>
						<div className="relative">
							<div className="absolute top-0 right-0">
								<button
									onClick={() => handleEditLicenseClick(lic, index)}
									className={`p-2 rounded-full ${
										isDarkMode
											? "bg-gray-700 text-white hover:bg-gray-800"
											: "bg-gray-200 text-black hover:bg-gray-600"
									}`}
									title="Edit"
								>
									<Edit className="w-5 h-5" />
								</button>

								<button
									onClick={() => handleDeleteClick(lic.license_id)}
									className={`p-2 rounded-full ${
										isDarkMode
											? "bg-gray-700 text-white hover:bg-gray-800"
											: "bg-gray-200 text-black hover:bg-gray-600"
									}`}
									title="Delete"
								>
									<Trash2 className="w-5 h-5" />
								</button>

								<ConfirmationModal
									isOpen={isModalOpen}
									onRequestClose={() => setIsModalOpen(false)}
									onConfirm={handleConfirmLicenseDelete}
									message="Are you sure you want to delete this License record?"
								/>
							</div>

							{/* License Name */}
							<div
								className={`bg-gray-200 p-3 sm:p-4 rounded-lg  shadow-lg ${
									isDarkMode
										? "bg-gray-700 text-white"
										: "bg-gray-200 text-black"
								}`}
							>
								<label
									className={`block text-sm font-normal ${
										isDarkMode ? "text-gray-300" : "text-gray-600"
									}`}
								>
									License name:
								</label>
								<p
									className={`font-semibold mt-1 mb-5 ${
										isDarkMode ? "text-gray-200" : "text-gray-800"
									}`}
								>
									{lic.license_master_name || "N/A"}
								</p>

								<label
									className={`block text-sm font-normal ${
										isDarkMode ? "text-gray-300" : "text-gray-600"
									}`}
								>
									License Type:
								</label>
								<p
									className={`font-semibold mt-1 mb-5 ${
										isDarkMode ? "text-gray-200" : "text-gray-800"
									}`}
								>
									{lic.license_type_name || "N/A"}
								</p>

								<label
									className={`block text-sm font-normal ${
										isDarkMode ? "text-gray-300" : "text-gray-600"
									}`}
								>
									License number:
								</label>
								<p
									className={`font-semibold mt-1 mb-3 ${
										isDarkMode ? "text-gray-200" : "text-gray-800"
									}`}
								>
									{lic.license_number || "N/A"}
								</p>
							</div>

							{/* Modal */}
							{selectedIndex === index && showLicenseModal && (
								<div className="col-span-1 md:col-span-2 mt-4">
									<div className="bg-transparent rounded-lg p-6 w-full">
										<UpdateLicense
											showLicenseModal={showLicenseModal}
											setShowLicenseModal={setShowLicenseModal}
											selectedLicense={selectedLicense}
											licenses={licenses}
											licenseType={licenseType}
											setProfile={setProfile}
											setLoading={setLoading}
											session={session}
											fetchLicense={fetchLicense}
										/>
									</div>
								</div>
							)}
						</div>
					</div>
				))
			) : (
				<p className="text-sm sm:text-base text-gray-600">
					No licenses available.
				</p>
			)}
		</div>
	);
};

export default License;
