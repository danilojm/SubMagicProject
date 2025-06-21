import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/src/components/theme-provider";
import { Toaster } from "@/src/components/ui/sonner";
import { SessionProvider } from "@/src/components/session-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Professional Subtitle Generator",
  description:
    "Advanced AI-powered subtitle generation platform with multi-language support, real-time processing, and professional editing tools.",
  keywords:
    "subtitles, transcription, translation, AI, Whisper, video processing",
  authors: [{ name: "Professional Subtitle Generator Team" }],
  openGraph: {
    title: "Professional Subtitle Generator",
    description: "Advanced AI-powered subtitle generation platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
