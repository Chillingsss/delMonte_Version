import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import axios from 'axios';
import ComboBox from '@/app/my_components/combo-box';
import Spinner from '@/components/ui/spinner';

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
});

const UpdateHRMaster = ({ data, id, getData, firstName, middleName, lastname, contactNo, email, alternateEmail, userLevel, onClose }) => {
  const [hrCategory, setHrCategory] = useState([]);
  const [isSubmit, setIsSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { userLevel, firstName, middleName, lastname, contactNo, email, alternateEmail },
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

  useEffect(() => {
    form.reset({ userLevel, firstName, middleName, lastname, contactNo, email, alternateEmail });
    getHRUserLevel();
  }, [userLevel, firstName, middleName, lastname, contactNo, email, alternateEmail, form]);

  const onSubmit = async (values) => {
    setIsSubmit(true);
    try {
      if (
        email === values.email &&
        contactNo === values.contactNo &&
        firstName === values.firstName &&
        middleName === values.middleName &&
        lastname === values.lastname &&
        alternateEmail === values.alternateEmail &&
        userLevel === values.userLevel
      ) {
        toast.info("No changes made");
        setIsLoading(false);
        setIsSubmit(false);
        return;
      }
      const emailExists = data.some(user => user.hr_email.toLowerCase() === values.email.toLowerCase());
      if (emailExists && email !== values.email) {
        toast.error("This email already exists");
        setIsLoading(false);
        setIsSubmit(false);
        return;
      }
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const jsonData = {
        hrId: id,
        lastName: values.lastname,
        firstName: values.firstName,
        middleName: values.middleName,
        contactNo: values.contactNo,
        email: values.email,
        alternateEmail: values.alternateEmail,
        userLevel: values.userLevel
      }

      console.log("jsonData: ", jsonData);
      const formData = new FormData();
      formData.append("operation", "updateHR");
      formData.append("json", JSON.stringify(jsonData));

      const res = await axios.post(url, formData);
      console.log("res.data: ", res.data);
      if (res.data === 1) {
        toast.success("HR Master updated successfully");
        getData();
        onClose();
      } else {
        toast.error("Failed to update HR Master");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("UpdateHRMaster.jsx => onSubmit():", error);
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="h-screen md:h-auto" side="bottom">
        {isLoading ?
          <div className="flex justify-center items-center h-full">
            <Spinner />
          </div> :
          <>
            <SheetHeader>
              <SheetTitle>Update HR</SheetTitle>
              <SheetDescription />
            </SheetHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Form {...form}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 py-4 max-h-[calc(100vh-10rem)] overflow-y-auto p-3">
                  <FormField name="firstName" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField name="middleName" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Middle Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField name="lastname" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField name="email" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField name="alternateEmail" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Alternate Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField name="contactNo" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField name="userLevel" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>User Level</FormLabel>
                      <FormControl>
                        <ComboBox
                          list={hrCategory}
                          subject="HR Category"
                          value={field.value}
                          onChange={field.onChange}
                          styles={"bg-background"}
                        />
                      </FormControl><FormMessage />
                    </FormItem>
                  )} />
                </div>
              </Form>
              <div className="flex justify-end mt-4 gap-2">
                <Button type="button" onClick={onClose} variant="outline">Cancel</Button>
                <Button type="submit" disabled={isSubmit}>
                  {isSubmit && <Spinner />} {isSubmit ? 'Submitting...' : 'Update'}
                </Button>
              </div>
            </form>
          </>
        }
      </SheetContent>
    </Sheet>
  );
};

export default UpdateHRMaster;
