"use client";
import { formatDate } from "@/app/signup/page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

function SelectedApplicant({ open, onHide, candId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [isMedicalChecked, setIsMedicalChecked] = useState(false);

  const getCandidateProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const jsonData = {
        cand_id: candId,
      };
      const formData = new FormData();
      formData.append("operation", "getCandidateProfile");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("RES DATA ni getCandidateProfile: ", res.data);
      if (res.data !== 0) {
        setData(res.data);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("SelectedApplicant.jsx => getCandidateProfile(): " + error);
    } finally {
      setIsLoading(false);
    }
  }, [candId]);
  const handleHide = () => {
    onHide();
  };

  useEffect(() => {
    if (open) {
      getCandidateProfile();
    }
  }, [getCandidateProfile, open]);

  return (
    <>
      <Sheet open={open} onOpenChange={onHide}>
        <SheetContent side={"bottom"} className="h-full md:h-4/5">
          <ScrollArea className="h-full">
            <SheetHeader className="text-start">
              <SheetTitle>Applicant Profile</SheetTitle>
              <SheetDescription>
                View selected applicant details here.
              </SheetDescription>
            </SheetHeader>
            <Separator className="my-5 w-full" />
            {isLoading ? (
              <Spinner />
            ) : (
              <div className="md:grid grid-cols-3 gap-4 space-y-4">
                <Card className="overflow-hidden">
                  <CardHeader className="flex justify-center items-center">
                    <Avatar className="w-32 h-32">
                      <AvatarImage
                        src={
                          data.candidateInformation?.cand_profPic
                            ? `${process.env.NEXT_PUBLIC_API_URL}uploads/${data.candidateInformation.cand_profPic}`
                            : process.env.NEXT_PUBLIC_API_URL +
                              "images/emptyImage.jpg"
                        }
                        alt="avatar"
                      />
                      <AvatarFallback>
                        <Spinner />
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle>
                      {data.candidateInformation
                        ? `${data.candidateInformation.cand_firstname} ${data.candidateInformation.cand_lastname}`
                        : "No applicant data available"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.skills && data.skills.length > 0 ? (
                      <>
                        <p className="font-bold">Skill:</p>
                        {data.skills.map((skill, index) => (
                          <Badge className={"mr-2 my-1"} key={index}>
                            {skill.perS_name}
                          </Badge>
                        ))}
                      </>
                    ) : (
                      <p className="text-center text-gray-500">
                        No skills added
                      </p>
                    )}
                  </CardContent>
                </Card>

                <div className="sm:grid col-span-2 space-y-4">
                  <Card className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>Basic Information:</CardTitle>
                    </CardHeader>
                    <ScrollArea className="h-48 w-full">
                      <CardContent className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 text-start">
                        <div>
                          <p className="font-bold">Age:</p>
                          {data.candidateInformation
                            ? `${
                                new Date().getFullYear() -
                                new Date(
                                  data.candidateInformation.cand_dateofBirth
                                ).getFullYear()
                              } years old`
                            : "N/A"}
                          <Separator className="mt-3 md:hidden" />
                        </div>

                        <div>
                          <p className="font-bold">Email:</p>
                          {data.candidateInformation
                            ? data.candidateInformation.cand_email
                            : "N/A"}
                          <Separator className="mt-3 md:hidden" />
                        </div>

                        <div>
                          <p className="font-bold">Contact number:</p>
                          {data.candidateInformation
                            ? data.candidateInformation.cand_contactNo
                            : "N/A"}
                          <Separator className="mt-3 md:hidden" />
                        </div>

                        <div>
                          <p className="font-bold">Gender:</p>
                          {data.candidateInformation
                            ? data.candidateInformation.cand_sex
                            : "N/A"}
                          <Separator className="mt-3 md:hidden" />
                        </div>

                        <div>
                          <p className="font-bold">Present address:</p>
                          {data.candidateInformation
                            ? data.candidateInformation.cand_presentAddress
                            : "N/A"}
                          <Separator className="mt-3 md:hidden" />
                        </div>

                        <div>
                          <p className="font-bold">Permanent address:</p>
                          {data.candidateInformation
                            ? data.candidateInformation.cand_permanentAddress
                            : "N/A"}
                          <Separator className="mt-3 md:hidden" />
                        </div>
                      </CardContent>
                    </ScrollArea>
                  </Card>

                  <Card className="overflow-hidden">
                    <CardContent>
                      <Tabs defaultValue={1} className="my-3">
                        <TabsList>
                          <TabsTrigger value={1}>Education</TabsTrigger>
                          <TabsTrigger value={2}>Experience</TabsTrigger>
                          <TabsTrigger value={3}>Trainings</TabsTrigger>
                        </TabsList>
                        <TabsContent value={1}>
                          {data.educationalBackground &&
                          data.educationalBackground.length > 0 ? (
                            <>
                              <div className="w-full ml-3 hidden lg:block">
                                <Table className="w-full">
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>#</TableHead>
                                      <TableHead>Institution</TableHead>
                                      <TableHead>Course</TableHead>
                                      <TableHead>Course type</TableHead>
                                      <TableHead>Course category</TableHead>
                                      <TableHead>Graduation date</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {data.educationalBackground.map(
                                      (data, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{index + 1}</TableCell>
                                          <TableCell>
                                            {data.institution_name}
                                          </TableCell>
                                          <TableCell>
                                            {data.courses_name}
                                          </TableCell>
                                          <TableCell>
                                            {data.crs_type_name}
                                          </TableCell>
                                          <TableCell>
                                            {data.course_categoryName}
                                          </TableCell>
                                          <TableCell>
                                            {formatDate(data.educ_dategraduate)}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                              <div className="block lg:hidden">
                                {data.educationalBackground.map(
                                  (data, index) => (
                                    <div
                                      key={index}
                                      className="relative w-full p-4 rounded-md shadow"
                                    >
                                      <div className="mt-2 text-sm">
                                        <div className="mb-1 text-xl break-words">
                                          {data.institution_name}
                                        </div>
                                        {data.courses_name}
                                        <div className="text-gray-500">
                                          Date of Graduation:{" "}
                                          {formatDate(data.educ_dategraduate)}
                                        </div>
                                      </div>
                                      <Separator className="mt-3" />
                                    </div>
                                  )
                                )}
                              </div>
                            </>
                          ) : (
                            <p className="text-center text-gray-500">
                              No education added
                            </p>
                          )}
                        </TabsContent>
                        <TabsContent value={2}>
                          {data.employmentHistory &&
                          data.employmentHistory.length > 0 ? (
                            <>
                              <div className="w-full ml-3 hidden lg:block">
                                <Table className="w-full">
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>#</TableHead>
                                      <TableHead>Company name</TableHead>
                                      <TableHead>Position</TableHead>
                                      <TableHead>Start date</TableHead>
                                      <TableHead>End date</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {data.employmentHistory.map(
                                      (data, index) => (
                                        <TableRow key={index}>
                                          <TableCell>{index + 1}</TableCell>
                                          <TableCell>
                                            {data.empH_companyName}
                                          </TableCell>
                                          <TableCell>
                                            {data.empH_positionName}
                                          </TableCell>
                                          <TableCell>
                                            {formatDate(data.empH_startdate)}
                                          </TableCell>
                                          <TableCell>
                                            {formatDate(data.empH_enddate)}
                                          </TableCell>
                                        </TableRow>
                                      )
                                    )}
                                  </TableBody>
                                </Table>
                              </div>
                              <div className="block lg:hidden">
                                {data.employmentHistory.map((data, index) => (
                                  <div
                                    key={index}
                                    className="relative w-full p-4 rounded-md shadow"
                                  >
                                    <div className="mt-2 text-sm">
                                      <div className="mb-1 text-xl break-words">
                                        {data.empH_positionName}
                                      </div>
                                      {data.empH_companyName}
                                      <div className="text-gray-500">
                                        {formatDate(data.empH_startdate)} -{" "}
                                        {formatDate(data.empH_enddate)}
                                      </div>
                                    </div>
                                    <Separator className="mt-3" />
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <p className="text-center text-gray-500">
                              No education added
                            </p>
                          )}
                        </TabsContent>
                        <TabsContent value={3}>
                          {data.training && data.training.length > 0 ? (
                            <>
                              <div className="w-full ml-3 hidden lg:block">
                                <Table className="w-full text-center">
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="text-center">
                                        #
                                      </TableHead>
                                      <TableHead className="text-center">
                                        Training
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {data.training.map((data, index) => (
                                      <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{data.perT_name}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                              <div className="block lg:hidden">
                                {data.training.map((data, index) => (
                                  <div
                                    key={index}
                                    className="relative w-full p-4 rounded-md shadow"
                                  >
                                    <div className="mt-2 text-sm">
                                      <div className="mb-1 text-xl break-words">
                                        {data.perT_name}
                                      </div>
                                    </div>
                                    <Separator className="mt-3" />
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <p className="text-center text-gray-500">
                              No education added
                            </p>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
export default SelectedApplicant;
