"use client"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Facebook, Linkedin } from "lucide-react"

const AboutUsModal = ({ onClose, companyProfile }) => {
  if (!companyProfile || companyProfile.length === 0) return null // Ensure it's not empty

  const profile = companyProfile[0] // ✅ Extract the first object

  console.log("Company Profile:", profile)

  const handleOpenChange = (open) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <Drawer open={true} onOpenChange={handleOpenChange}>
      <DrawerContent className="h-[72vh] max-h-[75vh]">
        <div className="relative mx-auto w-full max-w-2xl bg-background rounded-t-lg h-full flex flex-col">
          <DrawerHeader className="bg-background border-b p-4 sm:p-6 md:p-8 flex-shrink-0">
            <DrawerTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              {profile.CompanyName}
            </DrawerTitle>
          </DrawerHeader>

          <ScrollArea className="flex-grow">
            <div className="p-4 sm:p-6 md:p-8">
              <p id="company-description" className="text-base sm:text-lg md:text-xl text-muted-foreground mt-2">
                {profile.Description}
              </p>

              <div className="flex space-x-4 mt-4">
                {profile.Facebook && (
                  <Button variant="outline" size="sm" onClick={() => window.open(profile.Facebook, "_blank")}>
                    <Facebook className="mr-2 h-4 w-4" />
                    Visit Facebook
                  </Button>
                )}
                {profile.LinkedIn && (
                  <Button variant="outline" size="sm" onClick={() => window.open(profile.LinkedIn, "_blank")}>
                    <Linkedin className="mr-2 h-4 w-4" />
                    Visit LinkedIn
                  </Button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                <div className="space-y-3 sm:space-y-4">
                  <DetailRow label="Main Products" value={profile.MainProducts} />
                  <DetailRow label="Product Variants" value={profile.ProductVariants} />
                  <DetailRow label="Pineapple Operation Size" value={profile.PineappleOperationSize} />
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <DetailRow label="Manufacturing Plant Size" value={profile.ManufacturingPlantSize} />
                  <DetailRow label="Plant Capacity" value={profile.ManufacturingPlantCapacity} />
                  <DetailRow label="Total Employees" value={profile.EmployeeCount} />
                </div>
              </div>

              <div className="bg-secondary/50 dark:bg-secondary/30 mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary mb-3 sm:mb-4">
                  Our Locations
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <LocationCard title="Mindanao Operations" details={profile.EmployeeLocationMindanao} />
                  <LocationCard title="Metro Manila Operations" details={profile.EmployeeLocationMetroManila} />
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

// Reusable Component for Detail Rows
const DetailRow = ({ label, value }) => (
  <div className="border-b pb-2 border-border">
    <p className="text-xs sm:text-sm text-muted-foreground mb-1">{label}</p>
    <p className="text-sm sm:text-base font-medium text-foreground">{value}</p>
  </div>
)

// Reusable Component for Location Cards
const LocationCard = ({ title, details }) => (
  <div className="bg-card shadow-md rounded-lg p-3 sm:p-4 border border-border">
    <h4 className="text-base sm:text-lg font-semibold text-primary mb-2">{title}</h4>
    <p className="text-sm sm:text-base text-card-foreground">{details}</p>
  </div>
)

export default AboutUsModal

