import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
// GET: Fetch cart items
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            sizeOptions: true, // Optional: If you want to show available sizes too
          },
        },
      },
    });

    // Transform cartItems to include selected size at top level
   const transformedCartItems = cartItems.map(
  (item: Prisma.CartItemGetPayload<{ include: { product: { include: { sizeOptions: true } } } }>) => ({
    id: item.id,
    quantity: item.quantity,
    size: item.size,
    product: {
      id: item.product.id,
      name: item.product.name,
      description: item.product.description,
      imageUrl: item.product.imageUrl,
      sizeOptions: item.product.sizeOptions,
      price: item.product.price,
    },
  })
);


    return NextResponse.json({ cartItems: transformedCartItems }, { status: 200 });
  } catch (error) {
    console.error('GET /api/cart error:', error);
    return NextResponse.json({ message: 'Error fetching cart items' }, { status: 500 });
  }
}

//POST
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { productId, quantity, size } = await req.json();

  if (!productId || quantity <= 0 || !size) {
    return NextResponse.json({ message: 'Valid productId, quantity, and size are required' }, { status: 400 });
  }

  // Check if the product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      sizeOptions: true,
    },
  }) as {
    sizeOptions: Array<{ size: string; price: number }>;
  };
  
  if (!product) {
    return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  }

  // Find the selected size and corresponding price
  const selectedSizeOption = product.sizeOptions.find((option) => option.size === size);

  if (!selectedSizeOption) {
    return NextResponse.json({ message: 'Selected size is not available' }, { status: 400 });
  }

  try {
    const existingItem = await prisma.cartItem.findFirst({
      where: { userId: session.user.id, productId, size },
    });

    if (existingItem) {
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
      return NextResponse.json({ success: true, updatedItem }, { status: 200 });
    }

    const newCartItem = await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        productId,
        quantity,
        size,
        // Store the selected price based on the size
        price: selectedSizeOption.price,
      },
    });

    return NextResponse.json({ success: true, newCartItem }, { status: 201 });
  } catch (error) {
    console.error('POST /api/cart error:', error);
    return NextResponse.json({ message: 'Error adding item to cart' }, { status: 500 });
  }
}



// PUT: Update quantity of a cart item
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { itemId, newQuantity } = await req.json();

  if (!itemId || newQuantity <= 0) {
    return NextResponse.json({ message: 'Valid itemId and quantity are required' }, { status: 400 });
  }

  try {
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: newQuantity },
    });

    return NextResponse.json({ updatedCartItem }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/cart error:', error);
    return NextResponse.json({ message: 'Error updating item quantity' }, { status: 500 });
  }
}

// DELETE: Remove an item from cart
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const cartItemId = url.searchParams.get('cartItemId');

  if (!cartItemId) {
    return NextResponse.json({ message: 'cartItemId is required' }, { status: 400 });
  }

  try {
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json({ message: 'Item removed from cart' }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/cart error:', error);
    return NextResponse.json({ message: 'Error removing item from cart' }, { status: 500 });
  }
}
