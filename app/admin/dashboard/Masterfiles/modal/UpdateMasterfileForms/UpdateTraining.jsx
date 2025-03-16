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
  trainingName: z.string().min(1, "Training name is required"),
  percentage: z.string().min(1, {
    message: "This field is required",
  })
    .refine((val) => {
      if (parseInt(val) < 0 || parseInt(val) > 100) {
        return false;
      }
      return true;
    })
    .refine((value) => !isNaN(Number(value)), {
      message: "This field must be a number",
    }),
});

const UpdateTraining = ({ data, id, currentName, currentPercent, getData }) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainingName: currentName,
      percentage: currentPercent?.toString() || "",
    },
  });

  const onSubmit = async (values) => {
    setIsSubmit(true);
    try {
      if (values.trainingName === currentName && Number(values.percentage) === Number(currentPercent)) {
        toast.info('No changes made');
        setIsSubmit(false);
        return;
      }

      // Check if another training has the same name but a different ID
      const isTrainingExists = data.some(training =>
        training.perT_id !== id && // Ignore the current training being edited
        training.perT_name && training.perT_name.toLowerCase() === values.trainingName.toLowerCase()
      );

      if (isTrainingExists) {
        toast.error('This training already exists');
        setIsSubmit(false);
        return;
      }

      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';

      const jsonData = {
        trainingName: values.trainingName,
        trainingId: id,
        percentage: values.percentage,
      };

      const formData = new FormData();
      formData.append("operation", "updateTraining");
      formData.append("json", JSON.stringify(jsonData));

      const res = await axios.post(url, formData);
      console.log("res.data: ", res.data);

      if (res.data === 1) {
        toast.success('Training updated successfully');
        setIsOpen(false);
        getData();
      } else {
        toast.error('Failed to update training');
      }
    } catch (error) {
      toast.error('Failed to update training');
      console.error('UpdateTraining.jsx ~ onSubmit ~ error:', error);
    } finally {
      setIsSubmit(false);
    }
  };



  useEffect(() => {
    if (!isOpen) {
      form.reset({
        trainingName: currentName,
        percentage: currentPercent?.toString() || "",
      });
    }
  }, [isOpen, currentName, form, currentPercent]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <button><Edit2 className="h-5 w-5 cursor-pointer" /></button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Training</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Form {...form}>
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentage</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter percentage"
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

export default UpdateTraining
