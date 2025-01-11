import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription } from '@/components/ui/card'
import ShowAlert from '@/components/ui/show-alert'
import { PlusIcon, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import AddTrainingModal from './modals/AddTrainingModal'
import { retrieveData, storeData } from '../utils/storageUtils'

function Training({ trainingList }) {
  const [trainingData, setTrainingData] = useState([]);
  const [indexToRemove, setIndexToRemove] = useState(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  
  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleCloseAlert = (status) => {
    if (status === 1) {
      const filteredTrainingData = trainingData.filter((_, index) => index !== indexToRemove);
      setTrainingData(filteredTrainingData);
      storeData("training", JSON.stringify(filteredTrainingData));
    }
    setShowAlert(false);
  };

  const [showTrainingModal, setShowTrainingModal] = useState(false);

  const handleOpenTrainingModal = () => {
    setShowTrainingModal(true);
  }

  const handleCloseTrainingModal = (status) => {
    if (status !== 0) {
      const newTrainingData = [...trainingData, status];
      setTrainingData(newTrainingData);
      storeData("training", JSON.stringify(newTrainingData));
    }
    setShowTrainingModal(false);
  };

  const handleRemoveList = (indexToRemove) => {
    setIndexToRemove(indexToRemove);
    handleShowAlert("This action cannot be undone. It will permanently delete the item and remove it from your list");
  };

  useEffect(() => {
    const savedTrainingData = retrieveData("training");
    if (savedTrainingData && savedTrainingData !== "[]") {
      setTrainingData(JSON.parse(savedTrainingData));
    }
  }, []);

  return (
    <div>
      <Button onClick={handleOpenTrainingModal} className="bg-[#f5f5f5] mt-3 text-[#0e4028]">
        <PlusIcon className="h-4 w-4 mr-1" />
        Add Training
      </Button>
      <Alert className="w-full bg-[#0a2e1c] mt-3">
        {trainingData && trainingData.length > 0 ? (
          <CardContent>
            {trainingData.map((data, index) => (
              <Alert key={index} className="relative w-full bg-[#0e5a35] mt-3">
                <button
                  className="absolute top-2 right-2 text-white"
                  onClick={() => handleRemoveList(index)}
                >
                  <X className="h-4 w-4" />
                </button>
                <AlertTitle className="text-md ">
                  <div className='mb-3'>{trainingList.find((item) => item.value === data.training)?.label}</div>
                </AlertTitle>
              </Alert>
            ))}
          </CardContent>
        ) : (
          <CardDescription className="text-center">
            No training added yet
          </CardDescription>
        )}
      </Alert>
      <AddTrainingModal open={showTrainingModal} onHide={handleCloseTrainingModal} trainingList={trainingList}/>
      <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} />
    </div>
  )
}

export default Training;
