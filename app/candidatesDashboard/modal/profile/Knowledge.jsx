import { Edit, Lock, Plus, Settings, Trash2, X } from "lucide-react";
import React from "react";
import ConfirmationModal from "../../components/ConfirmationModal";
import UpdateKnowledge from "../update/updateKnowledge";

const Knowledge = ({
	profile,
	isDarkMode,
	fetchProfile,
	showAddModal,
	setShowAddModal,
	handleDeleteClick,
	isModalOpen,
	setIsModalOpen,
	showKnowledgeModal,
	setShowKnowledgeModal,
	selectedKnowlegde,
	setSelectedKnowledge,
	knowledges,
	fetchKnowledge,
	handleConfirmKnowledgeDelete,
	handleEditKnowledgeClick,
	selectedIndex,
}) => {
	console.log("Profile:", profile);
	return (
		<div className="p-4 space-y-4">
			<div className="flex items-center justify-center mb-4 sm:mb-6">
				<h3
					className={`text-xl font-semibold mb-4 ${
						isDarkMode ? "text-white" : "text-black"
					}`}
				>
					Knowledge
				</h3>
				<button
					onClick={() => {
						setSelectedKnowledge({}); // Empty object for adding new skill
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
						<UpdateKnowledge
							showModal={showAddModal}
							setShowModal={setShowAddModal}
							know={selectedKnowlegde}
							knowledges={knowledges}
							fetchProfile={fetchProfile}
							profile={profile}
							handleConfirmKnowledgeDelete={handleConfirmKnowledgeDelete}
							fetchKnowledge={fetchKnowledge}
						/>
					</div>
				</div>
			)}

			{Array.isArray(profile.knowledge) && profile.knowledge.length > 0 ? (
				profile.knowledge.map((know, index) => (
					<div
						key={index}
						className={`relative grid grid-cols-1 md:grid-cols-1 gap-4 pb-4 -b ${
							isDarkMode ? "-gray-700" : "-gray-300"
						}`}
					>
						<div className="relative">
							{/* Edit Icon Button */}
							<div className="absolute top-0 right-0">
								<button
									onClick={() => handleEditKnowledgeClick(know, index)}
									className={`p-2 rounded-full ${
										isDarkMode
											? "bg-gray-700 text-white hover:bg-gray-800"
											: "bg-gray-200 text-black hover:bg-gray-600"
									}`}
									title="Edit"
								>
									<Edit className="w-5 h-5" /> {/* Lucide Edit Icon */}
								</button>

								<button
									onClick={() => handleDeleteClick(know.canknow_id)}
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
									onConfirm={handleConfirmKnowledgeDelete}
									message="Are you sure you want to delete this Knowledge record?"
								/>
							</div>

							<div
								className={`bg-gray-200 p-4 rounded-lg  shadow-lg ${
									isDarkMode
										? "bg-gray-700 text-white"
										: "bg-gray-200 text-black"
								}`}
							>
								<label
									className={`block text-gray-600 text-sm font-normal ${
										isDarkMode ? "text-white" : "text-gray-600"
									}`}
								>
									Knowledge:
								</label>
								<p
									className={`text-gray-800 font-semibold mt-1 ${
										isDarkMode ? "text-white" : "text-gray-800"
									}`}
								>
									{know.knowledge_name || "N/A"}
								</p>
							</div>
						</div>

						{/* Modal */}
						{selectedIndex === index && showKnowledgeModal && (
							<div className="col-span-1 md:col-span-1 mt-4">
								<div
									className={`bg-transparent rounded-lg p-6 w-full ${
										isDarkMode ? "bg-gray-800" : ""
									}`}
								>
									<UpdateKnowledge
										showModal={showKnowledgeModal}
										setShowModal={setShowKnowledgeModal}
										know={selectedKnowlegde}
										knowledges={knowledges}
										fetchProfile={fetchProfile}
										handleConfirmKnowledgeDelete
										fetchKnowledge={fetchKnowledge}
									/>
								</div>
							</div>
						)}
					</div>
				))
			) : (
				<p>No Knowledge available.</p>
			)}
		</div>
	);
};

export default Knowledge;
