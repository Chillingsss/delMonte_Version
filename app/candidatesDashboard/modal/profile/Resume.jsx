import { Edit, Plus, Trash2, X } from "lucide-react";
import React from "react";
import ConfirmationModal from "../../components/ConfirmationModal";
import UpdateResume from "../update/updateResume";
import { FileText, Download } from "lucide-react";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfWorker from "pdfjs-dist/build/pdf.worker.entry";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

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
}) => {
	console.log("Profile:", profile);

	const getFileType = (filename) => {
		const extension = filename.split(".").pop().toLowerCase();
		if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
			return "image";
		} else if (extension === "pdf") {
			return "pdf";
		} else if (extension === "docx") {
			return "docx";
		} else if (extension === "doc") {
			return "document";
		}
		return "unknown";
	};

	const extractTextFromPdf = async (fileUrl) => {
		try {
			const loadingTask = pdfjsLib.getDocument(fileUrl);
			const pdf = await loadingTask.promise;
			let extractedText = "";

			for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
				const page = await pdf.getPage(pageNum);
				const textContent = await page.getTextContent();
				const pageText = textContent.items.map((item) => item.str).join(" ");
				extractedText += pageText + "\n\n";
			}

			console.log("Extracted PDF Text:", extractedText);
			return extractedText;
		} catch (error) {
			console.error("Error extracting text from PDF:", error);
			throw error;
		}
	};

	const PdfPreview = ({ fileUrl }) => {
		const [text, setText] = React.useState("");
		const [loading, setLoading] = React.useState(true);
		const [error, setError] = React.useState(null);

		React.useEffect(() => {
			const loadPdf = async () => {
				try {
					setLoading(true);
					setError(null);
					const extractedText = await extractTextFromPdf(fileUrl);
					setText(extractedText);
					console.log("Extracted PDF Text:", extractedText);
				} catch (error) {
					setError("Failed to load PDF");
				} finally {
					setLoading(false);
				}
			};

			loadPdf();
		}, [fileUrl]);

		if (loading) {
			return <p>Loading PDF...</p>;
		}

		if (error) {
			return <p className="text-red-500">{error}</p>;
		}

		return (
			<div
				className={`p-4 rounded-lg shadow-md ${
					isDarkMode ? "bg-gray-700" : "bg-gray-100"
				}`}
			>
				<div className="flex justify-between items-center mb-4">
					<h2
						className={`text-xl font-semibold ${
							isDarkMode ? "text-white" : "text-gray-900"
						}`}
					>
						Resume Preview
					</h2>
					<a
						href={fileUrl}
						download
						className={`flex items-center px-4 py-2 rounded-lg ${
							isDarkMode
								? "bg-blue-600 hover:bg-blue-700"
								: "bg-blue-500 hover:bg-blue-600"
						} text-white transition-colors duration-200`}
					>
						<Download className="w-4 h-4 mr-2" />
						Download
					</a>
				</div>
				<p className="whitespace-pre-wrap">{text}</p>
			</div>
		);
	};

	// Add a new function to convert DOCX to text
	const convertDocxToText = async (fileUrl) => {
		try {
			console.log("Fetching DOCX from:", fileUrl);
			const response = await fetch(fileUrl, {
				credentials: "include",
				headers: {
					Accept:
						"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				},
			});

			if (!response.ok) {
				console.error(
					"Failed to fetch DOCX file:",
					response.status,
					response.statusText
				);
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const arrayBuffer = await response.arrayBuffer();
			console.log("File size:", arrayBuffer.byteLength, "bytes");

			if (arrayBuffer.byteLength === 0) {
				throw new Error("Empty file received");
			}

			const result = await mammoth.extractRawText({ arrayBuffer });

			if (!result.value) {
				throw new Error("No text content extracted");
			}

			console.log("Text extraction successful, length:", result.value.length);
			return result.value;
		} catch (error) {
			console.error("Detailed error in convertDocxToText:", error);
			if (error.messages) {
				console.error("Mammoth messages:", error.messages);
			}
			throw error; // Propagate the error to be handled by the component
		}
	};

	// Add a new DocxPreview component
	const DocxPreview = ({ fileUrl }) => {
		const [text, setText] = React.useState("");
		const [loading, setLoading] = React.useState(true);
		const [error, setError] = React.useState(null);

		React.useEffect(() => {
			const loadDocx = async () => {
				try {
					setLoading(true);
					setError(null);
					const extractedText = await convertDocxToText(fileUrl);

					if (!extractedText || extractedText.trim().length === 0) {
						throw new Error("No text content found in document");
					}

					setText(extractedText);
				} catch (error) {
					console.error("Error in DocxPreview:", error);
					setError(error.message || "Failed to load document");
					setText("");
				} finally {
					setLoading(false);
				}
			};

			loadDocx();
		}, [fileUrl]);

		if (loading) {
			return (
				<div
					className={`flex items-center justify-center py-4 ${
						isDarkMode ? "text-white" : "text-gray-900"
					}`}
				>
					<div
						className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
							isDarkMode ? "border-white" : "border-gray-900"
						}`}
					></div>
					<span className="ml-2">Loading document...</span>
				</div>
			);
		}

		if (error) {
			return (
				<div
					className={`text-center py-4 ${
						isDarkMode ? "text-red-400" : "text-red-500"
					}`}
				>
					<div className="mb-2">Error: {error}</div>
					<div
						className={`text-sm ${
							isDarkMode ? "text-gray-300" : "text-gray-600"
						}`}
					>
						Please ensure the document is a valid DOCX file and try again.
					</div>
				</div>
			);
		}

		return (
			<>
				<div className="flex justify-between items-center mb-4">
					<h2
						className={`text-xl font-semibold ${
							isDarkMode ? "text-white" : "text-gray-900"
						}`}
					>
						Resume Preview
					</h2>
					<a
						href={fileUrl}
						download
						className={`flex items-center px-4 py-2 rounded-lg ${
							isDarkMode
								? "text-gray-200 hover:text-blue-700"
								: "text-gray-800 hover:text-blue-600"
						} transition-colors duration-200`}
					>
						<Download className="w-4 h-4" />
					</a>
				</div>

				<div
					className={`mt-2 w-full rounded-lg shadow-md p-4 ${
						isDarkMode ? "bg-gray-800" : "bg-white"
					}`}
				>
					<div
						className={`p-6 whitespace-pre-wrap font-sans ${
							isDarkMode ? "bg-gray-800" : "bg-white"
						}`}
					>
						{text.split("\n\n").map((paragraph, index) => (
							<div
								key={index}
								className={`mb-4 ${
									isDarkMode ? "text-gray-200" : "text-gray-800"
								}`}
							>
								{paragraph}
							</div>
						))}
					</div>
				</div>
			</>
		);
	};

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
											<div className="mt-2 w-full h-[600px] rounded-lg overflow-hidden shadow-md">
												<PdfPreview
													fileUrl={`${process.env.NEXT_PUBLIC_API_URL}uploads/${res.canres_file}`}
												/>
												{/* <iframe
													src={`${process.env.NEXT_PUBLIC_API_URL}uploads/${res.canres_file}`}
													className="w-full h-full"
													title="PDF Resume"
												/> */}
											</div>
										) : getFileType(res.canres_file) === "document" ? (
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
											<div
												className={`mt-2 w-full rounded-lg shadow-md p-4 ${
													isDarkMode ? "bg-gray-800" : "bg-white"
												}`}
											>
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
