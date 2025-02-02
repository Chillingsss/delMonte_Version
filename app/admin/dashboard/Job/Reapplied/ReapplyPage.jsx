import React, { useEffect, useState } from "react";
import axios from "axios";
import { getDataFromSession, retrieveData } from "@/app/utils/storageUtils";
import { toast } from "sonner";
import Spinner from "@/components/ui/spinner";
import DataTable from "@/app/my_components/DataTable";
import SelectedApplicant from "../modal/SelectedApplicant";

const ReapplyPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [selectedCandId, setSelectedCandId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const handleOpenInterviewModal = () => {
    setIsInterviewModalOpen(true);
  };

  const handleCloseInterviewModal = () => {
    getReappliedCandidates();
    setIsInterviewModalOpen(false);
  };

  const getReappliedCandidates = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jsonData = { jobId: getDataFromSession("jobId") };
      const formData = new FormData();
      formData.append("operation", "getReappliedCandidates");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni getReappliedCandidates: ", res);
      setCandidates(res.data !== 0 ? res.data : []);
    } catch (error) {
      toast.error("Network error");
      console.log("ReapplyPage.jsx ~ getReappliedCandidates(): " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { header: "Full Name", accessor: "fullName" },
    { header: "Date Reapplied", accessor: "appS_date", sortable: true },
    { header: "Status", accessor: "status" },
  ];

  const handleOnClickRow = (id) => {
    const selectedCandidate = candidates.find(
      (candidate) => candidate.cand_id === id
    );
    setSelectedCandId(id);
    setSelectedStatus(selectedCandidate.status);
    handleOpenInterviewModal();
  };

  useEffect(() => {
    getReappliedCandidates();
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
            autoIndex={true}
            onRowClick={handleOnClickRow}
            idAccessor="cand_id"
          />
        </div>
      )}
      {isInterviewModalOpen && (
        <SelectedApplicant
          open={isInterviewModalOpen}
          onHide={handleCloseInterviewModal}
          statusName={"Reapplied"}
          candId={selectedCandId}
          // handleChangeStatus={handleChangeStatus}
        />
      )}
    </div>
  );
};

export default ReapplyPage;
