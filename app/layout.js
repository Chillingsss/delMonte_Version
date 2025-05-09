import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import SessionProviderWrapper from "@/SessionProviderWrapper";
import ClientWrapper from "./ClientWrapper";
import Image from "next/image"; // Import Image component

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Del Monte Careers",
  description: "Del Monte Philippines",
  icons: {
    icon: [
      {
        url: '/assets/images/delmontes.png',
        sizes: '32x32',
        type: 'image/png'
      },
      {
        url: '/assets/images/delmontes.png',
        sizes: '16x16',
        type: 'image/png'
      }
    ],
    apple: {
      url: '/assets/images/delmontes.png',
      sizes: '180x180',
      type: 'image/png'
    }
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <SessionProviderWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ClientWrapper>
              <div className="dark:bg-[#0e4028] h-screen">
                {/* <Toaster position="top-center" richColors duration={2000} /> */}
                <Toaster position="top-right" richColors duration={2000} />
                {children}
              </div>
            </ClientWrapper>
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}