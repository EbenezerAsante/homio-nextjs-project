import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Homio Ghana | Find Your Next Home",
  description: "Ghana's trusted property portal for homes for sale and to let.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
