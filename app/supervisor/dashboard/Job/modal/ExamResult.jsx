import { getDataFromSession, retrieveData } from '@/app/utils/storageUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { formatDate } from '@/app/signup/page';

const ExamResult = ({ candId }) => {
  const [examResults, setExamResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getCandidateExamPoints = useCallback(async () => {
    setIsLoading(true);
    try {
      const jobId = getDataFromSession("jobId");
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jsonData = { candidateId: candId, jobId: jobId }
      console.log("jsonData", jsonData);
      const formData = new FormData();
      formData.append("operation", "getCandidateExamPoints");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni exam", res);
      if (res.data && res.data.length > 0) {
        setExamResults(res.data);
        console.log("examResults", res.data);
      } else {
        setExamResults([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [candId]);

  useEffect(() => {
    getCandidateExamPoints();
  }, [getCandidateExamPoints]);

  const calculatePercentage = (score, totalScore) => {
    return (score / totalScore) * 100;
  };

  return (
    <div className="p-4">
      {isLoading ? (
        <Spinner />
      ) : examResults.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Exam Results</h2>
          {examResults.map((result, index) => (
            <Card key={result.examR_id} className="p-4">
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Score</p>
                  <p className="text-2xl font-bold">{result.examR_score} / {result.examR_totalscore}</p>
                </div>
                <Progress value={calculatePercentage(result.examR_score, result.examR_totalscore)} className="w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Date Taken</p>
                    <p>{formatDate(result.examR_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p>{result.examR_status === 1 ? 'Passed' : 'Failed'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No exam results found</p>
      )}
    </div>
  )
}

export default ExamResult
