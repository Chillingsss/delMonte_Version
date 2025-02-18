"use client";
import { Card, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import AddDuties from "../AddJob/AddDuties";
import ShowAlert from "@/components/ui/show-alert";
import { Edit2, PlusIcon, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getDataFromSession } from "@/app/utils/storageUtils";
import { toast } from "sonner";

function UpdateDuties({ data, handleAddData, handleUpdate, deleteData }) {
  const [datas, setDatas] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleCloseAlert = async (status) => {
    console.log("status delete", status);
    if (status === 1) {
      const jsonData = { dutyId: selectedId };
      await deleteData("deleteDuties", jsonData, "getDuties");
    }
    setShowAlert(false);
  };

  const handleAddList = async (status) => {
    if (status !== 0) {
      const jsonData = {
        jobId: getDataFromSession("jobId"),
        duties: status.duties,
      };
      await handleAddData("addDuties", jsonData, "getDuties");
      setDatas(data);
    } else {
      setDatas(datas);
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = async (status) => {
    setShowModal(false);
  };
  const handleRemoveList = (dutyId) => {
    setSelectedId(dutyId);
    handleShowAlert(
      "This action cannot be undone. It will permanently delete the item and remove it from your list"
    );
  };

  const handleEdit = (index, text, selectedId) => {
    setEditIndex(index);
    setEditedText(text);
    setSelectedId(selectedId);
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditedText("");
    setSelectedId(null);
  };

  const handleUpdateDuty = () => {
    if (editedText === datas[editIndex].duties_text) {
      handleCancelEdit();
      return;
    } else if (!editedText.trim()) {
      toast.error("Empty description is not allowed");
      return;
    }

    const jsonData = {
      duties: editedText.trim(),
      dutyId: selectedId,
    };
    handleUpdate("updateDuties", jsonData, "getDuties");
    handleCancelEdit();
  };

  useEffect(() => {
    if (data) {
      setDatas(data);
    }
    console.log("data ni useEffect: ", data);
  }, [data]);

  return (
    <>
      <div>
        <Button onClick={handleOpenModal}>
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Duties
        </Button>
        <Card className="w-full mt-3">
          {datas && datas.length > 0 ? (
            <>
              <div className="hidden md:block">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/12">Index</TableHead>
                      <TableHead className="w-10/12">Duty</TableHead>
                      <TableHead className="w-1/12 text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datas.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell className="w-1/12">{index + 1}</TableCell>
                        <TableCell className="w-10/12 whitespace-normal">
                          {editIndex === index ? (
                            <Textarea
                              value={editedText}
                              onChange={(e) => setEditedText(e.target.value)}
                            />
                          ) : (
                            data.duties_text
                          )}
                        </TableCell>
                        <TableCell className="w-1/12 text-center">
                          {editIndex === index ? (
                            <div className="flex justify-center">
                              <Button
                                onClick={handleCancelEdit}
                                variant="secondary"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleUpdateDuty}
                                className="ml-2"
                              >
                                Update
                              </Button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() =>
                                  handleEdit(
                                    index,
                                    data.duties_text,
                                    data.duties_id
                                  )
                                }
                              >
                                <Edit2 className="h-4 w-4 mr-4" />
                              </button>
                              <button
                                className="h-4 w-4"
                                onClick={() =>
                                  handleRemoveList(data.duties_id, index)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
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
                      {editIndex === index ? (
                        <>
                          <Button
                            onClick={handleUpdateDuty}
                            variant="primary"
                            className="mr-2"
                          >
                            Update
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="secondary"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(index, data.duties_text)}
                          >
                            <Edit2 className="h-4 w-4 mr-4" />
                          </button>
                          <button
                            className="h-4 w-4"
                            onClick={() => handleRemoveList(data.duties_id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                    <div className="mt-2 text-sm">
                      {editIndex === index ? (
                        <Textarea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                        />
                      ) : (
                        <>
                          {index + 1}.&nbsp;&nbsp;
                          {data.duties_text}
                        </>
                      )}
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <CardDescription className="text-center p-5">
              No duties added yet
            </CardDescription>
          )}
        </Card>
      </div>
      <AddDuties
        open={showModal}
        onHide={handleCloseModal}
        handleAddList={handleAddList}
      />
      <ShowAlert
        open={showAlert}
        onHide={handleCloseAlert}
        message={alertMessage}
        duration={1}
      />
    </>
  );
}

export default UpdateDuties;
