"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import Spinner from "@/components/ui/spinner";
import axios from "axios";
import DatePicker from "@/app/my_components/DatePicker";
import { Textarea } from "@/components/ui/textarea";
import { getDataFromSession, retrieveData } from "@/app/utils/storageUtils";
import { Edit2 } from "lucide-react";

const UpdateJobOffer = ({ candidate, getJobOfferCandidates, disabled }) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [open, setOpen] = useState(false);

  const formSchema = z.object({
    salary: z
      .string()
      .min(1, { message: "Salary is required" })
      .refine((val) => !isNaN(val), { message: "Salary must be a number" })
      .transform((val) => Number(val)),
    document: z.string().min(1, {
      message: "Document is required",
    }),
    expiryDate: z
      .string()
      .min(1, {
        message: "Expiry date is required",
      })
      .refine(
        (date) => {
          const parsedDate = Date.parse(date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return parsedDate >= today.getTime();
        },
        {
          message: "Date must be today or later",
        }
      ),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salary: candidate?.joboffer_salary || "",
      document: candidate?.joboffer_document || "",
      expiryDate: candidate?.joboffer_expiryDate || "",
    },
  });

  const onSubmit = async (values) => {
    setIsSubmit(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formattedValues = {
        ...values,
        expiryDate: new Date(values.expiryDate).toISOString().split("T")[0],
      };

      const jsonData = {
        ...formattedValues,
        candidateId: candidate.cand_id,
        jobId: getDataFromSession("jobId"),
      };
      console.log("jsonData ni updateJobOffer: ", jsonData);
      const formData = new FormData();
      formData.append("operation", "updateJobOffer");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni updateJobOffer: ", res);
      if (res.data === 1) {
        toast.success("Job offer updated successfully");
        getJobOfferCandidates();
        setOpen(false);
      } else if (res.data === 0) {
        toast.info("No changes made");
      } else {
        toast.error("Failed to update job offer");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("UpdateJobOffer.jsx => onSubmit(): " + error);
    } finally {
      setIsSubmit(false);
    }
  };

  const handleOpenChange = (open) => {
    if (!open) {
      form.reset({
        salary: candidate?.joboffer_salary || "",
        document: candidate?.joboffer_document || "",
        expiryDate: candidate?.joboffer_expiryDate || "",
      });
    }
    setOpen(open);
  };

  const handleEditClick = (e) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild disabled={disabled}>
        <div onClick={handleEditClick}>
          <Edit2
            className={`w-5 h-5 ${
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            }`}
          />
        </div>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[600px] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            Update Job Offer
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter salary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Enter document details"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DatePicker
              form={form}
              name="expiryDate"
              label="Expiry Date"
              pastAllowed={false}
            />

            <div className="flex flex-cols gap-2 justify-end mt-5">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button type="submit">
                {isSubmit && <Spinner />} {isSubmit ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateJobOffer;
