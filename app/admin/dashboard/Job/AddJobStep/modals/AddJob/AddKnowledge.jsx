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
import { Input } from "@/components/ui/input";
import ComboBox from "@/app/my_components/combo-box";
import {
  getDataFromSession,
  retrieveData,
  storeData,
  storeDataInSession,
} from "@/app/utils/storageUtils";
import AddKnowledgeMaster from "@/app/admin/dashboard/Masterfiles/modal/AddMasterfileForms/AddKnowledgeMaster";

function AddKnowledge({
  open,
  onHide,
  handleAddList,
  handleAddData,
  addTotalPoints,
  isUpdate = false,
}) {
  const [openState, setOpenState] = useState(false);
  const [knowledgeData, setKnowledgeData] = useState(
    JSON.parse(getDataFromSession("knowledgeList"))
  );
  const formSchema = z.object({
    knowledgeId: z.number().min(1, {
      message: "This field is required",
    }),
    // jobKnowledge: z.string().min(1, {
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
      knowledgeId: 0,
      // jobKnowledge: "",
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
    console.log("values ni addColumn: ", values);
    storeDataInSession(
      "knowledgeList",
      JSON.stringify([
        ...knowledgeData,
        { value: id, label: values.knowledgeName },
      ])
    );
    setKnowledgeData([
      ...knowledgeData,
      { value: id, label: values.knowledgeName },
    ]);
    if (!isUpdate) {
      handleAddData(values, id);
    }
  };

  const onSubmit = (values) => {
    console.log("continue..");
    try {
      const selectedKnowledge =
        JSON.parse(getDataFromSession("jobKnowledge")) || [];
      console.log("selectedKnowledge:", selectedKnowledge);
      let isValid = true;
      selectedKnowledge.forEach((element) => {
        console.log("element.knowledgeId:", element.knowledgeId);
        if (element.knowledgeId === values.knowledgeId) {
          toast.error("You already have this knowledge and compliance");
          isValid = false;
        }
      });
      if (isValid) {
        console.log("AddKnowledge.jsx => onSubmit():", values);
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
      console.log("AddKnowledge.jsx => onSubmit(): " + error);
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
            <DialogTitle>Add Knowledge and Compliance</DialogTitle>
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
                    name="knowledgeId"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Knowledge and compliance </FormLabel>
                        <div>
                          <ComboBox
                            list={knowledgeData}
                            subject="knowledge and compliance"
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
                    name="jobKnowledge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Knowledge Description</FormLabel>
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
      <AddKnowledgeMaster
        title={"knowledge and compliance masterfile"}
        addColumn={addColumn}
        openState={openState}
        closeState={handleCloseState}
      />
    </>
  );
}

export default AddKnowledge;
