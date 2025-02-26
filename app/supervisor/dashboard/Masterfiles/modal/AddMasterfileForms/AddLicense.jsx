"use client"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
import { PlusSquare } from 'lucide-react';

const AddLicense = ({ title, getData, data, addColumn }) => {
  const [licenseType, setLicenseType] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const inputRef = useRef(null);

  const formSchema = z.object({
    licenseType: z.number().min(1, {
      message: "This field is required",
    }),
    licenseName: z.string().min(1, {
      message: "This field is required",
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licenseType: 0,
      licenseName: "",
    },
  });

  const onSubmit = async (values) => {
    setIsSubmit(true);
    try {
      const licenseExists = data.some(license =>
        license.license_master_name?.toLowerCase() === values.licenseName.toLowerCase() &&
        license.license_type_name === licenseType.find(type => type.value === values.licenseType)?.label
      );

      if (licenseExists) {
        toast.error("This license already exists");
        setIsLoading(false);
        setIsSubmit(false);
        return;
      }

      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append("operation", "addLicenseMaster");
      formData.append("json", JSON.stringify(values));
      const res = await axios.post(url, formData);
      console.log("res", res);
      if (res.data !== 0) {
        toast.success("License added successfully");
        form.reset({
          licenseType: 0,
          licenseName: "",
        });
        const typeName = licenseType.find(type => type.value === values.licenseType)?.label || '';
        addColumn({
          license_master_name: values.licenseName,
          license_type_name: typeName
        }, res.data);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } else {
        toast.error("Failed to add license");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("AddLicense.jsx => onSubmit(): " + error);
    } finally {
      setIsSubmit(false);
    }
  };

  const getLicenseType = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      formData.append("operation", "getLicenseType");
      const res = await axios.post(url, formData);
      if (res.data !== 0) {
        const formattedLicenseType = res.data.map(item => ({
          value: item.license_type_id,
          label: item.license_type_name
        }));
        setLicenseType(formattedLicenseType);
      } else {
        toast.error("Failed to get license type");
        setLicenseType([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("Network error", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleClose = () => {
    setIsOpen(false);
    form.reset({
      licenseType: 0,
      licenseName: "",
    });
  }

  useEffect(() => {
    getLicenseType();
  }, []);

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) handleClose();
      }}>
        <DialogTrigger>
          <button><PlusSquare className="h-5 w-5 text-primary" /></button>
        </DialogTrigger>
        <DialogContent>
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <DialogHeader className="mb-3">
                <DialogTitle>Add {title}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="flex justify-center items-center">
                    <div className="space-y-2 sm:space-y-3 w-full max-w-8xl">
                      <FormField
                        name="licenseType"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Type</FormLabel>
                            <div>
                              <ComboBox
                                list={licenseType}
                                subject="license type"
                                value={field.value}
                                onChange={field.onChange}
                                styles={"bg-background"}
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="licenseName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter license name" {...field} ref={inputRef} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex flex-cols gap-2 justify-end mt-5">
                    <DialogClose asChild>
                      <Button variant="outline" onClick={handleClose}>Close</Button>
                    </DialogClose>
                    <Button type="submit">{isSubmit && <Spinner />} {isSubmit ? 'Submitting...' : 'Submit'}</Button>
                  </div>
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AddLicense