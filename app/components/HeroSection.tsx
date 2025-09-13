"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import SearchBarWithResults from "./search";

const HeroSection = () => {
  return (
    <section className="relative w-full bg-white text-black overflow-hidden min-h-screen">
      {/* Background Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large Circle */}
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 180 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute -top-32 -right-32 w-64 h-64 bg-black rounded-full opacity-15"
        />
        {/* Rectangle */}
        <motion.div
          initial={{ x: -200, rotate: 0 }}
          animate={{ x: 0, rotate: 45 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute top-1/4 -left-16 w-32 h-32 bg-black opacity-60"
        />
        {/* Triangle */}
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 0.05 }}
          transition={{ duration: 1.8, delay: 0.5 }}
          className="absolute bottom-1/4 right-1/4 w-0 h-0 border-l-[60px] border-r-[60px] border-b-[104px] border-l-transparent border-r-transparent border-b-black"
        />
      </div>

      <div className="relative max-w-[92%] md:max-w-[85%] mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-20 py-20 md:py-32">
        {/* LEFT SIDE */}
        <div className="space-y-10 text-center md:text-left relative">
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.1] tracking-tight uppercase"
          >
            DISCOVER <br />
            YOUR PERFECT FIT
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-gray-700 text-lg sm:text-xl max-w-md mx-auto md:mx-0 leading-relaxed"
          >
            Reliable, premium-quality uniforms tailored for comfort and style.
            From classrooms to events — your wardrobe starts here.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-md mx-auto md:mx-0"
          >
            <SearchBarWithResults />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="relative"
          >
            <button
              className="px-10 py-3 text-lg font-semibold uppercase border border-black bg-black text-white hover:bg-white hover:text-black transition-all duration-300"
              onClick={() => {
                document
                  .getElementById("product-categories")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Shop Now
            </button>

            {/* Shapes near button */}
            <motion.div
              animate={{ y: [0, -10, 0], x: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 w-4 h-4 bg-black rounded-full opacity-90"
            />
            <motion.div
              animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 right-4 w-10 h-10 bg-black rounded-full opacity-90"
            />
          </motion.div>
        </div>

        {/* RIGHT SIDE: Hero Image */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          whileHover={{ scale: 1.02 }}
          className="w-full h-[480px] sm:h-[600px] md:h-[700px] relative"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full relative rounded-lg overflow-hidden shadow-2xl"
          >
            <Image
              src="/home/hero.jpg"
              alt="Editorial Uniform"
              fill
              className="w-full h-full object-cover object-center"
              priority
            />

            {/* Shapes near image */}
            <motion.div
              animate={{ y: [0, -15, 0], x: [0, 15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -left-10 w-6 h-6 bg-black rounded-full opacity-30"
            />
            <motion.div
              animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 right-10 w-8 h-8 bg-black rounded-full opacity-25"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
