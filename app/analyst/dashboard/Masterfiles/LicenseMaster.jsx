import DataTable from '@/app/my_components/DataTable';
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import { useEffect, useState } from 'react'
import { toast } from 'sonner';
import AddLicense from './modal/AddMasterfileForms/AddLicense';
import UpdateLicenseMaster from './modal/UpdateMasterfileForms/UpdateLicenseMaster';
import { Trash2 } from 'lucide-react';
import ShowAlert from '@/components/ui/show-alert';

const LicenseMaster = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addColumn = (column, id) => {
    setData([...data, { ...column, license_master_id: id }]);
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
  const handleRemoveList = (licenseId) => {
    setSelectedId(licenseId);
    handleShowAlert("This action cannot be undone. It will permanently delete the item and remove it from your list");
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      const jsonData = { licenseId: selectedId }
      formData.append("operation", "deleteLicenseMaster");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni handleDelete: ", res.data);
      if (res.data === -1) {
        toast.error("Failed to delete, there's a transaction using this license");
      } else if (res.data === 1) {
        toast.success("License deleted successfully");
        getData();
      } else {
        toast.error("Failed to delete license");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("LicenseMaster.jsx ~ handleDelete ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const columns = [
    { header: "License Master", accessor: "license_master_name", sortable: true },
    { header: "License Type", accessor: "license_type_name", sortable: true },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-4">
          <UpdateLicenseMaster
            data={data}
            id={row.license_master_id}
            licenseTypeId={row.license_type_id}
            currentName={row.license_master_name}
            getData={getData}
          />
          <Trash2 className="h-5 w-5 cursor-pointer" onClick={() => handleRemoveList(row.license_master_id)} />
        </div>
      )
    }
  ]

  const getData = async () => {
    try {
      setIsLoading(true);
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append("operation", "getLicenseMaster");
      const res = await axios.post(url, formData);
      console.log("res.data ni getData: ", res.data);
      if (res.data !== 0) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("LicenseMaster.jsx ~ getData ~ error:", error);
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
            title="License Masters"
            data={data}
            columns={columns}
            autoIndex={true}
            add={
              <AddLicense
                title={"License Master"}
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

export default LicenseMaster
