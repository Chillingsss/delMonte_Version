import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription } from "@/components/ui/card";
import ShowAlert from "@/components/ui/show-alert";
import { PlusIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import AddTrainingModal from "./modals/AddTrainingModal";
import {
  getDataFromSession,
  retrieveData,
  storeData,
  storeDataInSession,
} from "../utils/storageUtils";
import AddKnowledge from "./modals/AddKnowledge";

function KnowledgeForm({ knowledgeList }) {
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
      storeDataInSession("knowledge", JSON.stringify(filteredData));
    }
    setShowAlert(false);
  };

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = (status) => {
    if (status !== 0) {
      const newData = [...data, status];
      setData(newData);
      storeDataInSession("knowledge", JSON.stringify(newData));
    }
    setShowModal(false);
  };

  const handleRemoveList = (indexToRemove) => {
    setIndexToRemove(indexToRemove);
    handleShowAlert(
      "This action cannot be undone. It will permanently delete the item and remove it from your list"
    );
  };

  useEffect(() => {
    const savedData = getDataFromSession("knowledge");
    if (savedData && savedData !== "[]") {
      setData(JSON.parse(savedData));
    }
  }, []);

  return (
    <div>
      <Button
        onClick={handleOpenModal}
        className="bg-[#f5f5f5] mt-3 text-[#0e4028]"
      >
        <PlusIcon className="h-4 w-4 mr-1" />
        Add Knowledge and Compliance
      </Button>
      <Alert className="w-full bg-[#0a2e1c] mt-3">
        {data && data.length > 0 ? (
          <CardContent>
            {data.map((datas, index) => (
              <Alert key={index} className="relative w-full bg-[#0e5a35] mt-3">
                <button
                  className="absolute top-2 right-2 text-white"
                  onClick={() => handleRemoveList(index)}
                >
                  <X className="h-4 w-4" />
                </button>
                <AlertTitle className="text-md ">
                  <div className="mb-3">
                    {
                      knowledgeList.find(
                        (item) => item.value === datas.knowledge
                      )?.label
                    }
                  </div>
                </AlertTitle>
              </Alert>
            ))}
          </CardContent>
        ) : (
          <CardDescription className="text-center">
            No knowledge added yet
          </CardDescription>
        )}
      </Alert>
      <AddKnowledge
        open={showModal}
        onHide={handleCloseModal}
        knowledgeList={knowledgeList}
      />
      <ShowAlert
        open={showAlert}
        onHide={handleCloseAlert}
        message={alertMessage}
      />
    </div>
  );
}

export default KnowledgeForm;
