import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Spinner from '@/components/ui/spinner'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  }
}

const JobAppliedChart = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [chartData, setChartData] = useState([])

  const getAllJobWithCandidates = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "admin.php";
      const formData = new FormData();
      formData.append("operation", "getAllJobWithCandidates");
      const res = await axios.post(url, formData);
      console.log("res ni getAllJobWithCandidates: ", res.data);

      const filteredData = res.data !== 0 ? res.data.filter(job => job.Total_Applied > 0) : [];

      setChartData(filteredData);
    } catch (error) {
      toast.error("Network error");
      console.error("error ni getAllJobWithCandidates: ", error);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    getAllJobWithCandidates();
  }, []);

  return (
    <div>
      {isLoading ? <Spinner /> :
        <>
          <Card>
            <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
              <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                <CardTitle>Job Applications</CardTitle>
                <CardDescription>Number of applicants per job</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <ChartContainer config={chartConfig} className="w-full ">
                  <BarChart accessibilityLayer data={chartData}>
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
                    <Bar dataKey="Total_Applied" fill="var(--color-desktop)" radius={4} />
                  </BarChart>

                </ChartContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </>
      }
    </div>
  )
}

export default JobAppliedChart