"use client"
import JobAppliedChart from './JobAppliedChart'
import AdminActivityLogs from './AdminActivityLogs'
import AdminInterviewDashboard from './AdminInterviewDashboard'
import { getDataFromSession, storeDataInSession } from '@/app/utils/storageUtils';
import { useSession } from "next-auth/react";
import { getDataFromCookie } from '@/app/utils/storageUtils';

function AdminDashboard() {

  const { data: session } = useSession();
  const getUserIdFromCookie = () => {
    const tokenData = getDataFromCookie("auth_token");
    if (tokenData && tokenData.userId) {
      return tokenData.userId;
    }
    return null;
  };

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

  return (
    <div className='grid grid-cols-1 gap-4'>
      <JobAppliedChart />
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <AdminActivityLogs handleChangeStatus={handleChangeStatus} />
        <AdminInterviewDashboard handleChangeStatus={handleChangeStatus} />
      </div>
    </div>
  )
}

export default AdminDashboard
