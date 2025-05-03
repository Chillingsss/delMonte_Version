"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
	getDataFromCookie,
	getDataFromSession,
} from "@/app/utils/storageUtils";
import Select from "react-select";
import { Toaster, toast } from "react-hot-toast";
import Tesseract from "tesseract.js";
import { fetchProfiles } from "@/app/utils/apiFunctions";

const performSemanticAnalysis = async (text1, text2, threshold) => {
	try {
		const response = await axios.post(
			"/api/semanticAnalysisTraining",
			{
				text1,
				text2,
				threshold,
			},
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		return response.data;
	} catch (error) {
		console.error("Error response:", error.response?.data || error.message);
		throw new Error(
			`Failed to perform semantic analysis: ${
				error.response?.data || error.message
			}`
		);
	}
};

const UpdateTraining = ({
	showModal,
	setShowModal,
	train,
	setProfile,
	setLoading,
	trainings,
	selectedTraining,
	fetchTraining,
	isDarkMode,
}) => {
	const { data: session } = useSession();
	const [data, setData] = useState({
		training_id: train?.training_id || "",
		perT_id: train?.training_perTId || "",
		perT_name: train?.perT_name || "",
		perT_percentage: train?.perT_percentage,
		image: null,
		training_image: train?.training_image || "",
	});

	const [isNewTraining, setIsNewTraining] = useState(true); // Track if adding a new training
	const [loadings, setLoadings] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState("");
	const [formValid, setFormValid] = useState(false);

	useEffect(() => {
		if (showModal) {
			if (isNewTraining) {
				// Reset data when adding a new training
				setData({
					training_id: "",
					perT_id: "",
					perT_name: "",
					perT_percentage: 60,
					image: null,
					training_image: "",
				});
			} else {
				// Populate data for editing
				setData({
					training_id: train.training_id || "",
					perT_id: train.training_perTId || "",
					perT_name: train.perT_name || "",
					perT_percentage: train.perT_percentage || 60,
					image: null,
					training_image: train.training_image || "",
				});
			}
		}
	}, [showModal, train, isNewTraining]);

	useEffect(() => {
		if (selectedTraining) {
			setData({
				training_id: selectedTraining.training_id || "",
				perT_id: selectedTraining.training_perTId || "",
				perT_name: selectedTraining.perT_name || "",
				perT_percentage: selectedTraining.perT_percentage || 60,
				image: null,
				training_image: selectedTraining.training_image || "",
			});
			setIsNewTraining(false); // Set to false when editing
		}
	}, [selectedTraining]);

	useEffect(() => {
		setFormValid(
			data.perT_name?.trim() &&
				(data.perT_id ? true : false) &&
				data.image &&
				!loadings
		);
	}, [data, loadings]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setData((prevData) => ({
			...prevData,
			[name]: value,
		}));

		// Validate training title input
		if (name === "perT_name") {
			if (
				trainings.some(
					(existingTraining) =>
						existingTraining.perT_name.toLowerCase() === value.toLowerCase()
				)
			) {
				setError("This training title already exists."); // Set error message
			} else {
				setError(""); // Clear error if no issue
			}
		}
	};

	const handleSelectChange = (selectedOption) => {
		if (selectedOption) {
			const isCustom = selectedOption.value === "custom";
			const selectedTraining = trainings.find(
				(t) => t.perT_id === selectedOption.value
			);
			setData({
				...data,
				perT_id: selectedOption.value,
				perT_name: isCustom ? "" : selectedOption.label,
				perT_percentage: isCustom
					? 60
					: selectedTraining?.perT_percentage || 60,
			});
		} else {
			setData({ ...data, perT_id: "", perT_name: "", perT_percentage: 60 });
		}
		setError("");
	};

	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			setData({ ...data, image: file });
		}
	};

	const processImage = async (file) => {
		try {
			const result = await Tesseract.recognize(file, "eng", {
				logger: (info) => console.log(info),
			});
			return result.data.text;
		} catch (error) {
			console.error("Error processing image:", error);
			throw new Error("Error processing image");
		}
	};

	const handleSave = async () => {
		setLoadings(true);
		setProgress(0);
		try {
			// Simulate progress for different stages
			setProgress(10); // Starting
			const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
			const userId = session?.user?.id;

			console.log("User ID:", userId);

			if (
				data.customTraining &&
				trainings.some(
					(existingTraining) =>
						existingTraining.perT_name.toLowerCase() ===
						data.perT_name.toLowerCase()
				)
			) {
				toast.error(
					"Please choose the existing training title from the dropdown."
				);
				return;
			}

			let textFromImage = "";
			if (data.image) {
				setProgress(30); // Image processing started
				textFromImage = await processImage(data.image);
				setProgress(50); // Image processing complete
			} else if (train?.training_image) {
				setProgress(30);
				textFromImage = await processImage(train?.training_image);
				setProgress(50);
			}

			const normalizedTextFromImage = textFromImage.trim().toLowerCase();
			const normalizedTrainingName = data.perT_name.trim().toLowerCase();

			setProgress(60); // Starting semantic analysis

			// Perform semantic analysis for image vs name with dynamic threshold
			console.log(
				"\n=== Detailed Semantic Analysis: Image vs Training Name ==="
			);
			const imageVsNameAnalysis = await performSemanticAnalysis(
				normalizedTextFromImage,
				normalizedTrainingName,
				data.perT_percentage
			);
			console.log("Match Quality:", imageVsNameAnalysis.matchQuality);
			console.log("Cosine Score:", imageVsNameAnalysis.score + "%");
			console.log("Required Percentage:", data.perT_percentage + "%");

			// Use cosine similarity with dynamic threshold for validation
			if (
				data.image &&
				parseFloat(imageVsNameAnalysis.score) < data.perT_percentage
			) {
				toast.error(
					`The certificate image does not match the selected training (Similarity: ${imageVsNameAnalysis.score}%, Required: ${data.perT_percentage}%)`
				);
				setLoadings(false);
				return;
			}

			const updatedData = {
				cand_id: userId,
				training: [
					{
						training_id: train?.training_id || null,
						perT_id:
							data.perT_id === "custom"
								? "custom"
								: data.perT_id || train?.training_perTId,
						customTraining: data.perT_id === "custom" ? data.perT_name : null,
						image: data.image ? data.image.name : train?.training_image,
					},
				],
			};

			console.log("Update Training:", updatedData);

			setProgress(80); // Uploading data

			const formData = new FormData();
			formData.append("operation", "updateCandidateTraining");
			formData.append("json", JSON.stringify(updatedData));

			if (data.image) {
				formData.append("image", data.image);
			}

			const response = await axios.post(url, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			setProgress(90);

			console.log("Response:", response.data);

			if (response.data === 1) {
				setProgress(100);
				console.log("Training updated successfully.");
				toast.success("Training updated successfully.");
				fetchProfiles(session, setProfile, setLoading);
				if (fetchTraining) {
					fetchTraining();
				}
				if (fetchTraining) {
					fetchTraining();
				}
				setShowModal(false);
			} else {
				console.error("Failed to update training:", response.data);
				toast.error("Failed to update training.");
			}
		} catch (error) {
			console.error("Error updating training:", error);
			toast.error("An error occurred while updating the training.");
		} finally {
			setLoadings(false);
			setProgress(0);
		}
	};

	const getSelectedOption = (options, value) =>
		options.find((option) => option.value === value) || null;

	const trainingOptions = useMemo(() => {
		return [
			{ value: "custom", label: "Other (Specify)" },
			...trainings.map((training) => ({
				value: training.perT_id,
				label: training.perT_name,
			})),
		];
	}, [trainings]);

	const selectedValue = useMemo(() => {
		return getSelectedOption(
			trainings.map((training) => ({
				value: training.perT_id,
				label: training.perT_name,
			})),
			data.perT_id || train?.training_perTId
		);
	}, [data.perT_id, train?.training_perTId, trainings]);

	const imageUrl = data.image ? URL.createObjectURL(data.image) : null;

	return (
		<div className={`modal ${showModal ? "block" : "hidden"}`}>
			<div
				className={`modal-content ${
					isDarkMode ? "bg-gray-700" : "bg-gray-200"
				} p-6 rounded-lg shadow-lg`}
			>
				<h3
					className={`text-xl font-semibold ${
						isDarkMode ? "text-white" : "text-gray-800"
					} mb-4`}
				>
					Update Training
				</h3>

				<div className="mb-4">
					<label
						className={`block ${
							isDarkMode ? "text-white" : "text-gray-600"
						} text-sm font-normal`}
					>
						Select Training:
					</label>
					<div className="flex items-center">
						<Select
							name="perT_id"
							value={selectedValue}
							onChange={handleSelectChange}
							options={trainingOptions}
							placeholder="Select Training"
							isSearchable
							className="w-full text-black"
							menuPlacement="auto"
							menuPosition="fixed"
							blurInputOnSelect
							isOptionDisabled={(option) => option.isDisabled}
						/>
						{data.perT_id && (
							<button
								className="ml-2 text-red-500"
								onClick={() => handleSelectChange(null, "perT_id")}
							>
								Clear
							</button>
						)}
					</div>
					{data.perT_id === "custom" && (
						<input
							type="text"
							name="perT_name"
							value={data.perT_name}
							onChange={handleChange}
							className={`w-full mt-2 border-b-2 pb-2 bg-transparent ${
								error ? "border-red-500" : "border-black"
							}`}
							placeholder="Enter custom training name"
						/>
					)}
					{error && <p className="text-red-500 text-sm">{error}</p>}
				</div>

				<div className="mb-4">
					<label
						className={`block ${
							isDarkMode ? "text-white" : "text-gray-600"
						} text-sm font-normal`}
					>
						Current Image:
					</label>

					{data.training_image && (
						<div className="mb-2">
							<img
								src={`http://localhost/php-delmonte/api/uploads/${data.training_image}`}
								alt="Current Training"
								className="w-32 h-32 object-cover rounded-lg shadow-md"
							/>
							<p
								className={`text-sm ${
									isDarkMode ? "text-white" : "text-gray-500"
								} mt-2`}
							>
								Current image: {data.training_image}
							</p>
						</div>
					)}

					<p
						className={`text-sm ${
							isDarkMode ? "text-white" : "text-gray-500"
						} mb-2`}
					>
						Choose a new image:
					</p>

					<div className="relative w-full">
						<input
							type="file"
							accept="image/*"
							onChange={handleImageUpload}
							className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
						/>
						<div
							className={`flex items-center justify-center w-full p-3 border-2 border-dashed ${
								isDarkMode ? "border-gray-500" : "border-gray-300"
							} rounded-lg hover:bg-gray-100 transition-all cursor-pointer`}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className={`h-6 w-6 ${
									isDarkMode ? "text-gray-400" : "text-gray-500"
								}`}
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M3 16.5V7a2 2 0 012-2h2.586a2 2 0 011.414.586l1.828 1.828a2 2 0 001.414.586H19a2 2 0 012 2v7.5m-8 0v6m-4-6v6m8-6v6"
								/>
							</svg>
							<span
								className={`ml-2 ${
									isDarkMode ? "text-white" : "text-gray-600"
								}`}
							>
								{data.image
									? data.image.name
									: train?.training_image
									? train.training_image
									: "Select File"}
							</span>
						</div>
					</div>
				</div>

				{imageUrl && (
					<div className="mt-4">
						<img
							src={imageUrl}
							alt="Selected Training"
							className="w-32 h-32 object-cover rounded-lg shadow-md"
						/>
					</div>
				)}

				<div className="flex justify-end">
					<button
						type="button"
						className={`px-4 py-2 mr-2 ${
							isDarkMode ? "text-gray-800" : "text-gray-800"
						} bg-gray-300 rounded hover:bg-gray-400 transition`}
						onClick={() => setShowModal(false)}
					>
						Cancel
					</button>
					<button
						type="button"
						className={`px-4 py-2 rounded ${
							formValid
								? "bg-blue-500 text-white hover:bg-blue-600"
								: "bg-gray-300 text-gray-500 cursor-not-allowed"
						}`}
						onClick={handleSave}
						disabled={!formValid}
						title={
							!formValid
								? "Please fill in all required fields including certificate"
								: ""
						}
					>
						{loadings ? "Saving..." : "Save"}
					</button>
				</div>

				{loadings && (
					<div className="fixed inset-0 bg-black/50 backdrop-blur-[4px] flex items-center justify-center z-50">
						<div
							className={`p-6 rounded-2xl shadow-xl w-96 border ${
								isDarkMode
									? "bg-gray-900 border-gray-800"
									: "bg-white border-gray-200"
							} transform transition-all duration-300 scale-100 hover:scale-[1.02]`}
						>
							<div className="space-y-6">
								{/* Header */}
								<div className="text-center">
									<h3
										className={`font-semibold text-xl tracking-tight ${
											isDarkMode ? "text-gray-100" : "text-gray-900"
										}`}
									>
										Processing Your Request
									</h3>
									<p
										className={`text-sm mt-1 ${
											isDarkMode ? "text-gray-400" : "text-gray-500"
										}`}
									>
										Please wait a moment
									</p>
								</div>

								{/* Progress Steps */}
								<div className="relative flex justify-between mb-4">
									<div
										className={`absolute top-3 left-0 right-0 h-1 rounded-full ${
											isDarkMode ? "bg-gray-800" : "bg-gray-200"
										}`}
									></div>
									<div
										className="absolute top-3 left-0 h-1 rounded-full bg-[#004F39] transition-all duration-700 ease-out"
										style={{
											width: `${Math.min(100, (progress / 100) * 100)}%`,
										}}
									></div>

									{["Upload", "Process", "Analyze", "Save"].map(
										(step, index) => {
											const stepProgress = Math.floor(progress / 25);
											return (
												<div
													key={step}
													className="flex flex-col items-center relative z-10"
												>
													<div
														className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
															index <= stepProgress
																? "bg-[#004F39] text-white border-2 border-[#00634A] scale-110"
																: isDarkMode
																? "bg-gray-800 border border-gray-700 text-gray-400"
																: "bg-white border border-gray-200 text-gray-500"
														}`}
													>
														{index < stepProgress ? (
															<svg
																className="w-4 h-4"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth="2"
																	d="M5 13l4 4L19 7"
																/>
															</svg>
														) : (
															<span className="font-medium text-sm">
																{index + 1}
															</span>
														)}
													</div>
													<span
														className={`text-xs mt-1 font-medium tracking-wide ${
															index <= stepProgress
																? "text-[#004F39]"
																: isDarkMode
																? "text-gray-500"
																: "text-gray-600"
														}`}
													>
														{step}
													</span>
												</div>
											);
										}
									)}
								</div>

								{/* Progress Bar */}
								<div className="relative pt-1">
									<div
										className={`overflow-hidden h-2 text-xs flex rounded-full ${
											isDarkMode ? "bg-gray-800" : "bg-gray-100"
										}`}
									>
										<div
											style={{ width: `${progress}%` }}
											className="transition-all duration-700 ease-out shadow-md flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#004F39] rounded-full"
										/>
									</div>
									<div className="flex justify-between text-xs mt-2 font-medium tracking-tight">
										<span
											className={isDarkMode ? "text-gray-300" : "text-gray-700"}
										>
											{progress}% Complete
										</span>
										<span
											className={isDarkMode ? "text-gray-500" : "text-gray-500"}
										>
											{100 - progress}% Left
										</span>
									</div>
								</div>

								{/* Loading Animation & Status Message */}
								<div
									className={`flex items-center justify-center space-x-3 py-3 px-4 rounded-lg ${
										isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
									} transition-all duration-300`}
								>
									<div className="relative w-5 h-5">
										<div className="w-5 h-5 rounded-full border-2 border-[#004F39] border-t-transparent animate-spin"></div>
										<div
											className="absolute inset-0 w-5 h-5 rounded-full border-2 border-[#004F39] border-t-transparent animate-spin opacity-50"
											style={{ animationDuration: "1.5s" }}
										></div>
									</div>
									<div
										className={`text-sm font-medium ${
											isDarkMode ? "text-gray-200" : "text-gray-700"
										}`}
									>
										{progress < 25 && "Preparing upload..."}
										{progress >= 25 && progress < 50 && "Processing image..."}
										{progress >= 50 && progress < 75 && "Analyzing content..."}
										{progress >= 75 && "Saving changes..."}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
				<Toaster position="bottom-left" />
				{/* Add Toaster component */}
			</div>
		</div>
	);
};

export default UpdateTraining;
