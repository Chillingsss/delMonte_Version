"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect } from "react";
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
import { getDataFromSession, retrieveData } from "@/app/utils/storageUtils";

function AddTraining({ open, onHide, training }) {
  const formSchema = z.object({
    training: z.number().min(1, {
      message: "This field is required",
    }),
    jobTraining: z.string().min(1, {
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
      training: 0,
      jobTraining: "",
      points: "",
    },
  });

  const onSubmit = (values) => {
    try {
      const selectedTraining =
        JSON.parse(getDataFromSession("jobTraining")) || [];
      let isValid = true;
      selectedTraining.forEach((element) => {
        if (element.training === values.training) {
          toast.error("You already have this training");
          isValid = false;
        }
      });
      if (isValid) {
        onHide(values);
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
            <DialogTitle className="text-center text-2xl font-bold">
              Add Training
            </DialogTitle>
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
                            list={training}
                            subject="training"
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
                    name="jobTraining"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Training Description</FormLabel>
                        <FormControl>
                          <Textarea
                            style={{ height: "200px" }}
                            placeholder="Enter description"
                            {...field}
                          />
                        </FormControl>
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
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Add Training</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddTraining;
