import React, { useCallback, useEffect, useState } from "react";
import { getDataFromSession } from "@/app/utils/storageUtils";
import { toast } from "sonner";
import axios from "axios";
import DataTable from "@/app/my_components/DataTable";
import Spinner from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import SelectedApplicant from "../modal/SelectedApplicant";
import SetToInterviewModal from "./modal/SetToInterviewModal";
import PotentialCandidatesModal from "./modal/PotentialCandidatesModal";

const ViewApplicants = ({ handleChangeStatus }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [jobQualifications, setJobQualifications] = useState([]);
  const [passingPercentage, setPassingPercentage] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("0");
  const [showSelectedApplicant, setShowSelectedApplicant] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState(0);
  const [statusName, setStatusName] = useState("");

  const handleShowSelectedApplicant = (id, statusName) => {
    if (statusName === "Pending") {
      handleChangeStatus(id, 2);
      setStatusName("Processed");
    } else {
      setStatusName(statusName);
    }
    setSelectedApplicantId(id);
    setShowSelectedApplicant(true);
  };

  const handleCloseSelectedApplicant = () => {
    // getPendingDetails();
    setShowSelectedApplicant(false);
  };

  useEffect(() => {
    getPendingDetails();
    getJobQualifications();
  }, []);

  // Fetch candidates and passing percentage
  const getPendingDetails = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      formData.append("operation", "getPendingDetails");
      formData.append("json", JSON.stringify({ jobId: getDataFromSession("jobId") }));
      const response = await axios.post(url, formData);
      setCandidates(response.data.candidates || []);
      setPassingPercentage(response.data.passingPercentage[0]?.passing_percentage || 0);
    } catch (error) {
      toast.error("Network error");
      console.error("Error fetching candidates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch job qualifications
  const getJobQualifications = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      formData.append("operation", "getJobQualification");
      formData.append("json", JSON.stringify({ jobId: getDataFromSession("jobId") }));
      const response = await axios.post(url, formData);
      setJobQualifications(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch job qualifications");
      console.error("Error fetching job qualifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  async function getSimilarityScore(resume, jobDescription) {
    const response = await fetch("/api/semanticpoints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume, jobDescription }),
    });

    const data = await response.json();
    console.log("Similarity Score:", data.similarity);
    return data.similarity;
  }

  // Calculate the total score for each candidate
  const calculateScores = useCallback(async () => {
    // setIsLoading(true);
    try {
      let updatedCandidates = [];

      for (const candidate of candidates) {
        let totalPoints = 0;
        let maxPoints = 0;

        const calculateSimilarity = async (jobItems, candItems, pointsKey, jobItemName, candItemName) => {
          for (const jobItem of jobItems || []) {
            for (const candItem of candItems || []) {
              const similarity = await getSimilarityScore(jobItem[jobItemName], candItem[candItemName]);

              if (similarity >= 0.75) {
                totalPoints += jobItem[pointsKey]; // Add points only when similarity is 1
                break; // Stop checking once a match is found
              }
            }
            maxPoints += jobItem[pointsKey]; // Ensure maxPoints is counted correctly
          }
        };

        // Calculate scores for each category
        await calculateSimilarity(jobQualifications.jobEducation, candidate.courses, "jeduc_points", "course_categoryName", "course_categoryName");
        await calculateSimilarity(jobQualifications.jobSkills, candidate.skills, "jskills_points", "perS_name", "perS_name");
        await calculateSimilarity(jobQualifications.jobTrainings, candidate.trainings, "jtrng_points", "perT_name", "perT_name");
        await calculateSimilarity(jobQualifications.jobKnowledge, candidate.knowledge, "jknow_points", "knowledge_name", "knowledge_name");
        await calculateSimilarity(jobQualifications.jobExperience, candidate.employmentHistory, "jwork_points", "jwork_responsibilities", "empH_positionName");

        // Calculate final percentage
        const percentage = maxPoints > 0 ? ((totalPoints / maxPoints) * 100).toFixed(2) : 0;

        updatedCandidates.push({
          ...candidate,
          totalPoints: totalPoints.toFixed(2),
          maxPoints,
          percentage,
        });
      }

      setCandidates(updatedCandidates);
    } catch (error) {
      console.error("Error calculating scores:", error);
    } finally {
      setIsLoading(false);
    }
  }, [candidates, jobQualifications]);

  useEffect(() => {
    if (candidates.length > 0 && jobQualifications) {
      calculateScores();
    }
  }, [calculateScores, candidates.length, jobQualifications]);

  const columns = [
    { header: "Full Name", accessor: "FullName" },
    {
      header: "Total Points",
      accessor: (row) => `${row.totalPoints || "Calculating"}/${row.maxPoints || ""}`,
      className: (row) =>
        `${row.percentage >= passingPercentage ? "text-green-500" : "text-gray-500"}`,
      hiddenOnMobile: true,
    },
    {
      header: "Percentage",
      accessor: "percentage",
      className: (row) =>
        `${row.percentage >= passingPercentage ? "text-green-500" : "text-gray-500"}`,
      sortable: true,
    },
    { header: "Date", accessor: "Date", sortable: true, hiddenOnMobile: true },
    {
      header: "Status",
      accessor: "status_name",
      className: (row) =>
        `${row.status_name === "Pending" || row.status_name === "Processed" ? "text-green-500" : "text-gray-500"}`,
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-end ml-1 md:mx-3 ">
        <p>
          Passing percentage: <Badge>{passingPercentage ? passingPercentage : 0}%</Badge>
        </p>
      </div>
      <div className="p-3">
        {isLoading ? (
          <Spinner />
        ) : (
          <DataTable
            columns={columns}
            data={candidates}
            itemsPerPage={5}
            onRowClick={(row) =>
              handleShowSelectedApplicant(row.cand_id, row.status_name)
            }
            headerAction={
              <div className="flex">
                <SetToInterviewModal
                  datas={candidates}
                  passingPercentage={passingPercentage}
                  getPendingCandidates={getPendingDetails}
                />
                <PotentialCandidatesModal
                  passingPercentage={passingPercentage}
                />
              </div>
            }
          />
        )}
      </div>

      {showSelectedApplicant && (
        <SelectedApplicant
          open={showSelectedApplicant}
          candId={selectedApplicantId}
          onHide={handleCloseSelectedApplicant}
          statusName={statusName}
          handleChangeStatus={handleChangeStatus}
        />
      )}
    </div>
  );
};

export default ViewApplicants;
