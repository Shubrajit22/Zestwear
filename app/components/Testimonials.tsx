'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaRegStar } from "react-icons/fa";

const testimonials = [
  {
    name: 'Himadri Das',
    text: 'This is the best place to get premium quality school uniforms.',
    image: '/images/user4.jpg',
    rating: 5,
  },
  {
    name: 'Sujal Debnath',
    text: 'Fast delivery and good quality products. Highly recommended for everyone.',
    image: '/images/user1.jpg',
    rating: 4,
  },
  {
    name: 'Rupomi Dutta',
    text: 'The uniforms fit perfectly and the fabric quality is excellent. Thank you Zestwear!',
    image: '/images/user5.jpg',
    rating: 5,
  },
  {
    name: 'Pritam Baruah',
    text: 'Amazing designs and affordable prices. Will definitely order again.',
    image: '/images/user3.png',
    rating: 4,
  },
  {
    name: 'Soumya Chakraborty',
    text: 'Great customer service and reliable delivery. Loved the experience!',
    image: '/images/user2.png',
    rating: 5,
  },
  {
    name: 'Aditi Sharma',
    text: 'Uniforms are durable and look very neat. Perfect for our school.',
    image: '/images/user6.jpg',
    rating: 5,
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // detect screen size
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(max-width: 767px)').matches);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // auto slide
  useEffect(() => {
    const step = isMobile ? 1 : 2;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + step) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isMobile]);

  const visibleCount = isMobile ? 1 : 2;

  const getVisible = () => {
    const res = [];
    for (let i = 0; i < visibleCount; i++) {
      res.push(testimonials[(currentIndex + i) % testimonials.length]);
    }
    return res;
  };

  const visibleTestimonials = getVisible();

  return (
    <section className="relative bg-black text-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <h2 className="text-3xl md:text-5xl font-bold tracking-wide uppercase text-center mb-14">
          What Our Clients Say
        </h2>

        {/* Testimonials Carousel */}
        <div className="relative flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentIndex}-${visibleCount}`}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className={`flex gap-8 justify-center ${
                isMobile ? 'flex-col items-center' : 'flex-row items-start'
              }`}
            >
              {visibleTestimonials.map((t, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/90 text-black backdrop-blur-sm border border-gray-200 
                             rounded-2xl shadow-lg p-6 w-[320px] md:w-[380px] 
                             transition duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <Image
                      src={t.image}
                      alt={t.name}
                      width={70}
                      height={70}
                      className="w-[70px] h-[70px] rounded-full object-cover"
                    />
                    <h4 className="font-semibold text-lg text-gray-900">{t.name}</h4>
                  </div>

                  <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-4">
                    {t.text}
                  </p>

                  <div className="flex flex-col items-start">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, idx) =>
                        t.rating > idx ? (
                          <FaStar key={idx} className="text-yellow-500" />
                        ) : (
                          <FaRegStar key={idx} className="text-gray-400" />
                        )
                      )}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">{t.rating}.0</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
