import { Edit, Lock, Plus, Settings, Trash2, X } from "lucide-react";
import React from "react";
import UpdateEducBac from "../update/updateEducBac";
import ConfirmationModal from "../../components/ConfirmationModal";

const EducationalBackground = ({
	profile,
	isDarkMode,
	setProfile,
	setLoading,
	session,
	handleAddEducation,
	showAddModal,
	setShowAddModal,
	selectedEducation,
	courses,
	institutions,
	courseTypes,
	courseCategory,
	fetchCourses,
	fetchInstitutions,
	fetchCourseTypes,
	fetchCourseCategorys,
	handleEditClick,
	handleDeleteClick,
	handleEducationDeleteClick,
	isModalOpen,
	setIsModalOpen,
	selectedIndex,
	showModalUpdateEduc,
	setShowModalUpdateEduc,
	setSelectedDiplomaImage,
	setIsDiplomaImageModalOpen,
}) => {
	// console.log("Profile:", profile);
	return (
		<div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
			<div className="flex items-center justify-center mb-4 sm:mb-6">
				<h3
					className={`text-lg sm:text-xl font-semibold ${
						isDarkMode ? "text-white" : "text-gray-800"
					} sm:mb-6`}
				>
					Educational Background
				</h3>
				<button
					onClick={handleAddEducation}
					className={`p-2 rounded-lg ${
						isDarkMode
							? "text-white hover:bg-gray-700"
							: "text-gray-800 hover:bg-gray-200 border border-gray-300"
					} transform hover:scale-105 transition-all duration-300 ease-in-out ml-auto`}
				>
					<Plus className="w-5 h-5" />
				</button>
			</div>

			{/* Add Modal */}
			{showAddModal && (
				<UpdateEducBac
					showModalUpdateEduc={showAddModal}
					setShowModalUpdateEduc={setShowAddModal}
					selectedEducation={selectedEducation}
					courses={courses}
					institutions={institutions}
					courseTypes={courseTypes}
					courseCategory={courseCategory}
					setProfile={setProfile}
					setLoading={setLoading}
					session={session}
					fetchCourses={fetchCourses}
					fetchInstitutions={fetchInstitutions}
					fetchCourseTypes={fetchCourseTypes}
					profile={profile}
				/>
			)}

			{Array.isArray(profile.educationalBackground) &&
			profile.educationalBackground.length > 0 ? (
				profile.educationalBackground.map((education, index) => (
					<div
						key={index}
						className="relative grid grid-cols-1 gap-4 md:grid-cols-1 md:gap-6 pb-4 sm:pb-6"
					>
						<div className="relative">
							{/* Edit Icon Button */}
							<div className="absolute top-0 right-0">
								<button
									onClick={() => handleEditClick(education, index)}
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
									onClick={() => handleDeleteClick(education.educ_back_id)}
									className={`p-2 rounded-full ${
										isDarkMode
											? "bg-gray-700 text-white"
											: "bg-gray-200 text-black"
									} hover:bg-gray-800 hover:text-white`}
									title="Edit"
								>
									<Trash2 className="w-5 h-5" />
								</button>

								<ConfirmationModal
									isOpen={isModalOpen}
									onRequestClose={() => setIsModalOpen(false)}
									onConfirm={handleEducationDeleteClick}
									message="Are you sure you want to delete this educational background?"
								/>
							</div>

							{/* Course */}
							<div
								className={`bg-gray-200 p-3 sm:p-4 rounded-lg shadow-lg ${
									isDarkMode ? "bg-gray-700 text-white" : ""
								}`}
							>
								<label
									className={`block text-gray-600 text-sm font-normal ${
										isDarkMode ? "text-white" : ""
									}`}
								>
									Course:
								</label>
								<p
									className={`text-gray-800 font-semibold mb-5 mt-1 ${
										isDarkMode ? "text-white" : ""
									}`}
								>
									{education.courses_name || "N/A"}
								</p>
								<label
									className={`block text-gray-600 text-sm font-normal mt-2 ${
										isDarkMode ? "text-white" : ""
									}`}
								>
									Course Category:
								</label>
								<p
									className={`text-gray-800 font-semibold mb-5 mt-1 ${
										isDarkMode ? "text-white" : ""
									}`}
								>
									{education.course_categoryName || "N/A"}
								</p>
								<label
									className={`block text-gray-600 text-sm font-normal mt-2 ${
										isDarkMode ? "text-white" : ""
									}`}
								>
									Institution:
								</label>
								<p
									className={`text-gray-800 font-semibold mb-5 mt-1 ${
										isDarkMode ? "text-white" : ""
									}`}
								>
									{education.institution_name || "N/A"}
								</p>
								<label
									className={`block text-gray-600 text-sm font-normal mt-2 ${
										isDarkMode ? "text-white" : ""
									}`}
								>
									Date Graduated:
								</label>
								<p
									className={`text-gray-800 font-semibold mb-5 mt-1 ${
										isDarkMode ? "text-white" : ""
									}`}
								>
									{education.educ_dategraduate || "N/A"}
								</p>

								{/* Add Diploma Image Display */}
								{education.educ_diploma_path && (
									<div className="mt-4">
										<label
											className={`block text-gray-600 text-sm font-normal ${
												isDarkMode ? "text-white" : ""
											}`}
										>
											Diploma:
										</label>
										<img
											src={`${process.env.NEXT_PUBLIC_API_URL}uploads/diplomas/${education.educ_diploma_path}`}
											alt="Diploma"
											className="mt-2 max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
											onClick={() => {
												setSelectedDiplomaImage(education.educ_diploma_path);
												setIsDiplomaImageModalOpen(true);
											}}
										/>
									</div>
								)}
							</div>

							{/* Modal */}
							{selectedIndex === index && showModalUpdateEduc && (
								<div className="col-span-1 md:col-span-2 mt-4">
									<div className="bg-transparent rounded-lg p-6 w-full">
										<UpdateEducBac
											showModalUpdateEduc={showModalUpdateEduc}
											setShowModalUpdateEduc={setShowModalUpdateEduc}
											selectedEducation={selectedEducation}
											courses={courses}
											courseTypes={courseTypes}
											courseCategory={courseCategory}
											institutions={institutions}
											fetchProfile={fetchProfile}
											fetchCourses={fetchCourses}
											fetchInstitutions={fetchInstitutions}
											fetchCourseTypes={fetchCourseTypes}
											fetchCourseCategorys={fetchCourseCategorys}
										/>
									</div>
								</div>
							)}
						</div>
					</div>
				))
			) : (
				<p className="text-sm sm:text-base text-gray-600">
					No educational background available.
				</p>
			)}
		</div>
	);
};

export default EducationalBackground;
