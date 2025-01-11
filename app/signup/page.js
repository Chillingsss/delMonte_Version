import React from "react";
import Signup from "./Signup";
import { format } from "date-fns";

function page() {
  return (
    <div>
      <Signup />
    </div>
  );
}

export default page;

export function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) {
    // Handle invalid date
    return "Invalid date";
  }
  return format(date, "MMM dd, yyyy");
}
