import { getUserOrders } from "@/lib/actions/getUserOrders";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { getNumericOrderId } from "@/lib/utils";
import CancelOrderButton from "../components/CancelOrderButton";

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

  const orders = await getUserOrders(userId);

  return (
    <div className="flex flex-col min-h-screen items-center px-4 py-8">
      <main className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-100">
          Your Orders
        </h1>

        {orders.length === 0 ? (
          <p className="text-gray-600 text-center">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow-md border border-gray-200 rounded-lg p-6 transition hover:shadow-lg"
              >
                {/* Order Header */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Order ID:{" "}
                    <span className="text-indigo-600">
                      #{getNumericOrderId(order.id)}
                    </span>
                  </h2>
                  <p className="text-sm text-gray-500">
                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-200">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 py-4">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {item.product.name}
                        </p>
                        <div className="text-sm text-gray-600 flex flex-col sm:flex-row gap-2 sm:gap-4">
                          <span>Quantity: {item.quantity}</span>
                          <span>Size: {item.size || "N/A"}</span>
                          <span>Price: ₹{item.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status Row with Cancel Button */}
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
                    Status: {order.status}
                  </span>
                  <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700">
                    Payment: {order.paymentStatus}
                  </span>
                  <span className="px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-700">
                    Shipping: {order.shippingStatus}
                  </span>

                  {/* Cancel Button inside Card */}
                  {order.shippingStatus === "processing" &&
                    order.status !== "cancelled" && (
                      <CancelOrderButton orderId={order.id} />
                    )}

                  {/* Price at End */}
                  <span className="ml-auto font-semibold text-lg text-gray-800">
                    ₹{order.totalAmount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
