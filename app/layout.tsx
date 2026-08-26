import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import WhatsAppWidget from "./components/WhatsAppWidget";
import PendingRequirementResolver from "./components/PendingRequirementResolver";
// ChatWidget (AI assistant, app/components/ChatWidget.tsx + app/api/chat)
// is built and ready but disabled until traffic justifies the API cost —
// re-enable by importing it and adding <ChatWidget /> below.

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://futuremindsindia.com";
const title = "Future Minds — Managed Tutor Marketplace";
const description =
  "Future Minds hand-picks the right educator for your child, coordinates the demo, and only releases payment once the class is confirmed.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Future Minds",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
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
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <PendingRequirementResolver />
        <WhatsAppWidget />
      </body>
    </html>
  );
}
