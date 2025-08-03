import { PrismaClient, ProductType as PrismaProductType } from "@prisma/client";
import ProductGridClient from "./ProductGridClient";

// Define a more restricted ProductType for the front-end
type ProductType = "SPORTS" | "CASUAL" | "FORMAL";

const prisma = new PrismaClient();

export default async function ShoesPage() {
  const shoesCategory = await prisma.productCategory.findFirst({
    where: { name: "SHOES" },
  });

  if (!shoesCategory) {
    return <div className="text-center text-2xl p-8">Category not found</div>;
  }

  const rawProducts = await prisma.product.findMany({
    where: {
      categoryId: shoesCategory.id,
      type: { in: ["SPORTS", "CASUAL", "FORMAL"] as PrismaProductType[] },
    },
  });

  const products = rawProducts.map((product) => ({
    ...product,
    type: product.type as ProductType,
    rating: product.rating ?? 0,
  }));

  return (
    <div className="min-h-screen p-4 bg-white-gradient items-center mt-10">
      <h1 className="text-3xl font-bold text-center mb-8 mt-10 text-black">Our Shoe Collection</h1>
      <ProductGridClient products={products} />
    </div>
  );
}
