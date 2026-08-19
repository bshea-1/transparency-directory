import type { Metadata, Viewport } from "next";
import { FlockMotion } from "../components/FlockMotion";
import { PwaRegistration } from "../components/PwaRegistration";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#060b14",
};

export const metadata: Metadata = {
  title: "Flock Transparency",
  applicationName: "Flock Transparency",
  metadataBase: new URL("https://flocktransparency.vercel.app"),
  manifest: "/manifest.webmanifest",
  description:
    "Search a nationwide directory of public Flock Safety transparency reports by county, agency, or state, and identify jurisdictions without a verified report link.",
  keywords: [
    "Flock Safety",
    "transparency report",
    "ALPR",
    "license plate reader",
    "public safety directory",
    "police transparency portal",
    "county surveillance audit",
  ],
  authors: [{ name: "Flock Transparency Directory" }],
  category: "Government transparency",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon-circle.png", type: "image/png", sizes: "512x512" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Flock Transparency",
  },
  openGraph: {
    title: "Flock Transparency",
    description:
      "Find public Flock Safety transparency reports by county, agency, or state.",
    url: "/",
    type: "website",
    siteName: "Flock Transparency",
    images: [{ url: "/civic-sky-hero.png", width: 1600, height: 900, alt: "Flock Transparency directory" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flock Transparency",
    description:
      "Find public Flock Safety transparency reports by county, agency, or state.",
    images: ["/civic-sky-hero.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon-circle.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      </head>
      <body className="motion-ready">
        <FlockMotion />
        <PwaRegistration />
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
