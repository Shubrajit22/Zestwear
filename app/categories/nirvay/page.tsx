import { PrismaClient, ProductType as PrismaProductType } from "@prisma/client";
import ProductGridClient from "./ProductGridClient";

// Define a more restricted ProductType for the front-end
type ProductType = "TSHIRT" | "HOODIE"; // Your front-end restricted ProductType

const prisma = new PrismaClient();

export default async function NirbhayPage() {
  const brahmandCategory = await prisma.productCategory.findFirst({
    where: { name: "NIRVAY" },
  });

  if (!brahmandCategory) {
    return <div className="text-center text-2xl p-8">Category not found</div>;
  }

  const rawProducts = await prisma.product.findMany({
    where: {
      categoryId: brahmandCategory.id,
      type: { in: ["TSHIRT", "HOODIE"] as PrismaProductType[] }, // PrismaProductType from the backend
    },
  });

  // Map over products to ensure rating is never null and cast types for ProductType
  const products = rawProducts.map((product) => ({
    ...product,
    type: product.type as ProductType, // Explicitly cast the type to the front-end ProductType
    rating: product.rating ?? 0, // Default to 0 if rating is null
  }));

  return (
    <div className="min-h-screen p-4 bg-white-gradient mt-10">
      <h1 className="text-3xl font-bold text-center mb-8 mt-10 text-black">निर्भय</h1>
      <ProductGridClient products={products} />
    </div>
  );
}
