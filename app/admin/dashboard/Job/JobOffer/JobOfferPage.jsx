import DataTable from "@/app/my_components/DataTable";
import {
  getDataFromCookie,
  getDataFromSession,
  retrieveData,
} from "@/app/utils/storageUtils";
import Spinner from "@/components/ui/spinner";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import SelectedApplicant from "../modal/SelectedApplicant";
import UpdateJobOffer from "./modals/UpdateJobOffer";
import { Trash2 } from "lucide-react";
import { formatDate } from "@/app/signup/page";
import ShowAlert, { showAlert } from "@/components/ui/show-alert";

const JobOfferPage = ({ handleChangeStatus }) => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandId, setSelectedCandId] = useState(null);

  const getJobOfferCandidates = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jsonData = { jobId: getDataFromSession("jobId") };
      const formData = new FormData();
      formData.append("operation", "getJobOfferCandidates");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni getJobOfferCandidates : ", res);
      setCandidates(res.data !== 0 ? res.data : []);
    } catch (error) {
      toast.error("Network error");
      console.log("JobOfferPage.jsx ~ getJobOfferCandidates(): " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    getJobOfferCandidates();
  };

  const handleOnClickRow = (id, isActionClick) => {
    if (!isActionClick) {
      setSelectedCandId(id);
      handleOpenModal();
    }
  };

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };
  const handleCloseAlert = async (status) => {
    if (status === 1) {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jsonData = {
        candId: selectedId,
        jobId: getDataFromCookie("jobId"),
      };
      const formData = new FormData();
      formData.append("operation", "deleteJobOffer");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni handleCloseAlert : ", res);
      if (res.data === 1) {
        handleChangeStatus(selectedId, 13);
        toast.success("Job offer deleted successfully");
        getJobOfferCandidates();
      } else {
        toast.error("Failed to delete job offer");
      }
    }
    setShowAlert(false);
  };
  const handleRemoveList = (dutyId) => {
    setSelectedId(dutyId);
    handleShowAlert(
      "This action cannot be undone. It will permanently remove the job offer"
    );
  };

  const columns = [
    { header: "Full Name", accessor: "fullName" },
    { header: "Document", accessor: "joboffer_document" },
    { header: "Salary", accessor: "joboffer_salary" },
    { header: "Date offered", accessor: "joboffer_date" },
    {
      header: "Date Expired",
      accessor: (row) => formatDate(row.joboffer_expiryDate),
    },
    {
      header: "Job Offer Status",
      accessor: "jobOfferStatus",
      className: "text-center",
    },
    {
      header: "Actions",
      cell: (row) => (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-3"
        >
          <div>
            <UpdateJobOffer
              candidate={row}
              getJobOfferCandidates={getJobOfferCandidates}
              handleChangeStatus={handleChangeStatus}
              disabled={row.jobOfferStatus !== "Pending"}
            />
          </div>
          <Trash2
            onClick={() =>
              row.jobOfferStatus === "Pending" && handleRemoveList(row.cand_id)
            }
            className={`w-5 h-5 ${
              row.jobOfferStatus === "Pending"
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-50"
            }`}
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    getJobOfferCandidates();
  }, []);

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <DataTable
          itemsPerPage={5}
          columns={columns}
          data={candidates}
          onRowClick={(id) => handleOnClickRow(id, false)}
          idAccessor="cand_id"
        />
      )}
      {isModalOpen && (
        <SelectedApplicant
          open={isModalOpen}
          onHide={handleCloseModal}
          statusName="Job Offer"
          candId={selectedCandId}
          handleChangeStatus={handleChangeStatus}
        />
      )}
      <ShowAlert
        open={showAlert}
        onHide={handleCloseAlert}
        message={alertMessage}
      />
    </div>
  );
};
export default JobOfferPage;
