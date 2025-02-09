"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ComboBox from "../my_components/combo-box";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeftCircle, CalendarIcon } from "lucide-react";
import { format, formatISO, set } from "date-fns";
import { cn } from "@/lib/utils";
import EnterPin from "./modals/EnterPin";
import axios from "axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import {
  getDataFromSession,
  retrieveData,
  storeData,
  storeDataInSession,
} from "../utils/storageUtils";
import { formatDate } from "./page";
import ShowAlert from "@/components/ui/show-alert";
import { useRouter } from "next/navigation";
import DatePicker from "../my_components/DatePicker";

const formSchema = z
  .object({
    firstName: z
      .string()
      .min(1, {
        message: "This field is required",
      })
      .transform((value) => value.charAt(0).toUpperCase() + value.slice(1)),
    lastName: z
      .string()
      .min(1, {
        message: "This field is required",
      })
      .transform((value) => value.charAt(0).toUpperCase() + value.slice(1)),
    middleName: z
      .string()
      .min(1, {
        message: "This field is required",
      })
      .transform((value) => value.charAt(0).toUpperCase() + value.slice(1)),
    email: z.string().email({
      message: "Invalid email address",
    }),
    alternateEmail: z.string().email({
      message: "Invalid email address",
    }),
    contact: z
      .string()
      .min(1, {
        message: "This field is required",
      })
      .regex(/^\+?[0-9]\d{1,14}$/, {
        message: "Invalid contact number format",
      }),
    alternateContact: z
      .string()
      .min(1, {
        message: "This field is required",
      })
      .regex(/^\+?[0-9]\d{1,14}$/, {
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
    dob: z
      .string()
      .min(1, { message: "This field is required" })
      .refine(
        (date) => {
          const parsedEndDate = Date.parse(date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return parsedEndDate <= today.getTime();
        },
        {
          message: "Invalid date",
        }
      ),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[@$!%*?&#]/, {
        message:
          "Password must contain at least one special character (@$!%*?&#)",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const PersonalInformation = ({ handleSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const genders = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ];

  // para sa pag input2 lang ni so walay dropdown or katong date
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
    { label: "Password", value: "password" },
    { label: "Confirm Password", value: "confirmPassword" },
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
  // const [selectedId, setSelectedId] = useState(null);
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

  useEffect(() => {
    const storedPersonalInfo = getDataFromSession("personalInfo");
    if (storedPersonalInfo !== null) {
      form.reset(storedPersonalInfo);
    }
    console.log("personalInfo", storedPersonalInfo);
  }, [form]);

  return (
    <>
      <div className="w-full max-w-4xl mt-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="w-full h-full flex flex-col bg-[#0e5a35]">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Sign up</CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                {isLoading ? (
                  <Spinner />
                ) : (
                  <div className="flex justify-center items-center p-4 sm:p-6">
                    <div className="space-y-2 sm:space-y-6 w-full max-w-2xl">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-3">
                        {personalInformation.map((data) => (
                          <FormField
                            key={data.value}
                            control={form.control}
                            name={data.value}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{data.label}</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    type={
                                      data.value.match(/password/i)
                                        ? "password"
                                        : "text"
                                    }
                                    className="bg-[#0e4028] border-2 border-[#0b864a]"
                                  />
                                </FormControl>
                                <FormMessage />
                                <p className="text-sm text-gray-500">
                                  {data.value === "email" &&
                                    "Please enter a valid email address."}
                                  {data.value === "password" &&
                                    "Must be at least 8 characters, include one uppercase letter, one lowercase letter, one number, and one special character."}
                                  {data.value === "confirmPassword" &&
                                    "Must match the password field."}
                                  {data.value === "contact" &&
                                    "Enter a valid phone number with country code (e.g., +1234567890)."}
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
                              <FormLabel>Gender</FormLabel>
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
                        <DatePicker
                          form={form}
                          name="dob"
                          label={"Date of Birth"}
                          futureAllowed={false}
                          design="justify-start w-full text-left font-normal bg-[#0e4028] hover:bg-[#0e5a35] border-2 border-[#0b864a]"
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex flex-row gap-4 w-full max-w-4xl mt-3 justify-end p-3">
                  <Button
                    type="button"
                    className="px-4 py-2 rounded bg-[#0e4028]"
                    variant="secondary"
                    onClick={handleShowAlert}
                  >
                    Back to login
                  </Button>
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
