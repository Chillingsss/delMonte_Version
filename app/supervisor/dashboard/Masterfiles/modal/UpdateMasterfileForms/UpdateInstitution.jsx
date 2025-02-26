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
  institutionName: z.string().min(1, "Institution name is required"),
});

const UpdateInstitution = ({ data, id, currentName, getData }) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      institutionName: currentName,
    },
  });

  const onSubmit = async (values) => {
    console.log("values for update institution: ", values);
    setIsSubmit(true);
    try {
      if (values.institutionName === currentName) {
        toast.info('No changes made');
        setIsSubmit(false);
        return;
      }
      const isInstitutionExists = data.some(institution =>
        institution.institution_name.trim().toLowerCase() === values.institutionName.trim().toLowerCase()
      );

      if (isInstitutionExists) {
        toast.error('This institution already exists');
        setIsSubmit(false);
        return;
      }
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';

      const jsonData = {
        institutionName: values.institutionName,
        institutionId: id,
      }

      const formData = new FormData();
      formData.append("operation", "updateInstitution");
      formData.append("json", JSON.stringify(jsonData));

      const res = await axios.post(url, formData);
      console.log("res.data for update institution: ", res);
      if (res.data === 1) {
        toast.success('Institution updated successfully');
        setIsOpen(false);
        getData();
      } else {
        toast.error('Failed to update institution');
      }
    } catch (error) {
      toast.error('Failed to update institution');
      console.error('UpdateInstitution.jsx ~ onSubmit ~ error:', error);
    } finally {
      setIsSubmit(false);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        institutionName: currentName,
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
          <DialogTitle>Update Institution</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Form {...form}>
            <FormField
              control={form.control}
              name="institutionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter institution name"
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

export default UpdateInstitution
