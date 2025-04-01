import { Edit, Lock, Plus, Settings, Trash2, X } from "lucide-react";
import React from "react";
import ConfirmationModal from "../../components/ConfirmationModal";
import UpdateEmpHis from "../update/updateEmpHis";

const EmploymentHistory = ({
	profile,
	isDarkMode,
	fetchProfile,
	showAddModal,
	setShowAddModal,
	handleDeleteClick,
	isModalOpen,
	setIsModalOpen,
	isEditingEmploymentInfo,
	setIsEditingEmploymentInfo,
	editData,
	handleChange,
	handleSaveEmploymentInfo,
	handleEditEmploymentClick,
	handleConfirmEmployementHistoryDelete,
}) => {
	console.log("Profile:", profile);
	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center justify-center mb-4 sm:mb-6">
				<h3
					className={`text-xl font-semibold ${
						isDarkMode ? "text-white" : "text-gray-800"
					} mb-6`}
				>
					Employment History
				</h3>
				<button
					onClick={() => {
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
						<UpdateEmpHis
							showModal={showAddModal}
							setShowModal={setShowAddModal}
							employment={""}
							fetchProfile={fetchProfile}
							profile={profile}
						/>
					</div>
				</div>
			)}

			{Array.isArray(profile.employmentHistory) &&
			profile.employmentHistory.length > 0 ? (
				profile.employmentHistory.map((employment, index) => (
					<div
						key={index}
						className="grid grid-cols-1 md:grid-cols-1 gap-4 pb-4"
					>
						<div className="relative">
							<div className="absolute top-0 right-0">
								{isEditingEmploymentInfo ? (
									<>
										<div className="flex space-x-2">
											<button
												onClick={handleSaveEmploymentInfo}
												className={`p-2 rounded-lg ${
													isDarkMode
														? "bg-green-700 text-white"
														: "bg-green-500 text-white"
												} flex items-center space-x-2`}
											>
												<Check className="w-4 h-4" />
												<span>Save</span>{" "}
											</button>
											<button
												onClick={() => setIsEditingEmploymentInfo(false)}
												className={`p-2 rounded-lg ${
													isDarkMode
														? "bg-red-700 text-white"
														: "bg-red-500 text-white"
												} flex items-center space-x-2`}
											>
												<X className="w-4 h-4" />
												<span>Cancel</span>{" "}
											</button>
										</div>
									</>
								) : (
									<>
										<button
											onClick={handleEditEmploymentClick}
											className={`p-2 rounded-full ${
												isDarkMode
													? "bg-gray-700 text-white"
													: "bg-gray-200 text-black"
											} hover:bg-gray-800 hover:text-white`}
											title="Edit"
										>
											<Edit className="w-5 h-5" />
										</button>

										<button
											onClick={() => handleDeleteClick(employment.empH_id)}
											className={`p-2 rounded-full ${
												isDarkMode
													? "bg-gray-700 text-white"
													: "bg-gray-200 text-black"
											} hover:bg-gray-800 hover:text-white`}
											title="Delete"
										>
											<Trash2 className="w-5 h-5" />
										</button>

										<ConfirmationModal
											isOpen={isModalOpen}
											onRequestClose={() => setIsModalOpen(false)}
											onConfirm={handleConfirmEmployementHistoryDelete}
											message="Are you sure you want to delete this employment record?"
										/>
									</>
								)}
							</div>

							<div
								className={`bg-gray-200 p-4 rounded-lg  shadow-lg ${
									isDarkMode ? "bg-gray-700 text-white" : ""
								}`}
							>
								<label
									className={`block text-sm font-normal ${
										isDarkMode ? "text-white" : "text-gray-600"
									}`}
								>
									Position Name:
								</label>
								{isEditingEmploymentInfo ? (
									<input
										type="text"
										name={`employmentHistory.${index}.empH_positionName`}
										value={
											editData.employmentHistory?.[index]?.empH_positionName ||
											employment.empH_positionName ||
											""
										}
										onChange={handleChange}
										className={`text-gray-800 font-semibold mt-1 w-full pb-2 bg-transparent ${
											isDarkMode ? "text-white" : ""
										}`}
									/>
								) : (
									<p
										className={`text-gray-800 font-semibold mt-1 mb-5 ${
											isDarkMode ? "text-white" : ""
										}`}
									>
										{employment.empH_positionName || "N/A"}
									</p>
								)}

								<label
									className={`block text-sm font-normal ${
										isDarkMode ? "text-white" : "text-gray-600"
									}`}
								>
									Company Name:
								</label>
								{isEditingEmploymentInfo ? (
									<input
										type="text"
										name={`employmentHistory.${index}.empH_companyName`}
										value={
											editData.employmentHistory?.[index]?.empH_companyName ||
											employment.empH_companyName ||
											"N/A"
										}
										onChange={handleChange}
										className={`text-gray-800 font-semibold mt-1 w-full pb-2 bg-transparent ${
											isDarkMode ? "text-white" : ""
										}`}
									/>
								) : (
									<p
										className={`text-gray-800 font-semibold mt-1 mb-5 ${
											isDarkMode ? "text-white" : ""
										}`}
									>
										{employment.empH_companyName || "N/A"}
									</p>
								)}

								<label
									className={`block text-sm font-normal ${
										isDarkMode ? "text-white" : "text-gray-600"
									}`}
								>
									Start Date:
								</label>
								{isEditingEmploymentInfo ? (
									<DatePicker
										selected={
											editData.employmentHistory?.[index]?.empH_startdate
												? new Date(
														editData.employmentHistory[index].empH_startdate
												  )
												: null
										}
										onChange={(date) =>
											handleChange({
												target: {
													name: `employmentHistory.${index}.empH_startdate`,
													value: date,
												},
											})
										}
										dateFormat="yyyy-MM-dd"
										className={`w-full mt-2 border-b-2 pb-2 bg-transparent px-2 py-2 z-50 ${
											isDarkMode ? "border-gray-400 text-white" : "border-black"
										} text-black`}
										placeholderText="Select start date"
										maxDate={new Date()}
										showYearDropdown
										showMonthDropdown
										scrollableYearDropdown
										scrollableMonthYearDropdown
										yearDropdownItemNumber={100} // Added for consistency
										isClearable
										customInput={
											<input
												className={`w-full mt-2 border-b-2 pb-2 bg-transparent ${
													isDarkMode
														? "border-gray-400 text-white"
														: "border-black"
												} text-black`}
											/>
										}
									/>
								) : (
									<p
										className={`text-gray-800 font-semibold mt-1 mb-5 ${
											isDarkMode ? "text-white" : ""
										}`}
									>
										{employment.empH_startdate
											? new Date(employment.empH_startdate).toLocaleDateString()
											: "N/A"}
									</p>
								)}

								<label
									className={`block text-sm font-normal ${
										isDarkMode ? "text-white" : "text-gray-600"
									}`}
								>
									End Date:
								</label>
								{isEditingEmploymentInfo ? (
									<DatePicker
										selected={
											editData.employmentHistory?.[index]?.empH_enddate
												? new Date(
														editData.employmentHistory[index].empH_enddate
												  )
												: null
										}
										onChange={(date) =>
											handleChange({
												target: {
													name: `employmentHistory.${index}.empH_enddate`,
													value: date,
												},
											})
										}
										dateFormat="yyyy-MM-dd"
										className={`text-gray-800 font-semibold mt-1 w-full pb-2 bg-transparent ${
											isDarkMode ? "text-white" : ""
										}`}
										placeholderText="Select end date"
										maxDate={new Date()}
										showYearDropdown
										showMonthDropdown
										scrollableYearDropdown
										scrollableMonthYearDropdown
										isClearable
										customInput={
											<input
												className={`w-full mt-2 border-b-2 pb-2 bg-transparent ${
													isDarkMode
														? "border-gray-400 text-white"
														: "border-black"
												} text-black`}
											/>
										}
									/>
								) : (
									<p
										className={`text-gray-800 font-semibold mt-1 mb-5 ${
											isDarkMode ? "text-white" : ""
										}`}
									>
										{employment.empH_enddate
											? new Date(employment.empH_enddate).toLocaleDateString()
											: "N/A"}
									</p>
								)}
							</div>
						</div>
					</div>
				))
			) : (
				<p>No employment history available.</p>
			)}
		</div>
	);
};

export default EmploymentHistory;
