"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import axios from "axios";
import { PlusSquare } from "lucide-react";
import {
  getDataFromSession,
  retrieveData,
  storeData,
  storeDataInSession,
} from "@/app/utils/storageUtils";

const formSchema = z.object({
  courseCategoryName: z.string().min(1, "Course category name is required"),
});

const AddCourseCategoryMaster = ({
  title,
  getData,
  data,
  addColumn,
  openState,
  closeState,
}) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseCategoryName: "",
    },
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const onSubmit = async (values) => {
    console.log("values ni course category: ", values);
    setIsSubmit(true);
    try {
      console.log("data ni course category: ", data);
      console.log("values ni courseCategoryName: ", values.courseCategoryName);
      console.log("data === null: ", data === undefined);
      const courseCategoryList = getDataFromSession("courseCategoryList") || [];
      let categoryExists = false;
      if (data === undefined || data === null) {
        console.log("courseCategoryList: ", courseCategoryList);
        categoryExists = courseCategoryList.some(
          (category) =>
            category.label.trim().toLowerCase() ===
            values.courseCategoryName.trim().toLowerCase()
        );
      } else {
        categoryExists =
          Array.isArray(data) &&
          data.some(
            (category) =>
              category.course_categoryName &&
              category.course_categoryName.trim().toLowerCase() ===
              values.courseCategoryName.trim().toLowerCase()
          );
      }

      if (categoryExists) {
        toast.error("This course category already exists");
        return;
      }

      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      formData.append("operation", "addCourseCategory");
      formData.append("json", JSON.stringify(values));

      const res = await axios.post(url, formData);
      console.log("res.data ni course category: ", res.data);
      if (res.data !== 0) {
        if (data === undefined || data === null) {
          storeDataInSession(
            "courseCategoryList",
            JSON.stringify([
              ...courseCategoryList,
              { value: res.data, label: values.courseCategoryName },
            ])
          );
        }
        toast.success("Course category added successfully");
        addColumn(values, res.data);
        form.reset();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } else {
        toast.error("Failed to add course category");
      }
    } catch (error) {
      toast.error("Network error");
      console.error("AddCourseCategoryMaster.jsx ~ onSubmit ~ error:", error);
    } finally {
      setIsSubmit(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    form.reset();
  };

  return (
    <div>
      <Dialog
        open={openState ? openState : isOpen}
        onOpenChange={(open) => {
          closeState ? closeState() : (setIsOpen(open), !open && handleClose());
        }}
      >
        {openState === undefined && (
          <DialogTrigger asChild>
            <button>
              <PlusSquare className="h-5 w-5 text-primary" />
            </button>
          </DialogTrigger>
        )}

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
                        control={form.control}
                        name="courseCategoryName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course Category Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter course category name"
                                {...field}
                                ref={inputRef}
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
                      <Button variant="outline" onClick={handleClose}>
                        Close
                      </Button>
                    </DialogClose>
                    <Button type="submit">
                      {isSubmit && <Spinner />}{" "}
                      {isSubmit ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddCourseCategoryMaster;
