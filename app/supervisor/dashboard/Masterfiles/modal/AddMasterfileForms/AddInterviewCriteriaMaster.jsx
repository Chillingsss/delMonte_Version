"use client"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import React, { useEffect, useState, useRef } from 'react'
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
import { PlusSquare } from 'lucide-react';

const AddInterviewCriteriaMaster = ({ title, getData, data, addColumn }) => {
  const [interviewCategory, setInterviewCategory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const inputRef = useRef(null);

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
      interviewCriteriaName: "",
    },
  });

  const onSubmit = async (values) => {
    setIsSubmit(true);
    try {
      const criteriaExists = data.some(criteria =>
        criteria.criteria_inter_name.toLowerCase() === values.interviewCriteriaName.toLowerCase() &&
        criteria.interview_categ_name === interviewCategory.find(cat => cat.value === values.interviewCategoryId)?.label
      );

      if (criteriaExists) {
        toast.error("This criteria already exists");
        setIsLoading(false);
        setIsSubmit(false);
        return;
      }

      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append("operation", "addInterviewCriteria");
      formData.append("json", JSON.stringify(values));
      const res = await axios.post(url, formData);

      if (res.data !== 0) {
        toast.success("Interview criteria added successfully");
        form.reset({
          interviewCategoryId: 0,
          interviewCriteriaName: "",
        });
        const categoryName = interviewCategory.find(cat => cat.value === values.interviewCategoryId)?.label || '';
        addColumn({
          interviewCriteriaName: values.interviewCriteriaName,
          interviewCategoryId: categoryName,
          interview_categ_id: values.interviewCategoryId
        }, res.data);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } else {
        toast.error("Failed to add interview criteria");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("AddInterviewCriteria.jsx => onSubmit(): " + error);
    } finally {
      setIsSubmit(false);
    }
  };

  const getInterviewCategories = async () => {
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
      } else {
        setInterviewCategory([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("AddInterviewCriteria.jsx ~ getInterviewCategories ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleClose = () => {
    setIsOpen(false);
    form.reset({
      interviewCategoryId: 0,
      interviewCriteriaName: "",
    });
  }

  useEffect(() => {
    getInterviewCategories();
  }, []);

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) handleClose();
      }}>
        <DialogTrigger>
          <button><PlusSquare className="h-5 w-5 text-primary" /></button>
        </DialogTrigger>
        <DialogContent>
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <DialogHeader className="mb-3">
                <DialogTitle>Add {title}</DialogTitle>
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
                              <Input placeholder="Enter criteria name" {...field} ref={inputRef} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex flex-cols gap-2 justify-end mt-5">
                    <DialogClose asChild>
                      <Button variant="outline" onClick={handleClose}>Close</Button>
                    </DialogClose>
                    <Button type="submit">{isSubmit && <Spinner />} {isSubmit ? 'Submitting...' : 'Submit'}</Button>
                  </div>
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddInterviewCriteriaMaster
