"use client";
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import React, { useEffect, useState } from 'react'
import AddJobMaster from './AddJobStep/AddJobMaster';
import AddDutiesMaster from './AddJobStep/AddDutiesMaster';
import { removeData, retrieveData, storeData } from '@/app/utils/storageUtils';
import AddJobEducation from './AddJobStep/AddJobEducation';
import axios from 'axios';
import { toast } from 'sonner';
import Spinner from '@/components/ui/spinner';
import AddJobTraining from './AddJobStep/AddJobTraining';
import AddJobKnowledge from './AddJobStep/AddJobKnowledge';
import AddJobSkill from './AddJobStep/AddJobSkill';
import AddJobExperience from './AddJobStep/AddJobExperience';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

function AddJob({ handleSwitchView }) {
  const [isLoading, setIsLoading] = useState(true);
  const [courseCategory, setCourseCategory] = useState([]);
  const [training, setTraining] = useState([]);
  const [skills, setSkills] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [knowledgeList, setKnowledgeList] = useState([]);

  const getDropDownForAddJobs = async () => {
    setIsLoading(true);
    try {
      const url = retrieveData("url") + "admin.php";
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

        setCourseCategory(formattedCourse);
        setTraining(formattedTraining);
        setSkills(formattedSkills);
        setKnowledgeList(formattedKnowledge);
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
      const url = retrieveData("url") + "admin.php";
      const jsonData = {
        jobMaster: retrieveData("jobMaster"),
        jobMasterDuties: JSON.parse(retrieveData("duties")),
        jobEducation: JSON.parse(retrieveData("jobEducation")),
        jobTraining: JSON.parse(retrieveData("jobTraining")),
        jobKnowledge: JSON.parse(retrieveData("jobKnowledge")),
        jobSkill: JSON.parse(retrieveData("jobSkill")),
        jobExperience: JSON.parse(retrieveData("jobExperience")),
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
        storeData("duties", "[]");
        storeData("jobEducation", "[]");
        storeData("jobTraining", "[]");
        storeData("jobKnowledge", "[]");
        storeData("jobSkill", "[]");
        storeData("jobExperience", "[]");
        handleNextStep(100);
        setTimeout(() => {
          handleSwitchView();
        }, [1500])
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
    if (retrieveData("duties") === null) {
      storeData("duties", "[]");
    }
    if (retrieveData("jobEducation") === null) {
      storeData("jobEducation", "[]");
    }
    if (retrieveData("jobTraining") === null) {
      storeData("jobTraining", "[]");
    }
    if (retrieveData("jobKnowledge") === null) {
      storeData("jobKnowledge", "[]");
    }
    if (retrieveData("jobSkill") === null) {
      storeData("jobSkill", "[]");
    }
    if (retrieveData("jobExperience") === null) {
      storeData("jobExperience", "[]");
    }
    getDropDownForAddJobs();
  }, []);

  return (
    <>
      {isLoading ? <Spinner /> :
        <Card className="rounded-md border-4 border-secondary mt-4">
          <CardContent>
            <div className="flex justify-center ">
              <Progress value={progress} className="my-10 md:w-3/4" />
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
                <AddJobKnowledge previousStep={handlePrevious} nextStep={handleNextStep} knowledgeList={knowledgeList} />
              </TabsContent>
              <TabsContent value={4}>
                <AddJobEducation courseCategory={courseCategory} previousStep={handlePrevious} nextStep={handleNextStep} />
              </TabsContent>
              <TabsContent value={5}>
                <AddJobTraining training={training} previousStep={handlePrevious} nextStep={handleNextStep} />
              </TabsContent>
              <TabsContent value={6}>
                <AddJobSkill skill={skills} previousStep={handlePrevious} nextStep={handleNextStep} />
              </TabsContent>
              <TabsContent value={7}>
                <AddJobExperience previousStep={handlePrevious} handleSubmit={handleSubmit} />
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
