import { PrismaClient, ProductType as PrismaProductType } from "@prisma/client";
import ProductGridClient from "./ProductGridClient";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function FormalsPage() {
  const formalsCategory = await prisma.productCategory.findFirst({
    where: { name: "FORMALS" },
  });

  if (!formalsCategory) {
    return <div className="text-center text-2xl p-8">Formals category not found</div>;
  }

  const rawProducts = await prisma.product.findMany({
    where: {
      categoryId: formalsCategory.id,
      type: { in: ["SHIRT", "PANTS"] as PrismaProductType[] },
    },
    orderBy: { createdAt: "desc" },
  });

  // Map and cast type safely for client
  const products = rawProducts.map((p) => ({
    ...p,
    type: p.type as "SHIRT" | "PANTS",
    rating: p.rating ?? 0,
  }));

  return (
    <div className="min-h-screen p-4 bg-white-gradient mt-10">
      <h1 className="text-3xl font-bold text-center mb-8 mt-10 text-black">Formals</h1>
      <ProductGridClient products={products} />
    </div>
  );
}
