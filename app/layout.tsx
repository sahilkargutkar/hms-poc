import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CarePoint Medical Clinic | Appointment & Patient Care Desk",
  description: "Direct medical appointment scheduling and clinic patient care desk with 24/7 real-time consultation booking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} min-h-full antialiased scroll-smooth`}
    >
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
