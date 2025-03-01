import React, { useState, useEffect, useRef } from "react";
import { XCircle } from "lucide-react";

const TwoFactorAuthModal = ({
  showModal,
  onClose,
  onSubmit,
  onCancel,
  loading,
  twoFACode,
  setTwoFACode,
  onResendCode,
  resendLoading,
}) => {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [codes, setCodes] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, canResend]);

  useEffect(() => {
    // Update the twoFACode when individual codes change
    setTwoFACode(codes.join(""));
  }, [codes, setTwoFACode]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResend = () => {
    onResendCode();
    setCountdown(120);
    setCanResend(false);
  };

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);

    // Move to next input if value is entered
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !codes[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCodes = [...codes];
    for (let i = 0; i < pastedData.length; i++) {
      newCodes[i] = pastedData[i];
    }
    setCodes(newCodes);
  };

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
          <div className="flex gap-2 justify-between">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={codes[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl rounded-md bg-transparent border-2 border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-[#151513]"
                required
                autoFocus={index === 0}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onSubmit}
            className="flex-1 bg-[#004F39] hover:bg-green-800 text-green-100 py-3 rounded-lg transition duration-200"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg transition duration-200"
            disabled={loading}
          >
            Cancel Login
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Check your email for the verification code
          </p>
          {!canResend ? (
            <p className="text-sm text-gray-500">
              Resend available in{" "}
              <span className="font-medium">{formatTime(countdown)}</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendLoading || !canResend}
              className="text-[#004F39] hover:text-green-700 text-sm font-medium underline disabled:opacity-50"
            >
              {resendLoading ? "Sending..." : "Resend Code"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthModal;
