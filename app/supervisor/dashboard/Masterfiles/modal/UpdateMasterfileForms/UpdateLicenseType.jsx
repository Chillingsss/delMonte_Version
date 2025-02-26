import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const formSchema = z.object({
  licenseTypeName: z.string().min(1, "License type name is required"),
});

const UpdateLicenseType = ({ data, id, currentName, getData }) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licenseTypeName: currentName,
    },
  });

  const onSubmit = async (values) => {
    setIsSubmit(true);
    try {
      if (values.licenseTypeName === currentName) {
        toast.info('No changes made');
        setIsSubmit(false);
        return;
      }
      const isLicenseTypeExists = data.some(licenseType =>
        licenseType.license_type_name.trim().toLowerCase() === values.licenseTypeName.trim().toLowerCase()
      );

      if (isLicenseTypeExists) {
        toast.error('This license type already exists');
        setIsSubmit(false);
        return;
      }
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';

      const jsonData = {
        licenseTypeName: values.licenseTypeName,
        licenseTypeId: id,
      }

      const formData = new FormData();
      formData.append("operation", "updateLicenseType");
      formData.append("json", JSON.stringify(jsonData));

      const res = await axios.post(url, formData);
      console.log("res.data: ", res.data);
      if (res.data === 1) {
        toast.success('License type updated successfully');
        setIsOpen(false);
        getData();
      } else {
        toast.error('Failed to update license type');
      }
    } catch (error) {
      toast.error('Failed to update license type');
      console.error('UpdateLicenseType.jsx ~ onSubmit ~ error:', error);
    } finally {
      setIsSubmit(false);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        licenseTypeName: currentName,
      });
    }
  }, [isOpen, currentName, form]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <button><Edit2 className="h-5 w-5 cursor-pointer" /></button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update License Type</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Form {...form}>
            <FormField
              control={form.control}
              name="licenseTypeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>License Type Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter license type name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end mt-4 gap-2">
              <Button type="button" onClick={() => setIsOpen(false)} variant="outline">Cancel</Button>
              <Button type="submit" disabled={isSubmit}>
                {isSubmit ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </Form>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateLicenseType
