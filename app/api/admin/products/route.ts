// app/api/products/route.ts

import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { ProductType } from '@prisma/client';
import { auth } from '@/lib/auth1'; // ✅ import auth session helper

// Interfaces
interface SizeOptionInput {
  size: string;
  price: number;
}

interface StockImageInput {
  imageUrl: string;
}

interface ProductRequestBody {
  id?: string;
  name: string;
  description: string;
  price: number;
  mrpPrice: number;
  discount: number;
  imageUrl: string;
  categoryId: string;
  type: string;
  state?: string;
  district?: string;
  institution?: string;
  color?: string;
  texture?: string;
  neckline?: string;
  sizeOptions?: SizeOptionInput[];
  stockImages?: StockImageInput[];
  newSizeOptions?: SizeOptionInput[];
  newStockImages?: StockImageInput[];
  deletedSizeOptionIds?: string[];
  deletedStockImageIds?: string[];
}

// ✅ Helper: Check if current user is admin
async function checkAdmin() {
  const session = await auth();
  if (!session?.user) return { status: 401, message: 'Unauthorized' };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });

  if (!user?.isAdmin) return { status: 403, message: 'Forbidden' };

  return null; // ✅ All good
}

// ✅ GET
export async function GET() {
  const authError = await checkAdmin();
  if (authError) return new Response(JSON.stringify({ error: authError.message }), { status: authError.status });

  try {
    const products = await prisma.product.findMany({
      include: {
        stockImages: true,
        sizeOptions: true,
        category: true,
        reviews: true,
      },
    });
    return new Response(JSON.stringify(products), { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// ✅ POST
export async function POST(req: NextRequest) {
  const authError = await checkAdmin();
  if (authError) return new Response(JSON.stringify({ error: authError.message }), { status: authError.status });

  try {
    const body: ProductRequestBody = await req.json();
    const {
      name, description, price, mrpPrice, discount, imageUrl, categoryId, type,
      state, district, institution, color, texture, neckline,
      sizeOptions = [], stockImages = [],
    } = body;

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        mrpPrice,
        discount,
        imageUrl,
        categoryId,
        type: type as ProductType,
        state,
        district,
        institution,
        color,
        texture,
        neckline,
        sizeOptions: {
          create: sizeOptions.filter((s) => s.size && s.price).map((s) => ({
            size: s.size,
            price: s.price,
          })),
        },
        stockImages: {
          create: stockImages.map((img) => ({
            imageUrl: typeof img === 'string' ? img : img.imageUrl,
          })),
        },
      },
      include: { sizeOptions: true, stockImages: true },
    });

    return new Response(JSON.stringify(newProduct), { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// ✅ PUT
export async function PUT(req: Request) {
  const authError = await checkAdmin();
  if (authError) return new Response(JSON.stringify({ error: authError.message }), { status: authError.status });

  try {
    const body: ProductRequestBody = await req.json();
    const {
      id, name, description, price, mrpPrice, discount, imageUrl, categoryId, type,
      state, district, institution, color, texture, neckline,
      newSizeOptions = [], deletedSizeOptionIds = [],
      newStockImages = [], deletedStockImageIds = [],
    } = body;

    if (!id) return new Response(JSON.stringify({ error: 'Product ID is required' }), { status: 400 });

    const categoryExists = await prisma.productCategory.findUnique({ where: { id: categoryId } });
    if (!categoryExists) return new Response(JSON.stringify({ error: 'Category not found' }), { status: 400 });

    if (deletedSizeOptionIds.length)
      await prisma.sizeOption.deleteMany({ where: { id: { in: deletedSizeOptionIds }, productId: id } });

    if (newSizeOptions.length)
      await prisma.sizeOption.createMany({
        data: newSizeOptions.map((size) => ({ productId: id, size: size.size, price: size.price })),
      });

    if (deletedStockImageIds.length)
      await prisma.stockImage.deleteMany({ where: { id: { in: deletedStockImageIds }, productId: id } });

    const normalizedStockImages = newStockImages.filter((img): img is StockImageInput => !!img.imageUrl?.trim());

    if (normalizedStockImages.length)
      await prisma.stockImage.createMany({
        data: normalizedStockImages.map((img) => ({ productId: id, imageUrl: img.imageUrl })),
      });

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        mrpPrice,
        discount,
        imageUrl,
        categoryId,
        type: type as ProductType,
        state,
        district,
        institution,
        color,
        texture,
        neckline,
      },
      include: {
        sizeOptions: true,
        stockImages: true,
      },
    });

    return new Response(JSON.stringify(updatedProduct), { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// ✅ DELETE
export async function DELETE(req: Request) {
  const authError = await checkAdmin();
  if (authError) return new Response(JSON.stringify({ error: authError.message }), { status: authError.status });

  try {
    const { id } = await req.json();
    if (!id) return new Response(JSON.stringify({ error: 'Product ID is required' }), { status: 400 });

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        sizeOptions: true,
        stockImages: true,
        orderItems: true,
        reviews: true,
      },
    });

    if (!product) return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });

    await prisma.orderItem.deleteMany({ where: { productId: id } });
    await prisma.review.deleteMany({ where: { productId: id } });
    await prisma.sizeOption.deleteMany({ where: { productId: id } });
    await prisma.stockImage.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error('Error deleting product:', error);

    if (error?.code === 'P2003') {
      return new Response(JSON.stringify({ error: 'Cannot delete product due to linked records' }), { status: 400 });
    }

    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
