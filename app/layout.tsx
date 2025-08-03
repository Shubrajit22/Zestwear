// app/layout.tsx
import "./globals.css";
import { Poppins } from "next/font/google";
import SessionWrapper from "./components/sessionwrapper";
import Navbar from "./components/Navbar";
import { CartContextProvider } from "./components/CartContextProvider";
import Footer from "./components/Footer";
import { Toaster } from 'react-hot-toast';
export const dynamic = "force-dynamic";

const poppins = Poppins({
  variable: "--font-poppins",
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
    <html lang="en" className="overflow-x-hidden">
      <body className={`${poppins.variable} antialiased min-h-screen flex flex-col overflow-x-hidden`}>
        <SessionWrapper>
          <CartContextProvider>
            <Navbar/>
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
