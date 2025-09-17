import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SnackbarProvider } from "./services/snackbarContext";
import { AllDropdownListDataProvider } from "@/app/components/contexts/allDropdownListData";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hariss International",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <SnackbarProvider>
          <AllDropdownListDataProvider>
        {children}
        </AllDropdownListDataProvider>
        </SnackbarProvider>
      </body>
    </html>
  );
}
