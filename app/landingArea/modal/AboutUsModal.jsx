"use client";

import { useState, useEffect } from "react";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
	Facebook,
	Linkedin,
	MapPin,
	Package,
	Factory,
	Users,
	ChevronRight,
} from "lucide-react";

const AboutUsModal = ({ onClose, companyProfile }) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Add a small delay to trigger the animation after component mounts
		const timer = setTimeout(() => setIsVisible(true), 100);
		return () => clearTimeout(timer);
	}, []);

	if (!companyProfile || companyProfile.length === 0) return null;

	const profile = companyProfile[0];

	const handleOpenChange = (open) => {
		if (!open) {
			setIsVisible(false);
			// Add a small delay before actually closing to allow animation to complete
			setTimeout(() => onClose(), 200);
		}
	};

	return (
		<Drawer open={true} onOpenChange={handleOpenChange}>
			<DrawerContent className="h-[80vh] max-h-[85vh]">
				<div className="relative mx-auto w-full max-w-3xl bg-background rounded-t-xl shadow-lg h-full flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
					<DrawerHeader className="bg-gradient-to-r from-primary/10 to-background border-b p-6 md:p-8 flex-shrink-0">
						<div className="flex flex-col space-y-2">
							<Badge
								variant="outline"
								className="w-fit text-xs font-medium text-muted-foreground mb-1"
							>
								Company Profile
							</Badge>
							<DrawerTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
								{profile.CompanyName}
							</DrawerTitle>
						</div>
					</DrawerHeader>

					<ScrollArea className="flex-grow">
						<div
							className={`p-6 md:p-8 space-y-8 transition-opacity duration-300 ${
								isVisible ? "opacity-100" : "opacity-0"
							}`}
						>
							{/* Description Section */}
							<div className="space-y-4">
								<h3 className="text-xl font-semibold text-foreground">
									About Us
								</h3>
								<p className="text-base md:text-lg leading-relaxed text-muted-foreground">
									{profile.Description}
								</p>

								<div className="flex flex-wrap gap-3 mt-6">
									{profile.Facebook && (
										<Button
											variant="outline"
											size="sm"
											className="rounded-full transition-all hover:bg-primary/10 hover:text-primary"
											onClick={() => window.open(profile.Facebook, "_blank")}
										>
											<Facebook className="mr-2 h-4 w-4" />
											Facebook
										</Button>
									)}
									{profile.LinkedIn && (
										<Button
											variant="outline"
											size="sm"
											className="rounded-full transition-all hover:bg-primary/10 hover:text-primary"
											onClick={() => window.open(profile.LinkedIn, "_blank")}
										>
											<Linkedin className="mr-2 h-4 w-4" />
											LinkedIn
										</Button>
									)}
								</div>
							</div>

							<Separator className="my-6" />

							{/* Company Details Section */}
							<div className="space-y-6">
								<h3 className="text-xl font-semibold text-foreground flex items-center">
									<Package className="mr-2 h-5 w-5 text-primary" />
									Products & Operations
								</h3>

								<div className="grid sm:grid-cols-2 gap-6">
									<div className="space-y-4">
										<DetailCard
											icon={<Package className="h-5 w-5 text-primary" />}
											title="Products"
											items={[
												{ label: "Main Products", value: profile.MainProducts },
												{
													label: "Product Variants",
													value: profile.ProductVariants,
												},
											]}
										/>
									</div>
									<div className="space-y-4">
										<DetailCard
											icon={<Factory className="h-5 w-5 text-primary" />}
											title="Operations"
											items={[
												{
													label: "Pineapple Operation Size",
													value: profile.PineappleOperationSize,
												},
												{
													label: "Manufacturing Plant Size",
													value: profile.ManufacturingPlantSize,
												},
												{
													label: "Plant Capacity",
													value: profile.ManufacturingPlantCapacity,
												},
											]}
										/>
									</div>
								</div>

								<DetailCard
									icon={<Users className="h-5 w-5 text-primary" />}
									title="Team"
									items={[
										{ label: "Total Employees", value: profile.EmployeeCount },
									]}
									className="mt-6"
								/>
							</div>

							<Separator className="my-6" />

							{/* Locations Section */}
							<div className="space-y-6">
								<h3 className="text-xl font-semibold text-foreground flex items-center">
									<MapPin className="mr-2 h-5 w-5 text-primary" />
									Our Locations
								</h3>

								<div className="grid sm:grid-cols-2 gap-4">
									<LocationCard
										title="Mindanao Operations"
										details={profile.EmployeeLocationMindanao}
									/>
									<LocationCard
										title="Metro Manila Operations"
										details={profile.EmployeeLocationMetroManila}
									/>
								</div>
							</div>
						</div>
					</ScrollArea>
				</div>
			</DrawerContent>
		</Drawer>
	);
};

// Enhanced Detail Card Component
const DetailCard = ({ icon, title, items, className = "" }) => (
	<div
		className={`bg-card/50 hover:bg-card/80 transition-colors rounded-xl p-5 border border-border/50 ${className}`}
	>
		<div className="flex items-center mb-4">
			{icon}
			<h4 className="text-lg font-medium ml-2 text-foreground">{title}</h4>
		</div>
		<div className="space-y-3">
			{items.map((item, index) => (
				<div key={index} className="group">
					<p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
						{item.label}
					</p>
					<p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
						{item.value}
					</p>
					{index < items.length - 1 && <Separator className="mt-3" />}
				</div>
			))}
		</div>
	</div>
);

// Enhanced Location Card Component
const LocationCard = ({ title, details }) => (
	<div className="group bg-primary/5 hover:bg-primary/10 transition-all duration-300 rounded-xl p-5 border border-primary/20 relative overflow-hidden">
		<div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-all duration-300"></div>
		<h4 className="text-lg font-medium text-primary mb-3 relative z-10">
			{title}
		</h4>
		<p className="text-sm text-foreground relative z-10">{details}</p>
		<ChevronRight className="absolute bottom-3 right-3 h-5 w-5 text-primary/40 group-hover:text-primary/70 transition-all duration-300" />
	</div>
);

export default AboutUsModal;
