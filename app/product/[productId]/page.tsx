import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductPageContent from "./ProductPageContent";
import type { Prisma, Product } from "@prisma/client";

export const dynamic = "force-dynamic"; // Ensure the page is always re-rendered

interface ProductPageProps {
  params: { productId: string };
}

// Product with stockImages + sizeOptions
type ProductWithExtras = Prisma.ProductGetPayload<{
  include: {
    stockImages: true;
    sizeOptions: true;
  };
}>;

// Review with user + product
type ReviewWithUser = Prisma.ReviewGetPayload<{
  include: {
    user: { select: { name: true; image: true } };
    product: { select: { name: true } };
  };
}>;

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params; // <-- fix: await params

  if (!productId) return notFound();

  // Fetch the product details
  let product: ProductWithExtras | null = null;
  try {
    product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        stockImages: true,
        sizeOptions: true,
      },
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return notFound();
  }

  if (!product) return notFound();

  // Fetch related products (plain Product type)
  let relatedProducts: Product[] = [];
  try {
    relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        NOT: { id: product.id },
      },
      take: 4,
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    relatedProducts = [];
  }

  // Fetch reviews
  let reviews: ReviewWithUser[] = [];
  try {
    reviews = await prisma.review.findMany({
      where: { productId: product.id },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    reviews = [];
  }

  return (
    <ProductPageContent
      product={product}
      relatedProducts={relatedProducts}
      reviews={reviews}
    />
  );
}
