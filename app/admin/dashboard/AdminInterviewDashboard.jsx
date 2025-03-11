import DataTable from '@/app/my_components/DataTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import SelectedApplicant from './Job/modal/SelectedApplicant'
import { storeDataInSession } from '@/app/utils/storageUtils'

const AdminInterviewDashboard = ({ handleChangeStatus }) => {
  const [interviewSchedule, setInterviewSchedule] = useState([])
  const [showSelectedApplicant, setShowSelectedApplicant] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState(0);
  const [statusName, setStatusName] = useState("");
  const [isLoading, setIsLoading] = useState(false)

  const getInterviewSchedule = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php"
      const formData = new FormData()
      formData.append("operation", "getInterviewSchedule")
      const res = await axios.post(url, formData)
      setInterviewSchedule(res.data !== 0 ? res.data : []);
      console.log("res ni getInterviewSchedule", res.data)
    } catch (error) {
      toast.error("Network error")
      console.log("AdminInterviewDashboard.jsx => getInterviewSchedule(): " + error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseSelectedApplicant = () => {
    getInterviewSchedule();
    setShowSelectedApplicant(false);
  };

  const columns = [
    { header: 'Candidate', accessor: 'FullName' },
    { header: 'Job', accessor: 'jobM_title' },
    { header: 'Date', accessor: 'intsched_date', sortable: true },

  ];

  const handleShowSelectedApplicant = (id, jobId) => {
    setSelectedApplicantId(id);
    console.log("id: ", id);
    setShowSelectedApplicant(true);
    setStatusName("Interview");
    storeDataInSession("jobId", jobId);
  };

  useEffect(() => {
    getInterviewSchedule();
  }, [])
  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Schedule</CardTitle>
        <CardDescription>Upcoming interviews</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable
          data={interviewSchedule}
          columns={columns}
          hideSearch={true}
          itemsPerPage={5}
          onRowClick={(row) => handleShowSelectedApplicant(row.cand_id, row.jobM_id)}
        />
      </CardContent>
      {showSelectedApplicant && (
        <SelectedApplicant
          open={showSelectedApplicant}
          candId={selectedApplicantId}
          onHide={handleCloseSelectedApplicant}
          statusName={statusName}
          handleChangeStatus={handleChangeStatus}
        />
      )}
    </Card>
  )
}

export default AdminInterviewDashboard