"use client";
import { getDataFromSession, retrieveData, storeData, storeDataInSession } from '@/app/utils/storageUtils'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription } from '@/components/ui/card'
import ShowAlert from '@/components/ui/show-alert'
import { PlusIcon, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area';
import AddKnowledge from '../modal/AddJob/AddKnowledge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';


function AddJobKnowledge({ previousStep, nextStep, knowledgeList }) {
  const [datas, setDatas] = useState([]);
  const [indexToRemove, setIndexToRemove] = useState(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };
  const handleCloseAlert = (status) => {
    if (status === 1) {
      const filteredDatas = datas.filter((_, index) => index !== indexToRemove);
      setDatas(filteredDatas);
      storeDataInSession("jobKnowledge", JSON.stringify(filteredDatas));
    }
    setShowAlert(false);
  };

  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  }

  const handleCloseModal = (status) => {
    if (status !== 0) {
      console.log("status: ", status);
      setDatas([...datas, status]);
      storeDataInSession("jobKnowledge", JSON.stringify([...datas, status]));
    } else {
      setDatas(datas);
    }
    setShowModal(false);
  };

  const handleRemoveList = (indexToRemove) => {
    setIndexToRemove(indexToRemove);
    handleShowAlert("This action cannot be undone. It will permanently delete the item and remove it from your list");
  };

  const handleNextStep = () => {
    // if (retrieveData("jobKnowledge") === null || retrieveData("jobKnowledge") === "[]") {
    //   toast.error("Please add knowledge and compliance first");
    //   return;
    // }
    nextStep(45);
  }


  useEffect(() => {
    if (getDataFromSession("jobKnowledge") !== null || getDataFromSession("jobKnowledge") !== "[]") {
      setDatas(getDataFromSession("jobKnowledge"));
    } else {
      setDatas([]);
    }
    console.log(getDataFromSession("jobKnowledge"));
  }, []);

  return (
    <>
      <div>
        <div className='flex justify-end gap-2 mb-3'>
          <Button variant="secondary" onClick={() => previousStep(15)} className="mt-3">Previous</Button>
          <Button onClick={handleNextStep} className="mt-3">Next</Button>
        </div>
        <Button onClick={handleOpenModal}>
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Knowledge and Compliance
        </Button>
        <Alert className="w-full mt-3">
          {datas && datas.length > 0 ? (
            <>
              <div className="hidden md:block">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/12">Index</TableHead>
                      <TableHead className="w-1/12 ">Knowledge</TableHead>
                      <TableHead className="w-10/12">Description</TableHead>
                      <TableHead className="w-1/12 text-center">Points</TableHead>
                      <TableHead className="w-1/12 text-center"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datas.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell className="w-1/12">{index + 1}</TableCell>
                        <TableCell className="w-1/12">
                          {knowledgeList.find((item) => item.value === data.knowledgeId)?.label}
                        </TableCell>
                        <TableCell className="w-10/12 whitespace-normal">
                          {data.jobKnowledge}
                        </TableCell>
                        <TableCell className="w-1/12 text-center">{data.points}</TableCell>
                        <TableCell className="w-1/12 text-center">
                          <button
                            className="h-4 w-4"
                            onClick={() => handleRemoveList(index)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="block md:hidden">
                {datas.map((data, index) => (
                  <div key={index} className="relative w-full p-4 rounded-md shadow">
                    <div className="flex justify-end">
                      <button
                        className="h-4 w-4"
                        onClick={() => handleRemoveList(index)}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-2 text-sm">
                      <div className='mb-1 text-xl break-words'>
                        {knowledgeList.find((item) => item.value === data.knowledgeId)?.label}
                      </div>
                      {data.jobKnowledge}
                    </div>
                    <div className='text-end'>
                      <Badge className="mt-2 text-xs font-bold">
                        Points: {data.points}
                      </Badge>
                    </div>
                    <Separator className="mt-3" />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <CardDescription className="text-center">
              No duties added yet
            </CardDescription>
          )}
        </Alert>
        <AddKnowledge open={showModal} onHide={handleCloseModal} knowledgeList={knowledgeList} />
        <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} />
      </div>
    </>
  )
}

export default AddJobKnowledge
