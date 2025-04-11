"use client";

import { useState } from "react";
import { signup } from "@/services/authServices";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  // State variables for input fields and messages
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // Message to display feedback
  const [loading, setLoading] = useState(false); // Loading state to prevent multiple submissions
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter(); // Router for redirecting on successful signup

  // Handles form submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form behavior

    try {
      setLoading(true); // Start loading state
      const data = await signup(name, email, password); // Call signup API

      if (data && data.token) {
        // If signup is successful and token is received
        localStorage.setItem("token", data.token); // Save token to local storage
        setMessage("Signup successful!");
        router.push("/book"); // Redirect to booking page
      } else {
        // If signup failed
        setMessage(data.error || "Signup failed"); // Show error message
      }
    } catch (err) {
      console.error(err); // Log any error
      setMessage("Something went wrong"); // Show error message
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <div className="h-dvh flex flex-col items-center bg-white justify-center">
      {/* Signup Form */}
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-lg sm:border sm:shadow-md w-full max-w-md"
      >
        {/* Header and Logo */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>
          <a href="/book" className="text-3xl font-bold mb-5 text-blue-500">
            SB
          </a>
        </div>

        {/* Name Input */}
        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 border outline-none focus:border-blue-500 focus:bg-blue-50 border-gray-300 rounded mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border outline-none focus:border-blue-500 focus:bg-blue-50 border-gray-300 rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Input */}
        <div className="flex flex-col mb-4 items-end">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full p-2 border outline-none focus:border-blue-500 focus:bg-blue-50 border-gray-300 rounded mb-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p
            onClick={() => {
              setShowPassword(!showPassword);
            }}
            className="text-blue-500"
          >
            {showPassword ? "Hide" : "Show"}
          </p>
        </div>
      

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 disabled:bg-green-300 text-white py-2 rounded"
        >
          {loading ? "Signing up..." : "Signup"}
        </button>

        {/* Message Display */}
        {message && <p className="text-center mt-4 text-red-500">{message}</p>}

        {/* Login Redirect Link */}
        <p className="mt-5 justify-self-center text-gray-400">
          Have an account?{" "}
          <a href="/login" className="text-blue-500 font-semibold">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
