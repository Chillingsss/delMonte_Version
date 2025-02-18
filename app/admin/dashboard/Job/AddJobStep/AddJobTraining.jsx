"use client";
import {
  getDataFromSession,
  storeDataInSession,
} from "@/app/utils/storageUtils";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import ShowAlert from "@/components/ui/show-alert";
import { PlusIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import AddTraining from "./modals/AddJob/AddTraining";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

function AddJobTraining({
  previousStep,
  nextStep,
  addTotalPoints,
  deductTotalPoints,
}) {
  const [datas, setDatas] = useState([]);
  const [indexToRemove, setIndexToRemove] = useState(null);
  const [trainingData, setTrainingData] = useState([]);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState(0);
  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleCloseAlert = (status) => {
    if (status === 1) {
      const filteredDatas = datas.filter((_, index) => index !== indexToRemove);
      setDatas(filteredDatas);
      storeDataInSession("jobTraining", JSON.stringify(filteredDatas));
      deductTotalPoints(Number(selectedPoints));
    }
    setShowAlert(false);
  };

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = (status) => {
    // if (status !== 0) {
    //   setDatas([...datas, status]);
    //   storeData("jobTraining", JSON.stringify([...datas, status]));
    // } else {
    //   setDatas(datas);
    // }
    setShowModal(false);
  };

  const handleAddList = (status) => {
    setDatas([...datas, status]);
    storeDataInSession("jobTraining", JSON.stringify([...datas, status]));
    toast.success("Training added successfully");
  };

  const handleAddData = (values, id) => {
    setTrainingData([
      ...trainingData,
      { value: id, label: values.trainingName },
    ]);
  };

  const handleRemoveList = (indexToRemove, points) => {
    setSelectedPoints(points);
    setIndexToRemove(indexToRemove);
    handleShowAlert(
      "This action cannot be undone. It will permanently delete the item and remove it from your list"
    );
  };

  const handleNextStep = () => {
    // if (retrieveData("jobTraining") === null || retrieveData("jobTraining") === "[]") {
    //   toast.error("Please add training first");
    //   return;
    // }
    nextStep(75);
  };

  useEffect(() => {
    const trainingList = getDataFromSession("trainingList");
    setTrainingData(trainingList);
    if (
      getDataFromSession("jobTraining") !== null ||
      getDataFromSession("jobTraining") !== "[]"
    ) {
      setDatas(getDataFromSession("jobTraining"));
    } else {
      setDatas([]);
    }
  }, []);

  return (
    <>
      <div>
        <div className="flex justify-end gap-2 mb-3">
          <Button
            variant="secondary"
            onClick={() => previousStep(45)}
            className="mt-3"
          >
            Previous
          </Button>
          <Button onClick={handleNextStep} className="mt-3">
            Next
          </Button>
        </div>
        <Button onClick={handleOpenModal}>
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Training
        </Button>
        <Alert className="w-full mt-3">
          {datas && datas.length > 0 ? (
            <>
              <div className="hidden md:block">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      {/* <TableHead className="w-1/12">Index</TableHead> */}
                      <TableHead className="w-1/12 ">Training</TableHead>
                      {/* <TableHead className="w-10/12">Description</TableHead> */}
                      <TableHead className="w-1/12 text-center">
                        Points
                      </TableHead>
                      <TableHead className="w-1/12 text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datas.map((data, index) => (
                      <TableRow key={index}>
                        {/* <TableCell className="w-1/12">{index + 1}</TableCell> */}
                        <TableCell className="w-1/12">
                          {
                            trainingData.find(
                              (item) => item.value === data.training
                            )?.label
                          }
                        </TableCell>
                        {/* <TableCell className="w-10/12 whitespace-normal">
                          {data.jobTraining}
                        </TableCell> */}
                        <TableCell className="w-1/12 text-center">
                          {data.points}
                        </TableCell>
                        <TableCell className="w-1/12 text-center">
                          <button
                            className="h-4 w-4"
                            onClick={() => handleRemoveList(index, data.points)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="block md:hidden">
                {datas.map((data, index) => (
                  <div
                    key={index}
                    className="relative w-full p-4 rounded-md shadow"
                  >
                    <div className="flex justify-end">
                      <button
                        className="h-4 w-4"
                        onClick={() => handleRemoveList(index, data.points)}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-2 text-sm">
                      <div className="mb-1 text-xl break-words">
                        {
                          trainingData.find(
                            (item) => item.value === data.training
                          )?.label
                        }
                      </div>
                      {/* {data.jobTraining} */}
                    </div>
                    <div className="text-end">
                      <Badge className="mt-2 text-xs font-bold">
                        Points: {data.points}
                      </Badge>
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <CardDescription className="text-center">
              No training added yet
            </CardDescription>
          )}
        </Alert>
        <AddTraining
          open={showModal}
          onHide={handleCloseModal}
          handleAddList={handleAddList}
          handleAddData={handleAddData}
          addTotalPoints={addTotalPoints}
        />
        <ShowAlert
          open={showAlert}
          onHide={handleCloseAlert}
          message={alertMessage}
        />
      </div>
    </>
  );
}

export default AddJobTraining;
