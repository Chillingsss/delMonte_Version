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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { InfoIcon, ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

const SecuritySettingsModal = ({ onClose }) => {
  const [settingEverylogs, setSettingEverylogs] = useState(false)
  const [settingDays, setSettingDays] = useState(2)
  const [loading, setLoading] = useState(true)

  const { data: session } = useSession()

  const getUserIdFromCookie = () => {
    if (typeof window !== "undefined") {
      const tokenData = getDataFromCookie("auth_token")
      return tokenData?.userId || null
    }
    return null
  }

  const userId = session?.user?.id || getUserIdFromCookie()
  const url = process.env.NEXT_PUBLIC_API_URL + "users.php"
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

      if (response.data && !response.data.error) {
        toast.success("2FA settings updated successfully.")
        fetchSettings()
      }
    } catch (error) {
      console.error("Error updating 2FA settings:", error)
      toast.error("Failed to update 2FA settings.")
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
            <div className="flex items-center gap-2">
              <SheetTitle className="text-2xl font-bold text-primary">Security Settings</SheetTitle>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                2FA
              </Badge>
            </div>
            <SheetDescription className="text-muted-foreground">
              Configure your two-factor authentication (2FA) settings to enhance account security.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-grow pr-4 -mr-4">
            <div className="mt-6 space-y-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-center text-muted-foreground">Loading your security settings...</p>
                </div>
              ) : (
                <>
                  <Alert className="bg-blue-500/10 dark:bg-blue-500/5 border-blue-500/20 dark:border-blue-500/10 transition-all duration-300 hover:bg-blue-500/15 dark:hover:bg-blue-500/10">
                    <div className="flex gap-2">
                      <InfoIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
                        Two-factor authentication adds an extra layer of security to your account by requiring a
                        verification code in addition to your password.
                      </AlertDescription>
                    </div>
                  </Alert>

                  {/* Security Status Indicator */}
                  <div className="bg-secondary/50 dark:bg-secondary/30 rounded-lg p-4 border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Current Security Status</h3>
                      <div
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium",
                          settingEverylogs
                            ? "bg-green-500/20 dark:bg-green-500/10 text-green-700 dark:text-green-400"
                            : settingDays
                              ? "bg-yellow-500/20 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                              : "bg-red-500/20 dark:bg-red-500/10 text-red-700 dark:text-red-400",
                        )}
                      >
                        {settingEverylogs ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" /> Maximum
                          </>
                        ) : settingDays ? (
                          <>
                            <Clock className="h-4 w-4" /> Enhanced
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" /> Disabled
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Switch for Every Login */}
                  <div className="space-y-3 transition-all duration-300 hover:bg-secondary/50 dark:hover:bg-secondary/20 p-3 rounded-lg -mx-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <span className="text-lg font-medium">Enable 2FA for Every Login</span>
                      </div>
                      <Switch
                        checked={settingEverylogs}
                        onCheckedChange={(checked) => {
                          setSettingEverylogs(checked)
                          if (checked) setSettingDays(null)
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground pl-7">
                      When enabled, you&apos;ll be required to enter a verification code every time you log in,
                      providing maximum security for your account.
                    </p>
                    {settingEverylogs && (
                      <div className="mt-2 bg-green-500/10 dark:bg-green-500/5 text-green-700 dark:text-green-400 text-sm p-2 rounded-md border border-green-500/20 dark:border-green-500/10 pl-7">
                        <CheckCircle2 className="h-4 w-4 inline mr-1" />
                        Maximum security enabled. You&apos;ll verify your identity on every login.
                      </div>
                    )}
                  </div>

                  {/* Radio Group for Days */}
                  <div
                    className={`transition-all duration-300 ${
                      settingEverylogs
                        ? "opacity-50 pointer-events-none filter blur-[0.3px]"
                        : "opacity-100 hover:bg-secondary/50 dark:hover:bg-secondary/20"
                    } p-3 rounded-lg -mx-3`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-medium">2FA Validity Duration</h3>
                      </div>
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
                    <p className="text-sm text-muted-foreground mb-3 pl-7">
                      Choose how long your 2FA verification remains valid before requiring re-verification. A shorter
                      duration provides better security.
                    </p>
                    <div className="pl-7">
                      <RadioGroup
                        value={settingDays ? String(settingDays) : ""}
                        onValueChange={(value) => setSettingDays(Number(value))}
                        disabled={settingEverylogs}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => (  // Added 1 to the array
                          <div
                            key={day}
                            className={cn(
                              "flex items-center space-x-2 border rounded-md p-2 transition-all",
                              String(settingDays) === String(day)
                                ? "border-primary bg-primary/10 dark:bg-primary/5"
                                : "border-border hover:border-primary/50 dark:hover:border-primary/30",
                            )}
                          >
                            <RadioGroupItem value={String(day)} id={`day-${day}`} className="border-input" />
                            <label htmlFor={`day-${day}`} className="text-base cursor-pointer w-full">
                              {day} {day === 1 ? "day" : "days"}
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    {!settingEverylogs && settingDays === null && (
                      <p className="text-sm text-muted-foreground mt-3 pl-7 flex items-start gap-1.5">
                        <InfoIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>
                          2FA is currently disabled. Select a validity duration or enable 2FA for every login to
                          activate it.
                        </span>
                      </p>
                    )}
                    {!settingEverylogs && settingDays !== null && (
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-3 pl-7 flex items-start gap-1.5 bg-amber-500/10 dark:bg-amber-500/5 p-2 rounded-md border border-amber-500/20 dark:border-amber-500/10">
                        <InfoIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>You won&apos;t need to verify again on this device for {settingDays} {settingDays === 1 ? "day" : "days"}.</span>
                      </p>
                    )}
                  </div>

                  <Separator className="my-6" />

                  <Alert className="bg-secondary/50 dark:bg-secondary/30 border-secondary transition-all duration-300 hover:bg-secondary/70 dark:hover:bg-secondary/40">
                    <AlertDescription className="text-sm flex gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-primary">Security Tip:</strong> For the highest level of protection, we
                        recommend enabling 2FA for every login. If you choose a validity duration, select the shortest
                        period that works for your needs. Leaving both options unselected will disable 2FA completely.
                      </div>
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </div>
          </ScrollArea>

          {/* Save Button */}
          <div className="mt-6 space-y-3">
            <Button className="w-full h-11" onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Changes will be applied immediately to your account security settings.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SecuritySettingsModal

