import { getUserOrders } from "@/lib/actions/getUserOrders";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import OrdersPageClient from "./OrdersPageClient";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="flex flex-col min-h-screen justify-center items-center text-center">
        <p className="text-xl text-red-600 font-semibold">
          Please login to view your orders.
        </p>
      </div>
    );
  }

  const orders = await getUserOrders(userId); // Prisma is called only on the server
  return (
    <OrdersPageClient
      orders={JSON.parse(JSON.stringify(orders))}
      userEmail={session.user?.email ?? ""}
    />
  );
}
