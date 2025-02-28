"use client";
import {
  getDataFromSession,
  retrieveData,
  storeData,
  storeDataInSession,
} from "@/app/utils/storageUtils";

import { Button } from "@/components/ui/button";
import { Card, CardDescription } from "@/components/ui/card";
import ShowAlert from "@/components/ui/show-alert";
import { Edit2, PlusIcon, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import AddTraining from "../AddJob/AddTraining";
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
import UpdateTrainingModal from "./UpdateJob/UpdateTrainingModal";

function UpdateTraining({ data, handleAddData, handleUpdate, deleteData }) {
  const training = getDataFromSession("trainingList");
  const [datas, setDatas] = useState([]);
  const [indexToRemove, setIndexToRemove] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [updateData, setUpdateData] = useState({});

  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };
  const handleCloseAlert = (status) => {
    if (status === 1) {
      const jsonData = {
        id: indexToRemove,
      };
      deleteData("deleteJobTraining", jsonData, "getJobTraining");
    }
    setShowAlert(false);
  };

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = async (status) => {
    setShowModal(false);
  };

  const handleRemoveList = (indexToRemove) => {
    setIndexToRemove(indexToRemove);
    handleShowAlert(
      "This action cannot be undone. It will permanently delete the item and remove it from your list"
    );
  };

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const handleOpenUpdateModal = () => {
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = (values) => {
    if (values !== 0) {
      const jsonData = {
        id: updateData.id,
        // trainingText: values.jobTraining,
        trainingId: values.training,
        points: values.points,
      };
      handleUpdate("updateJobTraining", jsonData, "getJobTraining");
    }
    setShowUpdateModal(false);
  };

  const handleEdit = (id, trainingId, points) => {
    setUpdateData({ id: id, training: trainingId, points: points });
    handleOpenUpdateModal();
  };

  const handleAddList = async (status) => {
    if (status !== 0) {
      const jsonData = {
        jobId: getDataFromSession("jobId"),
        trainingText: status.jobTraining,
        trainingId: status.training,
        points: status.points,
      };
      await handleAddData("addJobTraining", jsonData, "getJobTraining");
    } else {
      setDatas(datas);
    }
  };

  useEffect(() => {
    if (data) {
      setDatas(data);
      const filteredData = data.map((element) => ({
        training: element.jtrng_trainingId,
      }));
      storeDataInSession("jobTraining", JSON.stringify(filteredData));
    }
    console.log("datas ni training:", data);
    console.log("training ni training:", training);
  }, [data, training]);

  return (
    <>
      <div>
        <Button onClick={handleOpenModal}>
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Training
        </Button>
        <Card className="w-full mt-3">
          {datas && datas.length > 0 ? (
            <>
              <div className="hidden md:block">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/12">Index</TableHead>
                      <TableHead className="w-1/12 ">Training</TableHead>
                      {/* <TableHead className="w-10/12">Description</TableHead> */}
                      <TableHead className="w-1/12 text-center">
                        Points
                      </TableHead>
                      <TableHead className="w-1/12 text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datas.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell className="w-1/12">{index + 1}</TableCell>
                        <TableCell className="w-1/12">
                          {
                            training.find(
                              (item) => item.value === data.jtrng_trainingId
                            )?.label
                          }
                        </TableCell>
                        {/* <TableCell className="w-10/12 whitespace-normal">
                          {data.jtrng_text}
                        </TableCell> */}
                        <TableCell className="w-1/12 text-center">
                          {data.jtrng_points}
                        </TableCell>
                        <TableCell className="w-1/12 text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() =>
                                handleEdit(
                                  data.jtrng_id,
                                  data.jtrng_trainingId,
                                  data.jtrng_points
                                )
                              }
                            >
                              <Edit2 className="h-4 w-4 mr-4" />
                            </button>
                            <button
                              className="h-4 w-4"
                              onClick={() => handleRemoveList(data.jtrng_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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
                        onClick={() =>
                          handleEdit(
                            data.jtrng_id,
                            data.jtrng_trainingId,
                            data.jtrng_points
                          )
                        }
                      >
                        <Edit2 className="h-4 w-4 mr-4" />
                      </button>
                      <button
                        className="h-4 w-4"
                        onClick={() => handleRemoveList(data.jtrng_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 text-sm">
                      <div className="mb-1 text-xl break-words">
                        {
                          training.find(
                            (item) => item.value === data.jtrng_trainingId
                          )?.label
                        }
                      </div>
                      {/* {data.jtrng_text} */}
                    </div>
                    <div className="text-end">
                      <Badge className="mt-2 text-xs font-bold">
                        Points: {data.jtrng_points}
                      </Badge>
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <CardDescription className="text-center p-5">
              No training added yet
            </CardDescription>
          )}
        </Card>
        {showModal && (
          <AddTraining
            open={showModal}
            onHide={handleCloseModal}
            training={training}
            handleAddList={handleAddList}
            isUpdate={true}
          />
        )}
        {showUpdateModal && (
          <UpdateTrainingModal
            open={showUpdateModal}
            onHide={handleCloseUpdateModal}
            training={training}
            updateData={updateData}
          />
        )}
        <ShowAlert
          open={showAlert}
          onHide={handleCloseAlert}
          message={alertMessage}
          duration={1}
        />
      </div>
    </>
  );
}

export default UpdateTraining;
