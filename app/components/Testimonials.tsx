'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // update isMobile on resize
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(max-width: 767px)').matches);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // advance index
  useEffect(() => {
    const step = isMobile ? 1 : 2;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + step) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isMobile]);

  const visibleCount = isMobile ? 1 : 2;

  // get slice with wrapping
  const getVisible = () => {
    const res = [];
    for (let i = 0; i < visibleCount; i++) {
      res.push(testimonials[(currentIndex + i) % testimonials.length]);
    }
    return res;
  };

  const visibleTestimonials = getVisible();

  return (
    <div className="text-center py-12 overflow-hidden">
      <p className="text-slate-100 font-bold text-4xl mb-10">
        Here are some of our happiest clients
      </p>
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
              <div
                key={i}
                className="bg-white rounded-xl shadow-md p-4 w-[320px] md:w-[400px] text-left"
              >
                <div className="flex gap-4 items-center">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={70}
                    height={70}
                    className="w-[70px] h-[70px] rounded-full object-cover"
                  />

                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{t.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{t.text}</p>
                    <div className="text-yellow-500 mt-2 flex items-center gap-1">
                      {[...Array(5)].map((_, idx) => (
                        <span key={idx} className={t.rating > idx ? '' : 'opacity-40'}>
                          ★
                        </span>
                      ))}
                      <span className="text-xs text-gray-500 ml-2">{t.rating}.0</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Testimonials;
