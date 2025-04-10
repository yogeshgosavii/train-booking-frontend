"use client";

import { useEffect, useState } from "react";
import SeatGrid from "@/components/SeatGrid";
import { useRouter } from 'next/navigation'


type User = {
  id: number;
  name: string;
  email: string;
};

export default function BookingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggestedSeats, setSuggestedSeats] = useState<number[]>([]);
  const [manualSeats, setManualSeats] = useState<number[]>([]);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  const router = useRouter()





  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Auth response:", data);
        if (data?.user) {
          setUser(data.user);
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

      const fetchBookedSeats = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/bookings/booked"); // change to your actual API
          const data = await res.json();
          setBookedSeats(data.bookedSeats || []);
        } catch (err) {
          console.error("Failed to fetch booked seats", err);
        }
      };
  
      fetchBookedSeats();
  }, []);

  const handleBooking = () => {
    if (!user) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const seatsToBook = manualSeats.length > 0 ? manualSeats : suggestedSeats;

    if (seatsToBook.length === 0) {
      alert("No seats selected!");
      return;
    }

    setLoading(true);
    setIsBooking(true)
    console.log("Booking seats:", seatsToBook);

    fetch("http://localhost:5000/api/bookings/book", {
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
        if (data) {
          setBookedSeats([...bookedSeats, ...seatsToBook]); 
        } []
        alert("Booking successful!");
        setLoading(false);
        setIsBooking(false)
      })
      .catch((err) => {
        console.error("Booking error:", err);
        setUser(null);
        setLoading(false);
        setIsBooking(false)

      });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex justify-between max-w-screen-sm rounded-b-sm  border mb-6 bg-white px-4 py-3 sticky top-0 w-full">
        <h4 className="text-2xl font-bold p-1 px-1.5 rounded-full flex items-center  text-blue-500">SB</h4>

        {/* Loading State */}
        {loading ? ( 
          <p className="text-gray-500">...</p>
        ) : user ? (
          <div  onClick={()=>{router.push('/profile')}} className="max-w-md  w-fit px-2 py-1 rounded-sm bg-white text-right">
            <p className=" font-semibold">{user.name}</p>
            <p className="text-xs -mt-1  text-gray-400">{user.email}</p>
          </div>
        ) : (
          <a
            href="/login"
            className=" max-w-md text-blue-500 px-4 py-2 rounded text-center hover:bg-blue-700"
          >
            Login
          </a>
        )}
      </div>

      {/* SeatGrid for booking */}
      <SeatGrid
        manualSeats={manualSeats}
        setManualSeats={setManualSeats}
        suggestedSeats={suggestedSeats}
        setSuggestedSeats={setSuggestedSeats}
        bookedSeats={bookedSeats}
        setBookedSeats={setBookedSeats}
      />

      {/* Book Button */}
      <button
        onClick={handleBooking}
        disabled={!user || loading}
        className={`mt-6 px-6 py-3 text-lg sticky bottom-0 md:rounded md:mb-5 w-screen md:max-w-lg text-white font-medium ${
          (user || !loading) 
            ? "bg-green-600 "
            : "bg-green-300 cursor-not-allowed"
        }`}
      >
        {isBooking ? "Booking..." : "Book Now"}
      </button>
    </div>
  );
}
