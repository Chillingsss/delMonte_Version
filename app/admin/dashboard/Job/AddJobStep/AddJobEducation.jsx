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
import { Separator } from "@/components/ui/separator";
import ShowAlert from "@/components/ui/show-alert";
import { PlusIcon, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import AddEducation from "./modals/AddJob/AddEducation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

function AddJobEducation({
  previousStep,
  nextStep,
  addTotalPoints,
  deductTotalPoints,
}) {
  const [datas, setDatas] = useState([]);
  const [indexToRemove, setIndexToRemove] = useState(null);
  const [courseCategoryData, setCourseCategoryData] = useState([]);

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
      storeDataInSession("jobEducation", JSON.stringify(filteredDatas));
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
    storeDataInSession("jobEducation", JSON.stringify([...datas, status]));
    toast.success("Education added successfully");
  };

  const handleAddData = (values, id) => {
    setCourseCategoryData([
      ...courseCategoryData,
      { value: id, label: values.courseCategoryName },
    ]);
  };

  const handleCloseModal = (status) => {
    if (status !== 0) {
      setDatas([...datas, status]);
      storeDataInSession("jobEducation", JSON.stringify([...datas, status]));
    } else {
      setDatas(datas);
    }
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
    // if (retrieveData("jobEducation") === null || retrieveData("jobEducation") === "[]") {
    //   toast.error("Please add education first");
    //   return;
    // }
    nextStep(60);
  };

  useEffect(() => {
    const courseCategoryList =
      JSON.parse(getDataFromSession("courseCategoryList")) || [];
    setCourseCategoryData(courseCategoryList);
    console.log("courseCategoryList: ", courseCategoryList);
    if (
      getDataFromSession("jobEducation") !== null ||
      getDataFromSession("jobEducation") !== "[]"
    ) {
      setDatas(JSON.parse(getDataFromSession("jobEducation")));
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
            onClick={() => previousStep(30)}
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
          Add Education
        </Button>
        <Alert className="w-full mt-3">
          {datas && datas.length > 0 ? (
            <>
              <div className="hidden md:block">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      {/* <TableHead className="w-1/12">#</TableHead> */}
                      <TableHead className="w-1/12 ">Course category</TableHead>
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
                            courseCategoryData.find(
                              (item) => item.value === data.courseCategory
                            )?.label
                          }
                        </TableCell>
                        {/* <TableCell className="w-10/12 whitespace-normal">
                          {data.jobEducation}
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
                        className="h-6 w-6"
                        onClick={() => handleRemoveList(index, data.points)}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-2 text-sm">
                      <div className="mb-1 text-xl break-words">
                        {
                          courseCategoryData.find(
                            (item) => item.value === data.courseCategory
                          )?.label
                        }
                      </div>
                      {/* {data.jobEducation} */}
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
              No education added yet
            </CardDescription>
          )}
        </Alert>
        <AddEducation
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

export default AddJobEducation;
