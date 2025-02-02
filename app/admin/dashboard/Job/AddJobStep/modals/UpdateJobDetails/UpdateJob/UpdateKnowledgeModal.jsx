"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";
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
import { Input } from "@/components/ui/input";
import ComboBox from "@/app/my_components/combo-box";
import {
  getDataFromSession,
  retrieveData,
  storeData,
  storeDataInSession,
} from "@/app/utils/storageUtils";

function UpdateKnowledgeModal({ open, onHide, knowledgeList, updateData }) {
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
      knowledgeId: updateData.knowledgeId || 0,
      // jobKnowledge: updateData.jobKnowledge || "",
      points: updateData.points.toString() || "",
    },
  });

  const onSubmit = (values) => {
    try {
      const selectedKnowledge =
        JSON.parse(getDataFromSession("jobKnowledge")) || [];
      let isValid = true;
      const filteredSelectedData = selectedKnowledge.filter((element) => {
        return element.knowledgeId !== updateData.knowledgeId;
      });
      filteredSelectedData.forEach((element) => {
        if (element.knowledgeId === values.knowledgeId) {
          toast.error("You already have this knowledge and compliance");
          isValid = false;
        }
      });
      if (isValid) {
        const totalPoints = Number(getDataFromSession("jobTotalPoints") || 0);
        const newTotalPoints =
          totalPoints - Number(updateData.points) + Number(values.points);
        if (newTotalPoints > 100) {
          toast.error("Total points cannot exceed 100");
          return;
        }
        storeDataInSession("jobTotalPoints", newTotalPoints);
        onHide(values);
        form.reset();
      }
    } catch (error) {
      toast.error("Network error");
      console.log("UpdateKnowledgeModal.jsx => onSubmit(): " + error);
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
            <DialogTitle>Update Knowledge and Compliance</DialogTitle>
            <DialogDescription>
              Job&apos;s total points:{" "}
              {getDataFromSession("jobTotalPoints") || 0}
            </DialogDescription>
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
                            list={knowledgeList}
                            subject="knowledge and compliance"
                            value={field.value}
                            onChange={field.onChange}
                            styles={"bg-background"}
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
                <Button type="submit">Update</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default UpdateKnowledgeModal;
