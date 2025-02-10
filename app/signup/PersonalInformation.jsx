"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ComboBox from "../my_components/combo-box";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeftCircle, CalendarIcon, Check, ChevronLeft, Eye, EyeOff, X } from "lucide-react";
import { format, formatISO, set } from "date-fns";
import { cn } from "@/lib/utils";
import EnterPin from "./modals/EnterPin";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import { getDataFromSession, retrieveData, storeData, storeDataInSession } from "../utils/storageUtils";
import { formatDate } from "./page";
import ShowAlert from "@/components/ui/show-alert";
import { useRouter } from "next/navigation";
import DatePicker from "../my_components/DatePicker";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  firstName: z.string().min(1, {
    message: "This field is required",
  }).transform(value => value.charAt(0).toUpperCase() + value.slice(1)),
  lastName: z.string().min(1, {
    message: "This field is required",
  }).transform(value => value.charAt(0).toUpperCase() + value.slice(1)),
  middleName: z.string().min(1, {
    message: "This field is required",
  }).transform(value => value.charAt(0).toUpperCase() + value.slice(1)),
  email: z.string().email({
    message: "Invalid email address",
  }),
  alternateEmail: z.string().email({
    message: "Invalid email address",
  }),
  contact: z.string().min(1, {
    message: "This field is required",
  }).regex(/^\+?[0-9]\d{1,14}$/, {
    message: "Invalid contact number format",
  }),
  alternateContact: z.string().min(1, {
    message: "This field is required",
  }).regex(/^\+?[0-9]\d{1,14}$/, {
    message: "Invalid contact number format",
  }),
  presentAddress: z.string().min(1, {
    message: "This field is required",
  }),
  permanentAddress: z.string().min(1, {
    message: "This field is required",
  }),
  gender: z.string().min(1, {
    message: "This field is required",
  }),
  dob: z.string().min(1, { message: "This field is required" })
    .refine((date) => {
      const parsedEndDate = Date.parse(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return parsedEndDate <= today.getTime();
    }, {
      message: "Invalid date",
    }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }).regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  }).regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  }).regex(/[0-9]/, {
    message: "Password must contain at least one number",
  }).regex(/[@$!%*?&#]/, {
    message: "Password must contain at least one special character",
  }),
  confirmPassword: z.string().min(1, {
    message: "This field is required",
  })
});

