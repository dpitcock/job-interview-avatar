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
  title: "Twinterview Agent | AI Interview Assistant",
  description: "Your AI clone for job interviews. Let your digital avatar handle interviews using your voice, face, and expertise.",
  keywords: ["AI", "interview", "avatar", "voice cloning", "job interview", "automation"],
  authors: [{ name: "Twinterview Agent" }],
  openGraph: {
    title: "Twinterview Agent | AI Interview Assistant",
    description: "Your AI clone for job interviews",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
