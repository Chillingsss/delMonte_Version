import DataTable from "@/app/my_components/DataTable";
import { getDataFromSession, retrieveData } from "@/app/utils/storageUtils";
import Spinner from "@/components/ui/spinner";
import axios from "axios";
import React, { useEffect, useState } from "react";
import SelectedApplicant from "../modal/SelectedApplicant";
import { toast } from "sonner";

const DecisionPendingPage = ({ handleChangeStatus }) => {
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandId, setSelectedCandId] = useState(null);

  const getDecisionPendingCandidates = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jsonData = { jobId: getDataFromSession("jobId") };
      const formData = new FormData();
      formData.append("operation", "getDecisionPendingCandidates");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni getDecisionPendingCandidates: ", res);
      setCandidates(res.data !== 0 ? res.data : []);
    } catch (error) {
      toast.error("Network error");
      console.log(
        "DecisionPendingPage.jsx ~ getDecisionPendingCandidates(): " + error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    getDecisionPendingCandidates();
  };

  const handleOnClickRow = (id) => {
    setSelectedCandId(id);
    handleOpenModal();
  };

  useEffect(() => {
    getDecisionPendingCandidates();
  }, []);

  const columns = [
    { header: "Full Name", accessor: "fullName" },
    { header: "Status", accessor: "status_name" },
  ];

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <DataTable
          columns={columns}
          itemsPerPage={5}
          data={candidates}
          autoIndex={true}
          onRowClick={handleOnClickRow}
          idAccessor="cand_id"
        />
      )}
      {isModalOpen && (
        <SelectedApplicant
          open={isModalOpen}
          onHide={handleCloseModal}
          statusName="Decision Pending"
          candId={selectedCandId}
          handleChangeStatus={handleChangeStatus}
        />
      )}
    </div>
  );
};

export default DecisionPendingPage;
