'use client'

import { useState } from 'react'
import { signup } from '@/services/authServices'
import { useRouter } from 'next/navigation'


export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const data = await signup( name, email, password )


      if (data && data.token) {
        localStorage.setItem('token', data.token)
        setMessage('Signup successful!')
        router.push('/book') 
      } else {
        setMessage('Signup failed')
      }
    } catch (err) {
      console.error(err)
      setMessage('Something went wrong')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Signup</h2>

        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Signup
        </button>

        {message && <p className="text-center mt-4 text-red-500">{message}</p>}
      </form>
    </div>
  )
}
