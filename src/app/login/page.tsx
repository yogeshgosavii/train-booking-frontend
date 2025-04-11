"use client";

import { login } from "@/services/authServices";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  // State for user credentials and UI behavior
  const [email, setEmail] = useState(""); // User's email
  const [password, setPassword] = useState(""); // User's password
  const [message, setMessage] = useState(""); // Message to show login status or errors
  const [isClient, setIsClient] = useState(false); // Determines if component is running on client
  const [loading, setLoading] = useState(false); // Indicates if login request is in progress
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter(); // For navigation after login

  // Ensure component only renders after mounting on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload

    try {
      setLoading(true); // Start loading

      // Call login service with email and password
      const data = await login(email, password);

      // If login is successful and token received
      if (data && data.token) {
        localStorage.setItem("token", data.token); // Store token in local storage
        setMessage("Login successful!");

        router.push("/book"); // Redirect to booking page
        setLoading(false); // Stop loading
      } else {
        setMessage("Invalid email or password"); // Show login failure
        setLoading(false); // Stop loading
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong"); // Handle errors
      setLoading(false); // Stop loading
    }
  };

  // Avoid rendering on server
  if (!isClient) return null;

  return (
    <div className="h-dvh flex items-center bg-white justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg h-fit sm:border sm:shadow-md w-full sm:max-w-md"
      >
        {/* Header section with title and logo */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <a href="/book" className="text-3xl font-bold mb-5 text-blue-500">
            SB
          </a>
        </div>

        {/* Email input field */}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border outline-none focus:border-blue-500 focus:bg-blue-50 border-gray-300 rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password input field */}
      <div className="flex flex-col mb-4 items-end">
      <input
          type={showPassword?"text":"password"}
          placeholder="Password"
          className="w-full p-2 border outline-none focus:border-blue-500 focus:bg-blue-50 border-gray-300 rounded mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p onClick={()=>{setShowPassword(!showPassword)}} className="text-blue-500">{showPassword?"Hide" : "Show"}</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 disabled:bg-blue-300 text-white py-2 rounded "
        >
          {loading ? "Logining..." : "Login"}
        </button>

        {/* Message display for success/failure */}
        {message && <p className="text-center mt-4 text-red-500">{message}</p>}

        {/* Link to signup page */}
        <p className="mt-5 justify-self-center text-gray-400">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500 font-semibold">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
}
