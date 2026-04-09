import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { NavBar } from "@/components/NavBar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ShaqtinBracket 2026",
  description: "NBA Playoff Bracket Prediction Competition",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased min-h-screen bg-background`}>
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
