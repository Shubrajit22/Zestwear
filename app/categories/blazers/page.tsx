import { PrismaClient, ProductType as PrismaProductType } from "@prisma/client";
import ProductGridClient from "./ProductGridClient";
export const dynamic = "force-dynamic";

// Front-end product type (restricted to blazers & coats for this page)
type ProductType = "BLAZERS" | "COAT";

const prisma = new PrismaClient();

export default async function BlazersCategoryPage() {
  const blazersCategory = await prisma.productCategory.findFirst({
    where: { name: "BLAZERS" }, // category
  });

  if (!blazersCategory) {
    return <div className="text-center text-2xl p-8">Category not found</div>;
  }

  // fetch both blazers and coat types
  const rawProducts = await prisma.product.findMany({
    where: {
      categoryId: blazersCategory.id,
      type: { in: ["BLAZERS", "COAT"] as PrismaProductType[] },
    },
  });

  const products = rawProducts.map((product) => ({
    ...product,
    type: product.type as ProductType,
    rating: product.rating ?? 0,
  }));

  return (
    <div className="min-h-screen p-4 bg-white-gradient mt-10">
      <h1 className="text-3xl font-bold text-center mb-8 mt-10 text-black">
        Blazers Collection
      </h1>
      <ProductGridClient products={products} />
    </div>
  );
}