const PersonalInformation = ({ handleSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const router = useRouter();
  const genders = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ];

  const personalInformation = [
    { label: "First Name", value: "firstName" },
    { label: "Last Name", value: "lastName" },
    { label: "Middle Name", value: "middleName" },
    { label: "Email", value: "email" },
    { label: "Alternate Email", value: "alternateEmail" },
    { label: "Contact", value: "contact" },
    { label: "Alternate Contact", value: "alternateContact" },
    { label: "Present Address", value: "presentAddress" },
    { label: "Permanent Address", value: "permanentAddress" },
  ];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      email: "",
      alternateEmail: "",
      contact: "",
      alternateContact: "",
      presentAddress: "",
      permanentAddress: "",
      gender: "",
      dob: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleShowAlert = () => {
    setAlertMessage("Do you want to go back to the login page?");
    setShowAlert(true);
  };

  const handleCloseAlert = (status) => {
    if (status === 1) {
      router.push("/login");
    }
    setShowAlert(false);
  };

  const onSubmit = async (values) => {
    setIsLoading(true);
    const storedPersonalInfo = getDataFromSession("personalInfo");
    const userEmail = storedPersonalInfo ? storedPersonalInfo.email : "";

    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }
    if (userEmail === values.email) {
      handleSubmit(1);
      console.log("status submit: ", 1);
      setIsLoading(false);
      return;
    }
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const jsonData = { email: values.email };
      const formData = new FormData();
      formData.append("json", JSON.stringify(jsonData));
      formData.append("operation", "isEmailExist");
      const res = await axios.post(url, formData);
      console.log("EMAIL EXIST: ", res.data);
      if (res.data === -1) {
        toast.error("Email already exist");
        return;
      } else {
        storeDataInSession("personalInfo", JSON.stringify(values));
        handleSubmit(2);
        console.log("status submit: ", 2);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("PersonalInformation.jsx => onSubmit(): " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const [showDOB, setShowDOB] = useState(false);

  const handleDateChange = (date) => {
    if (date) {
      form.setValue("dob", formatISO(date, { representation: "date" }));
      form.trigger("dob");
      setTimeout(() => {
        setShowDOB(false);
      }, 50);
    }
  };

  const passwordStrengthChecker = (password) => {
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[@$!%*?&#]/.test(password),
    });
  };

  useEffect(() => {
    const storedPersonalInfo = getDataFromSession("personalInfo");
    if (storedPersonalInfo !== null) {
      form.reset(storedPersonalInfo);
    }
    console.log("personalInfo", storedPersonalInfo);
  }, [form]);

  return (
    <>
      <div className="w-full max-w-xl mt-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="w-full h-full flex flex-col bg-[#0e5a35] ">
              <CardHeader>
                <div className="flex flex-row w-full justify-between items-center">
                  <Button
                    type="button"
                    className="rounded bg-[#0e5a35]"
                    variant="secondary"
                    onClick={handleShowAlert}
                  >
                    <ChevronLeft className="h-6 w-6 mr-2" />
                  </Button>
                  <Image
                    src="/assets/images/delmonteLogo.png"
                    alt="DelmonteLogo"
                    width={152}
                    height={152}
                    className="mt-3"
                  />
                  <div className="w-12"></div>
                </div>
              </CardHeader>
              <CardContent className="h-full">
                {isLoading ? (
                  <Spinner />
                ) : (
                  <div className="flex justify-center items-center p-4 sm:p-6">
                    <div className="space-y-2 sm:space-y-6 w-full max-w-2xl">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-3">
                        {personalInformation.map((data) => (
                          <FormField
                            key={data.value}
                            control={form.control}
                            name={data.value}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{data.label} <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      {...field}
                                      type={"text"}
                                      className="bg-[#0e4028] border-2 border-[#0b864a] pr-10"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                                <p className="text-sm text-gray-500">

                                </p>
                              </FormItem>
                            )}
                          />
                        ))}
                        <FormField
                          name="gender"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gender<span className="text-red-500"> *</span></FormLabel>
                              <div>
                                <ComboBox
                                  list={genders}
                                  subject="Gender"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                      </div>
                      <DatePicker
                        form={form}
                        name="dob"
                        label={"Date of Birth"}
                        futureAllowed={false}
                        design="justify-start w-full text-left font-normal bg-[#0e4028] hover:bg-[#0e5a35] border-2 border-[#0b864a]"
                        isRequired={true}
                      />
                      <FormField
                        name="password"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password <span className="text-red-500"> *</span></FormLabel>
                            <div className="relative">
                              <Input
                                {...field}
                                type={isVisible ? "text" : "password"}
                                className="bg-[#0e4028] border-2 border-[#0b864a] pr-10"
                                onChange={(e) => {
                                  field.onChange(e);
                                  passwordStrengthChecker(e.target.value);
                                }}
                              />
                              <span className="absolute inset-y-0 right-0 flex items-center pr-3 hover:cursor-pointer" onClick={() => setIsVisible((prev) => !prev)}>
                                {isVisible ? (<EyeOff className="h-5 w-5 text-gray-400" />) : (<Eye className="h-5 w-5 text-gray-400" />)}
                              </span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div>
                        <Progress value={Object.values(passwordCriteria).filter(Boolean).length * 20} className="h-2" />
                        <h3 className="text-xs mt-3 font-bold">Password must contain</h3>
                        <ul className="grid grid-cols-1 gap-3 mt-3 text-sm">
                          <li className={`flex items-center ${passwordCriteria.length ? 'text-white' : 'text-[#8d9189]'}`}>
                            {passwordCriteria.length ? <Check className="h-3 w-4 mr-2" /> : <X className="h-3 w-4 mr-2" />} At least 8 characters
                          </li>
                          <li className={`flex items-center ${passwordCriteria.uppercase ? 'text-white' : 'text-[#8d9189]'}`}>
                            {passwordCriteria.uppercase ? <Check className="h-3 w-4 mr-2" /> : <X className="h-3 w-4 mr-2" />} At least 1 uppercase letter
                          </li>
                          <li className={`flex items-center ${passwordCriteria.lowercase ? 'text-white' : 'text-[#8d9189]'}`}>
                            {passwordCriteria.lowercase ? <Check className="h-3 w-4 mr-2" /> : <X className="h-3 w-4 mr-2" />} At least 1 lowercase letter
                          </li>
                          <li className={`flex items-center ${passwordCriteria.number ? 'text-white' : 'text-[#8d9189]'}`}>
                            {passwordCriteria.number ? <Check className="h-3 w-4 mr-2" /> : <X className="h-3 w-4 mr-2" />} At least 1 number
                          </li>
                          <li className={`flex items-center ${passwordCriteria.specialChar ? 'text-white' : 'text-[#8d9189]'}`}>
                            {passwordCriteria.specialChar ? <Check className="h-3 w-4 mr-2" /> : <X className="h-3 w-4 mr-2" />} At least 1 special character
                          </li>
                        </ul>
                      </div>

                      <FormField
                        name="confirmPassword"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password <span className="text-red-500"> *</span></FormLabel>
                            <div className="relative">
                              <Input
                                {...field}
                                type={isConfirmVisible ? "text" : "password"}
                                className="bg-[#0e4028] border-2 border-[#0b864a] pr-10"
                                onChange={(e) => { field.onChange(e); }}
                              />
                              <span className="absolute inset-y-0 right-0 flex items-center pr-3 hover:cursor-pointer" onClick={() => setIsConfirmVisible((prev) => !prev)}>
                                {isConfirmVisible ? (<EyeOff className="h-5 w-5 text-gray-400" />) : (<Eye className="h-5 w-5 text-gray-400" />)}
                              </span>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
                <div className="flex flex-row gap-4 w-full max-w-4xl mt-3 justify-end p-3">
                  <Button
                    type="submit"
                    className="px-4 py-2 text-white rounded dark:bg-[#f5f5f5] dark:text-[#0e4028] w-full sm:w-auto"
                    disabled={isLoading}
                  >
                    {isLoading && <Spinner />}
                    Submit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
      <ShowAlert
        open={showAlert}
        onHide={handleCloseAlert}
        message={alertMessage}
      />
    </>
  );
};

export default PersonalInformation;
