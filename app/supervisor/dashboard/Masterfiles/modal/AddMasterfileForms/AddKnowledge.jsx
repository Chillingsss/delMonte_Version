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
  knowledgeName: z.string().min(1, 'Knowledge name is required'),
});

const AddKnowledge = ({ title, getData, data, addColumn }) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      knowledgeName: '',
    },
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const onSubmit = async (values) => {
    console.log("values ni knowledge: ", values);
    setIsSubmit(true);
    try {
      console.log("data ni knowledge: ", data);
      console.log("values ni knowledgename: ", values.knowledgeName);
      const knowledgeExists = data.some(knowledge =>
        knowledge.knowledge_name.trim().toLowerCase() === values.knowledgeName.trim().toLowerCase()
      );

      if (knowledgeExists) {
        toast.error("This knowledge and compliance already exists");
        setIsLoading(false);
        return;
      }

      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';
      const formData = new FormData();
      formData.append('operation', 'addKnowledge');
      formData.append('json', JSON.stringify(values));

      const res = await axios.post(url, formData);
      console.log("res.data ni knowledge: ", res.data);
      if (res.data !== 1) {
        toast.success('Knowledge added successfully');
        addColumn(values, res.data);
        form.reset();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } else {
        toast.error('Failed to add knowledge');
      }
    } catch (error) {
      toast.error('Network error');
      console.error('AddKnowledge.jsx ~ onSubmit ~ error:', error);
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
                        name="knowledgeName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Knowledge Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter knowledge name" 
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

export default AddKnowledge;
