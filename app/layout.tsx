import "./globals.css";
import { Poppins, Inter } from "next/font/google";
import SessionWrapper from "./components/sessionwrapper";
import Navbar from "./components/Navbar";
import { CartContextProvider } from "./components/CartContextProvider";
import Footer from "./components/Footer";
import { Toaster } from "react-hot-toast";

export const dynamic = "force-dynamic";

// Import fonts with CSS variables
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "Zestwear",
  description: "Assam's Uniform Startup",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark overflow-x-hidden">
      <body
        className={`${poppins.variable} ${inter.variable} antialiased min-h-screen flex flex-col overflow-x-hidden bg-gray-900 text-white font-inter`}
      >
        <SessionWrapper>
          <CartContextProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
              <Toaster position="top-center" reverseOrder={false} />
            </main>
            <Footer />
          </CartContextProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
