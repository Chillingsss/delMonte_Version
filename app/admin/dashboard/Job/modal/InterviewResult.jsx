import { getDataFromSession } from "@/app/utils/storageUtils";
import { Card, CardContent } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/app/signup/page";
import { Button } from "@/components/ui/button";
import ConductInterview from "./ConductInterview";

const InterviewResult = ({ candId, handleInterviewChangeStatus }) => {
  const [interviewResults, setInterviewResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showConductInterview, setShowConductInterview] = useState(false);

  const getCandInterviewResult = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jsonData = {
        jobId: getDataFromSession("jobId"),
        candId: candId,
      };
      const formData = new FormData();
      formData.append("operation", "getCandInterviewResult");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);

      if (res.data && res.data !== -1 && res.data !== 0) {
        setInterviewResults(res.data);
      } else {
        setInterviewResults([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.error(
        "InterviewResult.jsx => getCandInterviewResult error: ",
        error
      );
    } finally {
      setIsLoading(false);
    }
  }, [candId]);

  const handleShowConductInterview = () => {
    setShowConductInterview(true);
  };

  const handleCloseConductInterview = () => {
    setShowConductInterview(false);
    getCandInterviewResult();
  };

  useEffect(() => {
    getCandInterviewResult();
  }, [getCandInterviewResult]);

  const calculatePercentage = (score, totalScore) => {
    return (score / totalScore) * 100;
  };

  return (
    <div className="p-4">
      {isLoading ? (
        <Spinner />
      ) : interviewResults.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Interview Results</h2>
          {interviewResults.map((result) => (
            <Card key={result.interviewR_id} className="p-4">
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Score</p>
                  <p className="text-2xl font-bold">
                    {result.interviewR_score} / {result.interviewR_totalScore}
                  </p>
                </div>
                <Progress
                  value={calculatePercentage(
                    result.interviewR_score,
                    result.interviewR_totalScore
                  )}
                  className="w-full"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Date Taken</p>
                    <p>{formatDate(result.interviewR_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p>
                      {result.interviewR_status === 1 ? "Passed" : "Failed"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {/* <div className="flex justify-center">
            <Button onClick={handleShowConductInterview}>Conduct New Interview</Button>
          </div> */}
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-center text-gray-500">
            No interview results found
          </p>
          <Button onClick={handleShowConductInterview}>
            Conduct Interview
          </Button>
        </div>
      )}

      {showConductInterview && (
        <ConductInterview
          open={showConductInterview}
          onHide={handleCloseConductInterview}
          candId={candId}
          handleInterviewChangeStatus={handleInterviewChangeStatus}
        />
      )}
    </div>
  );
};

export default InterviewResult;
