import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { ProductType } from '@prisma/client';

// Reusable interfaces for input validation
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

  // Existing size data (for display only)
  sizeOptions?: SizeOptionInput[];

  // Existing image data (for display only)
  stockImages?: StockImageInput[];

  // To add
  newSizeOptions?: SizeOptionInput[];
  newStockImages?: StockImageInput[];

  // To selectively delete
  deletedSizeOptionIds?: string[];
  deletedStockImageIds?: string[];
}

// ✅ GET: Fetch all products
export async function GET() {
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

// ✅ POST: Add a new product
export async function POST(req: NextRequest) {
  try {
    const body: ProductRequestBody = await req.json();

    const {
      name,
      description,
      price,
      mrpPrice,
      discount,
      imageUrl,
      categoryId,
      type,
      state,
      district,
      institution,
      color,
      texture,
      neckline,
      sizeOptions = [],
      stockImages = [],
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
          create: sizeOptions
            .filter((s) => s.size && s.price)
            .map((s) => ({
              size: s.size,
              price: s.price,
            })),
        },
        stockImages: {
          create: stockImages.map((img: string | StockImageInput) => ({
            imageUrl: typeof img === "string" ? img : img.imageUrl,
          })),
        },


      },
      include: {
        sizeOptions: true,
        stockImages: true,
      },
    });

    return new Response(JSON.stringify(newProduct), { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// ✅ PUT: Update product
export async function PUT(req: Request) {
  try {
    const body: ProductRequestBody = await req.json();

    const {
      id,
      name,
      description,
      price,
      mrpPrice,
      discount,
      imageUrl,
      categoryId,
      type,
      state,
      district,
      institution,
      color,
      texture,
      neckline,
      newSizeOptions = [],
      deletedSizeOptionIds = [],
      newStockImages = [],
      deletedStockImageIds = [],
    } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Product ID is required' }), { status: 400 });
    }

    const categoryExists = await prisma.productCategory.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return new Response(JSON.stringify({ error: 'Category not found' }), { status: 400 });
    }

    // 🔥 Delete selected size options
    if (deletedSizeOptionIds.length > 0) {
      await prisma.sizeOption.deleteMany({
        where: {
          id: { in: deletedSizeOptionIds },
          productId: id,
        },
      });
    }

    // ✨ Add new size options
    if (newSizeOptions.length > 0) {
      await prisma.sizeOption.createMany({
        data: newSizeOptions.map((size) => ({
          productId: id,
          size: size.size,
          price: size.price,
        })),
      });
    }

    // 🗑️ Delete selected images
    if (deletedStockImageIds.length > 0) {
      await prisma.stockImage.deleteMany({
        where: {
          id: { in: deletedStockImageIds },
          productId: id,
        },
      });
    }

    // ✅ Normalize and create new stock images (type-safe)
    const normalizedStockImages: StockImageInput[] = newStockImages.filter(
      (img): img is StockImageInput => !!img.imageUrl?.trim()
    );

    if (normalizedStockImages.length > 0) {
      await prisma.stockImage.createMany({
        data: normalizedStockImages.map((img) => ({
          productId: id,
          imageUrl: img.imageUrl,
        })),
      });
    }

    // ⚙️ Update main product
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
//DELETE
export async function DELETE(req: Request) {
  try {
    const body: { id: string } = await req.json();
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Product ID is required' }), { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        sizeOptions: true,
        stockImages: true,
        orderItems: true,
        reviews: true,
      },
    });

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }

    // Delete related records first
    await prisma.orderItem.deleteMany({ where: { productId: id } });
    await prisma.review.deleteMany({ where: { productId: id } }); // delete reviews
    await prisma.sizeOption.deleteMany({ where: { productId: id } });
    await prisma.stockImage.deleteMany({ where: { productId: id } });

    // Finally delete the product
    await prisma.product.delete({ where: { id } });

    return new Response(null, { status: 204 });
  } catch (error: unknown) {
  console.error('Error deleting product:', error);

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2003'
  ) {
    return new Response(
      JSON.stringify({
        error: 'Cannot delete product because it is linked to other records',
      }),
      { status: 400 }
    );
  }

  return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
}}
