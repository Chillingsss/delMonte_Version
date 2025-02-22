"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import JobDetailsModal from "./modal/jobDetails";
import { getDataFromCookie } from "../utils/storageUtils";
import { Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import { lineSpinner } from "ldrs";
import Image from "next/image";

const sliderImages = [
  {
    url: "/assets/images/pic3.jpg",
    title: "Join Our Team at Del Monte",
    description: "Build your career with a global leader in food innovation",
  },
  {
    url: "/assets/images/pic2.jpg",
    title: "Growing Together",
    description: "Discover opportunities that nurture growth and excellence",
  },
  {
    url: "/assets/images/pic4.jpg",
    title: "Innovation Starts Here",
    description: "Be part of our mission to deliver quality and innovation",
  },
  {
    url: "/assets/images/pic.jpg",
    title: "Shape the Future of Food",
    description:
      "Create impact with a company that values sustainability and excellence",
  },
];

export default function LandingArea() {
  const { data: session, status } = useSession();
  const [job, setJob] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  let hideTimeout;

  useEffect(() => {
    const handleUserActivity = () => {
      setIsNavbarVisible(true);
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => setIsNavbarVisible(false), 5000);
    };

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("scroll", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("scroll", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
    };
  }, []);

  const scrollToJobs = () => {
    const jobsSection = document.getElementById("jobs-section");
    jobsSection?.scrollIntoView({ behavior: "smooth" });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === sliderImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? sliderImages.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      lineSpinner.register();
    }
  }, []);

  const handleDetailsClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  useEffect(() => {
    let userLevel =
      session?.user?.userLevel || getDataFromCookie("auth_token")?.userLevel;
    if (!userLevel) return;

    const routes = {
      100: "/admin/dashboard",
      "100.0": "/admin/dashboard",
      2: "/superAdminDashboard",
      supervisor: "/supervisorDashboard",
      1: "/candidatesDashboard",
      "1.0": "/candidatesDashboard",
    };

    const targetRoute = routes[String(userLevel)];
    if (targetRoute && targetRoute !== window.location.pathname) {
      router.replace(targetRoute);
    }
  }, [session, router]);

  async function fetchJobs() {
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";

      const formData = new FormData();
      formData.append("operation", "getActiveJobs");
      const response = await axios.post(url, formData);

      if (Array.isArray(response.data)) {
        setJob(response.data);
      } else if (response.data.error) {
        setError("Error fetching jobs: " + response.data.error);
      } else {
        setError("Unexpected data format received from server.");
      }
    } catch (error) {
      setError("Error fetching jobs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-[#EAE9E7]">
      {/* Navigation Bar */}
      <nav
        className={`p-4 flex justify-between items-center text-white fixed top-0 left-0 z-50 w-full h-20 bg-[#004F39] transition-transform duration-500 ${
          isNavbarVisible ? "translate-y-0" : "-translate-y-full"
        }`}
        onMouseEnter={() => setIsNavbarVisible(true)}
      >
        <Image
          src="/assets/images/delmontes.png"
          width={70}
          height={70}
          alt="Del Monte Logo"
          className="h-16 w-auto"
        />

        <div className="flex items-center gap-4">
          <button
            onClick={scrollToJobs}
            className="text-white hover:text-[#EAE9E7] transition-colors px-4 py-2"
          >
            Jobs
          </button>
          <Link href="/login">
            <button className="bg-[#EAE9E7] text-[#004F39] px-4 py-2 rounded-md font-bold hover:bg-white transition-colors">
              Log In
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Slider Section */}
      <div className="relative h-screen w-full overflow-hidden">
        {sliderImages.map((slide, index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ${
              currentSlide === index ? "opacity-100" : "opacity-0"
            }`}
            style={{ marginTop: "0px" }}
          >
            <div className="absolute inset-0 bg-black/40 z-10" />
            <Image
              src={slide.url}
              alt={`Del Monte Slide ${index + 1}`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10 mt-10">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl text-white">
                {slide.description}
              </p>
            </div>
          </div>
        ))}

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentSlide === index ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Jobs Section */}
      <div id="jobs-section" className="p-8">
        <h2 className="text-3xl font-semibold text-[#004F39] mb-6">
          Active Jobs
        </h2>

        {loading ? (
          <div className="flex items-center justify-center h-64 flex-col">
            <div className="text-center">
              <l-line-spinner
                size="40"
                speed="1.75"
                color="black"
              ></l-line-spinner>
              <p className="text-green-700 mt-2">
                Please wait while we load available jobs
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 flex-col">
            <div className="text-center">
              <l-line-spinner
                size="40"
                speed="1.75"
                color="black"
              ></l-line-spinner>
              <p className="text-green-700 mt-2">
                Please wait while we load available jobs
              </p>
            </div>
          </div>
        ) : job.length === 0 ? (
          <p className="text-center text-gray-500">No jobs available</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {job.map((job) => (
              <div
                key={job.jobM_id}
                className="rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl bg-white"
              >
                <div className="p-4 h-20 flex items-center justify-start bg-[#0A6338]">
                  <Briefcase className="w-6 h-6 text-white mr-2" />
                  <h3 className="text-xl font-semibold text-white truncate">
                    {job.jobM_title}
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex items-center space-x-2 text-sm mt-4 text-black">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>{job.Total_Applied} Applicants</span>
                  </div>

                  <div className="flex items-center space-x-1 text-sm mb-5 text-black">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{job.jobM_createdAt}</span>
                  </div>

                  <button
                    onClick={() => handleDetailsClick(job)}
                    className="w-full px-4 py-2 rounded-md font-semibold transition-colors duration-300 bg-transparent hover:bg-[#004F39] text-gray-700 hover:text-white shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <JobDetailsModal
          job={selectedJob}
          onCloses={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
