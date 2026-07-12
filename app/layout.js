import "./globals.css";
import { Fraunces } from "next/font/google";
import Navbar from "../components/Navbar";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700", "900"],
  variable: "--font-heading",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Homio Ghana | Find Your Next Home",
    template: "%s | Homio Ghana",
  },
  description: "Ghana's trusted property portal for homes for sale and to let. Browse verified properties for sale and rent — from Accra to Kumasi and beyond.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Homio Ghana",
    title: "Homio Ghana | Find Your Next Home",
    description: "Ghana's trusted property portal for homes for sale and to let.",
    url: siteUrl,
    locale: "en_GH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Homio Ghana | Find Your Next Home",
    description: "Ghana's trusted property portal for homes for sale and to let.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fraunces.variable}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}