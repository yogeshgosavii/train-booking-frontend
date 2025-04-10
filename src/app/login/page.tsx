'use client'

import { login } from '@/services/authServices'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isClient, setIsClient] = useState(false)

  // This ensures that we only call `useRouter` after the component has mounted
  const router = useRouter()

  useEffect(() => {
    setIsClient(true) // This will ensure `useRouter` is only called after the component mounts
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const data = await login(email, password)

      if (data && data.token) {
        localStorage.setItem('token', data.token)
        setMessage('Login successful!')
        // Redirect after successful login
        router.push('/book')  // Use router.push to redirect
      } else {
        setMessage('Login failed')
      }
    } catch (err) {
      console.error(err)
      setMessage('Something went wrong')
    }
  }

  if (!isClient) return null; // Prevent rendering on the server side

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>

        {message && <p className="text-center mt-4 text-red-500">{message}</p>}
      </form>
    </div>
  )
}
