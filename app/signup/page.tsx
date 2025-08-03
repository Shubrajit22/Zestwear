'use client';

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState(""); // New mobile state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Ensure all fields are filled in
    if (!name || !email || !password || !mobile) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, mobile }), // Send mobile field
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/login");
      } else {
        setError(data?.error || "Signup failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black to-gray-800">
      <div className="max-w-lg w-full p-6 bg-black text-white rounded-md shadow-lg">
        {/* Google and Apple Sign-In Buttons */}
        <div className="flex flex-col gap-4 mb-6">
          <button
            className="w-full py-2 bg-red-600 text-white rounded-full"
            disabled={isLoading}
            onClick={() => signIn("google")}
          >
            Sign Up with Google
          </button>

          <button
            className="w-full py-2 bg-gray-900 text-white rounded-full"
            disabled={isLoading}
            onClick={() => signIn("apple")}
          >
            Sign Up with Apple
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium">Name</label>
            <input
              id="name"
              type="text"
              className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-black text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-black text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-black text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Mobile */}
          <div className="mb-4">
            <label htmlFor="mobile" className="block text-sm font-medium">Mobile</label>
            <input
              id="mobile"
              type="text"
              className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-black text-white"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2 bg-white text-black rounded-full mt-4"
            disabled={isLoading}
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-blue-400 hover:underline">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
