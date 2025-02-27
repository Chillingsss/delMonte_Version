import DataTable from '@/app/my_components/DataTable';
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import { useEffect, useState } from 'react'
import { toast } from 'sonner';
import AddLicenseType from './modal/AddMasterfileForms/AddLicenseType';
import UpdateMasterfile from './modal/UpdateMasterfile';
import { Trash2 } from 'lucide-react';
import UpdateLicenseType from './modal/UpdateMasterfileForms/UpdateLicenseType';
import ShowAlert from '@/components/ui/show-alert';

const LicenseTypeMaster = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const addColumn = (values, id) => {
    setData([...data, { ...values, license_type_id: id }]);
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

  const handleRemoveList = (licenseTypeId) => {
    setSelectedId(licenseTypeId);
    handleShowAlert("This action cannot be undone. It will permanently delete the item and remove it from your list");
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      const jsonData = { licenseTypeId: id }
      formData.append("operation", "deleteLicenseType");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni handleDelete: ", res.data);
      if (res.data === -1) {
        toast.error("Failed to delete, there's a transaction using this license type");
      } else if (res.data === 1) {
        toast.success("License type deleted successfully");
        getData();
      } else {
        toast.error("Failed to delete license type");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("LicenseTypeMaster.jsx ~ handleDelete ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const columns = [
    { header: "License type", accessor: "license_type_name", sortable: true },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex gap-4">
          <UpdateLicenseType
            data={data}
            id={row.license_type_id}
            currentName={row.license_type_name}
            getData={getData}
          />
          <Trash2 className="h-5 w-5 cursor-pointer" onClick={() => handleRemoveList(row.license_type_id)} />
        </div>
      )
    }
  ]

  const getData = async () => {
    try {
      setIsLoading(true);
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append("operation", "getLicenseType");
      const res = await axios.post(url, formData);
      console.log("res.data ni getData: ", res.data);
      if (res.data !== 0) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("LicenseTypeMaster.jsx ~ getData ~ error:", error);
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
            title="License Type"
            data={data}
            columns={columns}
            autoIndex={true}
            add={
              <AddLicenseType
                title="license type"
                subject="licenseType"
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

export default LicenseTypeMaster
