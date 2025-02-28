import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { Edit2 } from 'lucide-react';

const UpdateLicenseMaster = ({ data, id, licenseTypeId, currentName, getData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [licenseType, setLicenseType] = useState([]);
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
      licenseType: licenseTypeId,
      licenseName: currentName,
    },
  });

  const onSubmit = async (values) => {
    setIsSubmit(true);
    console.log("values: ", values);
    try {
      if (values.licenseName && currentName &&
          values.licenseName.toLowerCase() === currentName.toLowerCase() &&
          values.licenseType === licenseTypeId) {
        toast.info("No changes were made");
        setIsSubmit(false);
        return;
      }

      const licenseExists = data.some(license =>
        license.license_id !== id &&
        license.license_name &&
        values.licenseName &&
        license.license_name.trim().toLowerCase() === values.licenseName.trim().toLowerCase() &&
        license.license_type_name === licenseType.find(type => type.value === values.licenseType)?.label
      );

      if (licenseExists) {
        toast.error("This license already exists");
        setIsSubmit(false); 
        return;
      }

      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const jsonData = {
        licenseType: values.licenseType,
        licenseName: values.licenseName,
        licenseId: id
      }
      const formData = new FormData();
      formData.append("operation", "updateLicenseMaster");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data: ", res.data);
      if (res.data === 1) {
        toast.success("License updated successfully");
        setIsOpen(false);
        getData();
      } else {
        toast.error("Failed to update license");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("UpdateLicenseMaster.jsx => onSubmit(): " + error);
    } finally {
      setIsSubmit(false);
    }
  };

  const getLicenseTypeDropdown = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append('operation', 'getLicenseType');
      const response = await axios.post(url, formData);
      const res = response.data;
      if (res !== 0) {
        const formattedLicenseType = res.map(item => ({
          value: item.license_type_id,
          label: item.license_type_name
        }));

        setLicenseType(formattedLicenseType);
      } else {
        setLicenseType([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("UpdateLicenseMaster.jsx ~ getLicenseTypeDropdown ~ error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      getLicenseTypeDropdown();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        licenseType: licenseTypeId,
        licenseName: currentName,
      });
    }
  }, [isOpen, licenseTypeId, currentName, form]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Edit2 className='cursor-pointer h-5 w-5' />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update License</DialogTitle>
        </DialogHeader>
        {isLoading ? <Spinner /> : (
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
                  <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                </DialogClose>
                <Button type="submit">{isSubmit && <Spinner />} {isSubmit ? 'Updating...' : 'Update'}</Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UpdateLicenseMaster
