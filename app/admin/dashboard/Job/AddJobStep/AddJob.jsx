"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useEffect, useState } from 'react'
import AddJobMaster from './AddJobMaster';
import AddDutiesMaster from './AddDutiesMaster';
import { removeData, retrieveData, storeData } from '@/app/utils/storageUtils';
import AddJobEducation from './AddJobEducation';
import axios from 'axios';
import { toast } from 'sonner';
import Spinner from '@/components/ui/spinner';
import AddJobTraining from './AddJobTraining';
import AddJobKnowledge from './AddJobKnowledge';
import AddJobSkill from './AddJobSkill';
import AddJobExperience from './AddJobExperience';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

function AddJob({ handleSwitchView }) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  const getDropDownForAddJobs = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      formData.append("operation", "getDropDownForAddJobs");
      const res = await axios.post(url, formData);
      if (res.data !== 0) {
        const formattedCourse = res.data.courseCategory.map((item) => ({
          value: item.course_categoryId,
          label: item.course_categoryName,
        }))

        const formattedTraining = res.data.personalTraining.map((item) => ({
          value: item.perT_id,
          label: item.perT_name,
        }))

        const formattedSkills = res.data.personalSkills.map((item) => ({
          value: item.perS_id,
          label: item.perS_name,
        }))

        const formattedKnowledge = res.data.knowledge.map((item) => ({
          value: item.knowledge_id,
          label: item.knowledge_name,
        }))

        storeData("knowledgeList", JSON.stringify(formattedKnowledge));
        storeData("courseCategoryList", JSON.stringify(formattedCourse));
        storeData("trainingList", JSON.stringify(formattedTraining));
        storeData("skillsList", JSON.stringify(formattedSkills));

        // setCourseCategory(formattedCourse);
        // setTraining(formattedTraining);
        // setSkills(formattedSkills);
        // setKnowledgeList(formattedKnowledge);
        console.log("res ni getDropDownForAddJobs", res.data);
      }

    } catch (error) {
      toast.error("Network error");
      console.log("AddJob.jsx => onSubmit(): " + error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jsonData = {
        jobMaster: retrieveData("jobMaster"),
        jobMasterDuties: JSON.parse(retrieveData("duties")),
        jobEducation: JSON.parse(retrieveData("jobEducation")),
        jobTraining: JSON.parse(retrieveData("jobTraining")),
        jobKnowledge: JSON.parse(retrieveData("jobKnowledge")),
        jobSkill: JSON.parse(retrieveData("jobSkill")),
        jobExperience: JSON.parse(retrieveData("jobExperience")),
        totalPoints: Number(retrieveData("totalPoints")),
      }
      console.log("jsonData", JSON.stringify(jsonData));
      const formData = new FormData();
      formData.append("json", JSON.stringify(jsonData));
      formData.append("operation", "addJobMaster");
      const res = await axios.post(url, formData);
      console.log("RES DATA ni addJobMaster: ", res.data);
      if (res.data === 1) {
        toast.success("Job added successfully");
        setCurrentStep(1);
        removeData("jobMaster");
        removeData("duties");
        removeData("jobEducation");
        removeData("jobTraining");
        removeData("jobKnowledge");
        removeData("jobSkill");
        removeData("jobExperience");
        removeData("totalPoints");
        handleNextStep(100);
        setTimeout(() => {
          handleSwitchView();
        }, [1500]);
      } else {
        toast.error("Failed to add job");
      }

    } catch (error) {
      toast.error("Network error");
      console.log("AddJob.jsx => onSubmit(): " + error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleNextStep = (progress) => {
    setCurrentStep(currentStep + 1);
    setProgress(progress);
  }
  const handlePrevious = (progress) => {
    setCurrentStep(currentStep - 1);
    setProgress(progress);
  }

  useEffect(() => {
    const dataKeys = [
      "duties",
      "jobEducation",
      "jobTraining",
      "jobKnowledge",
      "jobSkill",
      "jobExperience",
      "totalPoints",
    ];

    dataKeys.forEach((key) => {
      if (retrieveData(key) === null) {
        storeData(key, key === "totalPoints" ? 0 : "[]");
      }
    });
    getDropDownForAddJobs();
  }, []);

  const addTotalPoints = (points) => {
    console.log("points:", Number(totalPoints) + Number(points));
    if ((Number(totalPoints) + Number(points)) > 100) {
      toast.error("Total points cannot exceed 100");
      return false;
    }
    setTotalPoints(Number(totalPoints) + Number(points));
    storeData("totalPoints", Number(totalPoints) + Number(points));
    return true;
  };

  const deductTotalPoints = (points) => {
    const pointsToDeduct = Number(points);
    if (isNaN(pointsToDeduct)) {
      toast.error("Invalid points value");
      return;
    }
    setTotalPoints(Number(totalPoints) - pointsToDeduct);
    storeData("totalPoints", totalPoints - pointsToDeduct);
  };


  const title = [
    "Job Master",
    "Duties",
    "Knowledge and Compliance",
    "Education",
    "Training",
    "Skill",
    "Experience",
  ]

  return (
    <>
      {isLoading ? <Spinner /> :
        <Card className="rounded-md border-4 border-secondary mt-4">
          <CardHeader>
            <CardTitle>{title[currentStep - 1]}</CardTitle>
            <CardDescription>Total points: {Number(retrieveData("totalPoints"))}/100</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center my-10 ">
              <Progress value={progress} className="flex-grow mr-4" />
              <p className="whitespace-nowrap">{progress}%</p>
            </div>
            <Separator />
            <Tabs defaultValue={1} value={currentStep}>
              <TabsContent value={1}>
                <AddJobMaster nextStep={handleNextStep} />
              </TabsContent>
              <TabsContent value={2}>
                <AddDutiesMaster previousStep={handlePrevious} nextStep={handleNextStep} />
              </TabsContent>
              <TabsContent value={3}>
                <AddJobKnowledge
                  previousStep={handlePrevious}
                  nextStep={handleNextStep}
                  addTotalPoints={addTotalPoints}
                  deductTotalPoints={deductTotalPoints}
                />
              </TabsContent>
              <TabsContent value={4}>
                <AddJobEducation
                  previousStep={handlePrevious}
                  nextStep={handleNextStep}
                  addTotalPoints={addTotalPoints}
                  deductTotalPoints={deductTotalPoints}
                />
              </TabsContent>
              <TabsContent value={5}>
                <AddJobTraining
                  previousStep={handlePrevious}
                  nextStep={handleNextStep}
                  addTotalPoints={addTotalPoints}
                  deductTotalPoints={deductTotalPoints}
                />
              </TabsContent>
              <TabsContent value={6}>
                <AddJobSkill
                  previousStep={handlePrevious}
                  nextStep={handleNextStep}
                  addTotalPoints={addTotalPoints}
                  deductTotalPoints={deductTotalPoints}
                />
              </TabsContent>
              <TabsContent value={7}>
                <AddJobExperience
                  previousStep={handlePrevious}
                  handleSubmit={handleSubmit}
                  addTotalPoints={addTotalPoints}
                  deductTotalPoints={deductTotalPoints}
                />
              </TabsContent>
              <TabsContent value={8}>
                <div className="flex justify-center items-center h-full">
                  <p className="text-xl">Add Job Completed!</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      }
    </>
  )
}

export default AddJob
