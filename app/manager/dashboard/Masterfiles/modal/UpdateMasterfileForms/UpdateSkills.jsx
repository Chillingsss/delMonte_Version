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
  skillName: z.string().min(1, "Skill name is required"),
});

const UpdateSkills = ({ data, id, currentName, getData }) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skillName: currentName,
    },
  });

  const onSubmit = async (values) => {
    setIsSubmit(true);
    try {
      if (values.skillName === currentName) {
        toast.info('No changes made');
        setIsSubmit(false);
        return;
      }
      const isSkillExists = data.some(skill =>
        skill.skill_name && skill.skill_name.toLowerCase() === values.skillName.toLowerCase()
      );

      if (isSkillExists) {
        toast.error('This skill already exists');
        setIsSubmit(false);
        return;
      }
      const url = process.env.NEXT_PUBLIC_API_URL + 'admin.php';

      const jsonData = {
        skillName: values.skillName,
        skillId: id,
      }

      const formData = new FormData();
      formData.append("operation", "updateSkill");
      formData.append("json", JSON.stringify(jsonData));

      const res = await axios.post(url, formData);
      console.log("res.data: ", res.data);
      if (res.data === 1) {
        toast.success('Skill updated successfully');
        setIsOpen(false);
        getData();
      } else {
        toast.error('Failed to update skill');
      }
    } catch (error) {
      toast.error('Failed to update skill');
      console.error('UpdateSkills.jsx ~ onSubmit ~ error:', error);
    } finally {
      setIsSubmit(false);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        skillName: currentName,
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
          <DialogTitle>Update Skill</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Form {...form}>
            <FormField
              control={form.control}
              name="skillName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter skill name"
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

export default UpdateSkills
