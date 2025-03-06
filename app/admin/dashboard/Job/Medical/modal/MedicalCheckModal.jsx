import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Spinner from '@/components/ui/spinner';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ComboBox from "@/app/my_components/combo-box";
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { getDataFromCookie } from '@/app/utils/storageUtils';


const MedicalCheckModal = ({ candId, getCandidateProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [medicalClassification, setMedicalClassification] = useState([]);

  const formSchema = z.object({
    medicalC: z.number().min(1, {
      message: "This field is required",
    }),
    // points: z
    //   .string()
    //   .min(1, {
    //     message: "This field is required",
    //   })
    //   .refine((value) => !isNaN(Number(value)), {
    //     message: "Points must be a number",
    //   }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicalC: 0,
      candId: candId,
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      // const tokenData = getDataFromCookie("auth_token");
      const jsonData = {
        medicalCId: values.medicalC,
        candId: candId,
        hrId: 1,
      }

      console.log("jsonData", jsonData);

      const formData = new FormData();
      formData.append("operation", "addMedicalMaster");
      formData.append("json", JSON.stringify(jsonData));
      const res = await axios.post(url, formData);
      console.log("res.data ni onSubmit: ", res);
      if (res.data === 1) {
        toast.success("Success!");
        getCandidateProfile();
        setIsOpen(false);
      } else {
        toast.error("There's something wrong");
        console.log("SelectedApplicant.jsx => onSubmit(): " + res.data);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("SelectedApplicant.jsx => onSubmit(): " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMedicalClassification = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      formData.append("operation", "getMedicalClassification");
      const res = await axios.post(url, formData);
      console.log("res.data ni getMedicalClassification: ", res);
      if (res.data !== 0) {
        const formattedMedicalC = res.data.map((item) => ({
          value: item.medicalC_id,
          label: item.medicalC_name,
        }));
        setMedicalClassification(formattedMedicalC);
      } else {
        setMedicalClassification([]);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("MedicalPage.jsx ~ getMedicalClassification(): " + error);
    } finally {
      setIsLoading(false);
    }
  }


  useEffect(() => {
    if (isOpen) {
      getMedicalClassification();
    }
  }, [isOpen]);

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger>
          <Button>Medical Check</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Medical Check</DialogTitle>
          <DialogDescription />
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    name="medicalC"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical classification</FormLabel>
                        <div>
                          <ComboBox
                            list={medicalClassification}
                            subject="medical classification"
                            value={field.value}
                            onChange={field.onChange}
                            styles={"bg-background"}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end mt-3">
                    <Button type="submit">Submit</Button>
                  </div>
                </form>
              </Form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MedicalCheckModal