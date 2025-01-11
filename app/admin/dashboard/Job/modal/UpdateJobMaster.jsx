"use client"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import React, { useState } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Edit } from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { retrieveData } from '@/app/utils/storageUtils';
import axios from 'axios';

const UpdateJobMaster = ({ title, description, getSelectedJobs }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const formSchema = z.object({
    jobTitle: z.string().min(1, {
      message: "This field is required",
    }),
    description: z.string().min(1, {
      message: "This field is required",
    })
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: title || "",
      description: description || "",
    },
  });

  const onSubmit = async (values) => {
    if(values.jobTitle === title && values.description === description) {
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jsonData = {
        jobId: retrieveData("jobId"),
        jobTitle: values.jobTitle,
        jobDescription: values.description
      }
      const formData = new FormData();
      formData.append("operation", "updateJobMaster");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res ", res);
      if (res.data === 1) {
        toast.success("Updated successfully");
        getSelectedJobs();
        setIsOpen(false);
      } else {
        toast.error("Failed to update");
        console.log("UpdateJobMaster.jsx => onSubmit(): " + res);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("UpdateJobMaster.jsx => onSubmit(): " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger>
          <Edit className="h-4 w-4 cursor-pointer ml-1" onClick={() => setIsOpen(true)} />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>Update Job Master</DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex justify-center items-center">
                <div className="space-y-2 sm:space-y-3 w-full max-w-8xl">
                  <FormField
                    control={form.control}
                    name="jobTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter job title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            style={{ height: "200px" }}
                            placeholder="Enter description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-cols gap-2 justify-end mt-5">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}> {isLoading && <Spinner className="mr-2" />}
                  Update
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UpdateJobMaster