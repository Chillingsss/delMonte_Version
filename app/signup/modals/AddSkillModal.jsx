"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import ComboBox from "@/app/my_components/combo-box";
import { z } from "zod";
import { retrieveData } from "@/app/utils/storageUtils";

function AddSkillModal({ open, onHide, skillList }) {

  const formSchema = z.object({
    skills: z.number().min(1, {
      message: "This field is required",
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skills: 0,
    },
  });

  const onSubmit = (values) => {
    try {
      const selectedSkills = JSON.parse(retrieveData("skills")) || [];
      let isValid = true;

      selectedSkills.forEach((element) => {
        if (element.skills === values.skills) {
          toast.error("You already have this skill");
          isValid = false;
        }
      });

      if (isValid) {
        onHide(values);
        form.reset();
      }
    } catch (error) {
      toast.error("Network error");
      console.log("AddSkillModal.jsx => onSubmit(): " + error);
    }
  };


  const handleHide = () => {
    onHide(0);
  };


  return (
    <>
      <Dialog open={open} onOpenChange={handleHide}>
        <DialogOverlay className="bg-black/5" />
        <DialogContent className="bg-[#0e5a35]">
          <DialogHeader>
            <DialogTitle className="text-3xl">Add Skill</DialogTitle>
          </DialogHeader>
          <div className="w-full">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} >
                <div className="flex justify-center items-center p-4 sm:p-6">
                  <div className="space-y-2 sm:space-y-3 w-full max-w-8xl">
                    <FormField
                      name="skills"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skill</FormLabel>
                          <div>
                            <ComboBox
                              list={skillList}
                              subject="Skill"
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex flex-cols gap-2 justify-end mr-7">
                  <DialogClose asChild>
                    <Button className="bg-[#0e4028] text-white">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-[#0b864a] text-white">Add Skill</Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddSkillModal;
