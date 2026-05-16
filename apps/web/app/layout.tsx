import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import { AnnouncementBanner } from "@/components/announcement-banner";

export const metadata: Metadata = {
  title: {
    default: "Legendary Community",
    template: "%s | Legendary Community",
  },
  description: "The ultimate Discord community platform. Talk, game, make friends, and join a high-quality society.",
  keywords: ["discord", "community", "gaming", "server", "roles", "verification"],
  authors: [{ name: "Legendary Community" }],
  creator: "Legendary Community",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "Legendary Community",
    description: "The ultimate Discord community platform.",
    siteName: "Legendary Community",
  },
  twitter: {
    card: "summary_large_image",
    title: "Legendary Community",
    description: "The ultimate Discord community platform.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="animated-gradient-bg min-h-screen antialiased">
        <Providers>
          <AnnouncementBanner />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
