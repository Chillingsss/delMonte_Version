import { retrieveData, storeData } from '@/app/utils/storageUtils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Spinner from '@/components/ui/spinner';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import UpdateJobModal from '../UpdateJobDetails/UpdateJobModal';
import SelectedApplicant from './SelectedApplicant';

function SelectedJob({ open, onHide, jobId }) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const getSelectedJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = retrieveData("url") + "admin.php";
      const jsonData = {
        "jobId": jobId
      }
      const formData = new FormData();
      formData.append("operation", "getSelectedJobs");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("RES DATA ni getSelectedJobs: ", res.data);
      if (res.data !== 0) {
        setData(res.data);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("AdminJobs.jsx => getSelectedJobs(): " + error);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    if (open) {
      getSelectedJobs();
      storeData("jobId", jobId);
    }
  }, [getSelectedJobs, jobId, open]);

  const indexOfLastCandidate = currentPage * itemsPerPage;
  const indexOfFirstCandidate = indexOfLastCandidate - itemsPerPage;
  const currentCandidates = data.candidates?.slice(indexOfFirstCandidate, indexOfLastCandidate);
  const totalPages = Math.ceil((data.candidates?.length || 0) / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const [showSelectedApplicant, setShowSelectedApplicant] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState(0);
  const handleShowSelectedApplicant = (id) => {
    setSelectedApplicantId(id);
    setShowSelectedApplicant(true);
  }
  const handleCloseSelectedApplicant = () => {
    setShowSelectedApplicant(false);
  };

  const handleUpdateJob = (data, type) => {
    return <UpdateJobModal jobData={data} type={type} getSelectedJobs={getSelectedJobs} />
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onHide}>
        <DialogContent className="max-w-7xl h-full md:h-4/5">
          <DialogTitle className="hidden" />
          {isLoading ? (<Spinner />) :
            (<>
              <ScrollArea className="h-full rounded-md md:p-2">
                <DialogHeader>
                  <DialogTitle>{data.jobMaster[0].jobM_title}</DialogTitle>
                  <ScrollArea className="h-52 md:h-36">
                    <DialogDescription>{data.jobMaster[0].jobM_description}</DialogDescription>
                  </ScrollArea>
                </DialogHeader>
                <Separator className="mb-4" />
                <div className='flex justify-end   mb-3'>
                </div>
                <Card className="w-full p-3">
                  <Tabs defaultValue={1} className='mb-5'>
                    <TabsList>
                      <TabsTrigger value={1}>Details</TabsTrigger>
                      <TabsTrigger value={2}>Applicants</TabsTrigger>
                    </TabsList>
                    <TabsContent value={1}>
                      <Accordion type="multiple" collapsible="true" className="w-full" defaultValue={["item-1", "item-2"]}>
                        <AccordionItem value="item-1">
                          <AccordionTrigger>
                            <div className="flex items-center w-full">
                              <span className='mr-2'>Duties and Responsibilities</span>
                              <div>{handleUpdateJob(data.jobDuties, "duties")}</div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className='px-5'>
                            <div className='w-full'>
                              {data.jobDuties.map((data, index) => (
                                <ul key={index} className="list-disc ml-4 mb-1">
                                  <li>{data.duties_text}</li>
                                </ul>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        {data.jobEducation.length > 0 || data.jobSkills.length > 0 || data.jobTrainings.length > 0 || data.jobExperience.length > 0 ? (
                          <AccordionItem value="item-2">
                            <AccordionTrigger>Qualifications</AccordionTrigger>
                            <AccordionContent className='px-5'>
                              {data.jobEducation.length > 0 && (
                                <>
                                  <div className='text-sm mb-3 font-bold flex items-center'>
                                    <span className='mr-2'>Educational Background </span>
                                    {handleUpdateJob(data.jobEducation, "education")}
                                  </div>
                                  <div className='w-full ml-3'>
                                    {data.jobEducation.map((data, index) => (
                                      <ul key={index} className="list-disc ml-4 mb-1">
                                        <li>{data.jeduc_text}</li>
                                      </ul>
                                    ))}
                                  </div>
                                </>
                              )}
                              {data.jobSkills.length > 0 && (
                                <>
                                  <div className='text-sm my-3 font-bold flex items-center'>
                                    <span className='mr-2'>Skills</span>
                                    {handleUpdateJob(data.jobSkills, "skills")}
                                  </div>
                                  <div className='w-full ml-3'>
                                    {data.jobSkills.map((data, index) => (
                                      <ul key={index} className="list-disc ml-4 mb-1">
                                        <li>{data.jskills_text}</li>
                                      </ul>
                                    ))}
                                  </div>
                                </>
                              )}
                              {data.jobTrainings.length > 0 && (
                                <>
                                  <div className='text-sm my-3 font-bold flex items-center'>
                                    <span className='mr-2'>Trainings</span>
                                    {handleUpdateJob(data, "trainings")}
                                  </div>
                                  <div className='w-full ml-3'>
                                    {data.jobTrainings.map((data, index) => (
                                      <ul key={index} className="list-disc ml-4 mb-1">
                                        <li>{data.jtrng_text}</li>
                                      </ul>
                                    ))}
                                  </div>
                                </>
                              )}
                              {data.jobExperience.length > 0 && (
                                <>
                                  <div className='text-sm my-3 font-bold flex items-center'>
                                    <span className='mr-2'>Experience</span>
                                    {handleUpdateJob(data, "experience")}
                                  </div>
                                  <div className='w-full ml-3'>
                                    {data.jobExperience.map((data, index) => (
                                      <ul key={index} className="list-disc ml-4 mb-1">
                                        <li>{data.jwork_responsibilities} {`${data.jwork_duration} year${data.jwork_duration > 1 ? "s" : ""} of experience needed`}</li>
                                      </ul>
                                    ))}
                                  </div>
                                </>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ) : null}
                      </Accordion>
                    </TabsContent>
                    <TabsContent value={2}>
                      {data.candidates?.length > 0 ? (
                        <Table className="w-full text-center">
                          <TableCaption className="text-center">Passing percentage: {data.jobPassing[0].passing_percentage ? data.jobPassing[0].passing_percentage : 0}%  </TableCaption>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-center">Index</TableHead>
                              <TableHead className="text-center">Full Name</TableHead>
                              <TableHead className="text-center">Points</TableHead>
                              <TableHead className="text-center">Percentage</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentCandidates?.map((candData, index) => (
                              <TableRow key={index} className="cursor-pointer" onClick={() => handleShowSelectedApplicant(candData.cand_id)}>
                                <TableCell>{index + 1 + (currentPage - 1) * itemsPerPage}</TableCell>
                                <TableCell>{candData.FullName}</TableCell>
                                <TableCell>{candData.points.totalPoints}/{candData.points.maxPoints}</TableCell>
                                <TableCell className={candData.points.percentage >= data.jobPassing[0].passing_percentage ? "text-green-500" : "text-red-500"}>{candData.points.percentage}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) :
                        (
                          <>
                            <Card className="text-center bg-background">
                              <CardDescription className="p-5">
                                No applicants applied yet
                              </CardDescription>
                            </Card>
                          </>
                        )
                      }
                      {data.candidates?.length > itemsPerPage && (
                        <div className='flex justify-end items-end mt-4'>
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={handlePreviousPage}
                                  href="#"
                                  className={"hover:text-primary"}
                                />
                              </PaginationItem>
                              {Array.from({ length: totalPages }, (_, index) => (
                                <PaginationItem key={index}>
                                  <PaginationLink
                                    href="#"
                                    onClick={() => handlePageChange(index + 1)}
                                    className={` ${currentPage === index + 1 ? "text-primary font-extrabold text-lg" : ""}`}
                                  >
                                    {index + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              ))}
                              <PaginationItem>
                                <PaginationNext
                                  onClick={handleNextPage}
                                  href="#"
                                  className={"hover:text-primary"}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </Card>
              </ScrollArea>
            </>)}
        </DialogContent>
      </Dialog>

      {showSelectedApplicant && <SelectedApplicant open={showSelectedApplicant} onHide={handleCloseSelectedApplicant} candId={selectedApplicantId} />}
    </>
  );
}

export default SelectedJob;