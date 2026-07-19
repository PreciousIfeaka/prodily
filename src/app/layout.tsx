import type { Metadata } from "next";
import "./globals.css";
import TopNav from "@/components/TopNav";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Prodily — Reward & Recognition",
  description: "Employee reward, recognition, and admin platform.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain antialiased">
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <ToastProvider>
          <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 pt-6 pb-16">
            <TopNav />
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
