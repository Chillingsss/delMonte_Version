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
import AddSkillMaster from "@/app/admin/dashboard/Masterfiles/modal/AddMasterfileForms/AddSkillMaster";

function AddSkill({
  open,
  onHide,
  handleAddList,
  handleAddData,
  addTotalPoints,
  isUpdate = false,
}) {
  const [openState, setOpenState] = useState(false);
  const [skillData, setSkillData] = useState(
    JSON.parse(getDataFromSession("skillsList"))
  );
  const formSchema = z.object({
    skill: z.number().min(1, {
      message: "This field is required",
    }),
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
      skill: 0,
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
      "skillsList",
      JSON.stringify([...skillData, { value: id, label: values.skillName }])
    );
    setSkillData([...skillData, { value: id, label: values.skillName }]);
    if (!isUpdate) {
      handleAddData(values, id);
    }
  };

  const onSubmit = (values) => {
    try {
      const selectedSkill = JSON.parse(getDataFromSession("jobSkill")) || [];
      let isValid = true;
      selectedSkill.forEach((element) => {
        if (element.skill === values.skill) {
          toast.error("You already have this skill");
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
        handleAddList(values);
        form.reset();
      }
    } catch (error) {
      toast.error("Network error");
      console.log("AddSkill.jsx => onSubmit(): " + error);
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
            <DialogTitle>Add Skill</DialogTitle>
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
                    name="skill"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skill</FormLabel>
                        <div>
                          <ComboBox
                            list={skillData}
                            subject="skill"
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
      <AddSkillMaster
        title={"skill masterfile"}
        addColumn={addColumn}
        openState={openState}
        closeState={handleCloseState}
      />
    </>
  );
}

export default AddSkill;
