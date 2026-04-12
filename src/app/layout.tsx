import type { Metadata, Viewport } from "next";
import "./globals.css";
import SWRegister from "./components/SWRegister";

export const metadata: Metadata = {
  title: "Nấu Gì Đây? - AI Cooking Assistant",
  description: "Gợi ý món ăn thông minh dựa trên nguyên liệu của bạn",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nấu Gì Đây?",
  },
};

export const viewport: Viewport = {
  themeColor: "#fcf9ef",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased selection:bg-secondary-container" suppressHydrationWarning>
        <SWRegister />
        {children}
      </body>
    </html>
  );
}
