import DataTable from '@/app/my_components/DataTable';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';

const HRMaster = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addColumn = (values, newId) => {
    setData([...data, {
      institution_id: newId,
      institution_name: values.institutionName
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
  const handleRemoveList = (institutionId) => {
    setSelectedId(institutionId);
    handleShowAlert("This action cannot be undone. It will permanently delete the item and remove it from your list");
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      const jsonData = { institutionId: selectedId }
      formData.append("operation", "deleteInstitution");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni handleDelete: ", res.data);
      if (res.data === -1) {
        toast.error("Failed to delete, there's a transaction using this HR");
      } else if (res.data === 1) {
        toast.success("HR deleted successfully");
        getData();
      } else {
        toast.error("Failed to delete HR");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("HRMaster.jsx ~ handleDelete ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const columns = [
    { header: "Name", accessor: "fullName", sortable: true },
    { header: "Contact Number", accessor: "hr_contactNo" },
    { header: "Email", accessor: "hr_email", },
    { header: "Date Created", accessor: "hr_createdAt", sortable: true },

    // {
    //   header: "Actions",
    //   cell: (row) => (
    //     <div className="flex gap-4">
    //       <UpdateInstitution
    //         data={data}
    //         id={row.institution_id}
    //         currentName={row.institution_name}
    //         getData={getData}
    //       />
    //       <Trash2 className="h-5 w-5 cursor-pointer" onClick={() => handleRemoveList(row.institution_id)} />
    //     </div>
    //   )
    // }
  ]

  const getData = async () => {
    try {
      setIsLoading(true);
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append("operation", "getHR");
      const res = await axios.post(url, formData);
      console.log("res.data ni getData: ", res.data);
      if (res.data !== 0) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("HRMaster.jsx ~ getData ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <DataTable
      title="Institution"
      data={data}
      columns={columns}
      autoIndex={true}
    // add={
    //   <AddInstitution
    //     title="institution"
    //     subject="institution"
    //     getData={getData}
    //     data={data}
    //     addColumn={addColumn}
    //   />}
    />
  )
}

export default HRMaster