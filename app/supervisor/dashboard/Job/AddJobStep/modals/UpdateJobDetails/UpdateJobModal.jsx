"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { useEffect, useState } from "react";
import UpdateDuties from "./UpdateDuties";
import { toast } from "sonner";
import axios from "axios";
import Spinner from "@/components/ui/spinner";
import {
  getDataFromSession,
  retrieveData,
  storeData,
  storeDataInSession,
} from "@/app/utils/storageUtils";
import UpdateEducation from "./UpdateEducationBackground";
import UpdateSkill from "./UpdateSkills";
import UpdateTraining from "./UpdateTraining";
import UpdateExperience from "./UpdateExperience";
import UpdateKnowledge from "./UpdateKnowledge";

function UpdateJobModal({ open, onClose, jobData, type }) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);

  const getData = async (operation) => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jsonData = {
        jobId: getDataFromSession("jobId"),
      };
      const formData = new FormData();
      formData.append("operation", operation);
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      if (res.data !== 0) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("UpdateJobModal.jsx => getData(): " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddData = async (operation, jsonData, getDataOperation) => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      console.log("jsonData ni handleAddData: ", jsonData);
      const formData = new FormData();
      formData.append("operation", operation);
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni handleAddData: ", res.data);
      if (res.data !== 0) {
        toast.success("Success!");
        getData(getDataOperation);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("UpdateJobModal.jsx => handleAddData(): " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (operation, jsonData, getDataOperation) => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      console.log("url ni handleUpdate: ", url);
      console.log("jsonData ni handleUpdate: ", jsonData);
      const formData = new FormData();
      formData.append("operation", operation);
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res ni handleUpdate: ", res);
      if (res.data === 1) {
        toast.success("Updated successfully");
        getData(getDataOperation);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("UpdateJobModal.jsx => handleUpdate(): " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteData = async (operation, jsonData, getDataOperation) => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      formData.append("operation", operation);
      formData.append("json", JSON.stringify(jsonData));
      console.log("url ni deleteData: ", url);
      console.log("jsonData ni deleteData: ", jsonData);
      const res = await axios.post(url, formData);
      console.log("res.data ni deleteData: ", res.data);
      if (res.data === 1) {
        toast.success("Deleted successfully");
        getData(getDataOperation);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("UpdateJobModal.jsx => deleteData(): " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAllDropdownData = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      formData.append("operation", "getAllDataForDropdownUpdate");
      const res = await axios.post(url, formData);
      console.log("res.data ni getAllDropdownData: ", res.data);
      if (res.data !== 0) {
        const formattedCourse = res.data.courseCategory.map((item) => ({
          value: item.course_categoryId,
          label: item.course_categoryName,
        }));

        const formattedTraining = res.data.training.map((item) => ({
          value: item.perT_id,
          label: item.perT_name,
        }));

        const formattedSkills = res.data.skills.map((item) => ({
          value: item.perS_id,
          label: item.perS_name,
        }));

        const formattedKnowledge = res.data.knowledge.map((item) => ({
          value: item.knowledge_id,
          label: item.knowledge_name,
        }));

        storeDataInSession(
          "courseCategoryList",
          JSON.stringify(formattedCourse)
        );
        storeDataInSession("trainingList", JSON.stringify(formattedTraining));
        storeDataInSession("skillsList", JSON.stringify(formattedSkills));
        storeDataInSession("knowledgeList", JSON.stringify(formattedKnowledge));

        // setCourseCategory(formattedCourse);
        // setTraining(formattedTraining);
        // setSkills(formattedSkills);
        // setKnowledgeList(formattedKnowledge);
        console.log("res ni getDropDownForAddJobs", res.data);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("UpdateJobModal.jsx => getAllDropdownData(): " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePage = () => {
    switch (type) {
      case "duties":
        return (
          <UpdateDuties
            data={data}
            handleAddData={handleAddData}
            getData={getData}
            handleUpdate={handleUpdate}
            deleteData={deleteData}
          />
        );
      case "education":
        return (
          <UpdateEducation
            // courseCategory={courseCategory}
            data={data}
            handleAddData={handleAddData}
            handleUpdate={handleUpdate}
            deleteData={deleteData}
          />
        );
      case "skills":
        return (
          <UpdateSkill
            // skill={skills}
            data={data}
            handleAddData={handleAddData}
            handleUpdate={handleUpdate}
            deleteData={deleteData}
          />
        );
      case "trainings":
        return (
          <UpdateTraining
            // training={training}
            data={data}
            handleAddData={handleAddData}
            handleUpdate={handleUpdate}
            deleteData={deleteData}
          />
        );
      case "experience":
        return (
          <UpdateExperience
            data={data}
            handleAddData={handleAddData}
            handleUpdate={handleUpdate}
            deleteData={deleteData}
          />
        );
      case "knowledge":
        return (
          <UpdateKnowledge
            // knowledgeList={knowledgeList}
            data={data}
            handleAddData={handleAddData}
            handleUpdate={handleUpdate}
            deleteData={deleteData}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (jobData && open) {
      setData(jobData);
      getAllDropdownData();
    }
  }, [jobData, open]);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom">
        <SheetHeader className="mb-3">
          <SheetTitle>Update {type}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          {isLoading ? <Spinner /> : <>{updatePage()}</>}
        </ScrollArea>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="secondary">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default UpdateJobModal;
