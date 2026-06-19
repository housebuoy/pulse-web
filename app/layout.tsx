import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/app/providers";


const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pulse Health",
  description: "Eliminate the waiting room.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
         <Providers>{children}</Providers>
      </body>
    </html>
  );
}