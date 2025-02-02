import { useEffect, useState } from "react";
import AddPositionModal from "./modals/AddPositionModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { formatDate } from "./page";
import { PlusIcon, X } from "lucide-react";
import ShowAlert from "@/components/ui/show-alert";
import {
  getDataFromSession,
  retrieveData,
  storeData,
  storeDataInSession,
} from "../utils/storageUtils";

function EmploymentHistory({ handlePrevious, handleNext }) {
  const [position, setPosition] = useState([]);
  const [openPositionModal, setOpenPositionModal] = useState(false);
  const [indexToRemove, setIndexToRemove] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };
  const handleCloseAlert = (status) => {
    if (status === 1) {
      const filteredPosition = position.filter(
        (_, index) => index !== indexToRemove
      );
      setPosition(filteredPosition);
      storeDataInSession.setItem(
        "employmentHistory",
        JSON.stringify(filteredPosition)
      );
    }
    setShowAlert(false);
  };

  const handleOpenPositionModal = () => {
    setOpenPositionModal(true);
  };

  const handleClosePositionModal = (status) => {
    if (status !== 0) {
      setPosition([...position, status]);
      storeDataInSession(
        "employmentHistory",
        JSON.stringify([...position, status])
      );
    }
    setOpenPositionModal(false);
  };

  const handleRemovePosition = (indexToRemove) => {
    setIndexToRemove(indexToRemove);
    handleShowAlert(
      "This action cannot be undone. It will permanently delete the item and remove it from your list"
    );
  };

  useEffect(() => {
    if (
      getDataFromSession("employmentHistory") !== null ||
      getDataFromSession("employmentHistory") !== "[]"
    ) {
      setPosition(JSON.parse(getDataFromSession("employmentHistory")));
    }
  }, []);

  return (
    <div>
      <Button
        onClick={handleOpenPositionModal}
        className="bg-[#f5f5f5] mt-3 text-[#0e4028]"
      >
        <PlusIcon className="h-4 w-4 mr-1" />
        Add Position
      </Button>
      <Alert className="w-full bg-[#0a2e1c] mt-3">
        {position.length > 0 ? (
          <CardContent>
            {position.map((pos, index) => (
              <Alert key={index} className="relative w-full bg-[#0e5a35] mt-3">
                <button
                  className="absolute top-2 right-2 text-white"
                  onClick={() => handleRemovePosition(index)}
                >
                  <X className="h-4 w-4" />
                </button>
                <AlertTitle className="text-md grid md:grid-cols-2 gap-4">
                  <div className="gap-4">Position: {pos.position}</div>
                  <div className="gap-4">Company: {pos.company}</div>
                  <div className="gap-4">
                    Start Date: {formatDate(pos.startDate)}
                  </div>
                  <div className="gap-4">
                    End Date: {formatDate(pos.endDate)}
                  </div>
                </AlertTitle>
              </Alert>
            ))}
          </CardContent>
        ) : (
          <CardDescription className="text-center">
            No position added yet
          </CardDescription>
        )}
      </Alert>
      <AddPositionModal
        open={openPositionModal}
        onHide={handleClosePositionModal}
        message={alertMessage}
      />
      <ShowAlert
        open={showAlert}
        onHide={handleCloseAlert}
        message={alertMessage}
      />
    </div>
  );
}

export default EmploymentHistory;
