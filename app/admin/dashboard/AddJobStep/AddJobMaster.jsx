"use client";
import React, { useEffect } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  getDataFromSession,
  retrieveData,
  storeData,
  storeDataInSession,
} from "@/app/utils/storageUtils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

function AddJobMaster({ nextStep }) {
  const formSchema = z.object({
    title: z.string().min(1, { message: "This field is required" }),
    description: z.string().min(1, { message: "This field is required" }),
    passingPercentage: z
      .string()
      .min(1, {
        message: "This field is required",
      })
      .refine((val) => {
        if (parseInt(val) < 0 || parseInt(val) > 100) {
          return false;
        }
        return true;
      })
      .refine((value) => !isNaN(Number(value)), {
        message: "This field must be a number",
      }),
    isJobActive: z.number().optional().default(0),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      passingPercentage: "",
      isJobActive: 1,
    },
  });

  const onSubmit = (values) => {
    try {
      console.log("AddJobMaster.jsx => onSubmit(): ", values);
      storeDataInSession("jobMaster", values);
      nextStep(15);
      form.reset();
    } catch (error) {
      toast.error("Network error");
      console.log("AddJobMaster.jsx => onSubmit(): " + error);
    }
  };

  useEffect(() => {
    if (getDataFromSession("jobMaster") !== null) {
      form.reset(getDataFromSession("jobMaster"));
    }
  }, [form]);

  return (
    <div className="flex flex-col">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-cols gap-2 justify-end mt-3">
            <Button type="submit">Next</Button>
          </div>
          <div className="flex justify-center items-center">
            <div className="space-y-3 sm:space-y-3 w-full max-w-8xl">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter job title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Description</FormLabel>
                    <FormControl>
                      <Textarea
                        style={{ height: "200px" }}
                        placeholder="Enter job description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passingPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passing percentage</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter passing percentage"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isJobActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={field.value === 1}
                          onCheckedChange={(checked) =>
                            field.onChange(checked ? 1 : 0)
                          }
                        />
                        <Label>
                          {field.value === 1 ? "Job Active" : "Job Inactive"}
                        </Label>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default AddJobMaster;
