import DataTable from '@/app/my_components/DataTable';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import AddHRMaster from './modal/AddMasterfileForms/AddHRMaster';
import { Trash2, Edit2 } from 'lucide-react';
import UpdateHRMaster from './modal/UpdateMasterfileForms/UpdateHRMaster';
import ShowAlert from '@/components/ui/show-alert';

const HRMaster = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHR, setSelectedHR] = useState(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const addColumn = (values, newId) => {
    setData([...data, {
      fullName: values.fullName,
      hr_contactNo: values.contactNo,
      hr_email: values.email,
      hr_createdAt: new Date().toLocaleString(),
      institution_id: newId,
    }]);
  };
  const handleUpdateClick = (row) => {
    setSelectedHR(row);
    setIsUpdateOpen(true);
  };

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
  const handleRemoveList = (id) => {
    setSelectedId(id);
    handleShowAlert("This action cannot be undone. It will permanently delete the item and remove it from your list");
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      const jsonData = { hrId: selectedId };
      console.log(JSON.stringify(jsonData));
      formData.append("operation", "deleteHR");
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
  };

  const columns = [
    { header: "Name", accessor: "fullName", sortable: true },
    { header: "Role", accessor: "UserL_description", sortable: true },
    { header: "Contact Number", accessor: "hr_contactNo" },
    { header: "Email", accessor: "hr_email" },
    { header: "Date Created", accessor: "hr_createdAt", sortable: true },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-4">
          <button onClick={() => handleUpdateClick(row)}>
            <Edit2 className="h-5 w-5 cursor-pointer" />
          </button>
          <Trash2 className="h-5 w-5 cursor-pointer" onClick={() => handleRemoveList(row.hr_id)} />
        </div>
      ),
    },
  ];

  const getData = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append("operation", "getHR");

      const res = await axios.post(url, formData);
      setData(res.data !== 0 ? res.data : []);
    } catch (error) {
      toast.error("Network error");
      console.log("HRMaster.jsx ~ getData ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <DataTable
        title="Human Resource"
        data={data}
        columns={columns}
        autoIndex={true}
        add={<AddHRMaster getData={getData} addColumn={addColumn} />}
      />
      {isUpdateOpen && selectedHR && (
        <UpdateHRMaster
          data={data}
          id={selectedHR.hr_id}
          getData={getData}
          firstName={selectedHR.hr_firstname}
          middleName={selectedHR.hr_middlename}
          lastname={selectedHR.hr_lastname}
          contactNo={selectedHR.hr_contactNo}
          email={selectedHR.hr_email}
          alternateEmail={selectedHR.hr_alternateEmail}
          userLevel={selectedHR.userL_id}
          onClose={() => setIsUpdateOpen(false)}
        />
      )}
      <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} />
    </>
  );
};

export default HRMaster;
