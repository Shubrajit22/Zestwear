'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <section className="relative w-full bg-white text-black h-[100vh] flex items-center justify-center px-4 sm:px-6 md:px-20 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left Text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex-1 text-center md:text-left space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase">
            About Zestwear
          </h2>
          <p className="text-base sm:text-lg md:text-lg leading-relaxed">
            <span className="font-semibold">Zestwear</span> is Assam’s first revolutionary online uniform startup, 
            transforming how you shop for uniforms, customized t-shirts, jerseys, and sports items.
          </p>
          <p className="text-base sm:text-lg md:text-lg leading-relaxed">
            Our seamless platform allows effortless booking and customization, ensuring 
            <span className="font-semibold"> quick and reliable home delivery</span> 
            and <span className="font-semibold">top-quality products</span>.
          </p>
          <p className="text-base sm:text-lg md:text-lg leading-relaxed">
            Experience <span className="font-semibold">convenience, quality, and style</span> all in one place with 
            <span className="font-semibold"> Zestwear!</span>
          </p>
        </motion.div>

        {/* Right Image */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="flex-1 flex justify-center md:justify-end"
        >
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg">
            <Image
              src="/images/logo.jpg"
              alt="Zestwear Logo"
              width={500}
              height={500}
              className="object-contain rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-700"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
