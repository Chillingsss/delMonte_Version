"use client"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

const SecuritySettingsModal = ({ onClose }) => {
  const handleOpenChange = (open) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <Sheet open={true} onOpenChange={handleOpenChange}>
      <SheetContent className="max-h-full" side="right">
        <div className="relative mx-auto w-full max-w-2xl bg-white rounded-t-lg h-full flex flex-col">
          <SheetHeader className="bg-white border-b p-4 sm:p-6 md:p-8 flex-shrink-0">
            <SheetTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0A6338]">Security Settings</SheetTitle>
          </SheetHeader>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SecuritySettingsModal

