"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const CustomizeHero = () => {
  return (
    <section className="relative w-full bg-white text-black overflow-hidden">
      <div className="max-w-[92%] md:max-w-[85%] mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-20 py-20 md:py-32">
        
        {/* LEFT SIDE */}
        <div className="space-y-10 text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight uppercase"
          >
            Customize
            <br />
            Your Style
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-gray-700 text-lg sm:text-xl max-w-md mx-auto md:mx-0 leading-relaxed"
          >
            Add your own text, colors, and design to make every product
            truly yours. Stand out with one-of-a-kind personalization.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link href="/Customise">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="px-10 py-3 text-lg font-semibold uppercase border border-black bg-black text-white hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-3"
              >
                Start Customizing
                {/* Animated Right Arrow */}
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  whileHover={{ x: 5 }} // moves right on hover
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </motion.svg>
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* RIGHT SIDE: Big Editorial Image */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          whileHover={{ scale: 1.02 }}
          className="w-full h-[480px] sm:h-[600px] md:h-[700px] relative"
        >
          <Image
            src="/images/customise.jpg"
            alt="Customize Product"
            fill
            className="object-cover object-center shadow-xl"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
};

export default CustomizeHero;
