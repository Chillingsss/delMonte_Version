import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const formSchema = z.object({
  interviewCategoryName: z.string().min(1, "Interview category name is required"),
});

const UpdateInterviewCategory = ({ data, id, currentName, getData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interviewCategoryName: currentName,
    },
  });

  const onSubmit = async (values) => {
    setIsSubmit(true);
    try {
      if (values.interviewCategoryName === currentName) {
        toast.info('No changes made');
        setIsSubmit(false);
        return;
      }
      const isCategoryExists = Array.isArray(data) && data.some(category =>
        category.interview_categ_name && 
        category.interview_categ_name.trim().toLowerCase() === values.interviewCategoryName.trim().toLowerCase()
      );

      if (isCategoryExists) {
        toast.error('This category already exists');
        setIsSubmit(false);
        return;
      }
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';

      const jsonData = {
        interviewCategoryName: values.interviewCategoryName,
        interviewCategoryId: id,
      }

      const formData = new FormData();
      formData.append("operation", "updateInterviewCategory");
      formData.append("json", JSON.stringify(jsonData));

      const res = await axios.post(url, formData);
      console.log("res.data ni update interview category: ", res.data);
      if (res.data === 1) {
        toast.success('Interview category updated successfully');
        setIsOpen(false);
        getData();
      } else {
        toast.error('Failed to update interview category');
      }
    } catch (error) {
      toast.error('Failed to update interview category');
      console.error('UpdateInterviewCategory.jsx ~ onSubmit ~ error:', error);
    } finally {
      setIsSubmit(false);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        interviewCategoryName: currentName,
      });
    }
  }, [isOpen, currentName, form]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <button><Edit2 className="h-5 w-5 cursor-pointer" /></button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Interview Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Form {...form}>
            <FormField
              control={form.control}
              name="interviewCategoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter interview category name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end mt-4 gap-2">
              <Button type="button" onClick={() => setIsOpen(false)} variant="outline">Cancel</Button>
              <Button type="submit" disabled={isSubmit}>
                {isSubmit ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </Form>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateInterviewCategory
