'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SearchBarWithResults from './search';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <section
      className="relative w-full text-white overflow-hidden pt-40 py-10"
      style={{ minHeight: 'calc(100vh - 88px)' }}
    >
      <div className="max-w-[90%] md:max-w-[80%] mx-auto grid grid-cols-1 md:grid-cols-2 items-start gap-12 md:gap-20 px-4 md:px-12 relative z-0">
        {/* LEFT SIDE */}
        <div className="space-y-6 text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-snug sm:leading-tight"
          >
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Discover Your Perfect Fit
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-gray-300 text-base sm:text-lg md:text-xl max-w-lg mx-auto md:mx-0"
          >
            Find the best, reliable, and high quality uniforms here. We focus on
            product quality. Uniforms for almost all schools—so why wait? Order now!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="max-w-md mx-auto md:mx-0"
          >
            <SearchBarWithResults />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <button
              className="px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg rounded-full bg-white text-black hover:bg-yellow-300 transition font-semibold shadow-lg hover:cursor-pointer"
              onClick={() => {
                document.getElementById('product-categories')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Shop Now
            </button>
          </motion.div>
        </div>

        {/* RIGHT SIDE: Image with motion */}
        <motion.div
  initial={{ opacity: 0, x: 50 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.8 }}
  whileHover={{ scale: 1.05 }}
  className="w-full max-w-[160px] sm:max-w-[240px] md:max-w-md lg:max-w-lg mx-auto md:ml-auto pr-2 sm:pr-4 md:pr-8"
>
  <Image
    src="/images/customise.png"
    alt="Customize illustration"
    width={500}
    height={600}
    className="w-full h-auto object-contain drop-shadow-xl rounded-xl"
    priority
  />
</motion.div>


      </div>
    </section>
  );
};

export default HeroSection;
