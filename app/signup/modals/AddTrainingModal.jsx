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

function AddTrainingModal({ open, onHide, trainingList }) {

  const formSchema = z.object({
    training: z.number().min(1, {
      message: "This field is required",
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      training: 0,
    },
  });

  const onSubmit = (values) => {
    console.log("AddTrainingModal.jsx => onSubmit():", values);
    try {
      const selectedTraining = JSON.parse(retrieveData("training")) || [];
      let isValid = true;

      selectedTraining.forEach((element) => {
        if (element.training === values.training) {
          toast.error("You already have this training");
          isValid = false;
        }
      });

      if (isValid) {
        onHide(values);
        form.reset();
      }
    } catch (error) {
      toast.error("Network error");
      console.log("AddTrainingModal.jsx => onSubmit(): " + error);
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
            <DialogTitle className="text-3xl">Add Training</DialogTitle>
          </DialogHeader>
          <div className="w-full">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} >
                <div className="flex justify-center items-center p-4 sm:p-6">
                  <div className="space-y-2 sm:space-y-3 w-full max-w-8xl">
                    <FormField
                      name="training"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Training</FormLabel>
                          <div>
                            <ComboBox
                              list={trainingList}
                              subject="Training"
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
                  <Button type="submit" className="bg-[#0b864a] text-white">Add Training</Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddTrainingModal;
