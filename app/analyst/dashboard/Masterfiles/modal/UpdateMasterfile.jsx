import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2 } from 'lucide-react';
import React, { useState } from 'react'
import UpdateCourseCategory from './UpdateMasterfileForms/UpdateCourseCategory';

const UpdateMasterfile = ({ title, subject, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const updateView = () => {
    switch (subject) {
      case "courseCategory":
        return <UpdateCourseCategory />
      default:
        return null;
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger>
          <button><Edit2 className="h-5 w-5 cursor-pointer" /></button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update {title}</DialogTitle>
            {updateView()}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default UpdateMasterfile