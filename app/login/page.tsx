"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black to-gray-800">
      <div className="max-w-lg w-full p-6 bg-black text-white rounded-md shadow-lg">
        <div className="flex flex-col gap-4 mb-6">
          <button
            className="w-full py-2 bg-red-600 text-white rounded-full"
            disabled={isLoading}
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Login with Google
          </button>
          <button
            className="w-full py-2 bg-gray-900 text-white rounded-full"
            disabled={isLoading}
            onClick={() => signIn("apple", { callbackUrl: "/" })}
          >
            Login with Apple
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center capitalize">{step.replace("-", " ")}</h1>

        {step === "login" && (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-black text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-black text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="w-full py-2 bg-white text-black rounded-full mt-4" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <div className="mt-4 text-center">
              <button type="button" className="text-sm text-blue-400 hover:underline" onClick={handleSendOtp}>
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        {step === "otp-sent" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm">Enter OTP</label>
              <input
                type="text"
                className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-black text-white"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm">New Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 mt-1 border border-gray-600 rounded-md bg-black text-white"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <button
              className="w-full py-2 bg-white text-black rounded-full"
              onClick={handleVerifyOtp}
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify & Reset Password"}
            </button>
          </div>
        )}

        {step === "reset-success" && (
          <div className="text-center space-y-4">
            <p className="text-green-400">Password updated successfully!</p>
            <button className="w-full py-2 bg-white text-black rounded-full" onClick={() => setStep("login")}>
              Back to Login
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm">
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
