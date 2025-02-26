import DataTable from '@/app/my_components/DataTable';
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import { useEffect, useState } from 'react'
import { toast } from 'sonner';
import AddTraining from './modal/AddMasterfileForms/AddTrainingMaster';
import UpdateMasterfile from './modal/UpdateMasterfile';
import { Trash2 } from 'lucide-react';
import UpdateTraining from './modal/UpdateMasterfileForms/UpdateTraining';
import ShowAlert from '@/components/ui/show-alert';
import AddTrainingMaster from './modal/AddMasterfileForms/AddTrainingMaster';

const TrainingMaster = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const addColumn = (values, id) => {
    console.log("values", values);
    setData([...data, { ...values, perT_id: id }]);
  }

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

  const handleRemoveList = (trainingId) => {
    setSelectedId(trainingId);
    handleShowAlert("This action cannot be undone. It will permanently delete the item and remove it from your list");
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      const jsonData = { trainingId: id }
      formData.append("operation", "deleteTraining");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni handleDelete: ", res.data);
      if (res.data === -1) {
        toast.error("Failed to delete, there's a transaction using this training");
      } else if (res.data === 1) {
        toast.success("Training deleted successfully");
        getData();
      } else {
        toast.error("Failed to delete training");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("TrainingMaster.jsx ~ handleDelete ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const columns = [
    { header: "Training", accessor: "perT_name", sortable: true },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-4">
          <UpdateTraining
            data={data}
            id={row.perT_id}
            currentName={row.perT_name}
            getData={getData}
          />
          <Trash2 className="h-5 w-5 cursor-pointer" onClick={() => handleRemoveList(row.perT_id)} />
        </div>
      )
    }
  ]

  const getData = async () => {
    try {
      setIsLoading(true);
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append("operation", "getTraining");
      const res = await axios.post(url, formData);
      console.log("res.data ni getData: ", res.data);
      if (res.data !== 0) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("TrainingMaster.jsx ~ getData ~ error:", error);
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
            title="Training"
            data={data}
            columns={columns}
            autoIndex={true}
            add={
              <AddTrainingMaster
                title="training"
                subject="training"
                getData={getData}
                data={data}
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

export default TrainingMaster
