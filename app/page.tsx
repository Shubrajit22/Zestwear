import HeroSection from "./components/HeroSection";
import MostSelling, { Product } from "./components/MostSelling";
import { CategoryGrid } from './components/CategoryGrid';
import CustomizeCard from "./components/Customise";
import ScrollAnimationWrapper from "./components/ScrollAnimationWrapper";
import { prisma } from '@/lib/prisma';
import { WhyChooseUs, VideoStory, EditorialBanner } from "./components/extra-sections";

export default async function Home() {
  let mostSellingProducts: Product[] = [];

  try {
    const products = await prisma.product.findMany({
      orderBy: {
        reviews: { _count: 'desc' },
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
          ? p.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / p.reviews.length
          : null,
      reviewCount: p.reviews.length,
    }));
  } catch (error) {
    console.error("Error fetching most reviewed products:", error);
  }

  return (
   <main className="relative w-full bg-black text-white">
  {/* Hero Section */}
  <section className="relative w-full min-h-screen flex items-center">
    <HeroSection />
  </section>
 <div className="h-0.5 sm:h-0.5"></div> {/* space after Hero */}

  {/* Product Categories */}
  <ScrollAnimationWrapper>
    <section id="product-categories" className="bg-white text-black py-16 px-6 md:px-20">
      <h2 className="text-4xl font-bold text-center mb-12">Product Categories</h2>
      <CategoryGrid />
    </section>
  </ScrollAnimationWrapper>
  <div className="h-0.5 sm:h-0.5"></div> {/* space after Product Categories */}

  {/* Why Choose Us */}
  <ScrollAnimationWrapper delay={0.2}>
    <section className="bg-black text-white ">
      <WhyChooseUs />
    </section>
  </ScrollAnimationWrapper>
  <div className="h-0.5 sm:h-0.5"></div> {/* space after Why Choose Us */}

  {/* Customize Your Product */}
  <ScrollAnimationWrapper delay={0.4}>
    <section className="bg-black text-white ">
      <CustomizeCard />
    </section>
  </ScrollAnimationWrapper>

  {/* Editorial Banner */}
  <ScrollAnimationWrapper delay={0.8}>
    <section className="bg-white text-black ">
      <EditorialBanner />
    </section>
  </ScrollAnimationWrapper>

  {/* Most Selling Products */}
  <ScrollAnimationWrapper delay={0.6}>
    <section className=" text-white ">
      <MostSelling products={mostSellingProducts} />
    </section>
  </ScrollAnimationWrapper>

  {/* Video Storytelling */}
  <ScrollAnimationWrapper delay={1}>
    <section className=" text-white ">
      <VideoStory />
    </section>
  </ScrollAnimationWrapper>
</main>

  );
}
