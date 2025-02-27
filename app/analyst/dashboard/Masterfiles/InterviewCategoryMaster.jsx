import DataTable from '@/app/my_components/DataTable';
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import { useEffect, useState } from 'react'
import { toast } from 'sonner';
// import AddInterviewCategoryMaster from './modal/AddMasterfileForms/AddInterviewCategoryMaster';
// import UpdateInterviewCategory from './modal/UpdateMasterfileForms/UpdateInterviewCategory';
import { Trash2 } from 'lucide-react';
import ShowAlert from '@/components/ui/show-alert';
import AddInterviewCategoryMaster from './modal/AddMasterfileForms/AddInterviewCategoryMaster';
import UpdateInterviewCategory from './modal/UpdateMasterfileForms/UpdateInterviewCategory';

const InterviewCategoryMaster = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addColumn = (values, newId) => {
    setData([...data, {
      interview_categ_id: newId,
      interview_categ_name: values.interviewCategoryName,
      interview_categ_status: 1
    }]);
  }

  // delete masterfile
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };
  const handleCloseAlert = (status) => {
    if (status === 1) {
      handleDelete(selectedId);
    }
    setShowAlert(false);
  };
  const handleRemoveList = (categId) => {
    setSelectedId(categId);
    handleShowAlert("This action cannot be undone. It will permanently delete the item and remove it from your list");
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      const jsonData = { interviewCategoryId: selectedId }
      formData.append("operation", "deleteInterviewCategory");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni handleDelete: ", res.data);
      if (res.data === -1) {
        toast.error("Failed to delete, there's a transaction using this interview category");
      } else if (res.data === 1) {
        toast.success("Interview category deleted successfully");
        getData();
      } else {
        toast.error("Failed to delete interview category");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("InterviewCategoryMaster.jsx ~ handleDelete ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const columns = [
    { header: "Interview Category", accessor: "interview_categ_name", sortable: true },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-4">
          <UpdateInterviewCategory
            data={data}
            id={row.interview_categ_id}
            currentName={row.interview_categ_name}
            getData={getData}
          />
          <Trash2 className="h-5 w-5 cursor-pointer" onClick={() => handleRemoveList(row.interview_categ_id)} />
        </div>
      )
    }
  ]

  const getData = async () => {
    try {
      setIsLoading(true);
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append("operation", "getInterviewCategory");
      const res = await axios.post(url, formData);
      console.log("res.data ni interview category: ", res.data);
      if (res.data !== 0) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("InterviewCategoryMaster.jsx ~ getData ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      {isLoading ? <Spinner /> : (
        <>
          <DataTable
            title="Interview Category"
            data={data}
            columns={columns}
            autoIndex={true}
            add={
              <AddInterviewCategoryMaster
                title="interview category"
                subject="interviewCategory"
                data={data}
                getData={getData}
                addColumn={addColumn}
              />
            }
          />
        </>
      )}
      <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} />
    </div>
  )
}

export default InterviewCategoryMaster
