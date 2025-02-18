import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import React, { useState, useEffect } from "react";
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
import Spinner from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { getDataFromSession } from "@/app/utils/storageUtils";
import { toast } from "sonner";
import axios from "axios";

function UpdateJobPassingPercentage({
  currentPassingPercentage,
  getSelectedJob,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formSchema = z.object({
    passingPercent: z
      .string()
      .min(1, {
        message: "This field is required",
      })
      .refine((value) => !isNaN(Number(value)), {
        message: "Passing percent must be a number",
      })
      .refine((value) => Number(value) <= 100, {
        message: "Passing percent should not be more than 100",
      })
      .refine((value) => Number(value) >= 0, {
        message: "Passing percent should not be less than 0",
      }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passingPercent: currentPassingPercentage,
    },
  });

  useEffect(() => {
    form.reset({ passingPercent: currentPassingPercentage });
  }, [currentPassingPercentage, form]);

  const onSubmit = async (values) => {
    if (Number(values.passingPercent) === Number(currentPassingPercentage)) {
      handleOnHide();
      return;
    }
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const jsonData = {
        jobId: getDataFromSession("jobId"),
        passingPercent: values.passingPercent,
      };
      console.log("jsonData: ", JSON.stringify(jsonData));
      const formData = new FormData();
      formData.append("operation", "updateJobPassingPercent");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data: ", res.data);
      if (res.data !== 0) {
        toast.success("Job's passing percentage updated successfully");
        getSelectedJob();
        handleOnHide();
      }
    } catch (error) {
      toast.error("Network error");
      console.log("UpdateJobPassingPercentage.jsx => onSubmit(): " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnHide = () => {
    setIsDialogOpen(false);
    form.reset();
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <button onClick={() => setIsDialogOpen(true)}>
          <Edit className="h-5 w-5 ml-1" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Passing Percentage</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex justify-center items-center">
              <div className="space-y-2 sm:space-y-3 w-full max-w-8xl">
                <FormField
                  control={form.control}
                  name="passingPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Passing Percent</FormLabel>
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
              </div>
            </div>
            <div className="flex flex-cols gap-2 justify-end mt-5">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner />} Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateJobPassingPercentage;
