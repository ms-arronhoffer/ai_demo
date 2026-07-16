import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/source-serif-4";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Demos | Build & Ship Software with AI",
  description:
    "An interactive catalog of demos showing how AI accelerates software delivery — from the AI-powered SDLC to deploying apps and AI resources with Infrastructure as Code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream font-sans text-charcoal">
        {children}
      </body>
    </html>
  );
}
