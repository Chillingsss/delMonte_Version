import DataTable from '@/app/my_components/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import SelectedApplicant from './Job/modal/SelectedApplicant';
import { storeDataInSession } from '@/app/utils/storageUtils';

const AdminActivityLogs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showSelectedApplicant, setShowSelectedApplicant] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState(0);
  const [statusName, setStatusName] = useState("");

  const handleChangeStatus = async (id, status) => {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const userId = session?.user?.id || getUserIdFromCookie();
      const jsonData = {
        jobId: getDataFromSession("jobId"),
        candId: id,
        status: status,
        hrId: userId
      };
      console.log("jsonData: ", jsonData);
      const formData = new FormData();
      formData.append("json", JSON.stringify(jsonData));
      formData.append("operation", "changeApplicantStatus");
      const res = await axios.post(url, formData);
      console.log("AdminActivityLogs.jsx => handleChangeStatus(): ", res.data);
      if (res.data !== 1) {
        toast.error("There's something wrong");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("AdminActivityLogs.jsx => handleChangeStatus(): " + error);
    }
  };

  const getAdminActivityLogs = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      formData.append("operation", "getAdminActivityLogs");
      const res = await axios.post(url, formData);
      console.log("res ni getAdminActivityLogs", res.data);
      setActivityLogs(res.data !== 0 ? res.data : []);
    } catch (error) {
      toast.error("Network Error");
      console.log("AdminActivityLogs.jsx => getAdminActivityLogs(): " + error);
    } finally {
      setIsLoading(false);
    }
  }
  const handleCloseSelectedApplicant = () => {
    getAdminActivityLogs();
    setShowSelectedApplicant(false);
  };


  const columns = [
    { header: 'HR Name', accessor: 'HRName', className: (row) => row.fullName === "Kobid" ? "bg-red-500" : "" },
    { header: 'Candidate', accessor: 'CandName' },
    { header: 'Job', accessor: 'jobM_title', hiddenOnMobile: true },
    { header: 'Status', accessor: 'status_name' },
    { header: 'Date', accessor: 'appS_date', hiddenOnMobile: true, sortable: true },

  ];

  const handleShowSelectedApplicant = (id, status, jobId) => {
    setSelectedApplicantId(id);
    setShowSelectedApplicant(true);
    setStatusName(status);
    storeDataInSession("jobId", jobId);
  };

  useEffect(() => {
    getAdminActivityLogs();
  }, [])

  return (
    <div>
      {isLoading ? <Spinner /> :
        <>
          <Card>
            <CardContent>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>kunwari activity log description</CardDescription>
              </CardHeader>
              <DataTable
                data={activityLogs}
                columns={columns}
                itemsPerPage={10}
                onRowClick={(row) => handleShowSelectedApplicant(row.cand_id, row.status_name, row.jobM_id)}
              />
            </CardContent>
          </Card>
          {showSelectedApplicant && (
            <SelectedApplicant
              open={showSelectedApplicant}
              candId={selectedApplicantId}
              onHide={handleCloseSelectedApplicant}
              statusName={statusName}
              handleChangeStatus={handleChangeStatus}
            />
          )}
        </>
      }
    </div>
  )
}

export default AdminActivityLogs