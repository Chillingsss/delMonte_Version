import { Card, CardContent, CardFooter } from "@/components/ui/card";
import AddExamQuestion from "../Job/Exam/modal/AddExamQuestion";
import CreateExamMaster from "../Job/Exam/modal/CreateExamMaster";
import UpdateExamMaster from "../Job/Exam/modal/UpdateExamMaster";
import UpdateExamQuestion from "../Job/Exam/modal/UpdateExamQuestion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import Spinner from "@/components/ui/spinner";
import axios from "axios";
import { toast } from "sonner";
import { formatDate } from "@/app/signup/page";


function GeneralExam() {
  const [examMaster, setExamMaster] = useState(null);
  const [questionMaster, setQuestionMaster] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getGeneralExamDetails = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      formData.append("operation", "getGeneralExamDetails");
      const response = await axios.post(url, formData);
      const res = response.data;
      if (res !== 0) {
        setExamMaster(res.examMaster[0]);
        setQuestionMaster(res.questionMaster.questions);
      } else {
        setExamMaster(null);
        setQuestionMaster([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getGeneralExamDetails();
  }, []);

  return (
    <div className='rounded-md p-4'>
      <p className="text-2xl font-bold mb-4">General Exam</p>
      <Card className="bg-[#0e5a35] dark:bg-[#1c1917]">
        <CardContent>
          <div className="p-3">
            {isLoading ? <Spinner /> :
              <>
                {!examMaster ? (
                  <div className='flex flex-col justify-center items-center gap-4'>
                    <p>No exam created yet</p>
                    <CreateExamMaster getSelectedJob={getGeneralExamDetails} type={1} />
                  </div>
                ) : (
                  <>
                    <AddExamQuestion examId={examMaster.exam_id} getSelectedJob={getGeneralExamDetails} />
                    <div className='flex flex-col'>
                      <div className='flex md:justify-center'>
                        <Card className='mb-3 flex flex-col gap-1 bg-background w-full md:w-1/2'>
                          <CardContent className='p-3'>
                            <div className='flex flex-row justify-between'>
                              <h1 className='text-2xl font-boldtext-start'>
                                {examMaster.exam_name}
                              </h1>
                              <UpdateExamMaster examMasterData={examMaster} getSelectedJob={getGeneralExamDetails} isGeneralExam={true} />
                            </div>
                            {/* <p>Exam duration: {examMaster.exam_duration} minutes</p> */}
                            <p className='text-sm'>Date created: {examMaster.exam_createdAt ? formatDate(examMaster.exam_createdAt) : 'N/A'}</p>
                            <p className='text-sm'>Date updated: {examMaster.exam_updatedAt ? formatDate(examMaster.exam_updatedAt) : 'N/A'}</p>
                          </CardContent>
                        </Card>
                      </div>
                      {questionMaster.length === 0 ? (
                        <div className='flex justify-center items-center mt-4'>
                          <p>No questions have been added to this exam yet.</p>
                        </div>
                      ) : (
                        <div className={`grid grid-cols-1 ${questionMaster.length === 1 ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-4`}>
                          {questionMaster.map((question, index) => (
                            <Card key={index} className='mb-3 bg-background w-full flex flex-col'>
                              <CardContent className="p-3 flex-grow">
                                <div className='grid grid-cols-3 gap-2'>
                                  <p className='mb-4 text-lg font-bold col-span-2'>{index + 1}. {question.examQ_text}</p>
                                  <div className='flex flex-row gap-4 justify-end md:mr-2'>
                                    <UpdateExamQuestion examQuestionData={question} getSelectedJob={getGeneralExamDetails} />
                                  </div>
                                </div>
                                <RadioGroup defaultValue={question.options.find(opt => opt.examC_isCorrect === 1)?.examC_id.toString()}>
                                  {question.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center space-x-2 mb-2">
                                      <RadioGroupItem
                                        value={option.examC_id.toString()}
                                        id={`${option.examC_id}`}
                                        disabled
                                        checked={option.examC_isCorrect === 1}
                                      />
                                      <Label htmlFor={`${option.examC_id}`}>{option.examC_text}</Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </CardContent>
                              <CardFooter className="mt-auto">
                                <Badge className="ml-auto">Points {question.examQ_points}</Badge>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GeneralExam