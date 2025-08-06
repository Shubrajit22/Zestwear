export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10 mt-32 bg-white shadow-xl rounded-2xl border border-gray-200 mb-20">
      <h1 className="text-4xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
        Privacy Policy
      </h1>

      <p className="text-lg text-gray-600 mb-6">
        Your privacy matters to <strong>Zestwear India</strong>. Here's how we protect it:
      </p>

      <ul className="list-disc list-inside text-base text-gray-700 space-y-3 mb-6">
        <li>We only collect necessary data to process your orders and improve our services.</li>
        <li>We do not share or sell your personal information.</li>
        <li>All transactions are secured using encryption technologies.</li>
        <li>We may use cookies to enhance user experience.</li>
      </ul>

      <p className="text-gray-600">
        By using our site, you agree to this privacy policy. For any concerns, email us at{" "}
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
