import DataTable from '@/app/my_components/DataTable';
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import UpdateSkills from './modal/UpdateMasterfileForms/UpdateSkills';
import ShowAlert from '@/components/ui/show-alert';
import AddSkillMaster from './modal/AddMasterfileForms/AddSkillMaster';

const SkillsMaster = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const addColumn = (values, id) => {
    console.log("values", values, id);
    setData([...data, { ...values, perS_id: id }]);
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

  const handleRemoveList = (skillId) => {
    setSelectedId(skillId);
    handleShowAlert("This action cannot be undone. It will permanently delete the item and remove it from your list");
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      const jsonData = { skillId: id }
      formData.append("operation", "deleteSkill");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni handleDelete: ", res.data);
      if (res.data === -1) {
        toast.error("Failed to delete, there's a transaction using this skill");
      } else if (res.data === 1) {
        toast.success("Skill deleted successfully");
        getData();
      } else {
        toast.error("Failed to delete skill");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("SkillsMaster.jsx ~ handleDelete ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const columns = [
    { header: "Skills", accessor: "perS_name", sortable: true },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-4">
          <UpdateSkills
            data={data}
            id={row.perS_id}
            currentName={row.perS_name}
            getData={getData}
          />
          <Trash2 className="h-5 w-5 cursor-pointer" onClick={() => handleRemoveList(row.perS_id)} />
        </div>
      )
    }
  ]

  const getData = async () => {
    try {
      setIsLoading(true);
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append("operation", "getSkills");
      const res = await axios.post(url, formData);
      console.log("res.data ni getData: ", res.data);
      if (res.data !== 0) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("SkillsMaster.jsx ~ getData ~ error:", error);
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
            title="Skills"
            data={data}
            columns={columns}
            autoIndex={true}
            add={
            <AddSkillMaster 
              title="skills" 
              subject="skills" 
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

export default SkillsMaster
