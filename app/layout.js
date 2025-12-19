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

export const metadata = {
  title: "Muslimah Content Creator - AI-Powered Affiliate Content Generator",
  description: "Generate stunning content for your Muslimah product affiliate marketing with AI. Create captions, images, scripts, and voice overs in seconds.",
  keywords: "muslimah, hijab, content creator, affiliate marketing, AI, OpenAI, DALL-E"
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" data-theme="elegant" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

