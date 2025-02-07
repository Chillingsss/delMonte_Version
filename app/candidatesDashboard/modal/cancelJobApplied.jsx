// app/candidatesDashboard/sideBar/CancelJobModal.jsx
import { getDataFromCookie } from "@/app/utils/storageUtils";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast"; // Updated import

const CancelJobModal = ({
  jobTitle,
  jobMId,
  jobAppId,
  onCancel,
  onClose,
  fetchAppliedJobs,
  fetchJobs,
  fetchNotification,
}) => {
  const { data: session, status } = useSession();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const handleCancelJob = async () => {
    const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
    const userId = session.user.id;
    console.log("User ID:", userId);

    try {
      const formData = new FormData();
      formData.append("operation", "cancelJobApplied");
      formData.append(
        "json",
        JSON.stringify({ user_id: userId, jobId: jobMId, appId: jobAppId })
      );

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.error) {
        // console.error(response.data.error);
        toast.error(response.data.error);
      } else {
        // console.log(response.data.success);
        toast.success("Job application cancelled successfully.");

        if (fetchAppliedJobs) {
          fetchAppliedJobs();
        }
        if (fetchNotification) {
          fetchNotification();
        }
        if (fetchJobs) {
          fetchJobs();
        }

        setIsRedirecting(true);
        setTimeout(() => {
          setIsRedirecting(false);
          onClose();
        }, 6000);
      }
    } catch (error) {
      toast.error("Error cancelling job application:", error);
    } finally {
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-200"
        >
          <FaTimes className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Cancel Job Application
        </h2>
        <p className="text-gray-700 mb-6">
          Are you sure you want to cancel your application for:{" "}
          <strong className="text-gray-900">{jobTitle}</strong>?
        </p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleCancelJob}
            className="bg-red-600 text-white px-6 py-2 rounded shadow hover:bg-red-700 transition duration-200"
          >
            Cancel Application
          </button>
        </div>
      </div>
      <Toaster position="bottom-left" />

      {isRedirecting && (
        <div className="fixed inset-0 bg-[#01472B] bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <l-hourglass
              size="40"
              bg-opacity="0.1"
              speed="1.75"
              color="white"
            ></l-hourglass>
            <p className="text-white text-xl font-semibold mt-4">Cancel Job</p>
            <p className="text-green-300 mt-2">
              Thank you for your request to cancel the job application. We are
              currently processing your request.
            </p>
            <p className="text-green-300 mt-2">
              We appreciate your effort and interest in this position.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelJobModal;
