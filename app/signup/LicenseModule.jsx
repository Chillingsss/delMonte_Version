import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription } from '@/components/ui/card'
import ShowAlert from '@/components/ui/show-alert'
import { PlusIcon, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import AddTrainingModal from './modals/AddTrainingModal'
import { retrieveData, storeData } from '../utils/storageUtils'
import AddLicense from './modals/AddLicense'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

function LicenseModule({ licenseType, licenseList }) {
  const [data, setData] = useState([]);
  const [indexToRemove, setIndexToRemove] = useState(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleCloseAlert = (status) => {
    if (status === 1) {
      const filteredData = data.filter((_, index) => index !== indexToRemove);
      setData(filteredData);
      storeData("licenses", JSON.stringify(filteredData));
    }
    setShowAlert(false);
  };

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  }

  const handleCloseModal = (status) => {
    if (status !== 0) {
      const newData = [...data, status];
      setData(newData);
      storeData("licenses", JSON.stringify(newData));
    }
    setShowModal(false);
  };

  const handleRemoveList = (indexToRemove) => {
    setIndexToRemove(indexToRemove);
    handleShowAlert("This action cannot be undone. It will permanently delete the item and remove it from your list");
  };

  useEffect(() => {
    const savedData = retrieveData("licenses");
    if (savedData && savedData !== "[]") {
      setData(JSON.parse(savedData));
    }
  }, []);
  
  return (
    <div>
      <Button onClick={handleOpenModal} className="bg-[#f5f5f5] mt-3 text-[#0e4028]">
        <PlusIcon className="h-4 w-4 mr-1" />
        Add license
      </Button>
      <Alert className="w-full bg-[#0e4028] mt-3">
        {data && data.length > 0 ? (
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Index</TableHead>
                <TableHead>License Type</TableHead>
                <TableHead>License</TableHead>
                <TableHead>License Number</TableHead>
              </TableRow>
            </TableHeader>
           <TableBody>
             {data.map((datas, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{licenseType.find((item) => item.value === datas.licenseType)?.label}</TableCell>
                <TableCell>{licenseList.find((item) => item.value === datas.license)?.label}</TableCell>
                <TableCell>{datas.licenseNumber}</TableCell>
              </TableRow>
              // <Alert key={index} className="relative w-full bg-[#0e5a35] mt-3">
              //   <button
              //     className="absolute top-2 right-2 text-white"
              //     onClick={() => handleRemoveList(index)}
              //   >
              //     <X className="h-4 w-4" />
              //   </button>
              //   <AlertTitle className="text-md ">
              //     <div className='mb-3'>License Type: {licenseType.find((item) => item.value === datas.licenseType)?.label}</div>
              //     <div className='mb-3'>License: {licenseList.find((item) => item.value === datas.license)?.label}</div>
              //     <div className='mb-3'>License Number: {datas.licenseNumber}</div>
              //   </AlertTitle>
              // </Alert>
            ))}
           </TableBody>
          </Table>
        ) : (
          <CardDescription className="text-center">
            No license added yet
          </CardDescription>
        )}  
      </Alert>
      <AddLicense open={showModal} onHide={handleCloseModal} licenseType={licenseType} licenseList={licenseList} />
      <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} />
    </div>
  )
}

export default LicenseModule;
