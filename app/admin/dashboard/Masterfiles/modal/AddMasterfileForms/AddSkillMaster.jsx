"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState, useRef, useEffect } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import axios from "axios";
import { PlusSquare } from "lucide-react";
import {
  getDataFromSession,
  retrieveData,
  storeData,
  storeDataInSession,
} from "@/app/utils/storageUtils";

const formSchema = z.object({
  skillName: z.string().min(1, "Skill name is required"),
});

const AddSkillMaster = ({
  title,
  getData,
  data,
  addColumn,
  openState,
  closeState,
}) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skillName: "",
    },
  });

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const onSubmit = async (values) => {
    console.log("values ni skill: ", values);
    setIsSubmit(true);
    try {
      console.log("data ni skill: ", data);
      console.log("values ni skillname: ", values.skillName);
      console.log("data === null: ", data === undefined);
      const skillsList = JSON.parse(getDataFromSession("skillsList")) || [];
      console.log("skillsList: ", skillsList);
      let skillExists = false;
      if (data === undefined || data === null) {
        console.log("skillsList: ", skillsList);
        skillExists = skillsList.some(
          (skill) =>
            skill.label.trim().toLowerCase() ===
            values.skillName.trim().toLowerCase()
        );
      } else {
        skillExists =
          Array.isArray(data) &&
          data.some(
            (skill) =>
              skill.perS_name &&
              skill.perS_name.trim().toLowerCase() ===
                values.skillName.trim().toLowerCase()
          );
      }

      if (skillExists) {
        toast.error("This skill already exists");
        return;
      }

      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      formData.append("operation", "addSkills");
      formData.append("json", JSON.stringify(values));

      const res = await axios.post(url, formData);
      console.log("res.data ni skill: ", res.data);
      if (res.data !== 1) {
        if (data === undefined || data === null) {
          storeDataInSession(
            "skillsList",
            JSON.stringify([
              ...skillsList,
              { value: res.data, label: values.skillName },
            ])
          );
        }
        toast.success("Skill added successfully");
        addColumn(values, res.data);
        form.reset();
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } else {
        toast.error("Failed to add skill");
      }
    } catch (error) {
      toast.error("Network error");
      console.error("AddSkill.jsx ~ onSubmit ~ error:", error);
    } finally {
      setIsSubmit(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    form.reset();
  };

  return (
    <div>
      <Dialog
        open={openState ? openState : isOpen}
        onOpenChange={(open) => {
          closeState ? closeState() : (setIsOpen(open), !open && handleClose());
        }}
      >
        {openState === undefined && (
          <DialogTrigger asChild>
            <button>
              <PlusSquare className="h-5 w-5 text-primary" />
            </button>
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
                        name="skillName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skill Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter skill name"
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
                      <Button variant="outline" onClick={handleClose}>
                        Close
                      </Button>
                    </DialogClose>
                    <Button type="submit">
                      {isSubmit && <Spinner />}{" "}
                      {isSubmit ? "Submitting..." : "Submit"}
                    </Button>
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

export default AddSkillMaster;
