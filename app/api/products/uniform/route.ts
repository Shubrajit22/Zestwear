// /app/api/products/uniform/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const uniforms = await prisma.product.findMany({
      where: {
        type: "UNIFORM",
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        state: true,
        district: true,
        institution: true,
      },
    });

    return NextResponse.json(uniforms);
  } catch (error) {
    console.error("Error fetching uniforms:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
