import { getDataFromSession } from '@/app/utils/storageUtils';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import SelectedApplicant from "../modal/SelectedApplicant";
import Spinner from '@/components/ui/spinner';
import DataTable from '@/app/my_components/DataTable';

const MedicalPage = ({ handleChangeStatus }) => {

  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [selectedCandId, setSelectedCandId] = useState(null);

  const handleOpenMedicalModal = () => {
    setIsMedicalModalOpen(true);
  };

  const handleCloseMedicalModal = () => {
    getMedicalCandidate();
    setIsMedicalModalOpen(false);
  };

  const getMedicalCandidate = async () => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jsonData = { jobId: getDataFromSession("jobId") };
      console.log("jsondata", JSON.stringify(jsonData));
      const formData = new FormData();
      formData.append("operation", "getMedicalCandidate");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni getMedicalCandidate: ", res);
      setCandidates(res.data !== 0 ? res.data : []);
    } catch (error) {
      toast.error("Network error");
      console.log("MedicalPage.jsx ~ getMedicalCandidate(): " + error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleOnClickRow = (id) => {
    setSelectedCandId(id);
    handleOpenMedicalModal();
  };

  const columns = [
    { header: "Full Name", accessor: "fullName" },
    { header: "Status", accessor: "status_name" },
  ];

  useEffect(() => {
    getMedicalCandidate();
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
          />
        </div>
      )}
      {isMedicalModalOpen && (
        <SelectedApplicant
          open={isMedicalModalOpen}
          onHide={handleCloseMedicalModal}
          statusName="Medical Check"
          candId={selectedCandId}
          handleChangeStatus={handleChangeStatus}
        />
      )}
    </div>
  )
}

export default MedicalPage