import { Edit, Lock, Plus, Settings, Trash2, X } from "lucide-react";
import React from "react";
import ConfirmationModal from "../../components/ConfirmationModal";
import UpdateSkill from "../update/updateSkill";

const Skill = ({
	profile,
	isDarkMode,
	fetchProfile,
	showAddModal,
	setShowAddModal,
	handleDeleteClick,
	isModalOpen,
	setIsModalOpen,
  setSelectedSkill,
	selectedSkill,
	skills,
	fetchSkills,
  handleEditSkillClick,
	handleConfirmSkillDelete,
	showSkillModal,
	setShowSkillModal,
  setUpdateTrigger,
  selectedIndex,
}) => {
	console.log("Profile:", profile);
	return (
		<div className="p-4 space-y-4">
			<div className="flex items-center justify-center mb-4 sm:mb-6">
				<h3 className="text-xl font-semibold mb-4">Skills</h3>
				<button
					onClick={() => {
						setSelectedSkill({});
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
						<UpdateSkill
							showModal={showAddModal}
							setShowModal={setShowAddModal}
							skill={selectedSkill}
							// setUpdateTrigger={setUpdateTrigger}
							skills={skills}
							fetchProfile={fetchProfile}
							profile={profile}
							fetchSkills={fetchSkills}
						/>
					</div>
				</div>
			)}

			{Array.isArray(profile.skills) && profile.skills.length > 0 ? (
				profile.skills.map((skill, index) => (
					<div
						key={index}
						className="relative grid grid-cols-1 md:grid-cols-1 gap-4 pb-4"
					>
						<div className="absolute top-0 right-0">
							<button
								onClick={() => handleEditSkillClick(skill, index)}
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
								onClick={() => handleDeleteClick(skill.skills_id)}
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
								onConfirm={handleConfirmSkillDelete}
								message="Are you sure you want to delete this skill record?"
							/>
						</div>

						<div
							className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
								isDarkMode ? "bg-gray-700 text-white" : ""
							}`}
						>
							<label
								className={`block text-sm font-normal ${
									isDarkMode ? "text-white" : "text-gray-600"
								}`}
							>
								Skills:
							</label>
							<p
								className={`text-gray-800 font-semibold mt-1 ${
									isDarkMode ? "text-white" : ""
								}`}
							>
								{skill.perS_name || "N/A"}
							</p>
						</div>

						{/* Modal */}
						{selectedIndex === index && showSkillModal && (
							<div className="col-span-1 md:col-span-1 mt-4">
								<div className="bg-transparent rounded-lg p-6 w-full">
									<UpdateSkill
										showModal={showSkillModal}
										setShowModal={setShowSkillModal}
										selectedSkill={selectedSkill}
										setUpdateTrigger={setUpdateTrigger}
										skills={skills}
										fetchProfile={fetchProfile}
										profile={profile}
										fetchSkills={fetchSkills}
									/>
								</div>
							</div>
						)}
					</div>
				))
			) : (
				<p>No skills available.</p>
			)}
		</div>
	);
};

export default Skill;
