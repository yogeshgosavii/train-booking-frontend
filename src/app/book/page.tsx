"use client";

import { useEffect, useState } from "react";
import SeatGrid from "@/components/SeatGrid";
import { useRouter } from 'next/navigation'

// Define the User type
type User = {
  id: number;
  name: string;
  email: string;
};

export default function BookingPage() {
  // State variables
  const [user, setUser] = useState<User | null>(null); // Logged-in user
  const [loading, setLoading] = useState(true); // Loading state
  const [suggestedSeats, setSuggestedSeats] = useState<number[]>([]); // AI-suggested seats
  const [manualSeats, setManualSeats] = useState<number[]>([]); // Manually selected seats
  const [bookedSeats, setBookedSeats] = useState<number[]>([]); // Already booked seats
  const [isBooking, setIsBooking] = useState(false); // Booking in progress

  const router = useRouter();

  // Runs once on mount
  useEffect(() => {
    const token = localStorage.getItem("token"); // Retrieve token from local storage

    // Fetch already booked seats from the backend
    const fetchBookedSeats = async () => {
      try {
        const res = await fetch("https://train-booking-backend-gray.vercel.app/api/bookings/booked");
        const data = await res.json();
        console.log("Booked seats response:", data.bookedSeats);

        setBookedSeats(data.bookedSeats || []);
      } catch (err) {
        console.error("Failed to fetch booked seats", err);
      }
    };

    fetchBookedSeats(); // Call function to fetch booked seats

    // If no token, stop loading and return early
    if (!token) {
      setLoading(false);
      return;
    }

    // Fetch user details using token
    fetch("https://train-booking-backend-gray.vercel.app/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Auth response:", data);
        if (data?.user) {
          setUser(data.user); // Set user if authenticated
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Auth error:", err);
        setUser(null);
        setLoading(false);
      });

  }, []);

  // Function to handle booking process
  const handleBooking = () => {
    if (!user) return; // Exit if user is not logged in

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    // Prioritize manual seat selection; fallback to suggested seats
    const seatsToBook = manualSeats.length > 0 ? manualSeats : suggestedSeats;

    if (seatsToBook.length === 0) {
      alert("No seats selected!");
      return;
    }

    setLoading(true);
    setIsBooking(true);
    console.log("Booking seats:", seatsToBook);

    // Send booking request to backend
    fetch("https://train-booking-backend-gray.vercel.app/api/bookings/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        seats: seatsToBook,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Booking response:", data);
        if (data && data.error) {
          alert(data.error || "Booking failed!");
        } else {
          // Update booked seats locally after successful booking
          setBookedSeats([...bookedSeats, ...seatsToBook]); 
          alert("Booking successful!");
        }
        setLoading(false);
        setIsBooking(false);
      })
      .catch((err) => {
        console.error("Booking error:", err);
        setUser(null); // Log out user on error
        setLoading(false);
        setIsBooking(false);
      });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {/* Top Header Bar */}
      <div className="flex justify-between max-w-screen-sm rounded-b-sm border mb-6 bg-white px-4 py-3 sticky top-0 w-full">
        <h4 className="text-2xl font-bold p-1 px-1.5 rounded-full flex items-center text-blue-500">SB</h4>

        {/* User Info or Login */}
        {loading ? (
          <p className="text-gray-500">...</p> // Loading indicator
        ) : user ? (
          // Show user name and email if logged in
          <div onClick={() => { router.push('/profile') }} className="max-w-md w-fit px-2 py-1 rounded-sm bg-white text-right">
            <p className="font-semibold">{user.name}</p>
            <p className="text-xs -mt-1 text-gray-400">{user.email}</p>
          </div>
        ) : (
          // Show login link if user is not logged in
          <a
            href="/login"
            className="max-w-md text-blue-500 px-4 py-2 rounded text-center"
          >
            Login
          </a>
        )}
      </div>

      {/* Seat Selection Grid */}
      <SeatGrid
        manualSeats={manualSeats}
        setManualSeats={setManualSeats}
        suggestedSeats={suggestedSeats}
        setSuggestedSeats={setSuggestedSeats}
        bookedSeats={bookedSeats}
        setBookedSeats={setBookedSeats}
      />

      {/* Book Now Button */}
      <button
        onClick={handleBooking}
        disabled={!user || loading} // Disable if not logged in or still loading
        className={`mt-6 px-6 py-3 text-lg sticky bottom-0 md:rounded md:mb-5 w-screen md:max-w-lg text-white font-medium ${
          (user && !loading) 
            ? "bg-green-600" 
            : "bg-green-300 cursor-not-allowed"
        }`}
      >
        {user ? (
          isBooking ? "Booking..." : "Book Now"
        ) : (
          "Login to book"
        )}
      </button>
    </div>
  );
}
