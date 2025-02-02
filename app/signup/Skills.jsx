import { Alert, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CardContent, CardDescription } from '@/components/ui/card'
import ShowAlert from '@/components/ui/show-alert'
import { PlusIcon, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import AddSkillModal from './modals/AddSkillModal'
import { getDataFromSession, retrieveData, storeData, storeDataInSession } from '../utils/storageUtils'

function Skills({ skillList }) {
  const [skillData, setSkillData] = useState([]);
  const [indexToRemove, setIndexToRemove] = useState(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };
  const handleCloseAlert = (status) => {
    if (status === 1) {
      const filteredSkillData = skillData.filter((_, index) => index !== indexToRemove);
      setSkillData(filteredSkillData);
      storeDataInSession("skills", JSON.stringify(filteredSkillData));
    }
    setShowAlert(false);
  };

  const [showSkillsModal, setShowSkillsModal] = useState(false);

  const handleOpenSkillsModal = () => {
    setShowSkillsModal(true);
  }

  const handleCloseSkillsModal = (status) => {
    if (status !== 0) {
      setSkillData([...skillData, status]);
      storeData("skills", JSON.stringify([...skillData, status]));
    }
    setShowSkillsModal(false);
  };

  const handleRemoveList = (indexToRemove) => {
    setIndexToRemove(indexToRemove);
    handleShowAlert("This action cannot be undone. It will permanently delete the item and remove it from your list");
  };

  useEffect(() => {
    if (getDataFromSession("skills") !== null || getDataFromSession("skills") !== "[]") {
      setSkillData(JSON.parse(getDataFromSession("skills")));
    }
  }, []);


  return (
    <div>
      <Button onClick={handleOpenSkillsModal} className="bg-[#f5f5f5] mt-3 text-[#0e4028]">
        <PlusIcon className="h-4 w-4 mr-1" />
        Add Skills
      </Button>
      <Alert className="w-full bg-[#0a2e1c] mt-3">
        {skillData && skillData.length > 0 ? (
          <CardContent>
            {skillData.map((data, index) => (
              <Alert key={index} className="relative w-full bg-[#0e5a35] mt-3">
                <button
                  className="absolute top-2 right-2 text-white"
                  onClick={() => handleRemoveList(index)}
                >
                  <X className="h-4 w-4" />
                </button>
                <AlertTitle className="text-md ">
                  <div className='mb-3'>{skillList.find((item) => item.value === data.skills)?.label}</div>
                </AlertTitle>
              </Alert>
            ))}
          </CardContent>
        ) : (
          <CardDescription className="text-center">
            No skills added yet
          </CardDescription>
        )}
      </Alert>
      <AddSkillModal open={showSkillsModal} onHide={handleCloseSkillsModal} skillList={skillList} />
      <ShowAlert open={showAlert} onHide={handleCloseAlert} message={alertMessage} />
    </div>
  )
}

export default Skills
