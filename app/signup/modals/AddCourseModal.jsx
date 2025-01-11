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
import ComboBox from "@/app/my_components/combo-box";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { formatDate } from "../page";

function AddCourseModal({ open, onHide, courseList, institutionList }) {
  const [selectedCourseType, setSelectedCourseType] = useState(2);
  const [courseData, setCourseData] = useState([]);

  const formSchema = z.object({
    institution: z.number().min(1, {
      message: "This field is required",
    }),
    course: z.number().min(1, {
      message: "This field is required",
    }),
    courseDateGraduated: z.string().min(1, { message: "This field is required" })
      .refine((date) => {
        const parsedEndDate = Date.parse(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return parsedEndDate <= today.getTime();
      }, {
        message: "Date cannot be in the future",
      }),
    // prcLicense: z.string().min(1, { message: "This field is required" }),
    // prcLicenseNumber: z.string().min(1, {
    //   message: "This field is required",
    // }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      institution: 0,
      course: 0,
      courseDateGraduated: "",
      // prcLicense: "",
      // prcLicenseNumber: "",
    },
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const handleDateChange = (date, type) => {

    if (date) {
      setTimeout(() => {
        setShowDatePicker(false);
      }, 50);
      form.setValue(type, formatISO(date, { representation: 'date' }));
      form.trigger(type);
    }
  };

  const onSubmit = (values) => {
    try {
      console.log("AddCourseModal.jsx => onSubmit():", values);
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

  const handleCourseTypeChange = (value) => {
    setSelectedCourseType(Number(value));
  };

  useEffect(() => {
    const filteredCourseList = courseList.filter((course) => course.courseType === selectedCourseType);
    setCourseData(filteredCourseList);
  }, [courseList, selectedCourseType]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleHide}>
        <DialogOverlay className="bg-black/5" />
        <DialogContent className="bg-[#0e5a35]">
          <DialogHeader>
            <DialogTitle className="text-3xl">Add Education Background</DialogTitle>
          </DialogHeader>
          <div className="w-full">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} >
                <div className="flex justify-center items-center p-4 sm:p-6">
                  <div className="space-y-2 sm:space-y-3 w-full max-w-8xl">
                    <div className="grid grid-cols-1 gap-2">
                      <FormField
                        name="institution"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution</FormLabel>
                            <div>
                              <ComboBox
                                list={institutionList}
                                subject="Institution"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Separator />
                      <RadioGroup defaultValue={2} onValueChange={handleCourseTypeChange}>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={1} id="r1" />
                            <Label htmlFor="r1">Secondary Education</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={2} id="r2" />
                            <Label htmlFor="r2">Tertiary Education</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={3} id="r3" />
                            <Label htmlFor="r3">Graduate Education</Label>
                          </div>
                        </div>
                      </RadioGroup>

                      <FormField
                        name="course"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course</FormLabel>
                            <div>
                              <ComboBox
                                list={courseData}
                                subject="Course"
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="courseDateGraduated"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Graduated</FormLabel>
                            <div>
                              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    onClick={() => setShowDatePicker(!showDatePicker)}
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
                                    onSelect={(date) => handleDateChange(date, "courseDateGraduated")}
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

                    {/* <Separator />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="prcLicense"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PRC License</FormLabel>
                            <FormControl>
                              <Input className="bg-[#0e4028] border-2 border-[#0b864a]" placeholder="Enter PRC License" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="prcLicenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>PRC License No.</FormLabel>
                            <FormControl>
                              <Input className="bg-[#0e4028] border-2 border-[#0b864a]" placeholder="Enter PRC License Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      /> 
                    </div>*/}
                  </div>
                </div>
                <div className="flex flex-cols gap-2 justify-end mr-7">
                  <DialogClose asChild>
                    <Button className="bg-[#0e4028] text-white">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-[#0b864a] text-white">Add Course</Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddCourseModal
