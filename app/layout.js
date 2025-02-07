import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import SessionProviderWrapper from "@/SessionProviderWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <SessionProviderWrapper>
          {" "}
          {/* ✅ Wrap entire app */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="dark:bg-[#0e4028] h-screen">
              <Toaster position="top-center" richColors duration={2000} />
              {children} {/* ✅ Now inside SessionProviderWrapper */}
            </div>
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
