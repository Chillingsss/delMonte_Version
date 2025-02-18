import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import {
  getDataFromSession,
  storeDataInSession,
} from "@/app/utils/storageUtils";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import { Love_Light } from "next/font/google";

const CreateExamMaster = ({ getExamDetails, type }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [examName, setExamName] = useState("");
  const [examDuration, setExamDuration] = useState(0);
  const [questions, setQuestions] = useState([
    { question: "", options: ["", ""], correctAnswer: "", points: 1 },
  ]);
  const [errors, setErrors] = useState({});
  const errorRefs = useRef({});

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", ""], correctAnswer: "", points: 1 },
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push("");
    setQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options = updatedQuestions[
      questionIndex
    ].options.filter((_, i) => i !== optionIndex);
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const validateForm = () => {
    let newErrors = {};
    if (!examName.trim()) newErrors.examName = "Exam name is required";
    if (examDuration <= 0)
      newErrors.examDuration = "Duration must be greater than 0";

    if (questions.length === 0) {
      newErrors.questions = "At least one question is required";
    } else {
      questions.forEach((question, index) => {
        if (!question.question.trim())
          newErrors[`question-${index}`] = "Question text is required";
        if (question.options.filter((opt) => opt.trim()).length < 2)
          newErrors[`options-${index}`] =
            "At least two non-empty options are required";
        if (!question.correctAnswer)
          newErrors[`correctAnswer-${index}`] =
            "A correct answer must be selected";
        if (question.points <= 0)
          newErrors[`points-${index}`] = "Points must be greater than 0";
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0];
      const errorElement = errorRefs.current[firstErrorKey];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [errors]);

  const handleSaveExam = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jobId = getDataFromSession("jobId");

      const examData = {
        master: {
          name: examName,
          typeId: type,
          jobId: type === 2 ? jobId : null,
          duration: examDuration,
        },
        questions: {
          questionMaster: questions.map((q) => ({
            text: q.question,
            typeId: 1,
            points: q.points,
            options: q.options
              .filter((option) => option.trim() !== "")
              .map((option) => ({
                text: option,
                isCorrect: option === q.correctAnswer ? 1 : 0,
              })),
          })),
        },
      };

      console.log("examData: ", examData);

      const formData = new FormData();
      formData.append("operation", "addExam");
      formData.append("json", JSON.stringify(examData));

      const response = await axios.post(url, formData);
      console.log(response);
      if (response.data !== 0) {
        storeDataInSession("examId", response.data);
        toast.success("Exam created successfully");
        setIsOpen(false);
        // Reset form
        setExamName("");
        setExamDuration(0);
        setQuestions([
          { question: "", options: ["", ""], correctAnswer: "", points: 1 },
        ]);
        setErrors({});
        getExamDetails();
      } else {
        toast.error("Failed to create exam");
      }
    } catch (error) {
      console.error("Error creating exam:", error);
      toast.error("An error occurred while creating the exam");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger>
        <Button>Create Exam</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-full overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Create Exam</h1>
        <form onSubmit={handleSaveExam} className="flex flex-col gap-4">
          <div className="mb-2">
            <Label htmlFor="examName">Exam Name</Label>
            <Input
              id="examName"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="Exam Name"
              className="mt-1"
            />
            {errors.examName && (
              <p
                ref={(el) => (errorRefs.current["examName"] = el)}
                className="text-red-500 text-sm mt-1"
              >
                {errors.examName}
              </p>
            )}
          </div>
          <div className="mb-2">
            <Label htmlFor="examDuration">Duration (minutes)</Label>
            <Input
              id="examDuration"
              type="number"
              value={examDuration}
              onChange={(e) => setExamDuration(parseInt(e.target.value))}
              placeholder="Duration"
              className="mt-1"
            />
            {errors.examDuration && (
              <p
                ref={(el) => (errorRefs.current["examDuration"] = el)}
                className="text-red-500 text-sm mt-1"
              >
                {errors.examDuration}
              </p>
            )}
          </div>
          {errors.questions && (
            <p
              ref={(el) => (errorRefs.current["questions"] = el)}
              className="text-red-500 text-sm mt-1"
            >
              {errors.questions}
            </p>
          )}
          {questions.map((question, index) => (
            <Card key={index} className="p-4 mb-4">
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">
                    Question {index + 1}
                  </h2>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeQuestion(index)}
                  >
                    <Trash2 size={20} />
                  </Button>
                </div>
                <div className="mb-2">
                  <Label htmlFor={`question-${index}`}>Question</Label>
                  <Input
                    id={`question-${index}`}
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(index, "question", e.target.value)
                    }
                    placeholder="Question"
                    className="mt-1"
                  />
                  {errors[`question-${index}`] && (
                    <p
                      ref={(el) =>
                        (errorRefs.current[`question-${index}`] = el)
                      }
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors[`question-${index}`]}
                    </p>
                  )}
                </div>
                <div className="mb-2">
                  <Label>Options</Label>
                  {question.options.map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className="flex items-center space-x-2 mb-2"
                    >
                      <Input
                        value={option}
                        onChange={(e) =>
                          updateOption(index, optionIndex, e.target.value)
                        }
                        className="mt-1"
                        placeholder={`Option ${optionIndex + 1}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeOption(index, optionIndex)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addOption(index)}
                    className="mt-1"
                  >
                    <PlusCircle size={20} className="mr-2" /> Add Option
                  </Button>
                  {errors[`options-${index}`] && (
                    <p
                      ref={(el) => (errorRefs.current[`options-${index}`] = el)}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors[`options-${index}`]}
                    </p>
                  )}
                </div>
                {question.options.some((option) => option.trim() !== "") && (
                  <div className="mb-2">
                    <Label>Select the correct answer</Label>
                    <RadioGroup
                      value={question.correctAnswer}
                      onValueChange={(value) =>
                        updateQuestion(index, "correctAnswer", value)
                      }
                      className="mt-1"
                    >
                      {question.options.map(
                        (option, optionIndex) =>
                          option.trim() !== "" && (
                            <div
                              key={optionIndex}
                              className="flex items-center space-x-2"
                            >
                              <RadioGroupItem
                                value={option}
                                id={`q${index}-option${optionIndex}`}
                              />
                              <Label htmlFor={`q${index}-option${optionIndex}`}>
                                {option}
                              </Label>
                            </div>
                          )
                      )}
                    </RadioGroup>
                    {errors[`correctAnswer-${index}`] && (
                      <p
                        ref={(el) =>
                          (errorRefs.current[`correctAnswer-${index}`] = el)
                        }
                        className="text-red-500 text-sm mt-1"
                      >
                        {errors[`correctAnswer-${index}`]}
                      </p>
                    )}
                  </div>
                )}
                <div className="mb-2">
                  <Label htmlFor={`points-${index}`}>Points</Label>
                  <Input
                    id={`points-${index}`}
                    type="number"
                    value={question.points}
                    onChange={(e) =>
                      updateQuestion(index, "points", parseInt(e.target.value))
                    }
                    className="mt-1"
                  />
                  {errors[`points-${index}`] && (
                    <p
                      ref={(el) => (errorRefs.current[`points-${index}`] = el)}
                      className="text-red-500 text-sm mt-1"
                    >
                      {errors[`points-${index}`]}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="flex justify-end">
            <Button type="button" onClick={addQuestion} variant="outline">
              <PlusCircle size={20} className="mr-1" /> Add Question
            </Button>
          </div>
          <Separator />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              onClick={() => setIsOpen(false)}
              variant="outline"
            >
              Close
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Spinner />} {isLoading ? "Saving..." : "Save Exam"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateExamMaster;
