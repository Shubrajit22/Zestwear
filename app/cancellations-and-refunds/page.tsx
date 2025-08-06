export default function CancellationsAndRefunds() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 mt-32 bg-white shadow-xl rounded-2xl border border-gray-200">
      <h1 className="text-4xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
        Cancellations & Refunds
      </h1>

      <p className="text-lg text-gray-600 mb-6">
        At Zestwear India, we understand that plans can change. Here's our transparent and simple policy:
      </p>

      <ul className="list-disc list-inside text-base text-gray-700 space-y-3 mb-6">
        <li>
          Orders can be cancelled within <span className="font-semibold">24 hours</span> of placement.
        </li>
        <li>
          Refunds will be processed within <span className="font-semibold">7–10 business days</span>.
        </li>
        <li>
          Refunds will be credited to the <span className="font-semibold">original payment method</span> only.
        </li>
        <li>
          Items that are <span className="font-semibold">used or damaged</span> are not eligible for return or refund.
        </li>
      </ul>

      <p className="text-gray-600">
        Have any questions? Reach out to us at{" "}
        <a
          href="mailto:zestwearindia.info@gmail.com"
          className="text-blue-600 hover:underline"
        >
          zestwearindia.info@gmail.com
        </a>
        .
      </p>
    </div>
  );
}
