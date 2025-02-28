import React from "react";
import { XCircle } from "lucide-react";

const TwoFactorAuthModal = ({
  showModal,
  onClose,
  onSubmit,
  onCancel,
  loading,
  twoFACode,
  setTwoFACode,
}) => {
  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${
        showModal ? "" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90%]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-[#004F39]">
            Two-Factor Authentication
          </h3>
        </div>

        <div className="mb-4">
          <label className="block text-gray-500 mb-2" htmlFor="twoFACode">
            Enter 2FA Code
          </label>
          <input
            id="twoFACode"
            type="text"
            placeholder="Enter 6-digit code"
            value={twoFACode}
            onChange={(e) =>
              setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="w-full p-2 rounded-md bg-transparent border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-[#151513]"
            required
            maxLength={6}
            autoFocus
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onSubmit}
            className="flex-1 bg-[#004F39] hover:bg-green-800 text-green-100 py-3 rounded-lg transition duration-200"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify 2FA Code"}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg transition duration-200"
            disabled={loading}
          >
            Cancel Login
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-500 text-center">
          Check your email for the verification code
        </p>
      </div>
    </div>
  );
};

export default TwoFactorAuthModal;
