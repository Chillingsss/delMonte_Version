"use client";

import React from "react";

const ResumeConfirmationModal = ({
  isOpen,
  onRequestClose,
  onConfirm,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-opacity-10 flex items-center justify-center z-50"
      onClick={onRequestClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Confirmation</h2>
          <p className="mb-4">{message}</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={onRequestClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeConfirmationModal;
