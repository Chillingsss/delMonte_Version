"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import ComboBox from "@/app/my_components/combo-box";
import { z } from "zod";
import { retrieveData } from "@/app/utils/storageUtils";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

function AddLicense({ open, onHide, licenseType, licenseList }) {

  const [licenseData, setLicenseData] = useState([]);
  const [selectedLicenseType, setSelectedLicenseType] = useState(0);

  const formSchema = z.object({
    licenseType: z.number().min(1, {
      message: "This field is required",
    }),
    license: z.number().min(1, {
      message: "This field is required",
    }),
    licenseNumber: z.string().min(1, {
      message: "This field is required",
    })
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      licenseType: 0,
      license: 0,
      licenseNumber: "",
    },
  });

  const onSubmit = (values) => {
    try {
      const selectedLicense = JSON.parse(retrieveData("licenses")) || [];
      let isValid = true;
      selectedLicense.forEach((element) => {
        if (element.license === values.license) {
          toast.error("You already have this license");
          isValid = false;
        }
      });

      if (isValid) {
        onHide(values);
        form.reset();
      }
    } catch (error) {
      toast.error("Network error");
      console.log("AddLicense.jsx => onSubmit(): " + error);
    }
  };

  const handleHide = () => {
    onHide(0);
  };

  useEffect(() => {
    console.log("AddLicense.jsx => licenseList:", licenseList);
    console.log("AddLicense.jsx => licenseType:", licenseType);
    console.log("AddLicense.jsx => selectedLicenseType:", selectedLicenseType);
    const filteredLicenses = licenseList.filter((license) => license.type === selectedLicenseType);
    setLicenseData(filteredLicenses);
  }, [selectedLicenseType, licenseList, licenseType]);


  return (
    <>
      <Dialog open={open} onOpenChange={handleHide}>
        <DialogOverlay className="bg-black/5" />
        <DialogContent className="bg-[#0e5a35]">
          <DialogHeader>
            <DialogTitle className="text-3xl">Add License</DialogTitle>
          </DialogHeader>
          <div className="w-full">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} >
                <div className="flex justify-center items-center p-4 sm:p-6">
                  <div className="space-y-2 sm:space-y-3 w-full max-w-8xl">
                    <FormField
                      name="licenseType"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Type</FormLabel>
                          <div>
                            <ComboBox
                              list={licenseType}
                              subject="License Type"
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                                form.trigger("licenseType");
                                setSelectedLicenseType(value);
                              }}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.getValues("licenseType") !== 0 && (
                      <>
                        <FormField
                          name="license"
                          control={form.control}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>License</FormLabel>
                              <div>
                                <ComboBox
                                  list={licenseData}
                                  subject="License"
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="licenseNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>License Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter license number" {...field} className="bg-[#0e4028] border-2 border-[#0b864a]" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-cols gap-2 justify-end mr-7">
                  <DialogClose asChild>
                    <Button className="bg-[#0e4028] text-white">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-[#0b864a] text-white">Add License</Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AddLicense;
