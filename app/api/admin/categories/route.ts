import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId'); // Get categoryId from query params

  try {
    // If categoryId is provided, fetch products for that category
    if (categoryId) {
      const categoryWithProducts = await prisma.productCategory.findUnique({
        where: { id: categoryId },
        select: {
          id: true,
          name: true,
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
              description: true,
            },
          },
        },
      });

      if (!categoryWithProducts) {
        return NextResponse.json({ message: 'Category not found' }, { status: 404 });
      }

      return NextResponse.json(categoryWithProducts);
    } else {
      // If no categoryId, return all categories with their products
      const categories = await prisma.productCategory.findMany({
        select: {
          id: true,
          name: true,
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              imageUrl: true,
              description: true,
            },
          },
        },
      });

      return NextResponse.json(categories);
    }
  } catch (error) {
    console.error('Failed to fetch categories and products:', error);
    return NextResponse.json({ message: 'Failed to fetch categories and products' }, { status: 500 });
  }
}
