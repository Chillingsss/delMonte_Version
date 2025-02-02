"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ComboBox from "@/app/my_components/combo-box";
import { Input } from "@/components/ui/input";
import {
  getDataFromSession,
  retrieveData,
  storeData,
  storeDataInSession,
} from "@/app/utils/storageUtils";
import AddCourseMaster from "@/app/admin/dashboard/Masterfiles/modal/AddMasterfileForms/AddCourseMaster";
import AddCourseCategoryMaster from "@/app/admin/dashboard/Masterfiles/modal/AddMasterfileForms/AddCourseCategoryMaster";

function AddEducation({
  open,
  onHide,
  handleAddList,
  isUpdate,
  handleAddData,
  addTotalPoints = false,
}) {
  const [courseCategory, setCourseCategory] = useState(
    JSON.parse(getDataFromSession("courseCategoryList"))
  );
  const [openState, setOpenState] = useState(false);
  const formSchema = z.object({
    courseCategory: z.number().min(1, {
      message: "This field is required",
    }),
    // jobEducation: z.string().min(1, {
    //   message: "This field is required",
    // }),
    points: z
      .string()
      .min(1, {
        message: "This field is required",
      })
      .refine((value) => !isNaN(Number(value)), {
        message: "Points must be a number",
      }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      points: "",
      courseCategory: 0,
      // jobEducation: "",
    },
  });

  const handleOthers = () => {
    setOpenState(true);
  };

  const handleCloseState = () => {
    setOpenState(false);
  };

  const addColumn = (values, id) => {
    console.log("values ni addColumn: ", values);
    storeDataInSession(
      "courseCategoryList",
      JSON.stringify([
        ...courseCategory,
        { value: id, label: values.courseCategoryName },
      ])
    );
    setCourseCategory([
      ...courseCategory,
      { value: id, label: values.courseCategoryName },
    ]);
    if (!isUpdate) {
      handleAddData(values, id);
    }
  };

  const onSubmit = (values) => {
    try {
      const selectedEducation =
        JSON.parse(getDataFromSession("jobEducation")) || [];
      let isValid = true;
      selectedEducation.forEach((element) => {
        if (element.courseCategory === values.courseCategory) {
          toast.error("You already have this education");
          isValid = false;
        }
      });
      if (isValid) {
        if (isUpdate) {
          const jobTotalPoints = Number(getDataFromSession("jobTotalPoints"));
          const jobPointSum = jobTotalPoints + Number(values.points);
          if (jobPointSum > 100) {
            toast.error("Total points must not exceed 100");
            return;
          }
          storeDataInSession("jobTotalPoints", jobPointSum);
          onHide(values);
        } else {
          if (addTotalPoints(values.points) === false) return;
          handleAddList(values);
        }
        form.reset();
      }
    } catch (error) {
      toast.error("Network error");
      console.log("AddEducation.jsx => onSubmit(): " + error);
    }
  };

  const handleOnHide = () => {
    onHide(0);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOnHide}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Education</DialogTitle>
            {isUpdate && (
              <DialogDescription>
                Total points: {getDataFromSession("jobTotalPoints")}
              </DialogDescription>
            )}
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex justify-center items-center">
                <div className="space-y-2 sm:space-y-3 w-full max-w-8xl">
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
                            others={handleOthers}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* <FormField
                    control={form.control}
                    name="jobEducation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Education Description</FormLabel>
                        <FormControl>
                          <Textarea style={{ height: "200px" }} placeholder="Enter description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                  <FormField
                    control={form.control}
                    name="points"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter points" {...field} />
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
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AddCourseCategoryMaster
        title={"course category masterfile"}
        addColumn={addColumn}
        openState={openState}
        closeState={handleCloseState}
      />
    </>
  );
}

export default AddEducation;
