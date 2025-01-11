import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription } from '@/components/ui/card'
import ShowAlert from '@/components/ui/show-alert'
import { PlusIcon, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { formatDate } from './page'
import AddCourseModal from './modals/AddCourseModal'
import { Separator } from '@radix-ui/react-dropdown-menu'
import { retrieveData, storeData } from '../utils/storageUtils'

function EducationalBackground({ courseList, graduateCourseList, institutionList }) {
  const [educationDatas, setEducationDatas] = useState([]);
  const [indexToRemove, setIndexToRemove] = useState(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };
  const handleCloseAlert = (status) => {
    if (status === 1) {
      const filteredEducationDatas = educationDatas.filter((_, index) => index !== indexToRemove);
      setEducationDatas(filteredEducationDatas);
      storeData("educationalBackground", JSON.stringify(filteredEducationDatas));
    }
    setShowAlert(false);
  };

  const [showCourseModal, setShowCourseModal] = useState(false);

  const handleOpenCourseModal = () => {
    setShowCourseModal(true);
  }

  const handleCloseCourseModal = (status) => {
    if (status !== 0) {
      setEducationDatas([...educationDatas, status]);
      storeData("educationalBackground", JSON.stringify([...educationDatas, status]));
    }
    setShowCourseModal(false);
  };

  const handleRemoveList = (indexToRemove) => {
    setIndexToRemove(indexToRemove);
    handleShowAlert("This action cannot be undone. It will permanently delete the item and remove it from your list");
  };

  useEffect(() => {
    if (retrieveData("educationalBackground") !== null || retrieveData("educationalBackground") !== "[]") {
      setEducationDatas(JSON.parse(retrieveData("educationalBackground")));
    }
  }, []);


  return (
    <div>
      <Button onClick={handleOpenCourseModal} className="bg-[#f5f5f5] mt-3 text-[#0e4028]">
        <PlusIcon className="h-4 w-4 mr-1" />
        Add Course
      </Button>
      <Alert className="w-full bg-[#0a2e1c] mt-3">
        {educationDatas.length > 0 ? (
          <CardContent>
            {educationDatas.map((data, index) => (
              <Alert key={index} className="relative w-full bg-[#0e5a35] mt-3">
                <button
                  className="absolute top-2 right-2 text-white"
                  onClick={() => handleRemoveList(index)}
                >
                  <X className="h-4 w-4" />
                </button>
                <AlertTitle className="text-md ">
                  <div className='mb-3'>Institution: {institutionList.find((item) => item.value === data.institution)?.label}</div>
                  <Separator className="my-2 border-t " />
                  <div className='mb-3'>Course: {courseList.find((item) => item.value === data.course)?.label}</div>
                  <div className="mb-3">Date Graduated: {formatDate(data.courseDateGraduated)}</div>
                </AlertTitle>
              </Alert>
            ))}
          </CardContent>
        ) : (
          <CardDescription className="text-center">
            No course added yet
          </CardDescription>
        )}
      </Alert>
      <AddCourseModal open={showCourseModal} onHide={handleCloseCourseModal} courseList={courseList} graduateCourseList={graduateCourseList} institutionList={institutionList} />
      <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} />
    </div>
  )
}

export default EducationalBackground
