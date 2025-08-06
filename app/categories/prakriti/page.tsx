import { PrismaClient, ProductType as PrismaProductType } from "@prisma/client";
import ProductGridClient from "./ProductGridClient";

export const dynamic = "force-dynamic";

// Restrict ProductType to only TSHIRT for frontend
type ProductType = "TSHIRT";

const prisma = new PrismaClient();

export default async function PrakritiPage() {
  const prakritiCategory = await prisma.productCategory.findFirst({
    where: { name: "PRAKRITI" },
  });

  if (!prakritiCategory) {
    return <div className="text-center text-2xl p-8">Category not found</div>;
  }

  const rawProducts = await prisma.product.findMany({
    where: {
      categoryId: prakritiCategory.id,
      type: "TSHIRT", // Only TSHIRT
    },
  });

  const products = rawProducts.map((product) => ({
    ...product,
    type: product.type as ProductType, // Safely cast to frontend ProductType
    rating: product.rating ?? 0,
  }));

  return (
    <div className="min-h-screen p-4 bg-white-gradient mt-10">
      <h1 className="text-3xl font-bold text-center mb-8 mt-10 text-black">Prakriti</h1>
      <ProductGridClient products={products} />
    </div>
  );
}
