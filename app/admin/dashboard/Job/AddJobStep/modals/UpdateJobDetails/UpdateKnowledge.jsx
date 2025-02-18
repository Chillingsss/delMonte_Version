"use client";
import {
  getDataFromSession,
  storeDataInSession,
} from "@/app/utils/storageUtils";
import { Button } from "@/components/ui/button";
import { Card, CardDescription } from "@/components/ui/card";
import ShowAlert from "@/components/ui/show-alert";
import { Edit2, PlusIcon, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import AddKnowledge from "../AddJob/AddKnowledge";
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
import { Badge } from "@/components/ui/badge";
import UpdateKnowledgeModal from "./UpdateJob/UpdateKnowledgeModal";

function UpdateKnowledge({ data, handleAddData, handleUpdate, deleteData }) {
  const knowledgeList = retrieveData("knowledgeList");
  const [datas, setDatas] = useState([]);
  const [indexToRemove, setIndexToRemove] = useState(null);
  const [updateData, setUpdateData] = useState({});
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };
  const handleCloseAlert = (status) => {
    if (status === 1) {
      const jsonData = {
        id: indexToRemove,
      };
      deleteData("deleteJobKnowledge", jsonData, "getJobKnowledge");
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
        knowledgeText: values.jobKnowledge,
        knowledgeId: values.knowledgeId,
        points: values.points,
      };
      handleUpdate("updateJobKnowledge", jsonData, "getJobKnowledge");
    }
    setShowUpdateModal(false);
  };

  const handleEdit = (id, knowledgeId, points, jobKnowledge) => {
    setUpdateData({
      id: id,
      knowledgeId: knowledgeId,
      points: points,
      jobKnowledge: jobKnowledge,
    });
    handleOpenUpdateModal();
  };

  const handleAddList = (status) => {
    if (status !== 0) {
      const jsonData = {
        jobId: retrieveData("jobId"),
        knowledgeText: status.jobKnowledge,
        knowledgeId: status.knowledgeId,
        points: status.points,
      };
      handleAddData("addJobKnowledge", jsonData, "getJobKnowledge");
    } else {
      setDatas(datas);
    }
  };

  useEffect(() => {
    if (data) {
      setDatas(data);
      const filteredData = data.map((element) => ({
        knowledgeId: element.jknow_knowledgeId,
      }));
      storeDataInSession("jobKnowledge", JSON.stringify(filteredData));
    }
    console.log("datas ni knowledge:", data);
    console.log("knowledge ni knowledge:", knowledgeList);
  }, [data, knowledgeList]);

  return (
    <>
      <div>
        <Button onClick={handleOpenModal}>
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Knowledge and Compliance
        </Button>
        <Card className="w-full mt-3">
          {datas && datas.length > 0 ? (
            <>
              <div className="hidden md:block">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/12">Index</TableHead>
                      <TableHead className="w-1/12 ">Knowledge</TableHead>
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
                            knowledgeList.find(
                              (item) => item.value === data.jknow_knowledgeId
                            )?.label
                          }
                        </TableCell>
                        {/* <TableCell className="w-10/12 whitespace-normal">
                          {data.jknow_text}
                        </TableCell> */}
                        <TableCell className="w-1/12 text-center">
                          {data.jknow_points}
                        </TableCell>
                        <TableCell className="w-1/12 text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() =>
                                handleEdit(
                                  data.jknow_id,
                                  data.jknow_knowledgeId,
                                  data.jknow_points,
                                  data.jknow_text
                                )
                              }
                            >
                              <Edit2 className="h-4 w-4 mr-4" />
                            </button>
                            <button
                              className="h-4 w-4"
                              onClick={() => handleRemoveList(data.jknow_id)}
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
                            data.jknow_id,
                            data.jknow_knowledgeId,
                            data.jknow_points
                          )
                        }
                      >
                        <Edit2 className="h-4 w-4 mr-4" />
                      </button>
                      <button
                        className="h-4 w-4"
                        onClick={() => handleRemoveList(data.jknow_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 text-sm">
                      <div className="mb-1 text-xl break-words">
                        {
                          knowledgeList.find(
                            (item) => item.value === data.jknow_knowledgeId
                          )?.label
                        }
                      </div>
                      {/* {data.jknow_text} */}
                    </div>
                    <div className="text-end">
                      <Badge className="mt-2 text-xs font-bold">
                        Points: {data.jknow_points}
                      </Badge>
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <CardDescription className="text-center p-5">
              No Knowledge added yet
            </CardDescription>
          )}
        </Card>

        {showModal && (
          <AddKnowledge
            open={showModal}
            onHide={handleCloseModal}
            knowledgeList={knowledgeList}
            handleAddList={handleAddList}
            isUpdate={true}
          />
        )}
        {showUpdateModal && (
          <UpdateKnowledgeModal
            open={showUpdateModal}
            onHide={handleCloseUpdateModal}
            updateData={updateData}
            knowledgeList={knowledgeList}
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

export default UpdateKnowledge;
