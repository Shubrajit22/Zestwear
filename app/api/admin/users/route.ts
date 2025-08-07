// app/api/users/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth1";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth(); // Or use getServerSession()

    // 🔒 Check if user is logged in
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 🔒 Check if user is an admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user?.isAdmin) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // ✅ Fetch all users (including isAdmin)
    const allUsers = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
    isAdmin: true,
    mobile: true,        // ✅ added
    createdAt: true,     // ✅ added
  },
});


    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
