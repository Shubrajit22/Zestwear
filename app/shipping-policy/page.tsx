export default function ShippingPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 mt-32 bg-white shadow-xl rounded-2xl border border-gray-200">
      <h1 className="text-4xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
        Shipping Policy
      </h1>

      <p className="text-lg text-gray-600 mb-6">
        We aim to deliver your Zestwear orders swiftly and securely:
      </p>

      <ul className="list-disc list-inside text-base text-gray-700 space-y-3 mb-6">
        <li>Orders are processed within <span className="font-semibold">2–3 business days</span>.</li>
        <li>Estimated delivery time is <span className="font-semibold">5–7 business days</span>, depending on location.</li>
        <li>Shipping charges (if any) will be displayed at checkout.</li>
        <li>We currently ship across all major cities in India.</li>
        <li>Tracking details will be shared via email once dispatched.</li>
      </ul>

      <p className="text-gray-600">
        For shipping updates or issues, contact us at{" "}
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
