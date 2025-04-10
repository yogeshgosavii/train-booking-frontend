import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold text-center">🚆 Train Seat Reservation</h1>
      <div className="flex gap-4">
        <Link href="/login" className="text-blue-600 underline">Login</Link>
        <Link href="/signup" className="text-blue-600 underline">Signup</Link>
        <Link href="/book" className="text-blue-600 underline">Book Seats</Link>
      </div>
    </div>
  )
}
