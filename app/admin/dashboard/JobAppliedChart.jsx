import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Spinner from '@/components/ui/spinner'
import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import SelectedJob from './Job/modal/SelectedJob'
import { DateRangePicker } from '@/app/my_components/DateRangePicker'

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#004F39",
  }
}

const formatToJobMDate = (date) => {
  if (!date) return null;
  const adjustedDate = new Date(date);
  adjustedDate.setHours(0, 0, 0, 0);

  const year = adjustedDate.getFullYear();
  const month = String(adjustedDate.getMonth() + 1).padStart(2, "0");
  const day = String(adjustedDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day} 00:00:00`;
};

const JobAppliedChart = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [chartData, setChartData] = useState([])
  const [filteredData, setFilteredData] = useState([]) // Store filtered data

  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });

  const [showSelectedJobModal, setShowSelectedJobModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(0);

  const closeShowSelectedJobModal = () => {
    setShowSelectedJobModal(false);
  };

  const getAllJobWithCandidates = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      formData.append("operation", "getAllJobWithCandidates");
      const res = await axios.post(url, formData);
      console.log("res ni getAllJobWithCandidates: ", res.data);

      const filteredData = res.data !== 0 ? res.data.filter(job => job.Total_Applied > 0) : [];

      setChartData(filteredData);
      filterData(filteredData, dateRange.from, dateRange.to);
    } catch (error) {
      toast.error("Network error");
      console.error("error ni getAllJobWithCandidates: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.from, dateRange.to]);

  useEffect(() => {
    getAllJobWithCandidates();
  }, [getAllJobWithCandidates]);

  useEffect(() => {
    filterData(chartData, dateRange.from, dateRange.to);
  }, [dateRange, chartData]);

  const filterData = (data, from, to) => {
    if (!data.length) return;

    const filtered = data.filter(job => {
      const jobDate = new Date(job.jobM_createdAt);
      return jobDate >= from && jobDate <= to;
    });

    setFilteredData(filtered);
  };

  const handleDateUpdate = (values) => {
    setDateRange({
      from: values.range.from,
      to: values.range.to,
    });
  };

  const handleBarClick = (data) => {
    setSelectedJobId(data.jobM_id);
    setShowSelectedJobModal(true);
  };

  return (
    <div>
      {isLoading ? <Spinner /> :
        <>
          <Card>
            <CardHeader className="grid grid-cols-1 sm:grid-cols-2 justify-center gap-1 px-6 py-5 sm:py-6">
              <div>
                <CardTitle>Job Applications</CardTitle>
                <CardDescription>Number of applicants per job</CardDescription>
              </div>
              <div className='justify-self-end'>
                <DateRangePicker
                  onUpdate={handleDateUpdate}
                  initialDateFrom={dateRange.from}
                  initialDateTo={dateRange.to}
                  align="start"
                  locale="en-GB"
                  showCompare={false}
                />
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
              {filteredData.length > 0 ? (
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                  <ChartContainer config={chartConfig} className="w-full">
                    <BarChart accessibilityLayer data={filteredData}>
                      <CartesianGrid vertical={false} />
                      <YAxis />
                      <XAxis
                        dataKey="jobM_title"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        tickFormatter={(value) => value.length > 10 ? value.slice(0, 3) + "..." : value}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="Total_Applied"
                        fill="var(--color-desktop)"
                        radius={4}
                        onClick={handleBarClick}
                        className='hover:cursor-pointer'
                      />
                    </BarChart>
                  </ChartContainer>
                </ChartContainer>
              ) : (
                <div className="text-center text-gray-500 py-10">No data found for this date range.</div>
              )}
            </CardContent>

          </Card>
        </>
      }

      {showSelectedJobModal && (
        <SelectedJob
          open={showSelectedJobModal}
          onHide={closeShowSelectedJobModal}
          jobId={selectedJobId}
          getJobs={getAllJobWithCandidates}
        />
      )}
    </div>
  )
}

export default JobAppliedChart;
