import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { retrieveData } from "@/app/utils/storageUtils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  joboffer_salary: z.number().positive(),
  joboffer_document: z.string().min(1, { message: "Document is required" }),
  joboffer_expiryDate: z.date({
    required_error: "Expiry date is required",
  }),
});

const JobOffer = ({ candId, changeStatus }) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      joboffer_salary: "",
      joboffer_document: "",
      joboffer_expiryDate: undefined,
    },
  });

  const onSubmit = async (data, status) => {
    setIsSubmitting(true);
    const formattedDate = format(data.joboffer_expiryDate, "yyyy-MM-dd");
    const jsonData = {
      candId: candId,
      jobId: retrieveData("jobId"),
      statusId: status,
      salary: data.joboffer_salary,
      document: data.joboffer_document,
      expiryDate: formattedDate,
    };
    console.log("jsonData: ", jsonData);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      formData.append("operation", "sendJobOffer");
      formData.append("json", JSON.stringify(jsonData));

      const response = await axios.post(url, formData);
      console.log(response.data);
      if (response.data === 1) {
        toast.success("Job offer sent successfully");
        changeStatus();
        setOpen(false);
      } else {
        toast.error("Failed to send job offer");
      }
    } catch (error) {
      console.error("Error sending job offer:", error);
      toast.error("An error occurred while sending the job offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Job Offer</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Job Offer</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-8">
            <FormField
              control={form.control}
              name="joboffer_salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      placeholder="Enter salary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="joboffer_document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document</FormLabel>
                  <FormControl>
                    <Textarea row={5} type="text" {...field} placeholder="Enter document" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="joboffer_expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormLabel>Expiry Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Close
              </Button>
              <Button
                type="button"
                onClick={() => form.handleSubmit((data) => onSubmit(data, 3))()}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default JobOffer;