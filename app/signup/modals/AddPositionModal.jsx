"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, formatISO, set } from "date-fns";
import { cn } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { formatDate } from "../page";
import { useState } from "react";

function AddPositionModal({ open, onHide }) {

  const formSchema = z.object({
    position: z.string().min(1, {
      message: "This field is required",
    }),
    company: z.string().min(1, {
      message: "This field is required",
    }),
    startDate: z.string().min(1, { message: "This field is required" })
      .refine((startDate) => {
        const parsedDate = Date.parse(startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return parsedDate <= today.getTime();
      }, {
        message: "Invalid Start Date",
      }),
    endDate: z.string().min(1, { message: "This field is required" })
      .refine((endDate) => {
        const parsedEndDate = Date.parse(endDate);
        const parsedStartDate = Date.parse(form.getValues("startDate"));
        return parsedEndDate >= parsedStartDate;
      }, {
        message: "End Date cannot be before Start Date",
      }).refine((endDate) => {
        const parsedEndDate = Date.parse(endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return parsedEndDate <= today.getTime();
      }, {
        message: "Invalid End Date",
      }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: "",
      company: "",
      startDate: "",
      endDate: "",
    },
  });

  const [showDatePickerStart, setShowDatePickerStart] = useState(false);
  const [showDatePickerEnd, setShowDatePickerEnd] = useState(false);
  const handleStartDateChange = (date) => {
    if (date) {
      form.setValue("startDate", formatISO(date, { representation: 'date' }));
    }
    form.trigger("startDate");
    setTimeout(() => {
      setShowDatePickerStart(false);
    }, 50);    

  };

  const handleEndDateChange = (date) => {
    if (date) {
      form.setValue("endDate", formatISO(date, { representation: 'date' }));
    }
    form.trigger("endDate");
    setTimeout(() => {
      setShowDatePickerEnd(false);
    }, 50);
  };

  const onSubmit = (values) => {
    try {
      onHide(values);
      form.reset();
    } catch (error) {
      toast.error("Network error");
      console.log("PersonalInformation.jsx => onSubmit(): " + error);
    }
  };

  const handleHide = () => {
    onHide(0);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleHide}>
        <DialogOverlay className="bg-black/5" />
        <DialogContent className="bg-[#0e5a35]">
          <DialogHeader>
            <DialogTitle className="text-3xl">Add Position</DialogTitle>
          </DialogHeader>
          <div className="w-full max-w-4xl ">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} >
                <div className="flex justify-center items-center p-4 sm:p-6">
                  <div className="space-y-2 sm:space-y-3 w-full max-w-8xl">
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Input className="bg-[#0e4028] border-2 border-[#0b864a]" placeholder="Enter Position" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input className="bg-[#0e4028] border-2 border-[#0b864a]" placeholder="Enter Company" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <div>
                              <Popover open={showDatePickerStart} onOpenChange={setShowDatePickerStart}>
                                <PopoverTrigger asChild>
                                  <Button
                                    onClick={() => setShowDatePickerStart(!showDatePickerStart)}
                                    variant={"outline"}
                                    className={cn("justify-start w-full text-left font-normal bg-[#0e4028] hover:bg-[#0e5a35] border-2 border-[#0b864a]", !field.value && "text-muted-foreground")}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? formatDate(new Date(field.value), "yyyy-MM-dd") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className=" w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    captionLayout="dropdown-buttons"
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={handleStartDateChange}
                                    fromYear={1960}
                                    toYear={new Date().getFullYear()}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <div>
                              <Popover open={showDatePickerEnd} onOpenChange={setShowDatePickerEnd}>
                                <PopoverTrigger asChild>
                                  <Button
                                    onClick={() => setShowDatePickerEnd(!showDatePickerEnd)}
                                    variant={"outline"}
                                    className={cn("justify-start w-full text-left font-normal bg-[#0e4028] hover:bg-[#0e5a35] border-2 border-[#0b864a]", !field.value && "text-muted-foreground")}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? formatDate(new Date(field.value), "yyyy-MM-dd") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className=" w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    captionLayout="dropdown-buttons"
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={handleEndDateChange}
                                    fromYear={1960}
                                    toYear={new Date().getFullYear()}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-cols gap-2 justify-end mr-7">
                  <DialogClose asChild>
                    <Button className="bg-[#0e4028] text-white">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-[#0b864a] text-white">Add Position</Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddPositionModal
