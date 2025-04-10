"use client";

import React, { useEffect, useState } from "react";

// Interface for the user data and ticket data
interface User {
  name: string;
  email: string;
  profilePicture: string;
}

interface Ticket {
  ticketId: string;
  seat: string;
  date: string;
  row: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [bookedTickets, setBookedTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }
    const fetchUserData = async () => {
      try {
        const userRes = await fetch("https://train-booking-backend-gray.vercel.app/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const userData = await userRes.json();
        console.log(userData.user);
        setUser(userData.user);

        const ticketsRes = await fetch(
          "https://train-booking-backend-gray.vercel.app/api/bookings/my-bookings",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const ticketsData = await ticketsRes.json();
        console.log(ticketsData.myBookedSeats);

        setBookedTickets(ticketsData.myBookedSeats);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center md:py-6 h-dvh">
      <div className="w-full max-w-3xl h-full md:h-fit p-6 bg-white rounded-lg md:border">
        {/* User Profile Section */}
        <div className="flex items-center mb-6">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="Profile"
              className="w-20 h-20 rounded-full mr-6"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-300 mr-6 flex items-center justify-center">
              <span className="text-lg font-semibold text-white">U</span>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-semibold">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Booked Tickets Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Booked Tickets</h3>
          {bookedTickets.length > 0 ? (
            <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {/* Ticket header */}
              <div className="bg-blue-600 p-4 text-white">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold">Your Booking</h4>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded">
                    {bookedTickets.length}{" "}
                    {bookedTickets.length > 1 ? "seats" : "seat"}
                  </span>
                </div>
              </div>

              {/* Ticket body */}
              <div className="p-4 bg-white">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-gray-500 text-xs">Date</p>
                    <p className="font-medium">
                      {new Date(bookedTickets[0].date).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Row</p>
                    <p className="font-medium bg-yellow-200 rounded-sm text-yellow-600 px-1.5 w-fit">
                      
                      {[
                        ...new Set(bookedTickets.map((ticket) => ticket.row)),
                      ].join(" - ")}
                    </p>{" "}
                  </div>
                </div>

                {/* Seats display */}
                <div className="mb-4">
                  <p className="text-gray-500 text-xs mb-1">Seat Numbers</p>
                  <div className="flex flex-wrap gap-2">
                    {bookedTickets.map((ticket) => (
                      <span
                        key={ticket.ticketId}
                        className="bg-blue-100 text-blue-800 text-sm px-2.5 py-1 rounded"
                      >
                        {ticket.seat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Barcode and ID */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-gray-500 text-xs">Booking ID</p>
                      <p className="font-mono text-sm">
                        {bookedTickets[0].ticketId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cancel button */}
                <div className="mt-4">
                  <button
                    onClick={async () => {
                      const seatNumbers = bookedTickets.map(
                        (ticket) => ticket.seat
                      );
                      try {
                        const response = await fetch(
                          "https://train-booking-backend-gray.vercel.app/api/bookings/cancel-booking",
                          {
                            method: "DELETE",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${localStorage.getItem(
                                "token"
                              )}`,
                            },
                            body: JSON.stringify({ seatNumbers }),
                          }
                        );

                        const result = await response.json();
                        if (response.ok) {
                          alert("Booking cancelled successfully");
                          // Refresh the bookings or update state
                        } else {
                          alert(result.error || "Failed to cancel booking");
                        }
                      } catch (error) {
                        console.error("Error cancelling booking:", error);
                        alert("Error cancelling booking");
                      }
                    }}
                    className="w-full py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No tickets booked yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
