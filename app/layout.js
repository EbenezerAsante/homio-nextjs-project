import "./globals.css";
import { Fraunces } from "next/font/google";
import Navbar from "../components/Navbar";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700", "900"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata = {
  title: "Homio Ghana | Find Your Next Home",
  description: "Ghana's trusted property portal for homes for sale and to let.",
  icons: {
    icon: "/favicon.svg",
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