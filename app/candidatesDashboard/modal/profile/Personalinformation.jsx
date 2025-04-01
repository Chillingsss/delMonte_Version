import { Edit, Lock, Settings, X } from "lucide-react";
import React from "react";
import UpdateEmail from "../update/updateEmail";
import UpdatePassword from "../update/updatePassword";

const PersonalInformation = ({
	profile,
	isDarkMode,
	settingsRef,
	fetchProfile,
	setProfile,
	isSettingsOpen,
	setIsSettingsOpen,
	isImageModalOpen,
	setIsImageModalOpen,
	zoomLevel,
	setZoomLevel,
	handleZoom,
	showPasswordModal,
	setShowPasswordModal,
	showEmailModal,
	setShowEmailModal,
	isEditingPersonalInfo,
	setIsEditingPersonalInfo,
	handleEditPersonalClick,
	handleEditPasswordClick,
	handleEditEmailClick,
	handleSavePersonalInfo,
	editData,
	setEditData,
  handleChangeNotArray
}) => {
	console.log("Profile:", profile);
	return (
		<div
			className={`p-6 space-y-6 ${
				isDarkMode ? "bg-[#1A202C] text-white" : "bg-[#F4F7FC]"
			}`}
		>
			<h3
				className={`text-2xl font-bold ${
					isDarkMode ? "text-white" : "text-gray-800"
				} mb-6`}
			>
				Personal Information
			</h3>

			<div className="relative flex items-end justify-end" ref={settingsRef}>
				<button
					onClick={() => setIsSettingsOpen(!isSettingsOpen)}
					className={`p-2 rounded-full ${
						isDarkMode
							? "bg-gray-700 text-white hover:bg-gray-500"
							: "bg-gray-200 text-gray-600"
					} hover:bg-gray-300 transition-colors duration-200 flex items-center justify-end`}
				>
					<Settings className="w-6 h-6" />
				</button>

				{isSettingsOpen && (
					<div
						className={`absolute right-0 top-full mt-2 w-60 ${
							isDarkMode ? "bg-gray-800 text-white" : "bg-white"
						} rounded-md shadow-2xl z-10 p-3`}
					>
						<div className="py-1">
							<button
								onClick={() => {
									handleEditPersonalClick();
									setIsSettingsOpen(false);
								}}
								className={`flex items-center px-4 py-2 text-sm ${
									isDarkMode ? "text-white" : "text-gray-700"
								} hover:bg-gray-400 hover:text-white w-full text-left`}
							>
								<Edit className="w-4 h-4 mr-2" />
								Personal Information
							</button>
							<button
								onClick={() => {
									handleEditPasswordClick();
									setIsSettingsOpen(false);
								}}
								className={`flex items-center px-4 py-2 text-sm ${
									isDarkMode ? "text-white" : "text-gray-700"
								} hover:bg-gray-400 hover:text-white w-full text-left`}
							>
								<Lock className="w-4 h-4 mr-2" />
								Change Password
							</button>

							<button
								onClick={() => {
									handleEditEmailClick();
									setIsSettingsOpen(false);
								}}
								className={`flex items-center px-4 py-2 text-sm ${
									isDarkMode ? "text-white" : "text-gray-700"
								} hover:bg-gray-400 hover:text-white w-full text-left`}
							>
								<Lock className="w-4 h-4 mr-2" />
								Change Email
							</button>
						</div>
					</div>
				)}
			</div>

			{showPasswordModal && (
				<UpdatePassword
					showModal={showPasswordModal}
					setShowModal={setShowPasswordModal}
					fetchProfile={fetchProfile}
					candidateEmail={profile.candidateInformation.cand_email}
					candidatePassword={profile.candidateInformation.cand_password}
					candidateAlternateEmail={
						profile.candidateInformation.cand_alternateEmail
					}
				/>
			)}

			{showEmailModal && (
				<UpdateEmail
					showModal={showEmailModal}
					setShowModal={setShowEmailModal}
					fetchProfile={fetchProfile}
					candidateEmail={profile.candidateInformation.cand_email}
					candidatePassword={profile.candidateInformation.cand_password}
					candidateAlternateEmail={
						profile.candidateInformation.cand_alternateEmail
					}
				/>
			)}

			{isEditingPersonalInfo && (
				<div className="flex space-x-2 mb-4">
					<button
						onClick={handleSavePersonalInfo}
						className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 ${
							isDarkMode ? "bg-gray-700" : ""
						}`}
					>
						Save Changes
					</button>
					<button
						onClick={() => setIsEditingPersonalInfo(false)}
						className={`px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 ${
							isDarkMode ? "bg-gray-800" : ""
						}`}
					>
						Cancel
					</button>
				</div>
			)}

			<div className="flex flex-col items-center mb-8">
				<div className="relative mb-3">
					<div
						className={`w-32 h-32 rounded-full overflow-hidden border-4 ${
							isDarkMode ? "border-gray-600" : "border-green-500"
						} cursor-pointer hover:opacity-90 transition-opacity`}
						onClick={() =>
							profile.candidateInformation?.cand_profPic &&
							setIsImageModalOpen(true)
						}
					>
						{profile.candidateInformation?.cand_profPic ? (
							<img
								src={`${process.env.NEXT_PUBLIC_API_URL}uploads/${profile.candidateInformation.cand_profPic}`}
								alt="Profile"
								className="w-full h-full object-cover"
							/>
						) : (
							<div
								className={`w-full h-full flex items-center justify-center ${
									isDarkMode ? "bg-gray-700" : "bg-gray-200"
								}`}
							>
								<span
									className={`text-4xl ${
										isDarkMode ? "text-gray-400" : "text-gray-500"
									}`}
								>
									{profile.candidateInformation?.cand_firstname?.[0]?.toUpperCase() ||
										"?"}
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Image Modal */}
				{isImageModalOpen && profile.candidateInformation?.cand_profPic && (
					<div
						className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
						onClick={() => {
							setIsImageModalOpen(false);
							setZoomLevel(1); // Reset zoom when closing
						}}
					>
						<div className="relative max-w-6xl max-h-[90vh] p-2">
							<img
								src={`${process.env.NEXT_PUBLIC_API_URL}uploads/${profile.candidateInformation.cand_profPic}`}
								alt="Profile"
								className="max-w-full max-h-[85vh] object-contain transition-transform duration-200"
								style={{ transform: `scale(${zoomLevel})` }}
								onClick={(e) => e.stopPropagation()}
							/>

							{/* Zoom Controls */}
							<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-50 p-2 rounded-lg">
								<button
									className="text-white hover:text-green-400 disabled:text-gray-500"
									onClick={(e) => {
										e.stopPropagation();
										handleZoom("out");
									}}
									disabled={zoomLevel <= 0.5}
									title="Zoom Out"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M20 12H4"
										/>
									</svg>
								</button>

								<span className="text-white text-sm">
									{(zoomLevel * 100).toFixed(0)}%
								</span>

								<button
									className="text-white hover:text-green-400 disabled:text-gray-500"
									onClick={(e) => {
										e.stopPropagation();
										handleZoom("in");
									}}
									disabled={zoomLevel >= 3}
									title="Zoom In"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 4v16m8-8H4"
										/>
									</svg>
								</button>
							</div>

							{/* Close button */}
							<button
								className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
								onClick={(e) => {
									e.stopPropagation();
									setIsImageModalOpen(false);
									setZoomLevel(1); // Reset zoom when closing
								}}
							>
								<X className="w-6 h-6" />
							</button>
						</div>
					</div>
				)}

				{isEditingPersonalInfo && (
					<div className="flex flex-col items-center gap-2">
						<div className="flex flex-col items-center gap-2 relative">
							<button
								onClick={() =>
									document
										.getElementById("upload-options")
										.classList.toggle("hidden")
								}
								className={`cursor-pointer px-4 py-2 rounded-lg ${
									isDarkMode
										? "bg-gray-700 hover:bg-gray-600"
										: "bg-green-500 hover:bg-green-600"
								} flex items-center gap-2 text-white`}
							>
								<Edit className="w-5 h-5" />
								<span>Choose Upload Method</span>
							</button>

							{/* Dropdown menu - updated positioning */}
							<div
								id="upload-options"
								className={`hidden absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-48 rounded-md shadow-lg ${
									isDarkMode ? "bg-gray-800" : "bg-white"
								} ring-1 ring-black ring-opacity-5 z-50`}
							>
								<div className="py-1">
									{/* Camera option */}
									<button
										onClick={() => {
											// Create video element
											const video = document.createElement("video");
											video.setAttribute("playsinline", "");
											video.setAttribute("autoplay", "");
											video.classList.add(
												"camera-preview",
												"rounded-lg",
												"max-w-full",
												"h-auto"
											);

											// Create canvas for capturing
											const canvas = document.createElement("canvas");

											// Create preview image element
											const previewImg = document.createElement("img");
											previewImg.classList.add(
												"rounded-lg",
												"max-w-full",
												"h-auto",
												"hidden"
											);

											// Create camera container
											const cameraContainer = document.createElement("div");
											cameraContainer.classList.add(
												"fixed",
												"inset-0",
												"z-50",
												"flex",
												"flex-col",
												"items-center",
												"justify-center",
												"bg-black",
												"bg-opacity-75",
												"p-4"
											);

											// Create buttons container
											const buttonsContainer = document.createElement("div");
											buttonsContainer.classList.add("flex", "gap-4", "mt-4");

											// Add video and preview image
											cameraContainer.appendChild(video);
											cameraContainer.appendChild(previewImg);
											cameraContainer.appendChild(buttonsContainer);

											// Add capture button
											const captureBtn = document.createElement("button");
											captureBtn.textContent = "Take Photo";
											captureBtn.classList.add(
												"px-4",
												"py-2",
												"bg-green-500",
												"text-white",
												"rounded-lg",
												"hover:bg-green-600"
											);
											buttonsContainer.appendChild(captureBtn);

											// Add close button
											const closeBtn = document.createElement("button");
											closeBtn.textContent = "Cancel";
											closeBtn.classList.add(
												"px-4",
												"py-2",
												"bg-red-500",
												"text-white",
												"rounded-lg",
												"hover:bg-red-600"
											);
											buttonsContainer.appendChild(closeBtn);

											// Add retake button (initially hidden)
											const retakeBtn = document.createElement("button");
											retakeBtn.textContent = "Retake";
											retakeBtn.classList.add(
												"px-4",
												"py-2",
												"bg-yellow-500",
												"text-white",
												"rounded-lg",
												"hover:bg-yellow-600",
												"hidden"
											);
											buttonsContainer.appendChild(retakeBtn);

											// Add use photo button (initially hidden)
											const usePhotoBtn = document.createElement("button");
											usePhotoBtn.textContent = "Use Photo";
											usePhotoBtn.classList.add(
												"px-4",
												"py-2",
												"bg-green-500",
												"text-white",
												"rounded-lg",
												"hover:bg-green-600",
												"hidden"
											);
											buttonsContainer.appendChild(usePhotoBtn);

											document.body.appendChild(cameraContainer);

											// Get camera stream
											const startCamera = () => {
												const handleSuccess = (stream) => {
													let objectUrl; // To store legacy object URL if needed

													// Handle both modern and legacy video sources
													if ("srcObject" in video) {
														video.srcObject = stream;
													} else {
														// Fallback for older browsers
														objectUrl = window.URL.createObjectURL(stream);
														video.src = objectUrl;
													}

													// Ensure video plays and handle errors
													video.play().catch((err) => {
														console.error("Error playing video:", err);
														handleError(err);
													});

													// Handle capture button
													captureBtn.onclick = () => {
														canvas.width = video.videoWidth;
														canvas.height = video.videoHeight;
														canvas.getContext("2d").drawImage(video, 0, 0);

														previewImg.src = canvas.toDataURL("image/jpeg");
														video.classList.add("hidden");
														previewImg.classList.remove("hidden");

														captureBtn.classList.add("hidden");
														retakeBtn.classList.remove("hidden");
														usePhotoBtn.classList.remove("hidden");
													};

													// Cleanup function for both modern and legacy streams
													const cleanup = () => {
														stream.getTracks().forEach((track) => track.stop());
														if (objectUrl) {
															window.URL.revokeObjectURL(objectUrl);
														}
													};

													// Handle retake button
													retakeBtn.onclick = () => {
														video.classList.remove("hidden");
														previewImg.classList.add("hidden");
														captureBtn.classList.remove("hidden");
														retakeBtn.classList.add("hidden");
														usePhotoBtn.classList.add("hidden");
													};

													// Handle use photo button
													usePhotoBtn.onclick = () => {
														canvas.toBlob((blob) => {
															const filename = `camera-capture-${Date.now()}-${Math.random()
																.toString(36)
																.substring(2, 8)}.jpg`;
															const file = new File([blob], filename, {
																type: "image/jpeg",
															});

															setEditData((prev) => ({
																...prev,
																candidateInformation: {
																	...prev.candidateInformation,
																	cand_profPic: file,
																},
															}));

															cleanup();
															cameraContainer.remove();
															document
																.getElementById("upload-options")
																.classList.add("hidden");
														}, "image/jpeg");
													};

													// Handle close button
													closeBtn.onclick = () => {
														cleanup();
														cameraContainer.remove();
														document
															.getElementById("upload-options")
															.classList.add("hidden");
													};
												};

												const handleError = (err) => {
													console.error("Camera Error:", err);
													alert(
														"Camera access failed. Please ensure permissions are granted and try again."
													);
													cameraContainer.remove();
												};

												// Feature detection with proper error handling
												try {
													if (navigator.mediaDevices?.getUserMedia) {
														navigator.mediaDevices
															.getUserMedia({ video: true })
															.then(handleSuccess)
															.catch(handleError);
													} else {
														const legacyGetUserMedia =
															navigator.getUserMedia ||
															navigator.webkitGetUserMedia ||
															navigator.mozGetUserMedia ||
															navigator.msGetUserMedia;

														if (legacyGetUserMedia) {
															legacyGetUserMedia.call(
																navigator,
																{ video: true },
																handleSuccess,
																handleError
															);
														} else {
															throw new Error("Camera API not supported");
														}
													}
												} catch (error) {
													alert(
														"This browser doesn't support camera access. Please try modern browsers like Chrome, Firefox, or Edge."
													);
													console.error("Camera API Unavailable:", error);
													cameraContainer.remove();
												}
											};

											// Start camera with proper video element attributes
											// Make sure your HTML video element includes these attributes:
											// <video autoplay playsinline></video>
											startCamera();
										}}
										className={`w-full text-left px-4 py-2 text-sm cursor-pointer ${
											isDarkMode
												? "text-gray-200 hover:bg-gray-700"
												: "text-gray-700 hover:bg-gray-100"
										}`}
									>
										<div className="flex items-center gap-2">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-5 w-5"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fillRule="evenodd"
													d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
													clipRule="evenodd"
												/>
											</svg>
											Use Camera
										</div>
									</button>

									{/* File upload option - keep this as is */}
									<label
										htmlFor="file-upload"
										className={`block px-4 py-2 text-sm cursor-pointer ${
											isDarkMode
												? "text-gray-200 hover:bg-gray-700"
												: "text-gray-700 hover:bg-gray-100"
										}`}
									>
										<div className="flex items-center gap-2">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-5 w-5"
												viewBox="0 0 20 20"
												fill="currentColor"
											>
												<path
													fillRule="evenodd"
													d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
													clipRule="evenodd"
												/>
											</svg>
											Choose File
										</div>
										<input
											id="file-upload"
											type="file"
											accept="image/jpeg, image/png, image/heic, image/heif"
											className="hidden"
											onChange={(e) => {
												const file = e.target.files[0];
												if (file) {
													console.log("File selected:", file);
													setEditData((prev) => ({
														...prev,
														candidateInformation: {
															...prev.candidateInformation,
															cand_profPic: file,
															originalProfPic:
																profile.candidateInformation?.cand_profPic, // Store original image name
														},
													}));
												}
												document
													.getElementById("upload-options")
													.classList.add("hidden");
											}}
										/>
									</label>
								</div>
							</div>
						</div>

						{/* File selection display */}
						<div className="text-sm text-gray-500">
							{editData.candidateInformation?.cand_profPic instanceof File
								? `New file selected: ${editData.candidateInformation.cand_profPic.name}`
								: editData.candidateInformation?.cand_profPic
								? `Current file: ${editData.candidateInformation.cand_profPic}`
								: profile.candidateInformation?.cand_profPic
								? `Current file: ${profile.candidateInformation.cand_profPic}`
								: "No file selected"}
						</div>

						{/* Preview of selected/captured image */}
						{(editData.candidateInformation?.cand_profPic ||
							profile.candidateInformation?.cand_profPic) && (
							<div className="relative w-32 h-32 mb-4">
								<img
									width={70}
									height={70}
									src={
										editData.candidateInformation?.cand_profPic instanceof File
											? URL.createObjectURL(
													editData.candidateInformation.cand_profPic
											  )
											: editData.candidateInformation?.cand_profPic
											? `${process.env.NEXT_PUBLIC_API_URL}uploads/${editData.candidateInformation.cand_profPic}`
											: `${process.env.NEXT_PUBLIC_API_URL}uploads/${profile.candidateInformation.cand_profPic}`
									}
									alt="Profile Preview"
									className="w-full h-full object-cover rounded-full border-4 border-green-500"
									onError={(e) => {
										console.error("Image failed to load:", e);
										e.target.src = "fallback-image-url.jpg";
									}}
								/>
								<button
									onClick={() => {
										setEditData((prev) => ({
											...prev,
											candidateInformation: {
												...prev.candidateInformation,
												cand_profPic: null,
											},
										}));
									}}
									className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
									title="Remove image"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
											clipRule="evenodd"
										/>
									</svg>
								</button>
							</div>
						)}
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-1 gap-4">
				<div
					className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
						isDarkMode ? "bg-gray-700 text-white" : ""
					}`}
				>
					<label
						className={`text-gray-600 block text-sm font-normal ${
							isDarkMode ? "text-white " : ""
						}`}
					>
						Name:
					</label>
					{isEditingPersonalInfo ? (
						<>
							<input
								type="text"
								name="candidateInformation.cand_lastname"
								value={editData.candidateInformation?.cand_lastname || ""}
								onChange={handleChangeNotArray}
								className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
									isDarkMode ? "bg-gray-700 text-white" : ""
								}`}
							/>
							<input
								type="text"
								name="candidateInformation.cand_firstname"
								value={editData.candidateInformation?.cand_firstname || ""}
								onChange={handleChangeNotArray}
								className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
									isDarkMode ? "bg-gray-700 text-white" : ""
								}`}
							/>
							<input
								type="text"
								name="candidateInformation.cand_middlename"
								value={editData.candidateInformation?.cand_middlename || ""}
								onChange={handleChangeNotArray}
								className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
									isDarkMode ? "bg-gray-700 text-white" : ""
								}`}
							/>
						</>
					) : (
						<p
							className={`text-gray-800 font-semibold mt-1 ${
								isDarkMode ? "text-white" : ""
							}`}
						>
							{profile.candidateInformation?.cand_lastname || "N/A"},{" "}
							{profile.candidateInformation?.cand_firstname || "N/A"}{" "}
							{profile.candidateInformation?.cand_middlename || "N/A"}
						</p>
					)}
				</div>
			</div>

			{/* contact no */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div
					className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
						isDarkMode ? "bg-gray-700 text-white" : ""
					}`}
				>
					<label
						className={`block text-gray-600 text-sm font-normal ${
							isDarkMode ? "text-white" : ""
						}`}
					>
						Contact No:
					</label>
					{isEditingPersonalInfo ? (
						<>
							<input
								type="number"
								name="candidateInformation.cand_contactNo"
								value={editData.candidateInformation?.cand_contactNo || ""}
								onChange={handleChangeNotArray}
								className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
									isDarkMode ? "bg-gray-700 text-white" : ""
								}`}
							/>
						</>
					) : (
						<p
							className={`text-gray-800 font-semibold mt-1 ${
								isDarkMode ? "text-white" : ""
							}`}
						>
							{profile.candidateInformation?.cand_contactNo || "N/A"}
						</p>
					)}
				</div>
				<div
					className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
						isDarkMode ? "bg-gray-700 text-white" : ""
					}`}
				>
					<label
						className={`block text-gray-600 text-sm font-normal ${
							isDarkMode ? "text-white" : ""
						}`}
					>
						Alternate Contact No:
					</label>
					{isEditingPersonalInfo ? (
						<input
							type="number"
							name="candidateInformation.cand_alternatecontactNo"
							value={
								editData.candidateInformation?.cand_alternatecontactNo || ""
							}
							onChange={handleChangeNotArray}
							className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
								isDarkMode ? "bg-gray-700 text-white" : ""
							}`}
						/>
					) : (
						<p
							className={`text-gray-800 font-semibold mt-1 ${
								isDarkMode ? "text-white" : ""
							}`}
						>
							{profile.candidateInformation?.cand_alternatecontactNo || "N/A"}
						</p>
					)}
				</div>
			</div>

			{/* email address */}

			{/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"></div> */}

			{/* Address */}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div
					className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
						isDarkMode ? "bg-gray-700 text-white" : ""
					}`}
				>
					<label
						className={`block text-gray-600 text-sm font-normal ${
							isDarkMode ? "text-white" : ""
						}`}
					>
						Present Address:
					</label>
					{isEditingPersonalInfo ? (
						<>
							<input
								type="text"
								name="candidateInformation.cand_presentAddress"
								value={editData.candidateInformation?.cand_presentAddress || ""}
								onChange={handleChangeNotArray}
								className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
									isDarkMode ? "bg-gray-700 text-white" : ""
								}`}
							/>
						</>
					) : (
						<p
							className={`text-gray-800 font-semibold mt-1 ${
								isDarkMode ? "text-white" : ""
							}`}
						>
							{profile.candidateInformation?.cand_presentAddress || "N/A"}
						</p>
					)}
				</div>
				<div
					className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
						isDarkMode ? "bg-gray-700 text-white" : ""
					}`}
				>
					<label
						className={`block text-gray-600 text-sm font-normal ${
							isDarkMode ? "text-white" : ""
						}`}
					>
						Permanent Address:
					</label>
					{isEditingPersonalInfo ? (
						<input
							type="text"
							name="candidateInformation.cand_permanentAddress"
							value={editData.candidateInformation?.cand_permanentAddress || ""}
							onChange={handleChangeNotArray}
							className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
								isDarkMode ? "bg-gray-700 text-white" : ""
							}`}
						/>
					) : (
						<p
							className={`text-gray-800 font-semibold mt-1 ${
								isDarkMode ? "text-white" : ""
							}`}
						>
							{profile.candidateInformation?.cand_permanentAddress || "N/A"}
						</p>
					)}
				</div>
			</div>

			{/* date of birth */}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div
					className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
						isDarkMode ? "bg-gray-700 text-white" : ""
					}`}
				>
					<label
						className={`block text-gray-600 text-sm font-normal ${
							isDarkMode ? "text-white" : ""
						}`}
					>
						Date of Birth:
					</label>
					{isEditingPersonalInfo ? (
						<>
							<input
								type="date"
								name="candidateInformation.cand_dateofBirth"
								value={editData.candidateInformation?.cand_dateofBirth || ""}
								onChange={handleChangeNotArray}
								className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
									isDarkMode ? "bg-gray-700 text-white" : ""
								}`}
							/>
						</>
					) : (
						<p
							className={`text-gray-800 font-semibold mt-1 ${
								isDarkMode ? "text-white" : ""
							}`}
						>
							{profile.candidateInformation?.cand_dateofBirth || "N/A"}
						</p>
					)}
				</div>
				<div
					className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
						isDarkMode ? "bg-gray-700 text-white" : ""
					}`}
				>
					<label
						className={`block text-gray-600 text-sm font-normal mb-2 ${
							isDarkMode ? "text-white" : ""
						}`}
					>
						Gender:
					</label>
					{isEditingPersonalInfo ? (
						<div className="flex space-x-4">
							<label className="inline-flex items-center">
								<input
									type="radio"
									name="candidateInformation.cand_sex"
									value="Male"
									checked={editData.candidateInformation?.cand_sex === "Male"}
									onChange={handleChangeNotArray}
									className="form-radio h-5 w-5 text-green-600"
								/>
								<span
									className={`ml-2 text-gray-700 ${
										isDarkMode ? "text-white" : ""
									}`}
								>
									Male
								</span>
							</label>
							<label className="inline-flex items-center">
								<input
									type="radio"
									name="candidateInformation.cand_sex"
									value="Female"
									checked={editData.candidateInformation?.cand_sex === "Female"}
									onChange={handleChangeNotArray}
									className="form-radio h-5 w-5 text-green-600"
								/>
								<span
									className={`ml-2 text-gray-700 ${
										isDarkMode ? "text-white" : ""
									}`}
								>
									Female
								</span>
							</label>
						</div>
					) : (
						<p
							className={`text-gray-800 font-semibold mt-1 ${
								isDarkMode ? "text-white" : ""
							}`}
						>
							{profile.candidateInformation?.cand_sex || "N/A"}
						</p>
					)}
				</div>
			</div>

			{/* sss no and tin no */}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div
					className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
						isDarkMode ? "bg-gray-700 text-white" : ""
					}`}
				>
					<label
						className={`block text-gray-600 text-sm font-normal ${
							isDarkMode ? "text-white" : ""
						}`}
					>
						SSS NO:
					</label>
					{isEditingPersonalInfo ? (
						<>
							<input
								type="number"
								name="candidateInformation.cand_sssNo"
								value={editData.candidateInformation?.cand_sssNo || ""}
								onChange={handleChangeNotArray}
								className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
									isDarkMode ? "bg-gray-700 text-white" : ""
								}`}
							/>
						</>
					) : (
						<p
							className={`text-gray-800 font-semibold mt-1 ${
								isDarkMode ? "text-white" : ""
							}`}
						>
							{profile.candidateInformation?.cand_sssNo || "N/A"}
						</p>
					)}
				</div>
				<div
					className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
						isDarkMode ? "bg-gray-700 text-white" : ""
					}`}
				>
					<label
						className={`block text-gray-600 text-sm font-normal ${
							isDarkMode ? "text-white" : ""
						}`}
					>
						TIN NO:
					</label>
					{isEditingPersonalInfo ? (
						<input
							type="gender"
							name="candidateInformation.cand_tinNo"
							value={editData.candidateInformation?.cand_tinNo || ""}
							onChange={handleChangeNotArray}
							className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
								isDarkMode ? "bg-gray-700 text-white" : ""
							}`}
						/>
					) : (
						<p
							className={`text-gray-800 font-semibold mt-1 ${
								isDarkMode ? "text-white" : ""
							}`}
						>
							{profile.candidateInformation?.cand_tinNo || "N/A"}
						</p>
					)}
				</div>
			</div>

			{/* philhealt ug pagibig no */}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div
					className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
						isDarkMode ? "bg-gray-700 text-white" : ""
					}`}
				>
					<label
						className={`block text-gray-600 text-sm font-normal ${
							isDarkMode ? "text-white" : ""
						}`}
					>
						Philhealth NO:
					</label>
					{isEditingPersonalInfo ? (
						<>
							<input
								type="number"
								name="candidateInformation.cand_philhealthNo"
								value={editData.candidateInformation?.cand_philhealthNo || ""}
								onChange={handleChangeNotArray}
								className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
									isDarkMode ? "bg-gray-700 text-white" : ""
								}`}
							/>
						</>
					) : (
						<p
							className={`text-gray-800 font-semibold mt-1 ${
								isDarkMode ? "text-white" : ""
							}`}
						>
							{profile.candidateInformation?.cand_philhealthNo || "N/A"}
						</p>
					)}
				</div>
				<div
					className={`bg-gray-200 p-4 rounded-lg shadow-lg ${
						isDarkMode ? "bg-gray-700 text-white" : ""
					}`}
				>
					<label
						className={`block text-gray-600 text-sm font-normal ${
							isDarkMode ? "text-white" : ""
						}`}
					>
						Pagibig NO:
					</label>
					{isEditingPersonalInfo ? (
						<input
							type="gender"
							name="candidateInformation.cand_pagibigNo"
							value={editData.candidateInformation?.cand_pagibigNo || ""}
							onChange={handleChangeNotArray}
							className={`text-gray-800 font-semibold mt-1 w-full -b-2 pb-2 bg-transparent ${
								isDarkMode ? "bg-gray-700 text-white" : ""
							}`}
						/>
					) : (
						<p
							className={`text-gray-800 font-semibold mt-1 ${
								isDarkMode ? "text-white" : ""
							}`}
						>
							{profile.candidateInformation?.cand_pagibigNo || "N/A"}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default PersonalInformation;
