import { retrieveData } from '@/app/utils/storageUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const ConductInterview = ({ open, onHide, candId, handleInterviewChangeStatus }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasCriteria, setHasCriteria] = useState(false);
  const [interviewCriteria, setInterviewCriteria] = useState([]);
  const [scores, setScores] = useState({});
  const [errors, setErrors] = useState({});
  const [candidateScore, setCandidateScore] = useState(0);
  const [overAllScore, setOverAllScore] = useState(0);
  const [passingPercentage, setPassingPercentage] = useState(0);

  const getInterviewCriteria = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jsonData = { jobId: retrieveData("jobId") };
      const formData = new FormData();
      formData.append("operation", "getCriteriaForInterview");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni getInterviewCriteria: ", res);

      if (res.data && res.data.criteria && res.data.criteria.length > 0) {
        setHasCriteria(true);
        setInterviewCriteria(res.data.criteria);

        // Calculate overall score by summing up inter_criteria_points
        const totalPoints = res.data.criteria.reduce((sum, criteria) => {
          return sum + parseInt(criteria.inter_criteria_points);
        }, 0);

        setOverAllScore(totalPoints);

        // Set passing percentage if available
        if (res.data.passingPoints && res.data.passingPoints.length > 0) {
          setPassingPercentage(res.data.passingPoints[0].passing_percent);
        }
      } else {
        setHasCriteria(false);
        setInterviewCriteria([]);
        setOverAllScore(0);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("ConductInterview.jsx => getInterviewCriteria(): " + error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getInterviewCriteria();
  }, []);

  const handleInputChange = (criteriaId, maxPoints, value) => {
    if (Number(value) > maxPoints) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [criteriaId]: `Score cannot exceed ${maxPoints} points`,
      }));
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [criteriaId]: "",
      }));
      setScores((prevScores) => ({
        ...prevScores,
        [criteriaId]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    let valid = true;
    let score = 0;
    //pass ni or fail
    let status = 0;

    interviewCriteria.forEach(criteria => {
      if (!scores[criteria.inter_criteria_id]) {
        setErrors(prevErrors => ({
          ...prevErrors,
          [criteria.inter_criteria_id]: "This field is required",
        }));
        valid = false;
      } else {
        score += Number(scores[criteria.inter_criteria_id]);
      }
    });

    if (valid) {
      const percentageScore = (score / overAllScore) * 100;
      status = percentageScore >= passingPercentage ? 1 : 0;

      const masterData = {
        jobId: retrieveData("jobId"),
        candId: candId,
        status: status,
        percentageScore: percentageScore,
        score: score,
        totalScore: overAllScore
      }
      const scoreData = interviewCriteria.map(criteria => ({
        jobId: retrieveData("jobId"),
        criteriaId: criteria.inter_criteria_id,
        candId: candId,
        points: Number(scores[criteria.inter_criteria_id]) || 0,
      }));

      console.log("passingPercentage: ", passingPercentage);
      console.log("Score percentage: ", percentageScore);
      console.log("status: ", status);

      try {
        const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
        const jsonData = {
          masterData: masterData,
          scoreData: scoreData
        }
        console.log("jsonData: ", jsonData);
        const formData = new FormData();
        formData.append("operation", "scoreInterviewApplicant");
        formData.append("json", JSON.stringify(jsonData));
        const res = await axios.post(url, formData);
        console.log("ConductInterview.jsx => handleSubmit(): ", res);
        if (res.data === 1) {
          toast.success(`Scores submitted successfully!`);
          handleInterviewChangeStatus(5);
          onHide();
        } else {
          toast.error("Failed to submit scores.");
        }
      } catch (error) {
        toast.error("Network error");
        console.log("ConductInterview.jsx => handleSubmit(): " + error);
      }
    } else {
      toast.error("Please fill in all required fields.");
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={onHide}>
        <DialogContent>
          <DialogTitle>Conduct Interview</DialogTitle>
          <DialogDescription>Score the applicant based on the criteria</DialogDescription>
          <form onSubmit={handleSubmit}>
            <ScrollArea className="h-[500px] w-full">
              <Card>
                <CardContent>
                  {isLoading ? (
                    <Spinner />
                  ) : (
                    <>
                      {hasCriteria ? (
                        <>
                          <div className="w-full grid grid-cols-1 gap-4 mt-3">
                            {interviewCriteria.map((criteria, index) => (
                              <div key={index}>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                  {criteria.criteria_inter_name}
                                  <span className='ml-1 text-xs'>{`(${criteria.interview_categ_name})`}</span>
                                </label>
                                <CardDescription className="mb-2">
                                  Question: {criteria.inter_criteria_question}
                                </CardDescription>
                                <Input
                                  type="number"
                                  value={scores[criteria.inter_criteria_id] || ''}
                                  onChange={(e) => handleInputChange(criteria.inter_criteria_id, criteria.inter_criteria_points, e.target.value)}
                                  placeholder={`Enter points (0-${criteria.inter_criteria_points})`}
                                  onKeyDown={(e) => {
                                    if (["e", "E", "+", "-"].includes(e.key)) {
                                      e.preventDefault();
                                    }
                                  }}
                                />
                                {errors[criteria.inter_criteria_id] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors[criteria.inter_criteria_id]}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div>
                          <div className='flex flex-col justify-center items-center gap-3'>
                            <div className='font-bold text-xl mt-3'>No interview criteria added yet</div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </ScrollArea>
            <div className={`mt-4 flex justify-end gap-2 ${!hasCriteria && "hidden"}`}>
              <Button type="button" className="mt-5 btn btn-secondary" onClick={onHide} variant="outline">
                Cancel
              </Button>
              <Button type="submit" className="mt-5 btn btn-primary">
                Submit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConductInterview;
