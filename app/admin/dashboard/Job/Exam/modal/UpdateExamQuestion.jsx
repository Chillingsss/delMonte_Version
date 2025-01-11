import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { PlusCircle, Trash2, Edit2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import Spinner from '@/components/ui/spinner'

const UpdateExamQuestion = ({ examQuestionData, getExamDetails }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [points, setPoints] = useState(1);
  const [errors, setErrors] = useState({});
  const errorRefs = useRef({});

  useEffect(() => {
    if (examQuestionData) {
      setQuestion(examQuestionData.examQ_text);
      setOptions(examQuestionData.options.map(opt => opt.examC_text));
      setCorrectAnswer(examQuestionData.options.find(opt => opt.examC_isCorrect === 1)?.examC_text || '');
      setPoints(examQuestionData.examQ_points);
    }
  }, [examQuestionData]);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validateForm = () => {
    let newErrors = {};
    if (!question.trim()) newErrors.question = "Question is required";
    if (options.filter(opt => opt.trim()).length < 2) newErrors.options = "At least two non-empty options are required";
    if (!correctAnswer) newErrors.correctAnswer = "A correct answer must be selected";
    if (points <= 0) newErrors.points = "Points must be greater than 0";

    if (!options.includes(correctAnswer)) {
      newErrors.correctAnswer = "A correct answer must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0];
      const errorElement = errorRefs.current[firstErrorKey];
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [errors]);

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    if (
      question === examQuestionData.examQ_text &&
      options.length === examQuestionData.options.length &&
      options.every((opt, index) => opt === examQuestionData.options[index].examC_text) &&
      correctAnswer === examQuestionData.options.find(opt => opt.examC_isCorrect === 1)?.examC_text &&
      points === examQuestionData.examQ_points
    ) {
      toast.info("No changes made");
      setIsLoading(false);
      return;
    }

    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      formData.append("operation", "updateExamQuestion");
      
      const questionData = {
        questionId: examQuestionData.examQ_id,
        text: question,
        typeId: 1,
        points: points,
        options: options.map(option => ({
          text: option,
          isCorrect: option === correctAnswer ? 1 : 0
        }))
      };
      
      formData.append("json", JSON.stringify(questionData));

      const response = await axios.post(url, formData);
      console.log("response: ", response);
      if (response.data === 1) {
        toast.success("Question updated successfully");
        setIsOpen(false);
        getExamDetails();
      } else if (response.data === 0) {
        toast.error("Failed to update question");
      } else {
        toast.error("Failed to update question. There's already a transaction made in this question");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("An error occurred while updating the question");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div>
          <button><Edit2 className='cursor-pointer w-5 h-5' /></button>
        </div>
      </SheetTrigger>
      <SheetContent side="bottom" className='h-full overflow-y-auto'>
        <h1 className="text-2xl font-bold mb-4">Update Question</h1>
        <form onSubmit={handleUpdateQuestion} className='flex flex-col gap-4'>
          <Card className="p-4 mb-4">
            <CardContent>
              <div className="mb-2">
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Question"
                  className="mt-1"
                />
                {errors.question && <p ref={el => errorRefs.current.question = el} className="text-red-500 text-sm mt-1">{errors.question}</p>}
              </div>
              <div className="mb-2">
                <Label>Options</Label>
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="mt-1"
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button type="button" variant="ghost" onClick={() => removeOption(index)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addOption} className="mt-1">
                  <PlusCircle size={20} className="mr-2" /> Add Option
                </Button>
                {errors.options && <p ref={el => errorRefs.current.options = el} className="text-red-500 text-sm mt-1">{errors.options}</p>}
              </div>
              {options.some(option => option.trim() !== '') && (
                <div className="mb-2">
                  <Label>Select the correct answer</Label>
                  <RadioGroup
                    value={correctAnswer}
                    onValueChange={setCorrectAnswer}
                    className="mt-1"
                  >
                    {options.map((option, index) => (
                      option.trim() !== '' && (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`option${index}`} />
                          <Label htmlFor={`option${index}`}>{option}</Label>
                        </div>
                      )
                    ))}
                  </RadioGroup>
                  {errors.correctAnswer && <p ref={el => errorRefs.current.correctAnswer = el} className="text-red-500 text-sm mt-1">{errors.correctAnswer}</p>}
                </div>
              )}
              <div className="mb-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(parseInt(e.target.value))}
                  className="mt-1"
                />
                {errors.points && <p ref={el => errorRefs.current.points = el} className="text-red-500 text-sm mt-1">{errors.points}</p>}
              </div>
            </CardContent>
          </Card>
          <Separator />
          <div className='flex justify-end gap-2'>
            <Button type="button" onClick={() => setIsOpen(false)} variant="outline">Close</Button>
            <Button type="submit" disabled={isLoading}>{isLoading && <Spinner />} {isLoading ? "Updating..." : "Update Question"}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default UpdateExamQuestion