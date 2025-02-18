"use client";
import {
  getDataFromSession,
  storeDataInSession,
} from "@/app/utils/storageUtils";
import { Button } from "@/components/ui/button";
import { Card, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ShowAlert from "@/components/ui/show-alert";
import { Edit2, PlusIcon, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AddSkill from "../AddJob/AddSkill";
import { Badge } from "@/components/ui/badge";
import UpdateSkillModal from "./UpdateJob/UpdateSkillModal";

function UpdateSkill({ data, handleAddData, handleUpdate, deleteData }) {
  const skill = getDataFromSession("skillsList");
  const [datas, setDatas] = useState([]);
  const [updateData, setUpdateData] = useState({});
  const [indexToRemove, setIndexToRemove] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };
  const handleCloseAlert = async (status) => {
    if (status === 1) {
      const jsonData = {
        id: indexToRemove,
      };
      await deleteData("deleteJobSkills", jsonData, "getJobSkills");
    }
    setShowAlert(false);
  };

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleAddList = (status) => {
    if (status !== 0) {
      const jsonData = {
        jobId: getDataFromSession("jobId"),
        // skillText: status.jobSkill,
        skillId: status.skill,
        points: status.points,
      };
      handleAddData("addJobSkills", jsonData, "getJobSkills");
    } else {
      setDatas(datas);
    }
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
        // skillText: values.jobSkill,
        skillId: values.skill,
        points: values.points,
      };
      handleUpdate("updateJobSkills", jsonData, "getJobSkills");
    }
    setShowUpdateModal(false);
  };

  const handleEdit = (id, skillId, points, jobSkill) => {
    setUpdateData({
      id: id,
      skill: skillId,
      points: points,
      jobSkill: jobSkill,
    });
    handleOpenUpdateModal();
  };

  useEffect(() => {
    if (data) {
      setDatas(data);
      const filteredData = data.map((element) => ({
        skill: element.jskills_skillsId,
      }));
      storeDataInSession("jobSkill", JSON.stringify(filteredData));
    }
    console.log("datas ni skills:", data);
    console.log("skills ni skills:", skill);
  }, [data, skill]);

  return (
    <>
      <div>
        <Button onClick={handleOpenModal}>
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Skill
        </Button>
        <Card className="w-full mt-3">
          {datas && datas.length > 0 ? (
            <>
              <div className="hidden md:block">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/12">Index</TableHead>
                      <TableHead className="w-1/12 ">Skill</TableHead>
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
                            skill.find(
                              (item) => item.value === data.jskills_skillsId
                            )?.label
                          }
                        </TableCell>
                        {/* <TableCell className="w-10/12 whitespace-normal">
                          {data.jskills_text}
                        </TableCell> */}
                        <TableCell className="w-1/12 text-center">
                          {data.jskills_points}
                        </TableCell>
                        <TableCell className="w-1/12 text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() =>
                                handleEdit(
                                  data.jskills_id,
                                  data.jskills_skillsId,
                                  data.jskills_points
                                )
                              }
                            >
                              <Edit2 className="h-4 w-4 mr-4" />
                            </button>
                            <button
                              className="h-4 w-4"
                              onClick={() => handleRemoveList(data.jskills_id)}
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
                            data.jskills_id,
                            data.jskills_skillsId,
                            data.jskills_points
                          )
                        }
                      >
                        <Edit2 className="h-4 w-4 mr-4" />
                      </button>
                      <button
                        className="h-4 w-4"
                        onClick={() => handleRemoveList(data.jskills_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 text-sm">
                      <div className="mb-1 text-xl break-words">
                        {
                          skill.find(
                            (item) => item.value === data.jskills_skillsId
                          )?.label
                        }
                      </div>
                      {/* {data.jskills_text} */}
                    </div>
                    <div className="text-end">
                      <Badge className="mt-2 text-xs font-bold">
                        Points: {data.jskills_points}
                      </Badge>
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <CardDescription className="text-center p-5">
              No skill added yet
            </CardDescription>
          )}
        </Card>
        {showModal && (
          <AddSkill
            open={showModal}
            onHide={handleCloseModal}
            skill={skill}
            handleAddList={handleAddList}
            isUpdate={true}
          />
        )}
        {showUpdateModal && (
          <UpdateSkillModal
            open={showUpdateModal}
            onHide={handleCloseUpdateModal}
            skill={skill}
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

export default UpdateSkill;
