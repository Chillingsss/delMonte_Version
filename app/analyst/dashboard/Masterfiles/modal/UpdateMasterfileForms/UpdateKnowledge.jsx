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
  knowledgeName: z.string().min(1, "Knowledge name is required"),
});

const UpdateKnowledge = ({ data, id, currentName, getData }) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      knowledgeName: currentName,
    },
  });

  const onSubmit = async (values) => {
    console.log("values for update knowledge: ", values);
    setIsSubmit(true);
    try {
      if (values.knowledgeName === currentName) {
        toast.info('No changes made');
        setIsSubmit(false);
        return;
      }
      const isKnowledgeExists = data.some(knowledge =>
        knowledge.knowledge_name.trim().toLowerCase() === values.knowledgeName.trim().toLowerCase()
      );

      if (isKnowledgeExists) {
        toast.error('This knowledge already exists');
        setIsSubmit(false);
        return;
      }
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';

      const jsonData = {
        knowledgeName: values.knowledgeName,
        knowledgeId: id,
      }

      const formData = new FormData();
      formData.append("operation", "updateKnowledge");
      formData.append("json", JSON.stringify(jsonData));

      const res = await axios.post(url, formData);
      console.log("res.data for update knowledge: ", res);
      if (res.data === 1) {
        toast.success('Knowledge updated successfully');
        setIsOpen(false);
        getData();
      } else {
        toast.error('Failed to update knowledge');
      }
    } catch (error) {
      toast.error('Failed to update knowledge');
      console.error('UpdateKnowledge.jsx ~ onSubmit ~ error:', error);
    } finally {
      setIsSubmit(false);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        knowledgeName: currentName,
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
          <DialogTitle>Update Knowledge</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Form {...form}>
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

export default UpdateKnowledge
