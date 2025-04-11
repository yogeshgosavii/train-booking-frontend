'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  // Constant for total seats available in the train
  const TOTAL_SEATS = 80;
  
  // State to store the number of available seats.
  // In a real application, you might fetch this value from an API.
  const [availableSeats, setAvailableSeats] = useState(TOTAL_SEATS);

  // Next.js router to programmatically navigate
  const router = useRouter();

  useEffect(() => {
    // fetch available seats from your backend
    fetch("https://train-booking-backend-gray.vercel.app/api/bookings/booked")
    .then(res => res.json())
      .then(data => setAvailableSeats(TOTAL_SEATS - data.bookedSeats.length));
  }, []);

  // Handler that navigates to the booking page when the train block is clicked.
  const handleTrainBlockClick = () => {
    router.push('/book');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      {/* Main heading */}
      <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">
        🚆 Train Seat Reservation
      </h1>
      
      {/* Navigation links */}
      <div className="flex gap-6 mb-6">
        <Link href="/login" className="text-blue-600">Login</Link>
        <Link href="/signup" className="text-blue-600">Signup</Link>
      </div>
      
      {/* Train block that displays available seats and navigates to the booking section */}
      <div
        className="p-6 bg-white rounded-lg border shadow-md cursor-pointer"
        onClick={handleTrainBlockClick}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">Train Block</h2>
        <p className="text-center text-lg text-gray-700">
          Available Seats: <span className="font-semibold text-green-600">{availableSeats}</span>
        </p>
        <p className="text-center text-sm text-gray-500 mt-3">Click here to book your seats</p>
      </div>

     
    </div>
  );
}
