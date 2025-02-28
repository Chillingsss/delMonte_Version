"use client"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import React, { useEffect, useState, useRef } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ComboBox from '@/app/my_components/combo-box';
import { Input } from '@/components/ui/input';
import { retrieveData } from '@/app/utils/storageUtils';
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import { PlusSquare } from 'lucide-react';

const AddCourse = ({ title, getData, data, addColumn }) => {
  const [courseCategory, setCourseCategory] = useState([]);
  const [courseType, setCourseType] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const inputRef = useRef(null);

  const formSchema = z.object({
    courseCategory: z.number().min(1, {
      message: "This field is required",
    }),
    courseType: z.number().min(1, {
      message: "This field is required",
    }),
    courseName: z.string().min(1, {
      message: "This field is required",
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseCategory: 0,
      courseType: 0,
      courseName: "",
    },
  });

  const onSubmit = async (values) => {
    setIsSubmit(true);
    try {
      const courseExists = data.some(course =>
        course.courses_name.toLowerCase() === values.courseName.toLowerCase() &&
        course.course_categoryName === courseCategory.find(cat => cat.value === values.courseCategory)?.label &&
        course.crs_type_name === courseType.find(type => type.value === values.courseType)?.label
      );

      if (courseExists) {
        toast.error("This course already exists");
        setIsLoading(false);
        setIsSubmit(false);
        return;
      }

      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append("operation", "addCourse");
      formData.append("json", JSON.stringify(values));
      const res = await axios.post(url, formData);
      console.log("res.data ni onSubmit: ", res.data);
      if (res.data !== 0) {
        toast.success("Course added successfully");
        form.reset({
          courseCategory: 0,
          courseType: 0,
          courseName: "",
        });
        const categoryName = courseCategory.find(cat => cat.value === values.courseCategory)?.label || '';
        const typeName = courseType.find(type => type.value === values.courseType)?.label || '';
        addColumn({
          courseName: values.courseName,
          courseCategory: categoryName,
          courseType: typeName
        }, res.data);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } else {
        toast.error("Failed to add course");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("AddCourse.jsx => onSubmit(): " + error);
    } finally {
      setIsSubmit(false);
    }
  };

  const getAddCourseDropdown = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append('operation', 'getAddCourseDropdown');
      const response = await axios.post(url, formData);
      const res = response.data;
      if (res !== 0) {
        const formattedCourseCategory = res.courseCategory.map(item => ({
          value: item.course_categoryId,
          label: item.course_categoryName
        }));

        const formattedCourseType = res.courseType.map(item => ({
          value: item.crs_type_id,
          label: item.crs_type_name
        }));

        setCourseCategory(formattedCourseCategory);
        setCourseType(formattedCourseType);
      } else {
        setCourseCategory([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("AddCourse.jsx ~ getAddCourseDropdown ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleClose = () => {
    setIsOpen(false);
    form.reset({
      courseCategory: 0,
      courseType: 0,
      courseName: "",
    });
    // getData();
  }

  useEffect(() => {
    getAddCourseDropdown();
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
                        name="courseType"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course Type</FormLabel>
                            <div>
                              <ComboBox
                                list={courseType}
                                subject="course type"
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
                        name="courseCategory"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course Category</FormLabel>
                            <div>
                              <ComboBox
                                list={courseCategory}
                                subject="course category"
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
                        name="courseName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter course name" {...field} ref={inputRef} />
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

export default AddCourse
