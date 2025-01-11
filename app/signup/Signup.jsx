"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import PersonalInformation from "./PersonalInformation";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import axios from "axios";
import Spinner from "@/components/ui/spinner";
import EnterPin from "./modals/EnterPin";
import {
  removeData,
  retrieveData,
  retrieveDataFromCookie,
  storeData,
} from "../utils/storageUtils";
import ShowAlert from "@/components/ui/show-alert";
import { useRouter } from "next/navigation";

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const { setTheme } = useTheme();
  const [pincode, setPincode] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");

  useEffect(() => {
    const token = retrieveDataFromCookie("auth_token");

    const encodedToken = retrieveDataFromCookie("auth_token");
    const tokenData = encodedToken ? JSON.parse(atob(encodedToken)) : null;
    const userLevel = tokenData?.userLevel;
    // const userName = retrieveDataFromCookie("first_name");
    // const userId = retrieveData("user_id");
    // const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
    // const token = retrieveDataFromCookie("auth_token");
    // const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
    // const userLevel = retrieveDataFromCookie("auth_token");

    if (!token) {
      sessionStorage.clear();

      // Clear all cookies
      document.cookie.split(";").forEach((cookie) => {
        const cookieName = cookie.split("=")[0].trim();
        document.cookie = `${cookieName}=;max-age=0;path=/;secure;samesite=Strict`;
      });

      router.push("/signup");
      return;
    }

    switch (userLevel) {
      case "100.0":
        router.replace("/admin/dashboard");
        break;
      case "2":
        router.replace("/superAdminDashboard");
        break;
      case "supervisor":
        router.replace("/supervisorDashboard");
        break;
      case "1.0":
        router.replace("/candidatesDashboard");
        break;
      default:
        // console.log("Unexpected user level, redirecting to landing area.");
        router.replace("/");
    }
  }, []);

  const handleShowPin = () => {
    setShowPin(true);
  };
  const handleHidePin = (status) => {
    switch (status) {
      case 1:
        handleSaveInformation();
        break;
      case 2:
        setPincode("");
        setExpirationDate("");
        break;
      default:
        break;
    }
    setShowPin(false);
  };

  const router = useRouter();

  const handleSaveInformation = async () => {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
      const formData = new FormData();
      formData.append(
        "json",
        JSON.stringify(JSON.parse(retrieveData("personalInfo")))
      );
      formData.append("operation", "signup");
      const res = await axios.post(url, formData);
      console.log("res ni handleSaveInformation: ", res.data);
      if (res.data === 1) {
        toast.success("Signup successful");
        removeData("personalInfo");
        setTimeout(() => {
          router.push("/login");
        }, 1250);
      }
    } catch (error) {
      toast.error("Network error");
      console.log("Signup.jsx => handleSaveInformation(): " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const handleShowAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleCloseAlert = (status) => {
    if (status === 1) {
      // handleSaveInformation();
    }
    setShowAlert(false);
  };

  const handleSubmit = async (status) => {
    const personalInfo = JSON.parse(retrieveData("personalInfo"));
    if (status === 2) {
      try {
        setIsLoading(true);
        const url = process.env.NEXT_PUBLIC_API_URL + "users.php";
        const jsonData = {
          email: personalInfo.email,
        };
        // console.log("url: " + url);
        console.log("email niya: " + JSON.stringify(jsonData));
        const formData = new FormData();
        formData.append("json", JSON.stringify(jsonData));
        formData.append("operation", "getPinCode");
        const res = await axios.post(url, formData);

        console.log("RES DATA: ", res.data);
        if (res.data === -1) {
          toast.error("Email already exist, please return to step 1");
          return;
        } else if (res.data !== 0) {
          console.log("pincode niya: " + JSON.stringify(res.data));
          setEmail(personalInfo.email);
          setPincode(res.data.pincode);
          setExpirationDate(res.data.expirationDate);
          handleShowPin();
        }
      } catch (error) {
        setTimeout(() => {
          toast.error("Network error");
        }, [500]);
        console.log("Signup.jsx => onSubmit(): " + error);
      } finally {
        setIsLoading(false);
      }
    } else {
      handleShowPin();
    }
  };

  useEffect(() => {
    setTheme("dark");
  }, [setTheme]);

  return (
    <>
      {isLoading ? (
        <main className="bg-[#0e4028] h-screen">
          <div className="flex flex-col w-full h-full justify-center items-center">
            <Spinner />
          </div>
        </main>
      ) : (
        <>
          <main className="bg-[#0e4028]">
            <div className="flex flex-col w-full justify-center items-center">
              <Image
                src="/assets/images/delmonteLogo.png"
                alt="DelmonteLogo"
                width={152}
                height={152}
                className="mt-3"
              />
              <PersonalInformation handleSubmit={handleSubmit} />
            </div>
          </main>
          <EnterPin
            open={showPin}
            onHide={handleHidePin}
            pin={pincode}
            expirationDate={expirationDate}
          />
          <ShowAlert
            open={showAlert}
            onHide={handleCloseAlert}
            message={alertMessage}
          />
        </>
      )}
    </>
  );
};

export default Signup;
