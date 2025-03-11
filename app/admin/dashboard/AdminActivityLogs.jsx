import DataTable from '@/app/my_components/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import SelectedApplicant from './Job/modal/SelectedApplicant';
import { getDataFromSession, storeDataInSession } from '@/app/utils/storageUtils';

const AdminActivityLogs = ({ handleChangeStatus }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showSelectedApplicant, setShowSelectedApplicant] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState(0);
  const [statusName, setStatusName] = useState("");

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
    { header: 'HR Name', accessor: 'HRName' },
    { header: 'Candidate', accessor: 'CandName' },
    { header: 'Job', accessor: 'jobM_title', hiddenOnMobile: true },
    { header: 'Status', accessor: 'status_name' },
    { header: 'Date', accessor: 'appS_date', hiddenOnMobile: true, sortable: true },

  ];

  const handleShowSelectedApplicant = (id, status, jobId) => {
    setSelectedApplicantId(id);
    console.log("id: ", id);
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
                <CardDescription>View and manage the activity logs of applicants.</CardDescription>
              </CardHeader>
              <DataTable
                data={activityLogs}
                columns={columns}
                hideSearch={true}
                itemsPerPage={5}
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