"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSession } from "next-auth/react"
import { getDataFromCookie } from "@/app/utils/storageUtils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon, ShieldCheck } from "lucide-react"
import toast from "react-hot-toast"

const SecuritySettingsModal = ({ onClose }) => {
  const [settingEverylogs, setSettingEverylogs] = useState(false);
  const [settingDays, setSettingDays] = useState(2);
  const [loading, setLoading] = useState(true);

  const { data: session } = useSession();

  const getUserIdFromCookie = () => {
    if (typeof window !== "undefined") {
      const tokenData = getDataFromCookie("auth_token")
      return tokenData?.userId || null
    }
    return null
  }

  const userId = session?.user?.id || getUserIdFromCookie();
  const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
  const fetchSettings = async () => {
    try {
      const formData = new FormData()
      formData.append("operation", "getTwofaSetting")
      formData.append("json", JSON.stringify({ cand_id: userId }))

      const response = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (response.data && !response.data.error) {
        setSettingEverylogs(response.data.setting_everylogs === 1)
        setSettingDays(response.data.setting_days)
      }
    } catch (error) {
      console.error("Error fetching 2FA settings:", error.response ? error.response.data : error.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchSettings()
  }, [userId, url])

  const handleSave = async () => {
    try {

      const jsonData = {
        cand_id: userId,
        setting_everylogs: settingEverylogs ? 1 : 0,
        setting_days: settingEverylogs ? null : settingDays,
      }

      const formData = new FormData()
      formData.append("operation", "twofaSetting")
      formData.append("json", JSON.stringify(jsonData))

      const response = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if(response.data && !response.data.error) {
        toast.success("2FA settings updated successfully.");
        fetchSettings();
      }

    } catch (error) {
      console.error("Error updating 2FA settings:", error);
      toast.error("Failed to update 2FA settings.");
    }
  }

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className="w-[calc(100%-70px)] sm:w-[540px] max-w-2xl rounded-l-lg sm:rounded-none overflow-hidden"
        side="right"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-2xl font-bold text-[#0A6338]">Security Settings</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              Configure your two-factor authentication (2FA) settings to enhance account security.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-grow pr-4 -mr-4">
            <div className="mt-6 space-y-6">
              {loading ? (
                <p className="text-center text-gray-500 my-8">Loading settings...</p>
              ) : (
                <>
                  <Alert className="bg-blue-50 border-blue-200">
                    <InfoIcon className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-700">
                      Two-factor authentication adds an extra layer of security to your account by requiring a
                      verification code in addition to your password.
                    </AlertDescription>
                  </Alert>

                  {/* Switch for Every Login */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-medium">Enable 2FA for Every Login</span>
                        <ShieldCheck className="h-5 w-5 text-[#0A6338]" />
                      </div>
                      <Switch
                        checked={settingEverylogs}
                        onCheckedChange={(checked) => {
                          setSettingEverylogs(checked)
                          if (checked) setSettingDays(null)
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      When enabled, you&apos;ll be required to enter a verification code every time you log in, providing
                      maximum security for your account.
                    </p>
                  </div>

                  {/* Radio Group for Days */}
                  <div
                    className={`transition-opacity ${settingEverylogs ? "opacity-50 pointer-events-none" : "opacity-100"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">2FA Validity Duration</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSettingDays(null)}
                        disabled={settingEverylogs || !settingDays}
                        className="text-xs h-8"
                      >
                        Clear Selection
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Choose how long your 2FA verification remains valid before requiring re-verification. A shorter
                      duration provides better security.
                    </p>
                    <RadioGroup
                      value={settingDays ? String(settingDays) : ""}
                      onValueChange={(value) => setSettingDays(Number(value))}
                      disabled={settingEverylogs}
                      className="space-y-2"
                    >
                      {[2, 3, 4, 5, 6, 7].map((day) => (
                        <div key={day} className="flex items-center space-x-2">
                          <RadioGroupItem value={String(day)} id={`day-${day}`} />
                          <label htmlFor={`day-${day}`} className="text-lg">
                            {day} {day === 1 ? "day" : "days"}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                    {!settingEverylogs && settingDays === null && (
                      <p className="text-sm text-red-600 mt-2">
                        <InfoIcon className="h-4 w-4 inline mr-1" />
                        Please select a validity duration.
                      </p>
                    )}
                    {!settingEverylogs && settingDays !== null && (
                      <p className="text-sm text-amber-600 mt-2">
                        <InfoIcon className="h-4 w-4 inline mr-1" />
                        You won&apos;t need to verify again on this device for the selected number of days.
                      </p>
                    )}
                  </div>

                  <Alert className="bg-gray-50 border-gray-200">
                    <AlertDescription className="text-sm">
                      <strong>Security Tip:</strong> For the highest level of protection, we recommend enabling 2FA for
                      every login. If you choose a validity duration, select the shortest period that works for your
                      needs.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </div>
          </ScrollArea>

          {/* Save Button */}
          <div className="mt-6">
            <Button className="w-full bg-[#0A6338] hover:bg-[#084d2b]" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SecuritySettingsModal

