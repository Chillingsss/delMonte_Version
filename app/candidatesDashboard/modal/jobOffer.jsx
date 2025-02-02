import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { tailChase } from "ldrs";
import { getDataFromSession, retrieveData } from "@/app/utils/storageUtils";

tailChase.register();

const JobOfferModal = ({
  jobOfferDetails,
  onClose,
  fetchJobOffer,
  fetchAppliedJobs,
  fetchNotification,
  fetchJobs,
  appId,
}) => {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [responseType, setResponseType] = useState("");

  if (!jobOfferDetails) return null;

  const handleResponse = async (status) => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const candId = getDataFromSession("user_id");

      const jsonData = {
        job_offer_id: jobOfferDetails.joboffer_id,
        status: status,
        app_id: appId,
        cand_id: candId,
      };

      const formData = new FormData();
      formData.append("operation", "insertCandidateJobOfferResponse");
      formData.append("json", JSON.stringify(jsonData));

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        console.error(data.error);
        toast.error(data.error);
      } else {
        setResponseType(status);

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
        // toast.success("Response submitted successfully!");
        // await fetchAppliedJobs();
        setTimeout(() => {
          setIsRedirecting(false);
          onClose();
        }, 5000);
      }
    } catch (error) {
      console.error("Error submitting response:", error);
      toast.error("Error submitting response: " + error.message);
    }
  };

  return (
    <div className="relative">
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
          ></div>
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3
                      className="text-lg sm:text-2xl leading-6 font-bold text-gray-900"
                      id="modal-title"
                    >
                      Job Offer Details
                    </h3>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <span className="sr-only">Close</span>
                      <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-4 bg-gray-50 p-6 rounded-lg shadow-md">
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
                      {jobOfferDetails.jobM_title}
                    </h4>
                    <div className="space-y-3 text-sm">
                      <p className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Salary:
                        </span>
                        <span className="text-gray-600">
                          {jobOfferDetails.joboffer_salary}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Document:
                        </span>
                        <span className="text-gray-600">
                          {jobOfferDetails.joboffer_document}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Expiry Date:
                        </span>
                        <span className="text-gray-600">
                          {new Date(
                            jobOfferDetails.joboffer_expiryDate
                          ).toLocaleDateString()}
                        </span>
                      </p>

                      <p className="flex justify-between">
                        <span className="font-medium text-gray-700">Date:</span>
                        <span className="text-gray-600">
                          {new Date(
                            jobOfferDetails.statusjobO_date
                          ).toLocaleDateString()}
                        </span>
                      </p>

                      <p className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Status:
                        </span>
                        <span className="text-gray-600">
                          {jobOfferDetails.jobofferS_name}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={() => handleResponse("accept")}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-lg px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm transition duration-200 ease-in-out transform hover:scale-105"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => handleResponse("decline")}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-lg px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition duration-200 ease-in-out transform hover:scale-105"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
        {isRedirecting && (
          <div className="fixed inset-0 bg-[#01472B] bg-opacity-90 flex items-center justify-center z-50">
            <div className="text-center">
              <l-tail-chase
                size="40"
                speed="2.1"
                color="#ffffff"
              ></l-tail-chase>
              <p className="text-white text-xl font-semibold mt-4">
                {responseType === "accept"
                  ? "Congratulations!"
                  : "Thank you for your response"}
              </p>
              <p className="text-green-300 mt-2">
                {responseType === "accept"
                  ? "We're preparing your onboarding details. Welcome aboard!"
                  : "We appreciate your prompt response and wish you success in your future endeavors"}
              </p>
            </div>
          </div>
        )}
      </div>
      <Toaster position="bottom-left" />
    </div>
  );
};

export default JobOfferModal;
