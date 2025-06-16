import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { SessionProvider } from '@/components/session-provider';
var inter = Inter({ subsets: ['latin'] });
export var metadata = {
    title: 'Professional Subtitle Generator',
    description: 'Advanced AI-powered subtitle generation platform with multi-language support, real-time processing, and professional editing tools.',
    keywords: 'subtitles, transcription, translation, AI, Whisper, video processing',
    authors: [{ name: 'Professional Subtitle Generator Team' }],
    openGraph: {
        title: 'Professional Subtitle Generator',
        description: 'Advanced AI-powered subtitle generation platform',
        type: 'website',
    },
};
export default function RootLayout(_a) {
    var children = _a.children;
    return (<html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>);
}
//# sourceMappingURL=layout.jsx.map