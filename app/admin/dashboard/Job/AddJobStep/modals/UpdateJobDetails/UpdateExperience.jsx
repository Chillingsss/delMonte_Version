"use client";
import { getDataFromSession, retrieveData } from "@/app/utils/storageUtils";
import { Button } from "@/components/ui/button";
import { Card, CardDescription } from "@/components/ui/card";
import ShowAlert from "@/components/ui/show-alert";
import { Edit2, PlusIcon, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import AddExperience from "../AddJob/AddExperience";
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

import UpdateExperienceModal from "./UpdateJob/UpdateExperienceModal";

function UpdateExperience({ data, handleAddData, handleUpdate, deleteData }) {
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
      deleteData("deleteJobExperience", jsonData, "getJobExperience");
    }
    setShowAlert(false);
  };

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = (status) => {
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
        experienceText: values.jobExperience,
        yearsOfExperience: values.yearsOfExperience,
        points: values.points,
      };
      handleUpdate("updateJobExperience", jsonData, "getJobExperience");
    }
    setShowUpdateModal(false);
  };

  const handleEdit = (id, points, jobExperienceText, yearsOfExperience) => {
    setUpdateData({
      id: id,
      jobExperience: jobExperienceText,
      yearsOfExperience: yearsOfExperience,
      points: points,
    });
    handleOpenUpdateModal();
  };

  const handleAddList = (status) => {
    if (status !== 0) {
      const jsonData = {
        jobId: getDataFromSession("jobId"),
        experienceText: status.jobExperience,
        yearsOfExperience: status.yearsOfExperience,
        points: status.points,
      };
      handleAddData("addJobExperience", jsonData, "getJobExperience");
    } else {
      setDatas(datas);
    }
  };

  useEffect(() => {
    if (data) {
      setDatas(data);
    }
  }, [data]);

  return (
    <>
      <div>
        <Button onClick={handleOpenModal}>
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Experience
        </Button>
        <Card className="w-full mt-3">
          {datas && datas.length > 0 ? (
            <>
              <div className="hidden md:block">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Experience</TableHead>
                      <TableHead className="text-center">
                        Year/s of experience
                      </TableHead>
                      <TableHead className="text-center">Points</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datas.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell className="whitespace-normal">
                          {data.jwork_responsibilities}
                        </TableCell>
                        <TableCell className="text-center">
                          {data.jwork_duration}
                        </TableCell>
                        <TableCell className="text-center">
                          {data.jwork_points}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() =>
                                handleEdit(
                                  data.jwork_id,
                                  data.jwork_points,
                                  data.jwork_responsibilities,
                                  data.jwork_duration
                                )
                              }
                            >
                              <Edit2 className="h-4 w-4 mr-4" />
                            </button>
                            <button
                              className="h-4 w-4"
                              onClick={() => handleRemoveList(data.jwork_id)}
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
                            data.jwork_id,
                            data.jwork_points,
                            data.jwork_responsibilities,
                            data.jwork_duration
                          )
                        }
                      >
                        <Edit2 className="h-4 w-4 mr-4" />
                      </button>
                      <button
                        className="h-4 w-4"
                        onClick={() => handleRemoveList(data.jwork_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 text-sm">
                      {data.jwork_responsibilities}
                    </div>
                    <div className="text-end">
                      <Badge className="mt-2 text-xs font-bold">
                        Year/s of Experience: {data.jwork_duration}
                      </Badge>
                      <Badge className="mt-2 text-xs font-bold ml-2">
                        Points: {data.jwork_points}
                      </Badge>
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <CardDescription className="text-center p-5">
              No experience added yet
            </CardDescription>
          )}
        </Card>
        {showModal && (
          <AddExperience
            open={showModal}
            onHide={handleCloseModal}
            handleAddList={handleAddList}
            isUpdate={true}
          />
        )}
        {showUpdateModal && (
          <UpdateExperienceModal
            open={showUpdateModal}
            onHide={handleCloseUpdateModal}
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

export default UpdateExperience;
