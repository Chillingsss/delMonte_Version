import DataTable from '@/app/my_components/DataTable';
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import ShowAlert from '@/components/ui/show-alert';
import AddInterviewCriteriaMaster from './modal/AddMasterfileForms/AddInterviewCriteriaMaster';
import UpdateInterviewCriteriaMaster from './modal/UpdateMasterfileForms/UpdateInterviewCriteriaMaster';
// import AddInterviewCriteriaMaster from './modal/AddMasterfileForms/AddInterviewCriteriaMaster';
// import UpdateInterviewCriteria from './modal/UpdateMasterfileForms/UpdateInterviewCriteria';

const InterviewCriteriaMaster = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addColumn = (values, newId) => {
    setData([...data, {
      criteria_inter_id: newId,
      criteria_inter_name: values.interviewCriteriaName,
      interview_categ_name: values.interviewCategoryId,
      interview_categ_id: values.interview_categ_id
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
  const handleRemoveList = (criteriaId) => {
    setSelectedId(criteriaId);
    handleShowAlert("This action cannot be undone. It will permanently delete the item and remove it from your list");
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      const jsonData = { criteriaId: selectedId }
      formData.append("operation", "deleteInterviewCriteriaMaster");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni handleDelete: ", res.data);
      if (res.data === -1) {
        toast.error("Failed to delete, there's a transaction using this interview criteria");
      } else if (res.data === 1) {
        toast.success("Interview criteria deleted successfully");
        getData();
      } else {
        toast.error("Failed to delete interview criteria");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("InterviewCriteriaMaster.jsx ~ handleDelete ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const columns = [
    { header: "Interview Criteria", accessor: "criteria_inter_name", sortable: true },
    { header: "Category", accessor: "interview_categ_name", sortable: true },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-4">
          <UpdateInterviewCriteriaMaster
            data={data}
            id={row.criteria_inter_id}
            categoryId={row.interview_categ_id}
            currentName={row.criteria_inter_name}
            getData={getData}
          />
          <Trash2 className="h-5 w-5 cursor-pointer" onClick={() => handleRemoveList(row.criteria_inter_id)} />
        </div>
      )
    }
  ]

  const getData = async () => {
    try {
      setIsLoading(true);
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append("operation", "getInterviewCriteriaMasterFiles");
      const res = await axios.post(url, formData);
      console.log("res.data ni interview criteria: ", res.data);
      if (res.data !== 0) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("InterviewCriteriaMaster.jsx ~ getData ~ error:", error);
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
            title="Interview Criteria"
            data={data}
            columns={columns}
            autoIndex={true}
            add={
              <AddInterviewCriteriaMaster
                title="interview criteria"
                subject="interviewCriteria"
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

export default InterviewCriteriaMaster
