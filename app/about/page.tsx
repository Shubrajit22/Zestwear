"use client";
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden mt-20">
      {/* Background gradient blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-500/20 via-cyan-500/20 to-transparent rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center min-h-screen px-8 md:px-20 py-10 gap-16">
        {/* Left Text Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl text-center md:text-left"
        >
          <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            About Zestwear
          </h1>
          <p className="text-gray-300 leading-relaxed text-lg md:text-xl">
            <span className="font-semibold text-white">Zestwear</span> is Assam’s first 
            revolutionary online uniform startup, dedicated to transforming how you 
            shop for uniforms, customized t-shirts, jerseys, and sports items.
          </p>
          <p className="text-gray-300 leading-relaxed text-lg md:text-xl mt-4">
            With our seamless online platform, you can book and customize your products effortlessly, 
            ensuring <span className="text-yellow-300 font-semibold">quick and reliable home delivery</span>. 
            Our commitment to innovation and excellence drives us to provide 
            <span className="text-yellow-300 font-semibold"> top-quality products</span>, promising 
            to contribute to building a new India.
          </p>
          <p className="text-gray-300 leading-relaxed text-lg md:text-xl mt-4">
            Experience <span className="text-yellow-300 font-semibold">convenience, quality, and style </span> 
            all in one place with <span className="font-semibold text-white">Zestwear!</span>
          </p>
        </motion.div>

        {/* Right Image Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-shrink-0"
        >
          <Image
            src="/home/logo1.jpeg"
            alt="Zestwear Logo"
            width={500}
            height={500}
            className="object-contain rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-700"
          />
        </motion.div>
      </div>
    </div>
  );
}
