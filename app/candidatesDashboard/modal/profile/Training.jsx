import { Edit, Lock, Plus, Settings, Trash2, X } from "lucide-react";
import React from "react";
import ConfirmationModal from "../../components/ConfirmationModal";
import UpdateTraining from "../update/updateTraining";

const Training = ({
	profile,
	isDarkMode,
	setProfile,
	setLoading,
	session,
	showAddModal,
	setShowAddModal,
	handleDeleteClick,
	isModalOpen,
	setIsModalOpen,
	setSelectedTraining,
	selectedTraining,
	trainings,
	fetchTraining,
	handleEditTrainingClick,
	selectedIndex,
	setSelectedTrainingImage,
	setIsTrainingImageModalOpen,
  handleConfirmTrainingDelete,
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
					Training
				</h3>
				<button
					onClick={() => {
						setSelectedTraining({}); // Empty object for adding new skill
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
						<UpdateTraining
							showModal={showAddModal}
							setShowModal={setShowAddModal}
							train={selectedTraining}
							trainings={trainings}
							setProfile={setProfile}
							setLoading={setLoading}
							session={session}
							profile={profile}
							fetchTraining={fetchTraining}
							isDarkMode={isDarkMode}
						/>
					</div>
				</div>
			)}

			{Array.isArray(profile.training) && profile.training.length > 0 ? (
				profile.training.map((train, index) => (
					<div
						key={index}
						className="relative grid grid-cols-1 md:grid-cols-1 gap-4 pb-4"
					>
						<div className="relative">
							{/* Edit Icon Button */}
							<div className="absolute top-0 right-0">
								<button
									onClick={() => handleEditTrainingClick(train, index)}
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
									onClick={() => handleDeleteClick(train.training_id)}
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
									onConfirm={handleConfirmTrainingDelete}
									message="Are you sure you want to delete this Training record?"
								/>
							</div>

							<div
								className={`bg-gray-200 p-4 rounded-lg  shadow-lg ${
									isDarkMode ? "bg-gray-700 text-white" : ""
								}`}
							>
								<label
									className={`block text-sm font-normal ${
										isDarkMode ? "text-gray-300" : "text-gray-600"
									}`}
								>
									Training:
								</label>
								<p
									className={`font-semibold mt-1 ${
										isDarkMode ? "text-gray-200" : "text-gray-800"
									}`}
								>
									{train.perT_name || "N/A"}
								</p>

								{train.training_image && (
									<div className="mt-4">
										<label
											className={`block text-sm font-normal ${
												isDarkMode ? "text-gray-300" : "text-gray-600"
											}`}
										>
											Training Image:
										</label>
										<img
											src={`${process.env.NEXT_PUBLIC_API_URL}uploads/${train.training_image}`}
											alt={train.perT_name}
											className="mt-2 max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
											onClick={() => {
												setSelectedTrainingImage(train.training_image);
												setIsTrainingImageModalOpen(true);
											}}
										/>
									</div>
								)}
							</div>
						</div>

						{selectedIndex === index && showTrainingModal && (
							<div className="col-span-1 md:col-span-1 mt-4">
								<div className="bg-transparent rounded-lg p-6 w-full">
									<UpdateTraining
										showModal={showTrainingModal}
										setShowModal={setShowTrainingModal}
										train={selectedTraining}
										trainings={trainings}
										setProfile={setProfile}
										setLoading={setLoading}
										session={session}
										fetchTraining={fetchTraining}
									/>
								</div>
							</div>
						)}
					</div>
				))
			) : (
				<p>No Training available.</p>
			)}
		</div>
	);
};

export default Training;
