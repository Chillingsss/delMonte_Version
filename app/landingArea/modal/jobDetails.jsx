"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { retrieveData } from "@/app/utils/storageUtils";

const JobDetailsModal = ({ job, onCloses }) => {
  const modalRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const formData = new FormData();
        formData.append("operation", "getActiveJob");
        const response = await axios.post(url, formData);

        if (Array.isArray(response.data)) {
          console.log("Setting jobs:", response.data);
          setJobs(response.data);
        } else if (response.data.error) {
          console.error("Server error:", response.data.error);
          setError("Error fetching jobs: " + response.data.error);
        } else {
          console.error("Invalid data format:", response.data);
          setError("Unexpected data format received from server.");
        }
      } catch (error) {
        console.error(
          "Error fetching jobs:",
          error.response || error.message || error
        );
        setError("Error fetching jobs");
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  // useEffect(() => {
  //   function handleClickOutside(event) {
  //     if (modalRef.current && !modalRef.current.contains(event.target)) {
  //       onClose();
  //     }
  //   }

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [onClose]);

  if (!job) return null;

  const dutiesArray = job.duties_text ? job.duties_text.split("|") : [];
  const educationArray = job.course_categoryName
    ? job.course_categoryName.split("|").join(", ")
    : [];
  const workResponsibilitiesArray = job.jwork_responsibilities
    ? job.jwork_responsibilities
        .split("|")
        .map((responsibility) => responsibility.trim())
    : [];

  const workDurationsArray = job.jwork_duration
    ? job.jwork_duration.split("|").map((duration) => duration.trim())
    : [];

  const workDetailsArray = workResponsibilitiesArray.map(
    (responsibility, index) => ({
      responsibility: responsibility || "",
      duration: workDurationsArray[index] || "",
    })
  );

  const knowledgeArray = job.knowledge_name
    ? job.knowledge_name.split("|").join(", ")
    : [];

  const skillsArray = job.jskills_text ? job.jskills_text.split("|") : [];
  const trainingArray = job.perT_name
    ? job.perT_name.split("|").join(", ")
    : [];

  const licenseArray = job.license_master_name
    ? job.license_master_name.split("|").join(", ")
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="relative p-6 rounded-lg max-w-4xl w-full bg-white text-black"
      >
        {/* Fixed title at the top inside the modal */}
        <div className="sticky top-0 left-0 right-0 bg-white z-10 pb-4 border-b border-gray-200 text-[#0A6338] text-center">
          <h2 className="text-xl font-bold mb-4">{job.jobM_title}</h2>
        </div>

        <div
          className="overflow-y-auto scrollbar-custom"
          style={{ paddingBottom: "6rem", maxHeight: "70vh" }}
        >
          {job.jobM_description && job.jobM_description.trim() !== "" && (
            <>
              <h2 className="text-lg font-bold mb-4">Job Description:</h2>
              <p className="mb-8">{job.jobM_description}</p>
            </>
          )}

          {dutiesArray.length > 0 && (
            <>
              <h2 className="text-lg font-bold mb-4">
                Duties and Responsibilities:
              </h2>
              <ul className="list-disc pl-5 mb-8">
                {dutiesArray.map((duty, index) => (
                  <li key={index} className="mb-2">
                    {duty}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Qualifications Section */}
          <div>
            <h2 className="text-lg font-bold mb-4">Qualifications:</h2>

            {educationArray.length > 0 && (
              <>
                {/* <h3 className="text-md font-semibold mb-2">Education:</h3> */}
                <ul className="list-disc pl-5 mb-4">
                  <li className="mb-2">
                    Graduate of any {educationArray} courses.
                  </li>
                </ul>
              </>
            )}

            {licenseArray.length > 0 && (
              <>
                <ul className="list-disc pl-5 mb-4">
                  <li className="mb-2">
                    Having a {licenseArray} is considered an advantage.
                  </li>
                </ul>
              </>
            )}

            {trainingArray.length > 0 && (
              <>
                {/* <h3 className="text-md font-semibold mb-2">Training:</h3> */}
                <ul className="list-disc pl-5 mb-4">
                  <li className="mb-2">With training in {trainingArray} </li>
                </ul>
              </>
            )}

            <div className="job-details">
              {workDetailsArray.length > 0 && (
                <>
                  {/* <h3 className="text-md font-semibold mb-2">
                    Work Experience:
                  </h3> */}
                  <ul className="list-disc pl-5">
                    {workDetailsArray.map((detail, index) => (
                      <li key={index} className="mb-2">
                        <p>
                          atleast {detail.duration} years,{" "}
                          {detail.responsibility}
                        </p>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {knowledgeArray.length > 0 && (
              <>
                {/* <h3 className="text-md font-semibold mb-2">Knowledge:</h3> */}
                <ul className="list-disc pl-5 mb-4 mt-4">
                  <li className="mb-2">
                    Knowledge in {knowledgeArray}{" "}
                    {/* Display knowledge as a single bullet point */}
                  </li>
                </ul>
              </>
            )}

            {skillsArray.length > 0 && (
              <>
                {/* <h3 className="text-md font-semibold mb-2">Skills:</h3> */}
                <ul className="list-disc pl-5 mb-4">
                  {skillsArray.map((skill, index) => (
                    <li key={index} className="mb-2 mt-4">
                      {skill}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Duties and Responsibilities Section */}
        </div>

        {/* Fixed buttons at the bottom inside the modal */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-between">
          <Link href="/login">
            <button
              className="px-4 py-2 rounded-md bg-[#188C54] text-white relative transition-transform duration-300 ease-in-out hover:scale-105 hover:-translate-y-1"
              style={{
                boxShadow: "0 10px 15px rgba(0, 0, 0, 0.3)",
              }}
            >
              Apply
            </button>
          </Link>

          <button
            onClick={onCloses}
            className="px-4 py-2 rounded-md bg-gray-500 text-white relative transition-transform duration-300 ease-in-out hover:scale-105 hover:-translate-y-1"
            style={{
              boxShadow: "0 10px 15px rgba(0, 0, 0, 0.3)",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsModal;
