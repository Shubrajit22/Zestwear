'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { Button } from "@/app/components/ui/button";
import { motion } from 'framer-motion';

const CustomizeCard = () => {
  return (
    <section className="w-full max-w-[80%] mx-auto flex flex-col-reverse md:flex-row items-center justify-between px-4 sm:px-6 md:px-16 py-10 md:py-20 gap-8">
      
      {/* Left content */}
      <div className="text-center md:text-left max-w-xl">
        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
          <Sparkles className="text-white w-6 h-6" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Customize Your Product
          </h2>
        </div>

        <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-6">
          Personalize your order with your own colors, text, and design. Stand out with your own unique creation.
        </p>

        <Link href="/Customise">
          <Button className="bg-white text-black hover:bg-yellow-300 hover:cursor-pointer rounded-full text-sm sm:text-base px-6 py-4 sm:py-5 font-semibold transition">
            Start Customizing
          </Button>
        </Link>
      </div>

      {/* Right illustration with motion */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        whileHover={{ scale: 1.05 }}
        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
      >
        <Image
          src="/images/customise.png"
          alt="Customize illustration"
          width={500}
          height={600}
          className="w-full h-auto object-contain drop-shadow-xl"
        />
      </motion.div>
    </section>
  );
};

export default CustomizeCard;
