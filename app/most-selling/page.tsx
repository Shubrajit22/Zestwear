// app/most-selling/page.tsx
export const dynamic = "force-dynamic";
import { prisma } from '@/lib/prisma';
import MostSelling from '../components/MostSelling';


export default async function MostSellingPage() {
  const products = await prisma.product.findMany({
    orderBy: {
      salesCount: 'desc',
    },
    take: 12,
    select: {
      id: true,
      name: true,
      imageUrl: true,
      rating: true,
      mrpPrice: true,
      price: true,
    },
  });

  return (
    <section className="bg-white text-black py-12 px-4 sm:px-8">
      <h1 className="text-3xl font-bold text-center mb-8">Most Selling Products</h1>
      <MostSelling products={products} />
    </section>
  );
}
