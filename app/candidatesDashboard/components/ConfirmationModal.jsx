"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ConfirmationModal = ({
	isOpen,
	onRequestClose,
	onConfirm,
	message,
	title = "Confirmation",
	isDarkMode,
}) => {
	// Handle escape key press
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape" && isOpen) {
				onRequestClose();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onRequestClose]);

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center">
					{/* Backdrop/Overlay */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
						onClick={onRequestClose}
					/>

					{/* Modal */}
					<motion.div
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.95, opacity: 0 }}
						transition={{ type: "spring", damping: 20, stiffness: 300 }}
						className={`relative w-full max-w-md rounded-xl shadow-xl overflow-hidden ${
							isDarkMode
								? "bg-gray-800 text-gray-100"
								: "bg-white text-gray-800"
						}`}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Content */}
						<div className="p-6">
							<h2 className="text-xl font-semibold mb-3">{title}</h2>
							<p
								className={`mb-6 ${
									isDarkMode ? "text-gray-300" : "text-gray-600"
								}`}
							>
								{message}
							</p>

							{/* Actions */}
							<div className="flex items-center justify-end gap-3">
								<button
									onClick={onRequestClose}
									className={`px-4 py-2 rounded-lg font-medium transition-colors ${
										isDarkMode
											? "bg-gray-700 hover:bg-gray-600 text-gray-300"
											: "bg-gray-100 hover:bg-gray-200 text-gray-700"
									}`}
								>
									Cancel
								</button>
								<button
									onClick={onConfirm}
									className={`px-4 py-2 rounded-lg font-medium transition-colors ${
										isDarkMode
											? "bg-blue-100 hover:bg-blue-200 text-blue-600 border-blue-200 border-2"
											: "bg-blue-100 hover:bg-blue-200/80 text-blue-600 border-blue-200 border-2"
									}`}
								>
									Confirm
								</button>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
};

export default ConfirmationModal;
