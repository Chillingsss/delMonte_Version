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
  courseCategoryName: z.string().min(1, "Course category name is required"),
});

const UpdateCourseCategory = ({ data, id, currentName, getData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseCategoryName: currentName,
    },
  });

  const onSubmit = async (values) => {
    console.log("values ni update course category: ", values);
    console.log("data ni update course category: ", data);
    setIsSubmit(true);
    try {
      if (values.courseCategoryName === currentName) {
        toast.info('No changes made');
        setIsSubmit(false);
        return;
      }
      const isCategoryExists = data.some(category =>
        category.course_categoryName.trim().toLowerCase() === values.courseCategoryName.trim().toLowerCase()
      );

      if (isCategoryExists) {
        toast.error('This category already exists');
        setIsSubmit(false);
        return;
      }
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';

      const jsonData = {
        courseCategoryName: values.courseCategoryName,
        courseCategoryId: id,
      }

      const formData = new FormData();
      formData.append("operation", "updateCourseCategory");
      formData.append("json", JSON.stringify(jsonData));

      const res = await axios.post(url, formData);
      console.log("res.data ni update course category: ", res.data);
      if (res.data === 1) {
        toast.success('Course category updated successfully');
        setIsOpen(false);
        getData();
      } else {
        toast.error('Failed to update course category');
      }
    } catch (error) {
      toast.error('Failed to update course category');
      console.error('UpdateCourseCategory.jsx ~ onSubmit ~ error:', error);
    } finally {
      setIsSubmit(false);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        courseCategoryName: currentName,
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
          <DialogTitle>Update Course Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Form {...form}>
            <FormField
              control={form.control}
              name="courseCategoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter course category name"
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

export default UpdateCourseCategory