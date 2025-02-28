import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { Edit2 } from 'lucide-react';

const UpdateCourse = ({ data, id, courseCategoryId, courseTypeId, currentName, getData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [courseCategory, setCourseCategory] = useState([]);
  const [courseType, setCourseType] = useState([]);
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
      courseCategory: courseCategoryId,
      courseType: courseTypeId,
      courseName: currentName,
    },
  });

  const onSubmit = async (values) => {
    setIsSubmit(true);
    console.log("values: ", values);
    try {
      if (values.courseName.toLowerCase() === currentName.toLowerCase() &&
        values.courseCategory === courseCategoryId &&
        values.courseType === courseTypeId) {
        toast.info("No changes were made");
        setIsSubmit(false);
        return;
      }

      const courseExists = data.some(course =>
        course.courses_id !== id &&
        course.courses_name.toLowerCase() === values.courseName.toLowerCase() &&
        course.course_categoryName === courseCategory.find(cat => cat.value === values.courseCategory)?.label &&
        course.crs_type_name === courseType.find(type => type.value === values.courseType)?.label
      );

      if (courseExists) {
        toast.error("This course already exists");
        setIsSubmit(false);
        return;
      }

      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const jsonData = {
        courseCategory: values.courseCategory,
        courseType: values.courseType,
        courseName: values.courseName,
        courseId: id
      }
      const formData = new FormData();
      formData.append("operation", "updateCourse");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data: ", res.data);
      if (res.data === 1) {
        toast.success("Course updated successfully");
        setIsOpen(false);
        getData();
      } else {
        toast.error("Failed to update course");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("UpdateCourse.jsx => onSubmit(): " + error);
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
        setCourseType([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("UpdateCourse.jsx ~ getAddCourseDropdown ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    console.log("data: ", data);
    console.log("courseCategoryId: ", courseCategoryId);
    console.log("courseTypeId: ", courseTypeId);
    if (isOpen) {
      getAddCourseDropdown();
    }
  }, [courseCategoryId, courseTypeId, data, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        courseCategory: courseCategoryId,
        courseType: courseTypeId,
        courseName: currentName,
      });
    }
  }, [isOpen, courseCategoryId, courseTypeId, currentName, form]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Edit2 className='cursor-pointer h-5 w-5' />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Course</DialogTitle>
        </DialogHeader>
        {isLoading ? <Spinner /> : (
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
                  <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                </DialogClose>
                <Button type="submit">{isSubmit && <Spinner />} {isSubmit ? 'Updating...' : 'Update'}</Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UpdateCourse
