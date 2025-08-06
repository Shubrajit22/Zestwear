"use client";

import { FaFacebookF, FaInstagram } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Grid: Always 4 columns on large screens */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left mb-6">
          {/* About */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-3">About</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <Link href="/" className="hover:text-yellow-500">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-yellow-500">
                  About us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <Link href="/contact" className="hover:text-yellow-500">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-yellow-500">
                  Your Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-3">Policies</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <Link href="/shipping-policy" className="hover:text-yellow-500">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/cancellations-and-refunds" className="hover:text-yellow-500">
                  Cancellations & Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-yellow-500">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions" className="hover:text-yellow-500">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-3">Follow Us</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a
                aria-label="Facebook"
                href="https://www.facebook.com/share/1AjbgiX7on/?mibextid=qi2Omg"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-yellow-500 hover:text-white transition"
              >
                <FaFacebookF className="text-gray-700 text-lg" />
              </a>
              <a
                aria-label="Instagram"
                href="https://www.instagram.com/zestwearindia?igsh=MWlpdHUzbzk2M283NA=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-yellow-500 hover:text-white transition"
              >
                <FaInstagram className="text-gray-700 text-lg" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Brand & Copy */}
        <div className="text-center border-t border-gray-200 pt-4">
          <h2 className="text-xl font-bold text-gray-800">
            Zestwear <span className="text-yellow-500">India</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            © {new Date().getFullYear()} Zestwear India. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
