"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
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
import { debounce } from "lodash";

const formSchema = z.object({
  firstName: z.string()
    .min(1, { message: "This field is required" })
    .max(20, { message: "First name cannot exceed 20 characters" })
    .regex(/^[A-Za-z\s-']+$/, { message: "Only letters, spaces, hyphens, and apostrophes are allowed" })
    .transform(value => value.charAt(0).toUpperCase() + value.slice(1)),
  
  middleName: z.string()
    .min(1, { message: "This field is required" })
    .max(20, { message: "Middle name cannot exceed 20 characters" })
    .regex(/^[A-Za-z\s-']+$/, { message: "Only letters, spaces, hyphens, and apostrophes are allowed" })
    .transform(value => value.charAt(0).toUpperCase() + value.slice(1)),
  
  lastName: z.string()
    .min(1, { message: "This field is required" })
    .max(20, { message: "Last name cannot exceed 20 characters" })
    .regex(/^[A-Za-z\s-']+$/, { message: "Only letters, spaces, hyphens, and apostrophes are allowed" })
    .transform(value => value.charAt(0).toUpperCase() + value.slice(1)),
  
  email: z.string()
    .min(1, { message: "This field is required" })
    .max(254, { message: "Email cannot exceed 254 characters" })
    .email({ message: "Invalid email address" }),
  
  alternateEmail: z.string()
    .min(1, { message: "This field is required" })
    .max(254, { message: "Email cannot exceed 254 characters" })
    .email({ message: "Invalid email address" }),
  
  contact: z.string()
    .min(1, { message: "This field is required" })
    .regex(/^\+63\s\d{3}\s\d{3}\s\d{4}$/, {
      message: "Invalid Philippine contact number format. Use: +63 XXX XXX XXXX",
    }),
  
  alternateContact: z.string()
    .min(1, { message: "This field is required" })
    .regex(/^\+63\s\d{3}\s\d{3}\s\d{4}$/, {
      message: "Invalid Philippine contact number format. Use: +63 XXX XXX XXXX",
    }),
  
  presentAddress: z.string()
    .min(1, { message: "This field is required" })
    .max(200, { message: "Address cannot exceed 200 characters" }),
  
  permanentAddress: z.string()
    .min(1, { message: "This field is required" })
    .max(200, { message: "Address cannot exceed 200 characters" }),
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
  }).regex(/^\S*$/, {
    message: "Password must not contain spaces",
  }),
  confirmPassword: z.string().min(1, {
    message: "This field is required",
  })
});

const PersonalInformation = ({ handleSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(false);
  const [emailValidation, setEmailValidation] = useState({ email: null, alternateEmail: null });
  const [isValidating, setIsValidating] = useState({ email: false, alternateEmail: false });
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    noSpaces: false,
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [addressValidation, setAddressValidation] = useState({
    presentAddress: null,
    permanentAddress: null
  });
  const router = useRouter();
  const genders = [
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
    { label: "Other", value: "Other" },
  ];

  const personalInformation = [
    { label: "First Name", value: "firstName", group: "name" },
    { label: "Middle Name", value: "middleName", group: "name" },
    { label: "Last Name", value: "lastName", group: "name" },
    { label: "Email", value: "email", group: "email" },
    { label: "Alternate Email", value: "alternateEmail", group: "email" },
    { label: "Contact", value: "contact", isContact: true, group: "contact" },
    { label: "Alternate Contact", value: "alternateContact", isContact: true, group: "contact" },
    { label: "Present Address", value: "presentAddress", isAddress: true, group: "address" },
    { label: "Permanent Address", value: "permanentAddress", isAddress: true, group: "address" },
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
    const newCriteria = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[@$!%*?&#]/.test(password),
      noSpaces: !/\s/.test(password),
    };
    
    setPasswordCriteria(newCriteria);
    const isValid = Object.values(newCriteria).every(Boolean);
    setIsPasswordValid(isValid);
    
    // Check confirm password validity whenever password changes
    const confirmPassword = form.getValues("confirmPassword");
    if (confirmPassword) {
      setIsConfirmPasswordValid(isValid && password === confirmPassword);
    }
    validateForm(); // Always validate form after password changes
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmValue = e.target.value;
    form.setValue("confirmPassword", confirmValue);
    const password = form.getValues("password");
    const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
    setIsConfirmPasswordValid(isPasswordValid && confirmValue === password);
    validateForm(); // Always validate form after confirm password changes
  };

  const validateEmailDomain = async (email, field) => {
    if (!email || !email.includes('@')) return;
    
    setIsValidating(prev => ({ ...prev, [field]: true }));
    const domain = email.split('@')[1];
    
    try {
      const { data } = await axios.post('/api/validateEmailDomain', { domain });
      setEmailValidation(prev => ({ ...prev, [field]: data.isValid }));
    } catch (error) {
      console.error('Error validating email domain:', error);
      setEmailValidation(prev => ({ ...prev, [field]: false }));
    } finally {
      setIsValidating(prev => ({ ...prev, [field]: false }));
    }
  };

  const debouncedValidation = useCallback(
    debounce((email, field) => validateEmailDomain(email, field), 500),
    []
  );

  const validateForm = () => {
    const isPasswordRequirementsMet = Object.values(passwordCriteria).every(Boolean);
    const password = form.getValues("password");
    const confirmPassword = form.getValues("confirmPassword");
    const isPasswordsMatch = password && confirmPassword && password === confirmPassword;
    const isEmailsValid = emailValidation.email && emailValidation.alternateEmail;
    const areAddressesValid = addressValidation.presentAddress && addressValidation.permanentAddress;
    
    const formValues = form.getValues();
    const areRequiredFieldsFilled = Boolean(
      formValues.firstName &&
      formValues.lastName &&
      formValues.middleName &&
      formValues.email &&
      formValues.alternateEmail &&
      formValues.contact &&
      formValues.alternateContact &&
      formValues.presentAddress &&
      formValues.permanentAddress &&
      formValues.gender &&
      formValues.dob &&
      formValues.password &&
      formValues.confirmPassword
    );

    const isValid = 
      isPasswordRequirementsMet && 
      isPasswordsMatch && 
      isEmailsValid && 
      areAddressesValid &&
      areRequiredFieldsFilled;

    // Detailed debugging
    console.log('Detailed Form Validation:', {
      isPasswordRequirementsMet,
      passwordCriteria,
      isPasswordsMatch: {
        password,
        confirmPassword,
        matches: isPasswordsMatch,
        requirementsMet: isPasswordRequirementsMet
      },
      isEmailsValid: {
        email: emailValidation.email,
        alternateEmail: emailValidation.alternateEmail
      },
      areAddressesValid: {
        present: addressValidation.presentAddress,
        permanent: addressValidation.permanentAddress
      },
      areRequiredFieldsFilled,
      requiredFields: {
        firstName: Boolean(formValues.firstName),
        lastName: Boolean(formValues.lastName),
        middleName: Boolean(formValues.middleName),
        email: Boolean(formValues.email),
        alternateEmail: Boolean(formValues.alternateEmail),
        contact: Boolean(formValues.contact),
        alternateContact: Boolean(formValues.alternateContact),
        presentAddress: Boolean(formValues.presentAddress),
        permanentAddress: Boolean(formValues.permanentAddress),
        gender: Boolean(formValues.gender),
        dob: Boolean(formValues.dob),
        password: Boolean(formValues.password),
        confirmPassword: Boolean(formValues.confirmPassword)
      }
    });

    setIsFormValid(isValid);
  };

  const handleAddressChange = (e, field) => {
    const value = e.target.value;
    form.setValue(field, value);
    validateAddress(value, field);
    validateForm();
  };

  const handleEmailChange = (e, field) => {
    const value = e.target.value;
    form.setValue(field, value);
    if (value && value.includes('@')) {
      debouncedValidation(value, field);
    } else {
      setEmailValidation(prev => ({ ...prev, [field]: null }));
    }
    validateForm();
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format the number
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `+63 ${digits.slice(2)}`;
    if (digits.length <= 8) return `+63 ${digits.slice(2, 5)} ${digits.slice(5)}`;
    return `+63 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 12)}`;
  };

  const handlePhoneNumberChange = (e, field) => {
    let value = e.target.value;
    
    if (e.nativeEvent.inputType === 'deleteContentBackward') {
      value = value.replace(/\s+$/, '');
    } else {
      value = value.replace(/[^\d+\s]/g, '');
      
      if (!value.startsWith('+63')) {
        value = '+63' + (value.startsWith('63') ? value.slice(2) : value);
      }
      
      value = formatPhoneNumber(value);
    }
    
    if (value.length <= 17) {
      form.setValue(field, value);
      validateForm();
    }
  };

  const validateAddress = (value, field) => {
    if (!value) {
      setAddressValidation(prev => ({ ...prev, [field]: false }));
      return false;
    }
    
    // Split by commas and check parts
    const parts = value.split(',');
    if (parts.length !== 4) {
      setAddressValidation(prev => ({ ...prev, [field]: false }));
      return false;
    }
    
    // Check each part has content after trimming
    for (let part of parts) {
      if (part.trim().length === 0) {
        setAddressValidation(prev => ({ ...prev, [field]: false }));
        return false;
      }
    }
    
    // Validate postal code
    const postalCode = parts[3].trim();
    if (!/^\d{4}$/.test(postalCode)) {
      setAddressValidation(prev => ({ ...prev, [field]: false }));
      return false;
    }
    
    setAddressValidation(prev => ({ ...prev, [field]: true }));
    return true;
  };

  useEffect(() => {
    validateForm();
  }, [passwordCriteria, emailValidation, addressValidation, form]);

  useEffect(() => {
    const subscription = form.watch(() => {
      validateForm();
    });

    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    const storedPersonalInfo = getDataFromSession("personalInfo");
    if (storedPersonalInfo !== null) {
      form.reset(storedPersonalInfo);
      
      // Validate emails if they exist
      if (storedPersonalInfo.email) {
        validateEmailDomain(storedPersonalInfo.email, 'email');
      }
      if (storedPersonalInfo.alternateEmail) {
        validateEmailDomain(storedPersonalInfo.alternateEmail, 'alternateEmail');
      }
      
      // Validate addresses if they exist
      if (storedPersonalInfo.presentAddress) {
        validateAddress(storedPersonalInfo.presentAddress, 'presentAddress');
      }
      if (storedPersonalInfo.permanentAddress) {
        validateAddress(storedPersonalInfo.permanentAddress, 'permanentAddress');
      }
      
      // Validate password if it exists
      if (storedPersonalInfo.password) {
        passwordStrengthChecker(storedPersonalInfo.password);
      }
    }
  }, [form]);
  // FEFACA - light green
  // 004F39 - green
  // EAE9E7 - white
  // 151513 - black
  return (
    <>
      <div className="w-full max-w-xl relative">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="w-full h-full flex flex-col bg-[#EAE9E7] text-[#151513]">
              {isLoading && (
                <div className="absolute inset-0 bg-black/5 backdrop-blur-sm z-50 flex items-center justify-center">
                  <Spinner />
                </div>
              )}
              <CardHeader>
                <div className="flex flex-row w-full justify-between items-center">
                  <Button
                    type="button"
                    className="rounded bg-[#EAE9E7] hover:bg-[#EAE9E7] text-[#151513]"
                    variant="secondary"
                    onClick={handleShowAlert}
                  >
                    <ChevronLeft className="h-6 w-6 mr-2" />
                  </Button>
                  <Image
                    src="/assets/images/delmontes.png"
                    alt="DelmonteLogo"
                    width={152}
                    height={152}
                    className="mt-3"
                  />
                  <div className="w-12"></div>
                </div>
              </CardHeader>
              <CardContent className="h-full">
                <div className="flex justify-center items-center p-4 sm:p-6">
                  <div className="space-y-2 sm:space-y-6 w-full max-w-2xl">
                    {/* Names Section - 3 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {personalInformation
                        .filter(field => field.group === "name")
                        .map((data) => (
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
                                      type="text" 
                                      className="bg-transparent border-2 border-gray-400" 
                                      maxLength={20}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        // Only allow letters, spaces, hyphens, and apostrophes
                                        if (/^[A-Za-z\s-']*$/.test(value)) {
                                          field.onChange(e);
                                        }
                                      }}
                                      placeholder={`Enter ${data.label.toLowerCase()}`}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                    </div>

                    {/* Email Section - 2 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {personalInformation
                        .filter(field => field.group === "email")
                        .map((data) => (
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
                                      type="text"
                                      className={`bg-transparent border-2 ${
                                        emailValidation[data.value] === true
                                          ? 'border-green-500'
                                          : emailValidation[data.value] === false
                                            ? 'border-red-500'
                                            : 'border-gray-400'
                                      } pr-10`}
                                      onChange={(e) => handleEmailChange(e, data.value)}
                                      placeholder={`Enter ${data.label.toLowerCase()}`}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                      {isValidating[data.value] ? (
                                        <Spinner className="h-4 w-4" />
                                      ) : emailValidation[data.value] === true ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                      ) : emailValidation[data.value] === false ? (
                                        <X className="h-4 w-4 text-red-500" />
                                      ) : null}
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                    </div>

                    {/* Contact Section - 2 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {personalInformation
                        .filter(field => field.group === "contact")
                        .map((data) => (
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
                                      type="text"
                                      className="bg-transparent border-2 border-gray-400 pr-10"
                                      onChange={(e) => handlePhoneNumberChange(e, data.value)}
                                      placeholder="+63 XXX XXX XXXX"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500">
                                      PH
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                                {data.isContact && (
                                  <div className="space-y-1 mt-1">
                                    <p className="text-xs text-gray-500">
                                      Enter Philippine mobile number
                                    </p>
                                  </div>
                                )}
                              </FormItem>
                            )}
                          />
                        ))}
                    </div>

                    {/* Address Section - 2 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {personalInformation
                        .filter(field => field.group === "address")
                        .map((data) => (
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
                                      type="text"
                                      className={`bg-transparent border-2 ${
                                        addressValidation[data.value] === true
                                          ? 'border-green-500'
                                          : addressValidation[data.value] === false
                                            ? 'border-red-500'
                                            : 'border-gray-400'
                                      } text-sm pr-10`}
                                      onChange={(e) => handleAddressChange(e, data.value)}
                                      placeholder="Street Address, Area, City, Postal Code"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                      {addressValidation[data.value] === true ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                      ) : addressValidation[data.value] === false ? (
                                        <X className="h-4 w-4 text-red-500" />
                                      ) : null}
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                                {data.isAddress && (
                                  <div className="space-y-1 mt-1">
                                    <ul className="text-xs text-gray-500 list-disc pl-4 space-y-0.5">
                                      <li>Street Address (e.g., 123 Main St, Unit 4B)</li>
                                      <li>Area (e.g., Brgy. San Antonio)</li>
                                      <li>City (e.g., Makati City)</li>
                                      <li>Postal Code (e.g., 1200)</li>
                                    </ul>
                                    <p className="text-xs text-gray-500">Example: 123 Main St, Brgy. San Antonio, Makati City, 1200</p>
                                  </div>
                                )}
                              </FormItem>
                            )}
                          />
                        ))}
                    </div>

                    {/* Gender and Birthday Section - 2 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                styles={"bg-transparent border-2 border-gray-400 hover:bg-[#0e5a35]"}
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex flex-col space-y-2">
                        <DatePicker
                          form={form}
                          name="dob"
                          label={"Date of Birth"}
                          futureAllowed={false}
                          design="justify-start w-full text-left font-normal bg-transparent hover:bg-[#004f39] border-2 border-gray-400"
                          labelDesign={true}
                          isRequired={true}
                        />
                      </div>
                    </div>

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
                              className="bg-transparent border-2 border-gray-400 pr-10"
                              onChange={(e) => {
                                field.onChange(e);
                                passwordStrengthChecker(e.target.value);
                              }}
                            />
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 hover:cursor-pointer" onClick={() => setIsVisible((prev) => !prev)}>
                              {isVisible ? (<EyeOff className="h-5 w-5 text-[#151513]" />) : (<Eye className="h-5 w-5 text-[#151513]" />)}
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
                        <li className={`flex items-center ${passwordCriteria.length ? 'text-black' : 'text-[#8d9189]'}`}>
                          {passwordCriteria.length ? <Check className="h-3 w-4 mr-2" /> : <X className="h-3 w-4 mr-2" />} At least 8 characters
                        </li>
                        <li className={`flex items-center ${passwordCriteria.uppercase ? 'text-black' : 'text-[#8d9189]'}`}>
                          {passwordCriteria.uppercase ? <Check className="h-3 w-4 mr-2" /> : <X className="h-3 w-4 mr-2" />} At least 1 uppercase letter
                        </li>
                        <li className={`flex items-center ${passwordCriteria.lowercase ? 'text-black' : 'text-[#8d9189]'}`}>
                          {passwordCriteria.lowercase ? <Check className="h-3 w-4 mr-2" /> : <X className="h-3 w-4 mr-2" />} At least 1 lowercase letter
                        </li>
                        <li className={`flex items-center ${passwordCriteria.number ? 'text-black' : 'text-[#8d9189]'}`}>
                          {passwordCriteria.number ? <Check className="h-3 w-4 mr-2" /> : <X className="h-3 w-4 mr-2" />} At least 1 number
                        </li>
                        <li className={`flex items-center ${passwordCriteria.specialChar ? 'text-black' : 'text-[#8d9189]'}`}>
                          {passwordCriteria.specialChar ? <Check className="h-3 w-4 mr-2" /> : <X className="h-3 w-4 mr-2" />} At least 1 special character
                        </li>
                        <li className={`flex items-center ${passwordCriteria.noSpaces ? 'text-black' : 'text-[#8d9189]'}`}>
                          {passwordCriteria.noSpaces ? <Check className="h-3 w-4 mr-2" /> : <X className="h-3 w-4 mr-2" />} No spaces allowed
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
                              className="bg-transparent border-2 border-gray-400 pr-10"
                              onChange={(e) => { 
                                field.onChange(e);
                                handleConfirmPasswordChange(e);
                              }}
                            />
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 hover:cursor-pointer" onClick={() => setIsConfirmVisible((prev) => !prev)}>
                              {isConfirmVisible ? (<EyeOff className="h-5 w-5 text-[#151513]" />) : (<Eye className="h-5 w-5 text-[#151513]" />)}
                            </span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex flex-row gap-4 w-full max-w-4xl mt-3 justify-end p-3">
                  <Button
                    type="submit"
                    className={`px-4 py-2 text-white rounded w-full sm:w-auto ${
                      isFormValid
                        ? 'bg-[#004f39] hover:bg-[#0b864a] cursor-pointer' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    disabled={isLoading || !isFormValid}
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