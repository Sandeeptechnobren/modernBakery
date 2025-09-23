import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SnackbarProvider } from "./services/snackbarContext";
import "./globals.css";
import { LoadingProvider } from "./services/loadingContext";

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
          <LoadingProvider>
            <SnackbarProvider>
              {children}
            </SnackbarProvider>
          </LoadingProvider>
      </body>
    </html>
  );
}
