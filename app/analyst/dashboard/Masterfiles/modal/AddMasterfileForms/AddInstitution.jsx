"use client"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import React, { useState, useRef, useEffect } from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import { PlusSquare } from 'lucide-react';

const formSchema = z.object({
  institutionName: z.string().min(1, 'Institution name is required'),
});

const AddInstitution = ({ title, getData, data, addColumn }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);
  const inputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      institutionName: '',
    },
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const onSubmit = async (values) => {
    console.log("values ni institution: ", values);
    setIsSubmit(true);
    try {
      const institutionExists = data.some(institution => 
        institution.institution_name.toLowerCase() === values.institutionName.toLowerCase()
      );

      if (institutionExists) {
        toast.error("This institution already exists");
        setIsLoading(false);
        setIsSubmit(false);
        return;
      }

      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append('operation', 'addInstitution');
      formData.append('json', JSON.stringify(values));

      const res = await axios.post(url, formData);
      console.log("res.data ni institution: ", res.data);
      if (res.data !== 1) {
        toast.success('Institution added successfully');
        addColumn(values, res.data);
        form.reset();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } else {
        toast.error('Failed to add institution');
      }
    } catch (error) {
      toast.error('Network error');
      console.error('AddInstitution.jsx ~ onSubmit ~ error:', error);
    } finally {
      setIsSubmit(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    form.reset();
  }

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
                        control={form.control}
                        name="institutionName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter institution name" {...field} ref={inputRef} />
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
  );
};

export default AddInstitution;
