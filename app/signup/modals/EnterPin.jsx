import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EnterPin({ open, onHide, pin, expirationDate }) {
  const [code, setCode] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [expirationDateTime, setExpirationDateTime] = useState("");

  const handleSubmit = () => {
    try {
      const expiredDate = new Date(expirationDateTime);
      const currentDateTime = new Date();

      console.log("pin code: " + pinCode);
      console.log("code: " + code);
      if (code === pinCode) {
        if (expiredDate < currentDateTime) {
          toast.error("Pin code has expired. Please try again.");
          handleResendPin();
        } else {
          toast.success("Pin code verified.");
          onHide(1);
        }
      } else {
        toast.error("Incorrect pin code.");
      }
    } catch (error) {
      toast.error("Network error");
      console.log("EnterPin.jsx => handleSubmit(): " + error);
    }
  };

  const handleResendPin = () => {
    onHide(2);
  };

  const handleHide = () => {
    console.log("Normal hide");
    onHide(0);
  };

  useEffect(() => {
    if (open) {
      setPinCode(pin);
      setExpirationDateTime(expirationDate);
    }
  }, [open, pin, expirationDate]);

  return (
    <Dialog open={open} onOpenChange={handleHide}>
      <DialogOverlay className="bg-black/5" />
      <DialogContent className="sm:max-w-[425px] bg-[#0e5a35] ">
        <DialogHeader>
          <DialogTitle>Enter Pin</DialogTitle>
          <DialogDescription>
            Please check your e-mail account for the verification code we sent
            you and enter the code below.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div>
            <Input
              id="name"
              className="col-span-3 bg-[#0e4028] border-2 border-[#0b864a]"
              placeholder="Enter Pin"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            className="dark:bg-[#f5f5f5] dark:text-[#0e4028]"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
