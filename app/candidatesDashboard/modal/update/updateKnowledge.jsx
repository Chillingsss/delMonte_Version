"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
	getDataFromSession,
	getDataFromCookie,
} from "@/app/utils/storageUtils";
import Select from "react-select";
import { Toaster, toast } from "react-hot-toast"; // Import React Hot Toast

const UpdateKnowledge = ({
	showModal,
	setShowModal,
	know,
	knowledges,
	fetchProfile,
	selectedKnowledge,
	fetchKnowledge,
}) => {
	const { data: session } = useSession();
	const [data, setData] = useState({
		canknow_id: know?.canknow_id || "",
		knowledge_id: know?.canknow_knowledgeId || "",
		knowledge_name: know?.knowledge_name || "",
		customKnowledge: "",
	});
	const [loading, setLoading] = useState(false);

	const [isDarkMode, setIsDarkMode] = useState(() => {
		const savedTheme = localStorage.getItem("appearance");
		if (savedTheme === "dark") return true;
		if (savedTheme === "light") return false;
		return window.matchMedia("(prefers-color-scheme: dark)").matches;
	});

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const updateTheme = () => {
			const savedTheme = localStorage.getItem("appearance");
			if (savedTheme === "dark") {
				setIsDarkMode(true);
			} else if (savedTheme === "light") {
				setIsDarkMode(false);
			} else {
				setIsDarkMode(mediaQuery.matches);
			}
		};

		// Set initial theme
		updateTheme();

		// Listen for changes in localStorage
		const handleStorageChange = (e) => {
			if (e.key === "appearance") {
				updateTheme();
			}
		};
		window.addEventListener("storage", handleStorageChange);

		// Listen for changes in system preference
		const handleMediaQueryChange = (e) => {
			const savedTheme = localStorage.getItem("appearance");
			if (savedTheme === "system") {
				setIsDarkMode(e.matches);
			}
		};
		mediaQuery.addEventListener("change", handleMediaQueryChange);

		// Cleanup
		return () => {
			window.removeEventListener("storage", handleStorageChange);
			mediaQuery.removeEventListener("change", handleMediaQueryChange);
		};
	}, []);

	const [error, setError] = useState(""); // State for error message

	useEffect(() => {
		if (selectedKnowledge) {
			setData({
				canknow_id: selectedKnowledge.canknow_id || "",
				knowledge_id: selectedKnowledge.knowledge_id || "",
				knowledge_name: selectedKnowledge.knowledge_name || "",
				customKnowledge: "",
			});
		}
	}, [selectedKnowledge]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setData((prevData) => ({
			...prevData,
			[name]: value,
		}));

		// Validate custom knowledge input
		if (name === "customKnowledge") {
			if (
				knowledges.some(
					(knowledge) =>
						knowledge.knowledge_name.toLowerCase() === value.toLowerCase()
				)
			) {
				setError("This knowledge already exists."); // Set error message
			} else {
				setError(""); // Clear error if no issue
			}
		}
	};

	const handleSelectChange = (selectedOption) => {
		const isCustom = selectedOption?.label === "Other (Specify)";
		setData({
			...data,
			knowledge_id: selectedOption ? selectedOption.value : "",
			knowledge_name: isCustom ? "" : selectedOption?.label,
			customKnowledge: isCustom ? data.customKnowledge : "",
		});
		setError(""); // Clear error when selecting a different option
	};

	const [formValid, setFormValid] = useState(false);

	useEffect(() => {
		setFormValid(
			(data.knowledge_id || data.customKnowledge) && !error && !loading
		);
	}, [data, error, loading]);

	const handleSave = async () => {
		try {
			const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
			const getUserIdFromCookie = () => {
				const tokenData = getDataFromCookie("auth_token");
				if (tokenData && tokenData.userId) {
					return tokenData.userId;
				}
				return null; // Return null if userId is not found or tokenData is invalid
			};
			const userId = session?.user?.id || getUserIdFromCookie();

			console.log("User ID:", userId);

			// Validate custom knowledge before saving
			if (
				data.customKnowledge &&
				knowledges.some(
					(knowledge) =>
						knowledge.knowledge_name.toLowerCase() ===
						data.customKnowledge.toLowerCase()
				)
			) {
				toast.error("Please choose the existing knowledge from the dropdown.");
				return;
			}

			const updatedKnowledge = {
				cand_id: userId,
				knowledge: [
					{
						canknow_id: data.canknow_id || null,
						knowledge_id:
							data.knowledge_id || (data.customKnowledge ? "custom" : ""),
						customKnowledge: data.customKnowledge || data.knowledge_name,
					},
				],
			};

			console.log("Update:", updatedKnowledge);

			const formData = new FormData();
			formData.append("operation", "updateCandidateKnowledge");
			formData.append("json", JSON.stringify(updatedKnowledge));

			const response = await axios.post(url, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			if (response.data === 1) {
				console.log("Knowledge updated successfully.");
				toast.success("Knowledge updated successfully.");
				if (fetchProfile) {
					fetchProfile();
				}
				if (fetchKnowledge) {
					fetchKnowledge();
				}
				setShowModal(false);
			} else if (response.data === 2) {
				toast.error("Knowledge exists.");
			} else {
				console.error("Failed to update knowledge:", response.data);
				toast.error("Failed to update knowledge.");
			}
		} catch (error) {
			console.error("Error updating knowledge:", error);
			toast.error("An error occurred while updating the knowledge.");
		}
	};

	const getSelectedOption = (options, value) =>
		options.find((option) => option.value === value) || null;

	const knowledgeOptions = useMemo(() => {
		return [
			{ value: "custom", label: "Other (Specify)" },
			...knowledges.map((knowledge) => ({
				value: knowledge.knowledge_id,
				label: knowledge.knowledge_name,
			})),
		];
	}, [knowledges]);

	const selectedKnowledgeOption = useMemo(() => {
		return getSelectedOption(
			[
				...knowledges.map((knowledge) => ({
					value: knowledge.knowledge_id,
					label: knowledge.knowledge_name,
				})),
				{ value: "custom", label: "Other (Specify)" },
			],
			data.knowledge_id
		);
	}, [knowledges, data.knowledge_id]);

	return (
		<>
			<Toaster position="bottom-left" /> {/* Add Toaster component */}
			<div className={`modal ${showModal ? "block" : "hidden"}`}>
				<div
					className={
						"modal-content " +
						(isDarkMode ? "bg-gray-700" : "bg-gray-200") +
						" p-6 rounded-lg shadow-lg"
					}
				>
					<h3
						className={
							"text-xl font-semibold " +
							(isDarkMode ? "text-white" : "text-gray-800") +
							" mb-4"
						}
					>
						Update Knowledge
					</h3>

					<div className="mb-4">
						<label
							className={
								"block text-gray-600 text-sm font-normal " +
								(isDarkMode ? "text-white" : "text-gray-800")
							}
						>
							Knowledge:
						</label>
						<div className="flex items-center">
							<Select
								name="knowledge_id"
								value={selectedKnowledgeOption}
								onChange={handleSelectChange}
								options={knowledgeOptions}
								placeholder={data.knowledge_name || "Select Knowledge"}
								isSearchable
								className="w-full text-black"
								menuPlacement="auto"
								menuPosition="fixed"
								blurInputOnSelect
								isOptionDisabled={(option) => option.isDisabled}
								styles={{
									control: (provided) => ({
										...provided,
										backgroundColor: isDarkMode ? "#1A202C" : "#F7F7F7",
										color: isDarkMode ? "#FFFFFF" : "#000000",
									}),
								}}
							/>
							{data.knowledge_id && (
								<button
									className="ml-2 text-red-500"
									onClick={() => handleSelectChange(null)}
								>
									Clear
								</button>
							)}
						</div>
						{data.knowledge_id === "custom" && (
							<div>
								<input
									type="text"
									name="customKnowledge"
									value={data.customKnowledge}
									onChange={handleChange}
									placeholder="Enter custom knowledge"
									className={`w-full mt-2 border-b-2 pb-2 bg-transparent ${
										error ? "border-red-500" : "border-black"
									}`}
								/>
								{error && <p className="text-red-500 text-sm">{error}</p>}{" "}
								{/* Display error message */}
							</div>
						)}
					</div>

					<div className="flex justify-end mt-4">
						<button
							onClick={() => setShowModal(false)}
							className="mr-2 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
						>
							Cancel
						</button>
						<button
							className={`px-4 py-2 rounded ${
								formValid
									? "bg-blue-500 text-white hover:bg-blue-600"
									: "bg-gray-300 text-gray-500 cursor-not-allowed"
							}`}
							onClick={handleSave}
							disabled={!formValid}
							title={!formValid ? "Please select a knowledge" : ""}
						>
							Save
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default UpdateKnowledge;
