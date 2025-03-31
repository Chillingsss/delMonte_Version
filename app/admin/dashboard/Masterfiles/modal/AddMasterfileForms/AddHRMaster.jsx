"use client"
import React, { useEffect, useState, useRef } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ComboBox from '@/app/my_components/combo-box';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import { Check, PlusSquare, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const AddHRMaster = ({ getData, data }) => {
  const [hrCategory, setHrCategory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const inputRef = useRef(null);

  const validatePassword = (password) => {
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const formSchema = z.object({
    userLevel: z.number().min(1, { message: "This field is required" }),
    firstName: z.string().min(1, { message: "This field is required" }),
    middleName: z.string().min(1, { message: "This field is required" }),
    lastname: z.string().min(1, { message: "This field is required" }),
    contactNo: z.string().min(1, { message: "This field is required" })
      .refine((value) => !isNaN(Number(value)), {
        message: "This field must be a number",
      }),
    email: z.string().email({ message: "Invalid email" }).min(1, { message: "This field is required" }),
    alternateEmail: z.string().optional(),
    password: z.string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/\d/, { message: "Password must contain at least one number" })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character" })
      .regex(/^\S*$/, { message: "Password cannot contain spaces" }),
    confirmPassword: z.string().min(1, { message: "This field is required" }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userLevel: 0,
      firstName: "",
      middleName: "",
      lastname: "",
      contactNo: "",
      email: "",
      alternateEmail: "",
      password: "",
      confirmPassword: ""
    },
  });

  const getHRUserLevel = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append("operation", "getHRUserLevel");
      const res = await axios.post(url, formData);
      if (res.data !== 0) {

        const formattedCategories = res.data.map(item => ({
          value: item.userL_id,
          label: item.UserL_description
        }))

        setHrCategory(formattedCategories);
      } else {
        toast.error("Failed to get HR user level");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("AddHRMaster.jsx ~ getHRUserLevel ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const onSubmit = async (values) => {
    setIsSubmit(true);
    console.log("values ni addHRMaster: ", JSON.stringify(values));
    try {
      const emailExists = data.some(user => user.hr_email.toLowerCase() === values.email.toLowerCase());
      if (emailExists) {
        toast.error("This email already exists");
        setIsLoading(false);
        setIsSubmit(false);
        return;
      }
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append("operation", "addHR");
      formData.append("json", JSON.stringify(values));
      const res = await axios.post(url, formData);
      console.log("res.data ni addHRMaster: ", res.data);
      if (res.data !== 0) {
        toast.success("HR Master added successfully");
        form.reset({
          userLevel: 0,
          firstName: "",
          middleName: "",
          lastname: "",
          contactNo: "",
          email: "",
          alternateEmail: "",
          password: "",
          confirmPassword: ""
        });

        if (inputRef.current) {
          inputRef.current.focus();
        }
      } else {
        toast.error("Failed to add HR Master");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("AddHRMaster.jsx => onSubmit(): " + error);
    } finally {
      setIsSubmit(false);
    }
  }

  const handleClose = () => {
    setIsOpen(false);
    form.reset();
    setPasswordCriteria({
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      specialChar: false,
      noSpaces: false,
    });
    getData();
  };

  useEffect(() => {
    getHRUserLevel();
  }, [isOpen]);

  return (
    <div>
      <Sheet open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) handleClose();
      }}>
        <SheetTrigger asChild>
          <PlusSquare className="h-5 w-5 text-primary hover:cursor-pointer" onClick={() => {
            setIsOpen(true);
          }} />
        </SheetTrigger>
        <SheetContent className="w-full h-screen md:h-[90vh]" side="bottom">
          <SheetHeader>
            <SheetTitle>Add HR Master</SheetTitle>
          </SheetHeader>
          {isLoading ?
            <div className="flex justify-center items-center h-full">
              <Spinner />
            </div>
            :
            <>
              <div className="w-full max-h-[calc(100vh-10rem)] overflow-y-auto p-3">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2 py-4'>
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name <span className='text-red-700'>*</span></FormLabel>
                            <FormControl>
                              <Input ref={inputRef} placeholder="First Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="middleName"
                        render={({ field }) => (
                          <FormItem className='w-full'>
                            <FormLabel>Middle Name <span className='text-red-700'>*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Middle Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastname"
                        render={({ field }) => (
                          <FormItem className='w-full'>
                            <FormLabel>Last Name <span className='text-red-700'>*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Last Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className='w-full'>
                            <FormLabel>Email <span className='text-red-700'>*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="alternateEmail"
                        render={({ field }) => (
                          <FormItem className='w-full'>
                            <FormLabel>Alternate Email </FormLabel>
                            <FormControl>
                              <Input placeholder="Alternate Email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="userLevel"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>HR Category <span className='text-red-700'>*</span></FormLabel>
                            <div>
                              <ComboBox
                                list={hrCategory}
                                subject="HR Category"
                                value={field.value}
                                onChange={field.onChange}
                                styles={"bg-background"}
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className='grid grid-cols-1 gap-4 py-4'>
                      <FormField
                        control={form.control}
                        name="contactNo"
                        render={({ field }) => (
                          <FormItem className='w-full'>
                            <FormLabel>Contact No <span className='text-red-700'>*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Contact No" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className='w-full'>
                            <FormLabel>Password <span className='text-red-700'>*</span></FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Password" {...field} onChange={(e) => {
                                field.onChange(e);
                                validatePassword(e.target.value);
                              }} />
                            </FormControl>
                            <FormMessage />
                            <Progress value={Object.values(passwordCriteria).filter(Boolean).length * 20} className="h-2 mt-2" />
                            <h3 className="text-xs mt-3 font-bold">Password must contain</h3>
                            <ul className="grid grid-cols-1 gap-3 mt-3 text-sm">
                              {Object.entries(passwordCriteria).map(([key, value]) => (
                                <li key={key} className={`flex items-center ${value ? 'text-primary' : 'text-[#8d9189]'}`}>
                                  {value ? <Check className="h-3 w-4 mr-2" /> : <X className="h-3 w-4 mr-2" />}
                                  {key === "length" ? "At least 8 characters" :
                                    key === "uppercase" ? "At least 1 uppercase letter" :
                                      key === "lowercase" ? "At least 1 lowercase letter" :
                                        key === "number" ? "At least 1 number" :
                                          key === "specialChar" ? "At least 1 special character" :
                                            ""}
                                </li>
                              ))}
                            </ul>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className='w-full'>
                            <FormLabel>Confirm Password <span className='text-red-700'>*</span></FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm Password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className='flex justify-end gap-2 mt-4'>
                      <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                      </SheetClose>
                      <Button type="submit" disabled={isSubmit}>
                        {isSubmit && <Spinner />} {isSubmit ? 'Submitting...' : 'Submit'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </>
          }
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default AddHRMaster