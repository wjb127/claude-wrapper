import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ChatProvider } from "@/lib/hooks/use-chat";
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
  title: "Claude Wrapper - Advanced AI Chat Interface",
  description: "Professional Claude AI interface with advanced features like conversation management, file processing, plugins, and more",
  keywords: "Claude AI, Chat Interface, AI Assistant, Conversation Management",
  authors: [{ name: "Claude Wrapper Team" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#8b5cf6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ChatProvider>
          {children}
        </ChatProvider>
      </body>
    </html>
  );
}
