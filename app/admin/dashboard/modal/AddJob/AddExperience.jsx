"use client"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import React from 'react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

function AddExperience({ open, onHide }) {

  const formSchema = z.object({
    yearsOfExperience: z.string()
      .min(1, { message: "This field is required" })
      .refine((value) => !isNaN(Number(value)), {
        message: "Years of experience must be a number",
      })
      .refine((value) => Number(value) <= 50, {
        message: "Years of experience should not be more than 50",
      })
      .refine((value) => Number(value) >= 0, {
        message: "Years of experience should not be less than 0",
      }),
    jobExperience: z.string().min(1, {
      message: "This field is required",
    }),
    points: z.string().min(1, {
      message: "This field is required",
    }).refine((value) => !isNaN(Number(value)), {
      message: "Points must be a number",
    })
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      yearsOfExperience: "",
      jobExperience: "",
      points: "",
    },
  });

  const onSubmit = (values) => {
    try {
      onHide(values);
      form.reset();
    } catch (error) {
      toast.error("Network error");
      console.log("AddExperience.jsx => onSubmit(): " + error);
    }
  };

  const handleOnHide = () => {
    onHide(0);
  }
  return (
    <>
      <Dialog open={open} onOpenChange={handleOnHide}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">Add Experience</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex justify-center items-center">
                <div className="space-y-2 sm:space-y-3 w-full max-w-8xl">
                  <FormField
                    control={form.control}
                    name="yearsOfExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year/s of Experience</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter years of experience" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Experience Description</FormLabel>
                        <FormControl>
                          <Textarea style={{ height: "200px" }} placeholder="Enter description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="points"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter points" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex flex-cols gap-2 justify-end mt-5">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Add Job Experience</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddExperience