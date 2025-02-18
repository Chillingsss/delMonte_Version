import { getDataFromSession } from "@/app/utils/storageUtils";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/ui/spinner";
import axios from "axios";
import { Edit } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import UpdateJobModal from "../AddJobStep/modals/UpdateJobDetails/UpdateJobModal";
import { ScrollArea } from "@/components/ui/scroll-area";

const JobDetails = ({ getSelectedJobs }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);

  const getJobDetails = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jobId = getDataFromSession("jobId");
      const jsonData = { jobId: jobId };
      const formData = new FormData();
      formData.append("operation", "getJobDetails");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("RES DATA ni jobbbbb: ", res.data.jobDuties);
      setData(res.data);
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const [openUpdateJob, setOpenUpdateJob] = useState(false);
  const [type, setType] = useState("");
  const [jobData, setJobData] = useState([]);

  const handleOpenUpdateJob = (data, type) => {
    setJobData(data);
    setType(type);
    setOpenUpdateJob(true);
  };

  const handleCloseUpdateJob = () => {
    setOpenUpdateJob(false);
    getSelectedJobs();
  };

  useEffect(() => {
    getJobDetails();
  }, []);

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <ScrollArea className="h-[65vh] pb-10">
          <div>
            <div className="flex items-center w-full px-3">
              <span className="text-sm my-3 font-bold flex items-center mr-2">
                Duties and Responsibilities
              </span>
              <div>
                <Edit
                  className="h-4 w-4 cursor-pointer ml-1"
                  onClick={() => handleOpenUpdateJob(data?.jobDuties, "duties")}
                />
              </div>
            </div>
            <div className="w-full px-6">
              {data?.jobDuties && data.jobDuties.length > 0 ? (
                data.jobDuties.map((duty, index) => (
                  <ul key={index} className="list-disc ml-4 mb-1">
                    <li>{duty.duties_text}</li>
                  </ul>
                ))
              ) : (
                <p className="text-primary">
                  No duties and responsibilities qualifications added yet.
                </p>
              )}
            </div>
            <div className="w-full px-3 mt-3">
              <div className="text-sm mb-3 font-bold flex items-center">
                <span className="mr-2">Educational Background </span>
                <Edit
                  className="h-4 w-4 cursor-pointer ml-1"
                  onClick={() =>
                    handleOpenUpdateJob(data?.jobEducation, "education")
                  }
                />
              </div>
              {data?.jobEducation && data.jobEducation.length > 0 ? (
                <>
                  <div className="w-full ml-3">
                    {data.jobEducation.map((edu, index) => (
                      <ul key={index} className="list-disc ml-4 mb-3">
                        <li>
                          Graduate of any {edu.course_categoryName} courses.
                          <Badge className="ml-2 text-xs">
                            {edu.jeduc_points} point
                            {edu.jeduc_points > 1 ? "s" : ""}
                          </Badge>
                        </li>
                      </ul>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="ml-3 text-primary">
                    No educational background qualifications added yet.
                  </p>
                </>
              )}
              <div className="text-sm my-3 font-bold flex items-center">
                <span className="mr-2">Skills</span>
                <Edit
                  className="h-4 w-4 cursor-pointer ml-1"
                  onClick={() => handleOpenUpdateJob(data?.jobSkills, "skills")}
                />
              </div>
              {data?.jobSkills && data.jobSkills.length > 0 ? (
                <>
                  <div className="w-full ml-3">
                    {data.jobSkills.map((skill, index) => (
                      <ul key={index} className="list-disc ml-4 mb-1">
                        <li>
                          {skill.perS_name}
                          <Badge className="ml-2 text-xs">
                            {skill.jskills_points} point
                            {skill.jskills_points > 1 ? "s" : ""}
                          </Badge>
                        </li>
                      </ul>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="ml-3 text-primary">
                    No skills qualifications added yet.
                  </p>
                </>
              )}
              <div className="text-sm my-3 font-bold flex items-center">
                <span className="mr-2">Trainings</span>
                <Edit
                  className="h-4 w-4 cursor-pointer ml-1"
                  onClick={() =>
                    handleOpenUpdateJob(data?.jobTrainings, "trainings")
                  }
                />
              </div>
              {data?.jobTrainings && data.jobTrainings.length > 0 ? (
                <>
                  <div className="w-full ml-3">
                    {data.jobTrainings.map((training, index) => (
                      <ul key={index} className="list-disc ml-4 mb-1">
                        <li>
                          {training.perT_name}
                          <Badge className="ml-2 text-xs">
                            {training.jtrng_points} point
                            {training.jtrng_points > 1 ? "s" : ""}
                          </Badge>
                        </li>
                      </ul>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="ml-3 text-primary">
                    No trainings qualifications added yet.
                  </p>
                </>
              )}
              <div className="text-sm my-3 font-bold flex items-center">
                <span className="mr-2">Experience</span>
                <Edit
                  className="h-4 w-4 cursor-pointer ml-1"
                  onClick={() =>
                    handleOpenUpdateJob(data?.jobExperience, "experience")
                  }
                />
              </div>
              {data?.jobExperience && data.jobExperience.length > 0 ? (
                <>
                  <div className="w-full ml-3">
                    {data.jobExperience.map((exp, index) => (
                      <ul key={index} className="list-disc ml-4 mb-1">
                        <li>
                          {exp.jwork_responsibilities}{" "}
                          {` (with at least ${exp.jwork_duration} year${
                            exp.jwork_duration > 1 ? "s" : ""
                          } of experience needed)`}
                          <Badge className="ml-2 text-xs">
                            {exp.jwork_points} point
                            {exp.jwork_points > 1 ? "s" : ""}
                          </Badge>
                        </li>
                      </ul>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="ml-3 text-primary">
                    No experience qualifications added yet.
                  </p>
                </>
              )}
              <div className="text-sm my-3 font-bold flex items-center">
                <span className="mr-2">Knowledge and Compliance</span>
                <Edit
                  className="h-4 w-4 cursor-pointer ml-1"
                  onClick={() =>
                    handleOpenUpdateJob(data?.jobKnowledge, "knowledge")
                  }
                />
              </div>
              {data?.jobKnowledge && data.jobKnowledge.length > 0 ? (
                <>
                  <div className="w-full ml-3">
                    {data.jobKnowledge.map((knowledge, index) => (
                      <ul key={index} className="list-disc ml-4 mb-1">
                        <li>
                          {knowledge.knowledge_name}
                          <Badge className="ml-2 text-xs">
                            {knowledge.jknow_points} point
                            {knowledge.jknow_points > 1 ? "s" : ""}
                          </Badge>
                        </li>
                      </ul>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="ml-3 text-primary">
                    No knowledge and compliance qualifications added yet.
                  </p>
                </>
              )}
            </div>
          </div>
        </ScrollArea>
      )}
      <UpdateJobModal
        open={openUpdateJob}
        onClose={handleCloseUpdateJob}
        jobData={jobData}
        type={type}
        getJobDetails={getJobDetails}
      />
    </div>
  );
};

export default JobDetails;
