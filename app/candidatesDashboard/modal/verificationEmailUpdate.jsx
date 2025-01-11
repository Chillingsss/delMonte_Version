"use client";

import React, { useState } from 'react';

const VerificationEmailUpdate = ({ onSubmit, onClose }) => {
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    onSubmit(code);
  };

  return (
    <div className="bg-white p-4 shadow-lg rounded-lg border">
      <h2 className="text-lg font-bold mb-2">Enter Verification Code</h2>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="border p-2 w-full"
        placeholder="Enter code"
      />
      <div className="mt-4 flex justify-between">
        <button
          onClick={handleSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded">
          Verify
        </button>
        <button
          onClick={onClose}
          className="bg-red-500 text-white px-4 py-2 rounded">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default VerificationEmailUpdate;
