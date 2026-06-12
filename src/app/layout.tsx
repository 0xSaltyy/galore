import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { siteUrl } from "@/lib/env";

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
  metadataBase: new URL(siteUrl()),
  title: {
    default: "# galore",
    template: "%s | # galore",
  },
  description:
    "late-night calls, cool people, live rooms.",
  openGraph: {
    title: "# galore",
    description: "late-night calls, cool people, live rooms.",
    images: [
      {
        url: "/images/galore-profile.jpeg",
        width: 736,
        height: 736,
        alt: "# galore profile",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
