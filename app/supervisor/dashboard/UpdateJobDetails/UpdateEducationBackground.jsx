"use client";
import {
  getDataFromSession,
  retrieveData,
  storeData,
} from "@/app/utils/storageUtils";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ShowAlert from "@/components/ui/show-alert";
import { Edit2, PlusIcon, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import UpdateEducationModal from "../modal/UpdateJob/UpdateEducationModal";
import AddEducation from "../modal/AddJob/AddEducation";

function UpdateEducation({
  courseCategory,
  data,
  handleAddData,
  getData,
  handleUpdate,
  deleteData,
}) {
  const [datas, setDatas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };
  const handleCloseAlert = async (status) => {
    if (status === 1) {
      const jsonData = {
        id: selectedId,
      };
      await deleteData("deleteJobEducation", jsonData, "getJobEducation");
    }
    setShowAlert(false);
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = async (status) => {
    if (status !== 0) {
      const jsonData = {
        points: status.points,
        courseCategory: status.courseCategory,
        jobEducation: status.jobEducation,
        jobId: getDataFromSession("jobId"),
      };
      await handleAddData("addJobEducation", jsonData);
      getData("getJobEducation");
    } else {
      setDatas(datas);
    }
    setShowModal(false);
  };

  const handleRemoveList = (id) => {
    setSelectedId(id);
    handleShowAlert(
      "This action cannot be undone. It will permanently delete the item and remove it from your list"
    );
  };

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const handleOpenUpdateModal = () => {
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = async (values) => {
    if (values !== 0) {
      const jsonData = {
        id: updateData.id,
        points: values.points,
        courseCategory: values.courseCategory,
        educationText: values.jobEducation,
      };
      handleUpdate("updateJobEducation", jsonData, "getJobEducation");
    }
    setShowUpdateModal(false);
  };
  const handleEdit = (id, categoryId, points, educationText) => {
    setUpdateData({
      id: id,
      categoryId: categoryId,
      points: points,
      educationText: educationText,
    });
    handleOpenUpdateModal();
  };

  useEffect(() => {
    if (data) {
      setDatas(data);
      const filteredData = data.map((element) => ({
        courseCategory: element.jeduc_categoryId,
      }));
      storeData("jobEducation", JSON.stringify(filteredData));
    }
    console.log("data ni education useEffect: ", data);
    console.log("courseCategory ni education useEffect: ", courseCategory);
    console.log("datas ni retrieveData: ", getDataFromSession("jobEducation"));
  }, [courseCategory, data]);

  return (
    <>
      <div>
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
                      <TableHead className="w-1/12">Index</TableHead>
                      <TableHead className="w-1/12 ">Course category</TableHead>
                      <TableHead className="w-10/12">Description</TableHead>
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
                            courseCategory.find(
                              (item) => item.value === data.jeduc_categoryId
                            )?.label
                          }
                        </TableCell>
                        <TableCell className="w-10/12 whitespace-normal">
                          {data.jeduc_text}
                        </TableCell>
                        <TableCell className="w-1/12 text-center">
                          {data.jeduc_points}
                        </TableCell>
                        <TableCell className="w-1/12 text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() =>
                                handleEdit(
                                  data.jeduc_id,
                                  data.jeduc_categoryId,
                                  data.jeduc_points,
                                  data.jeduc_text
                                )
                              }
                            >
                              <Edit2 className="h-4 w-4 mr-4" />
                            </button>
                            <button
                              className="h-4 w-4"
                              onClick={() => handleRemoveList(data.jeduc_id)}
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
                            data.jeduc_id,
                            data.jeduc_categoryId,
                            data.jeduc_points,
                            data.jeduc_text
                          )
                        }
                      >
                        <Edit2 className="h-4 w-4 mr-4" />
                      </button>
                      <button
                        className="h-4 w-4"
                        onClick={() => handleRemoveList(data.jeduc_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 text-sm">
                      <div className="mb-1 text-xl break-words">
                        {
                          courseCategory.find(
                            (item) => item.value === data.jeduc_categoryId
                          )?.label
                        }
                      </div>
                      {data.jeduc_text}
                    </div>
                    <div className="text-end">
                      <Badge className="mt-2 text-xs font-bold">
                        Points: {data.jeduc_points}
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
        {showModal && (
          <AddEducation
            open={showModal}
            onHide={handleCloseModal}
            courseCategory={courseCategory}
          />
        )}
        {showUpdateModal && (
          <UpdateEducationModal
            open={showUpdateModal}
            onHide={handleCloseUpdateModal}
            courseCategory={courseCategory}
            updateData={updateData}
            selectedEducations={data}
          />
        )}
        <ShowAlert
          open={showAlert}
          onHide={handleCloseAlert}
          message={alertMessage}
          duration={3}
        />
      </div>
    </>
  );
}

export default UpdateEducation;
