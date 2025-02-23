import DataTable from "@/app/my_components/DataTable";
import DatePicker from "@/app/my_components/DatePicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { date, z } from "zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { getDataFromSession } from "@/app/utils/storageUtils";
import axios from "axios";
import Spinner from "@/components/ui/spinner";
import { set } from "date-fns";

const SetToInterviewModal = ({
  datas,
  passingPercentage = 0,
  getPendingCandidates,
  isBatch = true,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState([]);
  const [selectedData, setSelectedData] = useState([]);

  const formSchema = z.object({
    date: z.string().min(1, { message: "This field is required" }),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const candidates = isBatch
        ? selectedData.map((candidate) => ({
          fullName: candidate.FullName,
          candId: candidate.cand_id,
          candEmail: candidate.cand_email,
        }))
        : [
          {
            fullName: data.cand_lastname + ", " + data.cand_firstname,
            candId: data.cand_id,
            candEmail: data.cand_email,
          },
        ];

      const jsonData = {
        candidates: candidates,
        jobId: getDataFromSession("jobId"),
        date: values.date,
      };
      console.log("jsonData", jsonData);
      const formData = new FormData();
      console.log("jsonData: ", jsonData);
      formData.append("operation", "batchSetInterview");
      formData.append("json", JSON.stringify(jsonData));

      const res = await axios.post(url, formData);
      console.log("res: ", res);

      if (res.data === 1) {
        getPendingCandidates();
        toast.success("Set to interview successfully");
        form.reset();
        setIsOpen(false);
      } else {
        toast.error("Failed to set candidates to interview");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("SetToInterviewModal.jsx => onSubmit(): " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    if (selectedData.length === 0) {
      toast.error("Please select at least one candidate");
      return;
    }
    setTabIndex(tabIndex + 1);
  };

  const handlePrevPage = () => {
    // setSelectedData([]);
    setTabIndex(tabIndex - 1);
  };

  useEffect(() => {
    console.log("datas: ", datas);
    console.log("passingPercentage: ", passingPercentage);
    if (isOpen) {
      if (isBatch) {
        const filteredData = datas.filter(
          (data) =>
            Number(data.percentage) >= Number(passingPercentage) &&
            (data.status_name === "Pending" || data.status_name === "Processed")
        );
        console.log("datas: ", filteredData);
        setData(filteredData);
        if (filteredData.length === 0) {
          setIsOpen(false);
          toast.error("No candidates to set to interview");
        }
      } else {
        setData(datas);
      }
    }
  }, [datas, isBatch, isOpen, passingPercentage]);

  const columns = [
    { header: "Full Name", accessor: "FullName" },
    { header: "Status", accessor: "status_name" },
  ];

  const handleModalClose = (isOpen) => {
    setIsOpen(isOpen);
    if (!isOpen) {
      setSelectedData([]);
      setTabIndex(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogTrigger>
        <Button className="mr-1">
          {isBatch ? "Batch set to interview" : "Set to interview"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isBatch
              ? "Set all passed applicants to interview"
              : "Set applicant to interview"}
          </DialogTitle>
        </DialogHeader>
        <Separator className="mt-2" />
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {tabIndex === 0 && (
              <>
                <div className="px-3">
                  {isBatch ? (
                    <DataTable
                      columns={columns}
                      data={data}
                      itemsPerPage={5}
                      hideSearch={true}
                      isSelectable={true}
                      selectedData={setSelectedData}
                    />
                  ) : (
                    <>
                      <DialogDescription>
                        Are you sure you want to set this applicant for
                        interview?
                      </DialogDescription>
                    </>
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-3">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={handleNextPage}>Next</Button>
                </div>
              </>
            )}

            {tabIndex === 1 && (
              <>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <DatePicker
                            form={form}
                            name={field.name}
                            label="Pick a date for interview"
                            pastAllowed={false}
                            withTime={true}
                          />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2 mt-3">
                      <Button variant="outline" onClick={handlePrevPage}>
                        Previous
                      </Button>
                      <Button type="submit">Submit</Button>
                    </div>
                  </form>
                </Form>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SetToInterviewModal;
