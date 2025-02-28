"use client"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import React, { useCallback, useEffect, useState } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ComboBox from '@/app/my_components/combo-box';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import { Pencil } from 'lucide-react';

const UpdateInterviewCriteriaMaster = ({ data, id, currentName, currentCategory, getData }) => {
  const [interviewCategory, setInterviewCategory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);

  const formSchema = z.object({
    interviewCategoryId: z.number().min(1, {
      message: "This field is required",
    }),
    interviewCriteriaName: z.string().min(1, {
      message: "This field is required",
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interviewCategoryId: 0,
      interviewCriteriaName: currentName,
    },
  });

  const onSubmit = async (values) => {
    setIsSubmit(true);
    try {
      const criteriaExists = data.some(criteria =>
        criteria.criteria_inter_name.toLowerCase() === values.interviewCriteriaName.toLowerCase() &&
        criteria.interview_categ_name === interviewCategory.find(cat => cat.value === values.interviewCategoryId)?.label &&
        criteria.criteria_inter_id !== id
      );

      if (criteriaExists) {
        toast.error("This criteria already exists");
        setIsSubmit(false);
        return;
      }

      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      const jsonData = {
        ...values,
        criteriaId: id
      };
      console.log("jsonData ni onSubmit: ", jsonData);
      formData.append("operation", "updateInterviewCriteria");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni onSubmit: ", res.data);
      if (res.data === 1) {
        toast.success("Interview criteria updated successfully");
        getData();
        setIsOpen(false);
      } else {
        toast.error("Failed to update interview criteria");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("UpdateInterviewCriteriaMaster.jsx => onSubmit(): " + error);
    } finally {
      setIsSubmit(false);
    }
  };

  const getInterviewCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append('operation', 'getInterviewCategory');
      const response = await axios.post(url, formData);
      const res = response.data;
      if (res !== 0) {
        const formattedCategories = res.map(item => ({
          value: item.interview_categ_id,
          label: item.interview_categ_name
        }));
        setInterviewCategory(formattedCategories);
        
        // Find the current criteria in data
        const currentCriteria = data.find(criteria => criteria.criteria_inter_id === id);
        if (currentCriteria) {
          // Set the initial category value based on interview_categ_id
          form.setValue('interviewCategoryId', currentCriteria.interview_categ_id);
        }
      } else {
        setInterviewCategory([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("UpdateInterviewCriteriaMaster.jsx ~ getInterviewCategories ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [data, form, id]);

  useEffect(() => {
    if (isOpen) {
      getInterviewCategories();
      form.setValue('interviewCriteriaName', currentName);
    }
  }, [currentName, form, getInterviewCategories, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Pencil className="h-5 w-5 cursor-pointer" />
      </DialogTrigger>
      <DialogContent>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <DialogHeader className="mb-3">
              <DialogTitle>Update Interview Criteria</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex justify-center items-center">
                  <div className="space-y-2 sm:space-y-3 w-full max-w-8xl">
                    <FormField
                      name="interviewCategoryId"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interview Category</FormLabel>
                          <div>
                            <ComboBox
                              list={interviewCategory}
                              subject="interview category"
                              value={field.value}
                              onChange={field.onChange}
                              styles={"bg-background"}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="interviewCriteriaName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Criteria Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter criteria name" {...field} />
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
                  <Button type="submit">{isSubmit && <Spinner />} {isSubmit ? 'Updating...' : 'Update'}</Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UpdateInterviewCriteriaMaster
