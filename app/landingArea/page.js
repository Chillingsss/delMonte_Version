"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import JobDetailsModal from "./modal/jobDetails";
import { getDataFromCookie } from "../utils/storageUtils";
import { Briefcase, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { lineSpinner } from "ldrs";
import Image from "next/image";
import AboutUsModal from "./modal/AboutUsModal";

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
	const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
	const [companyProfile, setCompanyProfile] = useState(null);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const menuRef = useRef(null);
	const menuButtonRef = useRef(null);

	let hideTimeout;

	useEffect(() => {
		const handleUserActivity = () => {
			setIsNavbarVisible(true);
			clearTimeout(hideTimeout);
			hideTimeout = setTimeout(() => {
				setIsNavbarVisible(false);
				setIsMobileMenuOpen(false); // Close mobile menu when navbar hides
			}, 5000);
		};

		window.addEventListener("mousemove", handleUserActivity);
		window.addEventListener("scroll", handleUserActivity);
		window.addEventListener("touchstart", handleUserActivity);

		return () => {
			window.removeEventListener("mousemove", handleUserActivity);
			window.removeEventListener("scroll", handleUserActivity);
			window.removeEventListener("touchstart", handleUserActivity);
			clearTimeout(hideTimeout);
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

	const handleAboutClick = async () => {
		setIsAboutModalOpen(true);
		try {
			const url =
				process.env.NODE_API_LANDING || "http://localhost:3003/landingArea";
			console.log("URL: ", url);
			const response = await axios.get(url);
			setCompanyProfile(response.data);
			console.log("Fetched data:", response.data); // ✅ Logs correct data immediately
		} catch (error) {
			console.error(
				"Error fetching company profile:",
				error.response ? error.response.data : error.message
			);
		}
	};

	useEffect(() => {
		console.log("Updated company profile:", companyProfile);
	}, [companyProfile]); // ✅ Runs when companyProfile changes

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				isMobileMenuOpen &&
				menuRef.current &&
				!menuRef.current.contains(event.target) &&
				menuButtonRef.current &&
				!menuButtonRef.current.contains(event.target)
			) {
				setIsMobileMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("touchstart", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("touchstart", handleClickOutside);
		};
	}, [isMobileMenuOpen]);

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
				className={`p-4 flex justify-between items-center text-white fixed top-0 left-0 z-50 w-full h-[70px] bg-[#004F39]/95 backdrop-blur-sm shadow-lg transition-all duration-300 ${
					isNavbarVisible ? "translate-y-0" : "-translate-y-full"
				}`}
				onMouseEnter={() => setIsNavbarVisible(true)}
			>
				<Link href="/" className="flex items-center space-x-2">
					<Image
						src="/assets/images/delmontes.png"
						width={55}
						height={55}
						alt="Del Monte Logo"
						className="h-14 w-auto transition-transform hover:scale-105"
					/>
				</Link>

				{/* Desktop Menu */}
				<div className="hidden md:flex items-center gap-6">
					<button
						onClick={handleAboutClick}
						className="text-white hover:text-[#EAE9E7] transition-all px-4 py-2 text-base relative group flex items-center gap-2"
					>
						<Info className="w-5 h-5" />
						About Us
						<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#EAE9E7] transition-all group-hover:w-full"></span>
					</button>
					<button
						onClick={scrollToJobs}
						className="text-white hover:text-[#EAE9E7] transition-all px-4 py-2 text-base relative group flex items-center gap-2"
					>
						<Briefcase className="w-5 h-5" />
						Jobs
						<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#EAE9E7] transition-all group-hover:w-full"></span>
					</button>
					<Link href="/login">
						<button className="bg-[#EAE9E7] text-[#004F39] px-6 py-2 rounded-full font-semibold hover:bg-white transition-all hover:shadow-lg text-base">
							Log In
						</button>
					</Link>
				</div>

				{/* Mobile Menu Button */}
				<div className="md:hidden">
					<button
						ref={menuButtonRef}
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							setIsMobileMenuOpen(!isMobileMenuOpen);
						}}
						className="text-white p-2 hover:bg-[#003D2C] rounded-lg transition-colors relative w-10 h-10 flex items-center justify-center"
					>
						<div className="w-6 relative flex justify-center items-center">
							<span
								className={`w-6 h-0.5 bg-current absolute transform transition-all duration-300 ease-in-out ${
									isMobileMenuOpen
										? "rotate-45"
										: "-translate-y-2"
								}`}
							></span>
							<span
								className={`w-6 h-0.5 bg-current absolute transform transition-all duration-300 ease-in-out ${
									isMobileMenuOpen ? "opacity-0" : "opacity-100"
								}`}
							></span>
							<span
								className={`w-6 h-0.5 bg-current absolute transform transition-all duration-300 ease-in-out ${
									isMobileMenuOpen
										? "-rotate-45"
										: "translate-y-2"
								}`}
							></span>
						</div>
					</button>
				</div>

				{/* Mobile Menu */}
				<div
					ref={menuRef}
					className={`md:hidden fixed top-[70px] right-4 w-48 bg-[#004F39] shadow-lg rounded-lg transition-all duration-300 ease-in-out transform z-50 ${
						isMobileMenuOpen && isNavbarVisible
							? "translate-x-0 opacity-100"
							: "translate-x-full opacity-0"
					}`}
				>
					<div className="flex flex-col p-2">
						<button
							onClick={(e) => {
								e.preventDefault();
								handleAboutClick();
								setIsMobileMenuOpen(false);
							}}
							className="text-white hover:text-[#EAE9E7] transition-colors px-4 py-2 text-sm hover:bg-[#003D2C] rounded-lg w-full text-left mb-1 flex items-center gap-2"
						>
							<Info className="w-4 h-4" />
							About Us
						</button>
						<button
							onClick={(e) => {
								e.preventDefault();
								scrollToJobs();
								setIsMobileMenuOpen(false);
							}}
							className="text-white hover:text-[#EAE9E7] transition-colors px-4 py-2 text-sm hover:bg-[#003D2C] rounded-lg w-full text-left mb-1 flex items-center gap-2"
						>
							<Briefcase className="w-4 h-4" />
							Jobs
						</button>
						<Link href="/login" className="w-full">
							<button
								onClick={() => setIsMobileMenuOpen(false)}
								className="bg-[#EAE9E7] text-[#004F39] px-4 py-2 rounded-lg font-semibold hover:bg-white transition-colors text-sm w-full"
							>
								Log In
							</button>
						</Link>
					</div>
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
								<div className="p-4 h-20 flex items-center justify-start bg-[#004F39]">
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

			{isAboutModalOpen && (
				<AboutUsModal
					onClose={() => setIsAboutModalOpen(false)}
					companyProfile={companyProfile}
				/>
			)}
		</div>
	);
}
