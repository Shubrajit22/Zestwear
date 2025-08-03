"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

const SignUp = () => {
  const router = useRouter();
  const params = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [isOAuthFlow, setIsOAuthFlow] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const emailParam = params.get("email");
    if (emailParam) {
      setEmail(emailParam);
      setIsOAuthFlow(true);
    }
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !mobile) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          mobile,
          fromOAuth: isOAuthFlow,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await signIn("credentials", {
          email,
          password,
          redirect: true,
          callbackUrl: "/",
        });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4">
      <div className="w-full max-w-md p-8 bg-gray-900/60 backdrop-blur-lg text-white rounded-2xl shadow-2xl border border-gray-700">
        
        {/* Social Signup */}
        {!isOAuthFlow && (
          <div className="flex flex-col gap-3 mb-8">
            <button
              className="flex items-center justify-center gap-3 w-full py-3 bg-white text-black font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
              disabled={isLoading}
              onClick={() => signIn("google")}
            >
              <FcGoogle size={22} />
              Sign Up with Google
            </button>
          </div>
        )}

        <h1 className="text-3xl font-bold text-center mb-6">
          {isOAuthFlow ? "Complete Your Signup" : "Sign Up"}
        </h1>

        {error && (
          <div className="text-red-500 text-center mb-4 text-sm bg-red-500/10 p-2 rounded-md border border-red-500/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm text-gray-300">Name</label>
            <input
              id="name"
              type="text"
              className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300">Email</label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isOAuthFlow || isLoading}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm text-gray-300">Password</label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Mobile */}
          <div>
            <label htmlFor="mobile" className="block text-sm text-gray-300">Mobile</label>
            <input
              id="mobile"
              type="text"
              className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all"
            disabled={isLoading}
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        {!isOAuthFlow && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <a href="/login" className="text-blue-400 hover:underline">
                Login
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;
