import { Edit, Lock, Plus, Settings, Trash2, X } from "lucide-react";
import React from "react";
import ConfirmationModal from "../../components/ConfirmationModal";
import UpdateResume from "../update/updateResume";
import { FileText, Download } from "lucide-react";

const Resume = ({
	profile,
	isDarkMode,
	fetchProfile,
	showAddModal,
	setShowAddModal,
	handleDeleteClick,
	isModalOpen,
	setIsModalOpen,
	setSelectedResume,
	selectedResume,
	handleConfirmResumeDelete,
	handleEditResumeClick,
	selectedIndex,
	setSelectedResumeImage,
	setIsResumeImageModalOpen,
	showResumeModal,
	setShowResumeModal,
	getFileType,
	DocxPreview,
}) => {
	console.log("Profile:", profile);
	return (
		<div className="p-4 space-y-4">
			{/* Show Add New Resume button only if there are no resumes */}
			{Array.isArray(profile.resume) && profile.resume.length === 0 && (
				<div className="flex justify-between items-center mb-4 sm:mb-6">
					<h3 className="text-xl font-semibold mb-4">Resume</h3>
					<button
						onClick={() => {
							setShowAddModal(true);
							setSelectedResume({});
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
			)}

			{showAddModal && (
				<div className="col-span-1 md:col-span-1 mt-4">
					<div className="bg-transparent rounded-lg p-6 w-full">
						<UpdateResume
							showModal={showAddModal}
							setShowModal={setShowAddModal}
							res={selectedResume}
							fetchProfile={fetchProfile}
							profile={profile}
						/>
					</div>
				</div>
			)}

			{Array.isArray(profile.resume) && profile.resume.length > 0 ? (
				profile.resume.map((res, index) => (
					<div
						key={index}
						className="relative grid grid-cols-1 md:grid-cols-1 gap-4 pb-4 -b -gray-300"
					>
						<div className="relative">
							<div className="absolute top-0 right-0">
								<button
									onClick={() => handleEditResumeClick(res, index)}
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
									onClick={() => handleDeleteClick(res.canres_id)}
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
									onConfirm={handleConfirmResumeDelete}
									message="Are you sure you want to delete this Resume record?"
								/>
							</div>

							<div
								className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
									isDarkMode
										? "bg-gray-700 text-white"
										: "bg-gray-200 text-black"
								}`}
							>
								{res.canres_file && (
									<div className="mt-4">
										<label
											className={`block text-sm font-normal mb-2 ${
												isDarkMode ? "text-white" : "text-gray-600"
											}`}
										>
											Resume File:
										</label>
										{getFileType(res.canres_file) === "image" ? (
											// Image Preview
											<img
												src={`${process.env.NEXT_PUBLIC_API_URL}uploads/${res.canres_file}`}
												alt={res.canres_name}
												className="mt-2 max-w-full h-auto rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
												onClick={() => {
													setSelectedResumeImage(res.canres_file);
													setIsResumeImageModalOpen(true);
												}}
											/>
										) : getFileType(res.canres_file) === "pdf" ? (
											// PDF Preview
											<div className="mt-2 w-full h-[600px] rounded-lg overflow-hidden shadow-md">
												<iframe
													src={`${process.env.NEXT_PUBLIC_API_URL}uploads/${res.canres_file}`}
													className="w-full h-full"
													title="PDF Resume"
												/>
											</div>
										) : getFileType(res.canres_file) === "document" ? (
											// Document Preview using Google Docs Viewer
											<div className="mt-2 w-full h-[600px] rounded-lg overflow-hidden shadow-md">
												<iframe
													src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
														`${process.env.NEXT_PUBLIC_API_URL}uploads/${res.canres_file}`
													)}`}
													className="w-full h-full"
													title="Document Resume"
												/>
											</div>
										) : getFileType(res.canres_file) === "docx" ? (
											// DOCX Preview using Mammoth
											<div className="mt-2 w-full rounded-lg shadow-md p-4 bg-white">
												<DocxPreview
													fileUrl={`${process.env.NEXT_PUBLIC_API_URL}uploads/${res.canres_file}`}
												/>
											</div>
										) : (
											// Fallback for unsupported file types
											<div className="flex items-center space-x-2">
												<FileText className="w-6 h-6" />
												<a
													href={`${process.env.NEXT_PUBLIC_API_URL}uploads/${res.canres_file}`}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-500 hover:text-blue-700 underline"
												>
													Download Resume
												</a>
											</div>
										)}
									</div>
								)}
							</div>
						</div>

						{selectedIndex === index && showResumeModal && (
							<div className="col-span-1 md:col-span-1 mt-4">
								<div className="bg-transparent rounded-lg p-6 w-full">
									<UpdateResume
										showModal={showResumeModal}
										setShowModal={setShowResumeModal}
										res={selectedResume}
										fetchProfile={fetchProfile}
									/>
								</div>
							</div>
						)}
					</div>
				))
			) : (
				<p>No Resume available.</p>
			)}
		</div>
	);
};

export default Resume;
