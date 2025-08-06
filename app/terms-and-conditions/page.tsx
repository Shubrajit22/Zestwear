export default function TermsAndConditions() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 mt-32 bg-white shadow-xl rounded-2xl border border-gray-200 mb-20">
      <h1 className="text-4xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
        Terms & Conditions
      </h1>

      <p className="text-lg text-gray-600 mb-6">
        By using Zestwear India, you agree to our terms outlined below:
      </p>

      <ul className="list-disc list-inside text-base text-gray-700 space-y-3 mb-6">
        <li>All products listed are subject to availability.</li>
        <li>Prices are subject to change without prior notice.</li>
        <li>Users must provide accurate personal and shipping information.</li>
        <li>Zestwear India is not responsible for delays caused by external logistics partners.</li>
        <li>Unauthorized resale or reproduction of our designs is prohibited.</li>
      </ul>

      <p className="text-gray-600">
        If you have any questions or concerns, feel free to reach out to{" "}
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
