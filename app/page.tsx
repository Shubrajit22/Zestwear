import HeroSection from "./components/HeroSection";
import MostSelling, { Product } from "./components/MostSelling";
import { CategoryGrid } from './components/CategoryGrid';
import Testimonials from "./components/Testimonials";
import CustomizeCard from "./components/Customise";
import ScrollAnimationWrapper from "./components/ScrollAnimationWrapper";
import { prisma } from '@/lib/prisma';

export default async function Home() {
  let mostSellingProducts: Product[] = [];

  try {
    const products = await prisma.product.findMany({
      orderBy: {
        reviews: {
          _count: 'desc', // sort by most reviewed first
        },
      },
      take: 6,
      include: { reviews: true },
    });

    mostSellingProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      imageUrl: p.imageUrl,
      mrpPrice: p.mrpPrice,
      price: p.price,
      rating:
        p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
            p.reviews.length
          : null,
      reviewCount: p.reviews.length,
    }));
  } catch (error) {
    console.error("Error fetching most reviewed products:", error);
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

      {/* Most Reviewed */}
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
