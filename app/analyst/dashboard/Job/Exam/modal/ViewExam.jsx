import { formatDate } from "@/app/signup/page";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Edit2, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import ShowAlert from "@/components/ui/show-alert";
import CreateExamMaster from "./CreateExamMaster";
import AddExamQuestion from "./AddExamQuestion";
import UpdateExamMaster from "./UpdateExamMaster";
import UpdateExamQuestion from "./UpdateExamQuestion";
import axios from "axios";
import { toast } from "sonner";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Spinner from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { getDataFromSession, retrieveData } from "@/app/utils/storageUtils";
import { ScrollArea } from "@/components/ui/scroll-area";

function ViewExam() {
  const [examMaster, setExamMaster] = useState([]);
  const [questionMaster, setQuestionMaster] = useState([]);
  const [passingPercent, setPassingPercent] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // // delete question
  // const [alertMessage, setAlertMessage] = useState("");
  // const [showAlert, setShowAlert] = useState(false);
  // const [selectedId, setSelectedId] = useState(null);
  // const handleShowAlert = (message) => {
  // setAlertMessage(message);
  //   setShowAlert(true);
  // };
  // const handleCloseAlert = (status) => {
  //   if (status === 1) {
  //     // delete question
  //   }
  //   setShowAlert(false);
  // };
  // const handleRemoveList = (id) => {
  //   setSelectedId(id);
  //   handleShowAlert("This action cannot be undone. It will permanently delete the question");
  // };

  // const handleDeleteQuestion = () => {}

  const getExamDetails = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      const jsonData = { jobId: getDataFromSession("jobId") };
      formData.append("json", JSON.stringify(jsonData));
      formData.append("operation", "getExamDetails");
      const response = await axios.post(url, formData);
      const res = response.data;
      console.log("ViewExam.jsx ~ getExamDetails ~ res:", res);
      if (res !== 0) {
        setExamMaster(res.examMaster[0]);
        setQuestionMaster(res.questionMaster.questions);
        setPassingPercent(res.passingPercentage.jobM_passpercentage);
      } else {
        setExamMaster(0);
        setQuestionMaster([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("ViewExam.jsx ~ getExamDetails ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      getExamDetails();
    }
    // if (examData !== 0) {
    //   setExamMaster(examData.examMaster[0]);
    //   setQuestionMaster(examData.questionMaster.questions);
    // }
    // console.log("examData: ", examData);
  }, [isOpen]);

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button>View Exam</Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>View Exam</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[80vh]">
            {isLoading ? (
              <Spinner />
            ) : (
              <div className="rounded-md p-4">
                {examMaster === 0 ? (
                  <div className="flex flex-col justify-center items-center gap-4">
                    <p>No exam created yet</p>
                    <CreateExamMaster
                      getExamDetails={getExamDetails}
                      type={2}
                    />
                  </div>
                ) : (
                  <>
                    <AddExamQuestion
                      examId={examMaster.exam_id}
                      getExamDetails={getExamDetails}
                    />
                    <div className="flex flex-col">
                      <div className="flex md:justify-center">
                        <Card className="mb-3 flex flex-col gap-1 w-full md:w-1/2">
                          <CardContent className="p-3">
                            <div className="flex flex-row justify-between">
                              <h1 className="text-2xl font-boldtext-start">
                                {examMaster.exam_name}
                              </h1>
                              <UpdateExamMaster
                                examMasterData={examMaster}
                                getExamDetails={getExamDetails}
                                passingPercent={passingPercent}
                              />
                            </div>
                            <p>
                              Exam duration: {examMaster.exam_duration} minutes
                            </p>
                            <p className="text-sm">
                              Date created:{" "}
                              {examMaster.exam_createdAt
                                ? formatDate(examMaster.exam_createdAt)
                                : "N/A"}
                            </p>
                            <p className="text-sm">
                              Date updated:{" "}
                              {examMaster.exam_updatedAt
                                ? formatDate(examMaster.exam_updatedAt)
                                : "N/A"}
                            </p>
                            <p className="text-sm">
                              Passing percentage: {passingPercent}%
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                      {questionMaster.length === 0 ? (
                        <div className="flex justify-center items-center mt-4">
                          <p>No questions have been added to this exam yet.</p>
                        </div>
                      ) : (
                        <div
                          className={`grid grid-cols-1 ${
                            questionMaster.length === 1
                              ? "md:grid-cols-1"
                              : "md:grid-cols-2"
                          } gap-4`}
                        >
                          {questionMaster.map((question, index) => (
                            <Card
                              key={index}
                              className="mb-3 w-full flex flex-col"
                            >
                              <CardContent className="p-3 flex-grow">
                                <div className="grid grid-cols-3 gap-2">
                                  <p className="mb-4 text-lg font-bold col-span-2">
                                    {index + 1}. {question.examQ_text}
                                  </p>
                                  <div className="flex flex-row gap-4 justify-end md:mr-2">
                                    <UpdateExamQuestion
                                      examQuestionData={question}
                                      getExamDetails={getExamDetails}
                                    />
                                    {/* <Trash2 size={20} onClick={() => handleRemoveList(question.examQ_id)} className='cursor-pointer' /> */}
                                  </div>
                                </div>
                                <RadioGroup
                                  defaultValue={question.options
                                    .find((opt) => opt.examC_isCorrect === 1)
                                    ?.examC_id.toString()}
                                >
                                  {question.options.map(
                                    (option, optionIndex) => (
                                      <div
                                        key={optionIndex}
                                        className="flex items-center space-x-2 mb-2"
                                      >
                                        <RadioGroupItem
                                          value={option.examC_id.toString()}
                                          id={`${option.examC_id}`}
                                          disabled
                                          checked={option.examC_isCorrect === 1}
                                        />
                                        <Label htmlFor={`${option.examC_id}`}>
                                          {option.examC_text}
                                        </Label>
                                      </div>
                                    )
                                  )}
                                </RadioGroup>
                              </CardContent>
                              <CardFooter className="mt-auto">
                                <Badge className="ml-auto">
                                  Points {question.examQ_points}
                                </Badge>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
                {/* <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} /> */}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default ViewExam;
