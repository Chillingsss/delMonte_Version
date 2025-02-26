"use client";
import {
  getDataFromSession,
  retrieveData,
  storeData,
  storeDataInSession,
} from "@/app/utils/storageUtils";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import ShowAlert from "@/components/ui/show-alert";
import { PlusIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import AddExperience from "./modals/AddJob/AddExperience";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

function AddJobExperience({
  previousStep,
  handleSubmit,
  addTotalPoints,
  deductTotalPoints,
}) {
  const [datas, setDatas] = useState([]);
  const [indexToRemove, setIndexToRemove] = useState(null);

  const [selectedPoints, setSelectedPoints] = useState(0);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };
  const handleCloseAlert = (status) => {
    if (status === 1) {
      const filteredDatas = datas.filter((_, index) => index !== indexToRemove);
      setDatas(filteredDatas);
      storeDataInSession("jobExperience", JSON.stringify(filteredDatas));
      deductTotalPoints(Number(selectedPoints));
    }
    setShowAlert(false);
  };

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleAddList = (status) => {
    setDatas([...datas, status]);
    storeDataInSession("jobExperience", JSON.stringify([...datas, status]));
    toast.success("Experience added successfully");
  };

  const handleCloseModal = (status) => {
    // if (status !== 0) {
    //   setDatas([...datas, status]);
    //   storeData("jobExperience", JSON.stringify([...datas, status]));
    // } else {
    //   setDatas(datas);
    // }
    setShowModal(false);
  };

  const handleRemoveList = (indexToRemove, points) => {
    setSelectedPoints(points);
    setIndexToRemove(indexToRemove);
    handleShowAlert(
      "This action cannot be undone. It will permanently delete the item and remove it from your list"
    );
  };

  const handleNextStep = () => {
    // if (retrieveData("jobExperience") === null || retrieveData("jobExperience") === "[]") {
    //   toast.error("Please add experience first");
    //   return;
    // }
    handleSubmit();
  };

  useEffect(() => {
    if (
      getDataFromSession("jobExperience") !== null ||
      getDataFromSession("jobExperience") !== "[]"
    ) {
      setDatas(getDataFromSession("jobExperience"));
    } else {
      setDatas([]);
    }
    console.log(getDataFromSession("jobExperience"));
  }, []);

  return (
    <>
      <div>
        <div className="flex justify-end gap-2 mb-3">
          <Button
            variant="secondary"
            onClick={() => previousStep(80)}
            className="mt-3"
          >
            Previous
          </Button>
          <Button onClick={handleNextStep} className="mt-3">
            Submit
          </Button>
        </div>
        <Button onClick={handleOpenModal}>
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Experience
        </Button>
        <Alert className="w-full mt-3">
          {datas && datas.length > 0 ? (
            <>
              <div className="hidden md:block">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      {/* <TableHead className="w-1/12">Index</TableHead> */}
                      <TableHead className="w-10/12">Experience</TableHead>
                      <TableHead className="w-1/12 text-center">
                        Year/s of experience
                      </TableHead>
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
                        <TableCell className="w-10/12 whitespace-normal">
                          {data.jobExperience}
                        </TableCell>
                        <TableCell className="w-1/12 text-center">
                          {data.yearsOfExperience}
                        </TableCell>
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
                        className="h-6 w-6"
                        onClick={() => handleRemoveList(index, data.points)}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-2 text-sm">{data.jobExperience}</div>
                    <div className="text-end">
                      <Badge className="mt-2 text-xs font-bold">
                        Year/s of Experience: {data.yearsOfExperience}
                      </Badge>
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <CardDescription className="text-center">
              No experience added yet
            </CardDescription>
          )}
        </Alert>
        <AddExperience
          open={showModal}
          onHide={handleCloseModal}
          handleAddList={handleAddList}
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

export default AddJobExperience;
