import React, { useEffect, useState } from "react";
import ViewInterviewCriteria from "./modals/ViewInterviewCriteria";
import { getDataFromSession, retrieveData } from "@/app/utils/storageUtils";
import axios from "axios";
import { toast } from "sonner";
import Spinner from "@/components/ui/spinner";
import DataTable from "@/app/my_components/DataTable";
import SelectedApplicant from "../modal/SelectedApplicant";

const InterviewPage = ({ handleChangeStatus }) => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [selectedCandId, setSelectedCandId] = useState(null);

  const handleOpenInterviewModal = () => {
    setIsInterviewModalOpen(true);
  };

  const handleCloseInterviewModal = () => {
    getInterviewCandidates();
    setIsInterviewModalOpen(false);
  };

  const getInterviewCandidates = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jsonData = { jobId: getDataFromSession("jobId") };
      const formData = new FormData();
      formData.append("operation", "getInterviewCandidates");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni getInterviewCandidates: ", res);
      setCandidates(res.data !== 0 ? res.data : []);
    } catch (error) {
      toast.error("Network error");
      console.log("InterviewPage.jsx ~ getInterviewCandidates(): " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnClickRow = (id) => {
    setSelectedCandId(id);
    handleOpenInterviewModal();
  };

  const columns = [
    { header: "Full Name", accessor: "fullName" },
    // { header: "Status", accessor: "status_name" },
    { header: "Schedule date", accessor: "schedDate" },
    { header: "Schedule time", accessor: "schedTime" },
  ];

  useEffect(() => {
    getInterviewCandidates();
  }, []);

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="p-3">
          <DataTable
            columns={columns}
            itemsPerPage={5}
            data={candidates}
            onRowClick={handleOnClickRow}
            idAccessor="cand_id"
            headerAction={<ViewInterviewCriteria />}
          />
        </div>
      )}
      {isInterviewModalOpen && (
        <SelectedApplicant
          open={isInterviewModalOpen}
          onHide={handleCloseInterviewModal}
          statusName="Interview"
          candId={selectedCandId}
          handleChangeStatus={handleChangeStatus}
        />
      )}
    </div>
  );
};

export default InterviewPage;
