import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Edit2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import Spinner from '@/components/ui/spinner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

const formSchema = z.object({
  name: z.string().min(1, { message: "Exam name is required" }),
  duration: z.number().min(1, { message: "Duration must be greater than 0" }),
  passingPercent: z.number().min(1, { message: "Passing percentage must be greater than 0" }),
})

const UpdateExamMaster = ({ examMasterData, getExamDetails, passingPercent, isGeneralExam = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      duration: 0,
      passingPercent: 0,
    },
  })

  useEffect(() => {
    if (examMasterData) {
      form.reset({
        name: examMasterData.exam_name,
        duration: examMasterData.exam_duration,
        passingPercent: passingPercent,
      })
    }
  }, [examMasterData, form, passingPercent])

  const handleUpdateExamMaster = async (values) => {
    if (values.name === examMasterData.exam_name && values.duration === examMasterData.exam_duration && values.passingPercent === examMasterData.passing_percent) {
      // setIsOpen(false);
      toast.info("No changes made");
      return;
    }

    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      formData.append("operation", "updateExamMaster");

      const examData = {
        examId: examMasterData.exam_id,
        name: values.name,
        duration: values.duration,
        passingPercent: values.passingPercent,
        jobId: examMasterData.exam_jobMId
      };

      console.log("examData: ", examData);

      formData.append("json", JSON.stringify(examData));

      const response = await axios.post(url, formData);
      console.log("response: ", response);
      if (response.data === 1) {
        toast.success("Exam updated successfully");
        setIsOpen(false);
        getExamDetails();
      } else {
        toast.error("Failed to update exam");
      }
    } catch (error) {
      console.error("Error updating exam:", error);
      toast.error("An error occurred while updating the exam");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div>
          <button><Edit2 className='cursor-pointer w-5 h-5 md:mr-2' /></button>
        </div>
      </DialogTrigger>
      <DialogContent className='overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Update exam master</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdateExamMaster)} className='flex flex-col gap-2'>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Exam Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isGeneralExam && (
              <>
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="passingPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passing Percentage</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <div className='flex justify-end gap-2'>
              <Button type="button" onClick={() => setIsOpen(false)} variant="outline">Close</Button>
              <Button type="submit" disabled={isLoading}>{isLoading && <Spinner />} {isLoading ? "Updating..." : "Update Exam"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateExamMaster
