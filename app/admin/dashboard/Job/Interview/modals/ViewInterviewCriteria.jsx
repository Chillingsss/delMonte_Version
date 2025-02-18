import { Button } from "@/components/ui/button";
import { Edit2, PlusCircle, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import ShowAlert from "@/components/ui/show-alert";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import UpdateInterviewPassingPercentage from "./UpdateInterview/UpdateInterviewPassingPercentage";
import AddInterviewCriteria from "./AddInterview/AddInterviewCriteria";
import UpdateInterviewCriteria from "./UpdateInterview/UpdateInterviewCriteria";
import Spinner from "@/components/ui/spinner";
import { getDataFromSession } from "@/app/utils/storageUtils";
import { ScrollArea } from "@/components/ui/scroll-area";

function ViewInterviewCriteria() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [interviewPassingPercentage, setInterviewPassingPercentage] =
    useState(0);

  // add interview criteria modal diri
  const [showAddModal, setShowAddModal] = useState(false);
  const openShowModal = () => {
    setShowAddModal(true);
  };

  const closeShowModal = (status) => {
    if (status !== 0) {
      getJobInterviewDetails();
    }
    setShowAddModal(false);
  };

  const addCriteria = (values) => {
    setData((prevData) => [
      ...prevData,
      {
        criteria_inter_name: values.name,
        inter_criteria_points: values.points,
        interview_categ_name: values.category,
        inter_criteria_question: values.question,
        criteria_inter_id: values.criteriaId,
      },
    ]);
  };

  // update interview criteria modal diri
  const [selectedData, setSelectedData] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const openShowModalUpdate = (data, index) => {
    setShowUpdateModal(true);
    setSelectedData(data);
    setSelectedIndex(index);
  };
  const closeUpdateModal = (status) => {
    if (status !== 0) {
      let criteriaList = data;
      criteriaList[selectedIndex] = {
        criteria_inter_name: status.name,
        inter_criteria_points: status.points,
      };
      setData(criteriaList);
      // getSelectedJob();
    }
    setShowUpdateModal(false);
    setSelectedIndex(0);
  };

  // delete sa criteria ni diri
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [indexToRemove, setIndexToRemove] = useState(null);
  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleCloseAlert = async (status) => {
    console.log("status: ", status);
    if (status === 1) {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jsonData = { criteriaId: indexToRemove };
      console.log("JSON DATA: ", jsonData);
      const formData = new FormData();
      formData.append("operation", "deleteInterviewCriteria");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data: ", res.data);
      if (res.data === 1) {
        getJobInterviewDetails();
        toast.success("Criteria deleted successfully");
      }
    }
    setShowAlert(false);
  };

  const handleRemoveList = (idToRemove) => {
    setIndexToRemove(idToRemove);
    handleShowAlert(
      "This action cannot be undone. It will permanently delete the item and remove it from your list"
    );
  };

  const getJobInterviewDetails = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jobId = getDataFromSession("jobId");
      const jsonData = { jobId: jobId };
      const formData = new FormData();
      formData.append("operation", "getJobInterviewDetails");
      formData.append("json", JSON.stringify(jsonData));
      const response = await axios.post(url, formData);
      const res = response.data;
      console.log("percent mo to: ", res);
      if (res !== 0) {
        setData(res.interviewCriteria);
        setInterviewPassingPercentage(
          res.interviewPassingPercent[0].passing_percent
        );
      } else {
        setData([]);
      }
    } catch (error) {
      console.log("error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      getJobInterviewDetails();
    }
  }, [isOpen]);

  return (
    <div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger>
          <Button>View criteria</Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader className="mb-5">
            <SheetTitle>Interview criteria</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[80vh]">
            {isLoading ? (
              <Spinner />
            ) : (
              <div>
                {data.length === 0 ? (
                  <div className="flex flex-col justify-center items-center gap-3">
                    <div className="font-bold text-xl mt-3">
                      No criteria for interview
                    </div>
                    <Button onClick={openShowModal}>
                      <PlusCircle className="h-5 w-5 mr-1" /> Add criteria
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="ml-2">
                        <Button onClick={openShowModal} className="md:mb-3">
                          <PlusCircle className="h-5 w-5 mr-1" /> Add criteria
                        </Button>
                      </div>
                      <div className="flex md:justify-end items-end ml-2 md:mx-5 mb-3">
                        <p>Passing percentage: {interviewPassingPercentage}%</p>
                        <UpdateInterviewPassingPercentage
                          currentPassingPercentage={interviewPassingPercentage}
                          getJobInterviewDetails={getJobInterviewDetails}
                        />
                      </div>
                    </div>
                    <div
                      className={`grid ${
                        data.length > 2
                          ? "grid-cols-1 md:grid-cols-2"
                          : "grid-cols-1"
                      } gap-2`}
                    >
                      {data.map((item, index) => (
                        <Card key={index}>
                          <CardContent>
                            <CardHeader>
                              <div className="flex justify-end">
                                {/* <div className='flex justify-end gap-3'> */}
                                {/* <Edit2 className='h-5 w-5 mr-1 hover:cursor-pointer' /> */}
                                <Trash2
                                  className="h-5 w-5 mr-1 hover:cursor-pointer"
                                  onClick={() =>
                                    handleRemoveList(item.inter_criteria_id)
                                  }
                                />
                              </div>
                              <CardTitle> {item.criteria_inter_name}</CardTitle>
                              <CardDescription>
                                {item.inter_criteria_question}
                              </CardDescription>
                            </CardHeader>
                            <CardFooter>
                              <Badge variant="secondary" className="mr-2">
                                {item.interview_categ_name}
                              </Badge>
                              <Badge>{item.inter_criteria_points} points</Badge>
                            </CardFooter>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
      {showAddModal && (
        <AddInterviewCriteria
          open={showAddModal}
          onHide={closeShowModal}
          interviewCriteria={data}
          addCriteria={addCriteria}
        />
      )}
      {showUpdateModal && (
        <UpdateInterviewCriteria
          open={showUpdateModal}
          onHide={closeUpdateModal}
          data={selectedData}
          criteriaList={data}
          isMaster={false}
        />
      )}
      <ShowAlert
        open={showAlert}
        onHide={handleCloseAlert}
        message={alertMessage}
        duration={0}
      />
    </div>
  );
}

export default ViewInterviewCriteria;
