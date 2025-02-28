import DataTable from '@/app/my_components/DataTable';
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import { useEffect, useState } from 'react'
import { toast } from 'sonner';
import UpdateKnowledge from './modal/UpdateMasterfileForms/UpdateKnowledge';
import { Trash2 } from 'lucide-react';
import ShowAlert from '@/components/ui/show-alert';
import AddKnowledgeMaster from './modal/AddMasterfileForms/AddKnowledgeMaster';

const KnowledgeMaster = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addColumn = (values, newId) => {
    setData([...data, {
      knowledge_id: newId,
      knowledge_name: values.knowledgeName
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
  const handleRemoveList = (knowledgeId) => {
    setSelectedId(knowledgeId);
    handleShowAlert("This action cannot be undone. It will permanently delete the item and remove it from your list");
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      const jsonData = { knowledgeId: selectedId }
      formData.append("operation", "deleteKnowledge");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni handleDelete: ", res.data);
      if (res.data === -1) {
        toast.error("Failed to delete, there's a transaction using this knowledge");
      } else if (res.data === 1) {
        toast.success("Knowledge deleted successfully");
        getData();
      } else {
        toast.error("Failed to delete knowledge");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("KnowledgeMaster.jsx ~ handleDelete ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const columns = [
    { header: "Knowledge and Compliance", accessor: "knowledge_name", sortable: true },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-4">
          <UpdateKnowledge
            data={data}
            id={row.knowledge_id}
            currentName={row.knowledge_name}
            getData={getData}
          />
          <Trash2 className="h-5 w-5 cursor-pointer" onClick={() => handleRemoveList(row.knowledge_id)} />
        </div>
      )
    }
  ]

  const getData = async () => {
    try {
      setIsLoading(true);
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append("operation", "getKnowledge");
      const res = await axios.post(url, formData);
      console.log("res.data ni getData: ", res.data);
      if (res.data !== 0) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("KnowledgeMaster.jsx ~ getData ~ error:", error);
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
            title="Knowledge and Compliance"
            data={data}
            columns={columns}
            autoIndex={true}
            add={
              <AddKnowledgeMaster
                title="knowledge and compliance"
                subject="knowledge"
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

export default KnowledgeMaster
