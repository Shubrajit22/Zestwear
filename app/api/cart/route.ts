import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET: Fetch cart items
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({}, { status: 401 });
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            sizeOptions: true,
          },
        },
      },
    });

    const transformedCartItems = cartItems.map(
      (
        item: Prisma.CartItemGetPayload<{
          include: { product: { include: { sizeOptions: true } } };
        }>
      ) => ({
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
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}

// POST: Add to cart
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({}, { status: 401 });
  }

  const { productId, quantity, size } = await req.json();

  if (!productId || quantity <= 0 || !size) {
    return NextResponse.json({}, { status: 400 });
  }

  const product = (await prisma.product.findUnique({
    where: { id: productId },
    include: {
      sizeOptions: true,
    },
  })) as {
    sizeOptions: Array<{ size: string; price: number }>;
  };

  if (!product) {
    return NextResponse.json({}, { status: 404 });
  }

  const selectedSizeOption = product.sizeOptions.find((option) => option.size === size);

  if (!selectedSizeOption) {
    return NextResponse.json({}, { status: 400 });
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
      return NextResponse.json({ updatedItem }, { status: 200 });
    }

    const newCartItem = await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        productId,
        quantity,
        size,
        price: selectedSizeOption.price,
      },
    });

    return NextResponse.json({ newCartItem }, { status: 201 });
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}

// PUT: Update quantity
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({}, { status: 401 });
  }

  const { itemId, newQuantity } = await req.json();

  if (!itemId || newQuantity <= 0) {
    return NextResponse.json({}, { status: 400 });
  }

  try {
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: newQuantity },
    });

    return NextResponse.json({ updatedCartItem }, { status: 200 });
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}

// DELETE: Remove from cart
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({}, { status: 401 });
  }

  const url = new URL(req.url);
  const cartItemId = url.searchParams.get("cartItemId");

  if (!cartItemId) {
    return NextResponse.json({}, { status: 400 });
  }

  try {
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json({}, { status: 200 });
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}
