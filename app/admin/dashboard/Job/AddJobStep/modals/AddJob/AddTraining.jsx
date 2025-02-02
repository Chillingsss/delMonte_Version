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
import AddTrainingMaster from "@/app/admin/dashboard/Masterfiles/modal/AddMasterfileForms/AddTrainingMaster";

function AddTraining({
  open,
  onHide,
  handleAddList,
  handleAddData,
  addTotalPoints,
  isUpdate = false,
}) {
  const [openState, setOpenState] = useState(false);
  const [trainingData, setTrainingData] = useState(
    JSON.parse(retrieveData("trainingList"))
  );

  const formSchema = z.object({
    training: z.number().min(1, {
      message: "This field is required",
    }),
    // jobTraining: z.string().min(1, {
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
      training: 0,
      // jobTraining: "",
      points: "",
    },
  });

  const handleOthers = () => {
    setOpenState(true);
  };

  const handleCloseState = () => {
    setOpenState(false);
  };

  const addColumn = (values, id) => {
    storeDataInSession(
      "trainingList",
      JSON.stringify([
        ...trainingData,
        { value: id, label: values.trainingName },
      ])
    );
    setTrainingData([
      ...trainingData,
      { value: id, label: values.trainingName },
    ]);
    if (!isUpdate) {
      handleAddData(values, id);
    }
  };

  const onSubmit = (values) => {
    try {
      const selectedTraining = JSON.parse(retrieveData("jobTraining")) || [];
      let isValid = true;
      selectedTraining.forEach((element) => {
        if (element.training === values.training) {
          toast.error("You already have this training");
          isValid = false;
        }
      });
      if (isValid) {
        if (!isUpdate) {
          if (addTotalPoints(values.points) === false) return;
        }
        const jobTotalPoints = Number(getDataFromSession("jobTotalPoints"));
        const jobPointSum = jobTotalPoints + Number(values.points);
        if (jobPointSum > 100) {
          toast.error("Total points must not exceed 100");
          return;
        }
        storeDataInSession("jobTotalPoints", jobPointSum);
        // onHide(values);
        handleAddList(values);
        form.reset();
      }
    } catch (error) {
      toast.error("Network error");
      console.log("AddTraining.jsx => onSubmit(): " + error);
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
            <DialogTitle>Add Training</DialogTitle>
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
                    name="training"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Training</FormLabel>
                        <div>
                          <ComboBox
                            list={trainingData}
                            subject="training"
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
                    name="jobTraining"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Training Description</FormLabel>
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
      <AddTrainingMaster
        title={"training masterfile"}
        addColumn={addColumn}
        openState={openState}
        closeState={handleCloseState}
      />
    </>
  );
}

export default AddTraining;
