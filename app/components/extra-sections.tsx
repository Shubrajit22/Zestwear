"use client";
import { motion } from "framer-motion";
import { Leaf, Truck, Sparkles, Scissors } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

// -------------------------------
// WHY CHOOSE US
// -------------------------------
export const WhyChooseUs = () => {
  const features = [
    { icon: Sparkles, title: "Premium Quality", text: "Crafted with the finest fabrics for unmatched comfort and durability." },
    { icon: Leaf, title: "Sustainable Fabrics", text: "Eco-friendly materials to protect the planet while you look your best." },
    { icon: Truck, title: "Fast Delivery", text: "Quick, reliable shipping so you get your uniforms when you need them." },
    { icon: Scissors, title: "Customizable Options", text: "Tailor colors, logos, and fits to make it uniquely yours." },
  ];

  return (
    <section className="bg-black py-12 sm:py-16 px-4 sm:px-6 md:px-20">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-100 mb-10 sm:mb-14">
          Why Choose Us
        </h2>

        <div className="flex justify-between flex-wrap gap-4">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="flex-1 min-w-[150px] sm:min-w-[180px] md:min-w-[220px] flex flex-col items-center text-center px-4 py-6"
            >
              <f.icon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-100 mb-3 sm:mb-4" />
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-100 mb-1 sm:mb-2">{f.title}</h3>
              <p className="text-gray-300 text-xs sm:text-sm md:text-base">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// -------------------------------
// EDITORIAL / LIFESTYLE BANNER
// -------------------------------
export const EditorialBanner = () => {
  return (
    <section className="relative w-full h-[60vh] sm:h-[70vh] md:h-[100vh] overflow-hidden">
      <Image
        src="/images/editorial.jpg" // replace with your lifestyle photo
        alt="Uniforms Beyond the Classroom"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-top py-10 text-center px-4 sm:px-6 md:px-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase mb-2 sm:mb-4 text-white"
        >
          Uniforms Beyond the Classroom
        </motion.h2>
        <p className="text-gray-200 text-sm sm:text-lg md:text-xl max-w-xl sm:max-w-2xl">
          From school to events — redefine uniforms with comfort and elegance.
        </p>
      </div>
    </section>
  );
};

// -------------------------------
// VIDEO STORYTELLING SECTION
// -------------------------------
export const VideoStory = () => {


  return (
    <section className="relative w-full text-white overflow-hidden">
      <div className="relative w-full h-[70vh] sm:h-[75vh] md:h-[80vh] lg:h-[85vh] xl:h-[90vh] 2xl:h-[95vh]">
        <video
  className="absolute inset-0 w-full h-full object-cover object-[center_40%] sm:object-[center_30%]"
  autoPlay
  loop
  muted
  playsInline
>
  {/* Mobile video for screens <= 639px */}
  <source src="/videos/brand_mobile.mp4" type="video/mp4" media="(max-width: 639px)" />
  {/* Desktop video for screens >= 640px */}
  <source src="/videos/brand.mp4" type="video/mp4" media="(min-width: 640px)" />
  Your browser does not support the video tag.
</video>


        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-3 leading-tight max-w-[90vw] sm:max-w-2xl"
          >
            Wear the Future of Uniforms
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-gray-200 text-sm sm:text-base md:text-lg lg:text-xl max-w-[85vw] sm:max-w-md md:max-w-2xl lg:max-w-4xl mb-4 leading-relaxed"
          >
            From school to events — redefine uniforms with comfort, elegance, and style.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 text-base font-semibold uppercase border border-black bg-white text-black hover:border-6 transition-all duration-300"
            onClick={() => {
              document
                .getElementById("product-categories")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Shop Now
          </motion.button>
        </div>
      </div>
    </section>
  );
};
