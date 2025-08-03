import HeroSection from "./components/HeroSection";
import MostSelling from "./components/MostSelling";
import { CategoryGrid } from './components/CategoryGrid';
import Testimonials from "./components/Testimonials";
import CustomizeCard from "./components/Customise";
import ScrollAnimationWrapper from "./components/ScrollAnimationWrapper";
import { prisma } from '@/lib/prisma';
import { Product } from '@prisma/client';

export default async function Home() {
  let mostSellingProducts: Product[] = [];

  try {
    mostSellingProducts = await prisma.product.findMany({
      orderBy: {
        salesCount: 'desc',
      },
      take: 6,
    });
  } catch (error) {
    console.error("Error fetching most selling products:", error);
  }
  return (
    <>
      <main className="text-white relative">
        {/* Background gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-500/20 via-cyan-500/20 to-transparent rounded-full blur-3xl"></div>

        {/* Hero */}
        <div className="w-full h-screen flex items-center relative z-10">
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-12">
            <HeroSection />
          </div>
        </div>
      </main>

      {/* Categories */}
      <ScrollAnimationWrapper>
        <section id="product-categories" className="w-full bg-white text-black py-12 px-4 md:px-20">
          <h1 className="text-center text-4xl font-bold mb-8">Product Categories</h1>
          <CategoryGrid />
        </section>
      </ScrollAnimationWrapper>

      {/* Customize */}
      <ScrollAnimationWrapper delay={0.2}>
        <section>
          <CustomizeCard />
        </section>
      </ScrollAnimationWrapper>

      {/* Most Selling */}
      <ScrollAnimationWrapper delay={0.4}>
        <section>
          <MostSelling products={mostSellingProducts} />
        </section>
      </ScrollAnimationWrapper>

      {/* Testimonials */}
      <ScrollAnimationWrapper delay={0.6}>
        <section>
          <Testimonials />
        </section>
      </ScrollAnimationWrapper>
    </>
  );
}
