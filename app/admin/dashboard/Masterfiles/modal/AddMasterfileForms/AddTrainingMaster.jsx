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
import { retrieveData, storeData } from '@/app/utils/storageUtils';

const formSchema = z.object({
  trainingName: z.string().min(1, 'Training name is required'),
});

const AddTrainingMaster = ({ title, getData, data, addColumn, openState, closeState }) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainingName: '',
    },
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const onSubmit = async (values) => {
    console.log("values ni training: ", values);
    setIsSubmit(true);
    try {
      console.log("data ni training: ", data);
      console.log("values ni trainingName: ", values.trainingName);
      console.log("data === null: ", data === undefined);
      const trainingList = JSON.parse(retrieveData("trainingList")) || [];
      let trainingExists = false;
      if (data === undefined || data === null) {
        console.log("trainingList: ", trainingList);
        trainingExists = trainingList.some(training =>
          training.label.trim().toLowerCase() === values.trainingName.trim().toLowerCase()
        );
      } else {
        trainingExists = Array.isArray(data) && data.some(training =>
          training.perT_name && training.perT_name.trim().toLowerCase() === values.trainingName.trim().toLowerCase()
        );
      }

      if (trainingExists) {
        toast.error("This training already exists");
        return;
      }

      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append('operation', 'addTraining');
      formData.append('json', JSON.stringify(values));

      const res = await axios.post(url, formData);
      console.log("res.data ni training: ", res.data);
      if (res.data !== 1) {
        if (data === undefined || data === null) {
          storeData("trainingList", JSON.stringify([...trainingList, { value: res.data, label: values.trainingName }]));
        }
        toast.success('Training added successfully');
        if (typeof addColumn === 'function') {
          addColumn(values, res.data);
        }
        form.reset();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } else {
        toast.error('Failed to add training');
      }
    } catch (error) {
      toast.error('Network error');
      console.error('AddTrainingMaster.jsx ~ onSubmit ~ error:', error);
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
      <Dialog open={openState ? openState : isOpen} onOpenChange={(open) => {
        closeState ? closeState() : (setIsOpen(open), !open && handleClose());
      }}>
        {openState === undefined && (
          <DialogTrigger asChild>
            <button><PlusSquare className="h-5 w-5 text-primary" /></button>
          </DialogTrigger>
        )}

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
                        name="trainingName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Training Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter training name"
                                {...field}
                                ref={inputRef}
                              />
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

export default AddTrainingMaster;
