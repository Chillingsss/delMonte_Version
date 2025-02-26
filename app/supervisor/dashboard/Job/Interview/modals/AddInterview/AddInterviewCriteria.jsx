import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useEffect } from "react";
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
import { getDataFromSession, retrieveData } from "@/app/utils/storageUtils";
import ComboBox from "@/app/my_components/combo-box";

function AddInterviewCriteria({
  open,
  onHide,
  interviewCriteria,
  addCriteria,
}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [interviewCategory, setInterviewCategory] = React.useState([]);
  const [allInterviewCriteriaList, setAllInterviewCriteriaList] =
    React.useState([]);
  const [interviewCriteriaList, setInterviewCriteriaList] = React.useState([]);

  const formSchema = z.object({
    points: z
      .string()
      .min(1, {
        message: "This field is required",
      })
      .refine((value) => !isNaN(Number(value)), {
        message: "Points must be a number",
      }),
    interviewQuestion: z.string().min(1, {
      message: "This field is required",
    }),
    interviewCriteria: z.number().min(1, {
      message: "This field is required",
    }),
    interviewCategory: z.number().min(1, {
      message: "This field is required",
    }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      points: "",
      interviewQuestion: "",
      interviewCriteria: 0,
      interviewCategory: 0,
    },
  });

  const getInterviewCategory = async () => {
    const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
    const formData = new FormData();
    formData.append("operation", "getCriteriaAndCategory");
    const response = await axios.post(url, formData);
    const res = response.data;

    if (res !== 0) {
      const formattedCategory = res.category.map((item) => ({
        label: item.interview_categ_name,
        value: item.interview_categ_id,
      }));
      const formattedCriteria = res.criteria.map((item) => ({
        label: item.criteria_inter_name,
        value: item.criteria_inter_id,
        categoryId: item.criteria_inter_categId,
      }));
      setInterviewCategory(formattedCategory);
      setAllInterviewCriteriaList(formattedCriteria);
      setInterviewCriteriaList(formattedCriteria);
    } else {
      setInterviewCategory([]);
    }
  };

  const handleCategoryChange = (categoryId) => {
    const filteredCriteria = allInterviewCriteriaList.filter(
      (criteria) => criteria.categoryId === categoryId
    );
    form.setValue("interviewCriteria", 0);
    setInterviewCriteriaList(filteredCriteria);
  };

  const onSubmit = async (values) => {
    console.log("Submitted values:", values);
    console.log("Current interviewCriteria list:", interviewCriteria);
    const isDuplicate = interviewCriteria.some(
      (element) => element.criteria_inter_id === values.interviewCriteria
    );

    if (isDuplicate) {
      toast.error("Criteria already exists");
      setIsLoading(false);
      return;
    }
    try {
      const jsonData = {
        jobId: getDataFromSession("jobId"),
        criteriaId: values.interviewCriteria,
        points: values.points,
        question: values.interviewQuestion,
      };

      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      formData.append("operation", "addInterviewCriteriaMaster");
      formData.append("json", JSON.stringify(jsonData));

      const res = await axios.post(url, formData);

      if (res.data !== 0) {
        toast.success("Criteria added successfully");

        const returnData = {
          category: interviewCategory.find(
            (item) => item.value === form.getValues("interviewCategory")
          )?.label,
          name: allInterviewCriteriaList.find(
            (item) => item.value === form.getValues("interviewCriteria")
          )?.label,
          points: values.points,
          question: values.interviewQuestion,
          criteriaId: values.interviewCriteria,
        };
        addCriteria(returnData);
      }
    } catch (error) {
      toast.error("Network error");
      console.error("Error in onSubmit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnHide = () => {
    onHide(1);
  };

  useEffect(() => {
    getInterviewCategory();
  }, []);

  return (
    <div>
      <Dialog open={open} onOpenChange={handleOnHide}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Interview Criteria</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex justify-center items-center">
                <div className="space-y-2 sm:space-y-3 w-full max-w-8xl">
                  <FormField
                    name="interviewCategory"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interview Category</FormLabel>
                        <ComboBox
                          list={interviewCategory}
                          subject="category"
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            handleCategoryChange(value);
                          }}
                          styles={"bg-background"}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.getValues("interviewCategory") !== 0 && (
                    <>
                      <FormField
                        name="interviewCriteria"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Interview Criteria</FormLabel>
                            <ComboBox
                              list={interviewCriteriaList}
                              subject="criteria"
                              value={field.value}
                              onChange={field.onChange}
                              styles={"bg-background"}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="interviewQuestion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Interview Question</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter question" {...field} />
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
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-cols gap-2 justify-end mt-5">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Spinner />} Submit
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddInterviewCriteria;
