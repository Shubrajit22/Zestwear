import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.productCategory.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
        description: true,
        order: true, // include the order field
      },
      orderBy: {
        order: "asc", // sort by the numeric order field
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
