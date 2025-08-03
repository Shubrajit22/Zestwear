"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"login" | "otp-sent" | "verified" | "reset-success">("login");
  const [isLoading, setIsLoading] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  console.debug(session);
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    const error = params.get("error");
    if (error) {
      toast.error(error);
    }
  }, [params]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (!res) {
      toast.error("Sign-in failed (no response).");
      setIsLoading(false);
      return;
    }

    if (res.error) {
      toast.error(res.error);
      setIsLoading(false);
      return;
    }

    toast.success("Logged in successfully");
    router.replace("/");
    setIsLoading(false);
  };

  const handleSendOtp = async () => {
    if (!isEmailValid) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "Failed to send OTP");
    } else {
      toast.success("OTP sent to your email");
      setStep("otp-sent");
    }

    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message || "OTP verification failed");
    } else {
      toast.success("Password reset successful");
      setStep("reset-success");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4">
      <div className="w-full max-w-md p-8 bg-gray-900/60 backdrop-blur-lg text-white rounded-2xl shadow-2xl border border-gray-700">
        {/* Social Login */}
        <div className="flex flex-col gap-3 mb-8">
          <button
            className="hover:cursor-pointer flex items-center justify-center gap-3 w-full py-3 bg-white text-black font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
            disabled={isLoading}
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <FcGoogle size={22} />
            Login with Google
          </button>
        </div>

        <h1 className="text-3xl font-bold text-center mb-6 capitalize">
          {step.replace("-", " ")}
        </h1>

        {/* Step 1: Login Form */}
        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all hover:cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-blue-400 hover:underline hover:cursor-pointer"
                onClick={handleSendOtp}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        {/* Step 2: OTP Form */}
        {step === "otp-sent" && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300">Enter OTP</label>
              <input
                type="text"
                className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300">New Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <button
              className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-all"
              onClick={handleVerifyOtp}
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify & Reset Password"}
            </button>
          </div>
        )}

        {/* Step 3: Success */}
        {step === "reset-success" && (
          <div className="text-center space-y-5">
            <p className="text-green-400 text-lg">Password updated successfully!</p>
            <button
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all"
              onClick={() => setStep("login")}
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Sign Up */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-blue-400 hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
