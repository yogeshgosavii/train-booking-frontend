"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";

const TOTAL_SEATS = 80;
const FULL_ROW_SIZE = 7;
const FULL_ROW_COUNT = 11;
const LAST_ROW_SIZE = 3;

// Example: pretend these are booked by other users
// const bookedSeats = [2, 3, 6, 10, 25, 26, 27, 41, 42]

interface SeatGridProps {
  manualSeats: number[];
  setManualSeats: React.Dispatch<React.SetStateAction<number[]>>;
  suggestedSeats: number[];
  setSuggestedSeats: React.Dispatch<React.SetStateAction<number[]>>;
  bookedSeats: number[];
  setBookedSeats: React.Dispatch<React.SetStateAction<number[]>>;
}

export default function SeatGrid({
  manualSeats,
  setManualSeats,
  suggestedSeats,
  setSuggestedSeats,
  bookedSeats,
  setBookedSeats
}: SeatGridProps) {
  const [selectedCount, setSelectedCount] = useState(0);
  // const [suggestedSeats, setSuggestedSeats] = useState<number[]>([])
  // const [manualSeats, setManualSeats] = useState<number[]>([])
  // const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  useEffect(() => {
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

  useEffect(() => {
    if (selectedCount > 0) {
      const suggestion = findBestSeats(selectedCount);
      setSuggestedSeats(suggestion);
      setManualSeats([]);
    }
  }, [selectedCount]);

  const suggestSeats = () => {
    const availableSeats = Array.from(
      { length: TOTAL_SEATS },
      (_, i) => i + 1
    ).filter((seat) => !bookedSeats.includes(seat));

    // If no manual selection, default to first available block
    if (manualSeats.length === 0) {
      for (let i = 0; i <= availableSeats.length - selectedCount; i++) {
        const chunk = availableSeats.slice(i, i + selectedCount);

        const isContinuous = chunk.every((seat, index) =>
          index === 0 ? true : seat === chunk[index - 1] + 1
        );

        if (isContinuous) {
          setSuggestedSeats(chunk);
          setManualSeats([]);
          return;
        }
      }
      alert("No suitable continuous block found.");
      return;
    }

    // If manual seat is selected, suggest nearest continuous block
    const targetSeat = manualSeats[0];
    let bestChunk: number[] = [];
    let minDistance = Infinity;

    for (let i = 0; i <= availableSeats.length - selectedCount; i++) {
      const chunk = availableSeats.slice(i, i + selectedCount);

      const isContinuous = chunk.every((seat, index) =>
        index === 0 ? true : seat === chunk[index - 1] + 1
      );

      if (isContinuous) {
        const distance = Math.abs(chunk[0] - targetSeat);
        if (distance < minDistance) {
          bestChunk = chunk;
          minDistance = distance;
        }
      }
    }

    if (bestChunk.length > 0) {
      setSuggestedSeats(bestChunk);
      setManualSeats([]);
    } else {
      alert("No suitable continuous block found.");
    }
  };

  const handleManualSelect = (startSeat: number) => {
    if (isSeatTaken(startSeat)) return;

    const selected: number[] = [];
    let current = startSeat;

    // Try to gather 'selectedCount' seats starting from startSeat
    while (selected.length < selectedCount && current <= TOTAL_SEATS) {
      if (!bookedSeats.includes(current)) {
        selected.push(current);
      }
      current++;
    }

    // If not enough seats were found, just pick the starting seat
    if (selected.length < selectedCount) {
      setManualSeats([startSeat]);
    } else {
      setManualSeats(selected);
    }

    // Turn off suggestions when user manually chooses
    setSuggestedSeats([]);
  };

  const isSeatTaken = (seat: number) => bookedSeats.includes(seat);
  const isSuggested = (seat: number) => suggestedSeats.includes(seat);
  const isManual = (seat: number) => manualSeats.includes(seat);

  const getSeatClass = (seat: number) => {
    if (isSeatTaken(seat)) return "bg-red-500 text-white cursor-not-allowed";
    const isContinuous =
      manualSeats[manualSeats.length - 1] - manualSeats[0] == selectedCount - 1;

    if (isManual(seat)) {
      if (isContinuous) {
        return "bg-blue-400 text-white";
      } else {
        return "bg-yellow-400 text-white";
      }
    }
    if (isSuggested(seat)) {
      const together = areSeatsTogether(suggestedSeats);
      return together ? "bg-green-500 text-white" : "bg-yellow-400 text-black";
    }

    return "bg-white hover:bg-gray-100";
  };

  const areSeatsTogether = (seats: number[]) => {
    const sorted = [...seats].sort((a, b) => a - b);
    return sorted.every((seat, i) =>
      i === 0 ? true : seat === sorted[i - 1] + 1
    );
  };

  const findBestSeats = (count: number) => {
    const seats: number[] = [];

    for (let i = 1; i <= TOTAL_SEATS - count + 1; i++) {
      const block = Array.from({ length: count }, (_, k) => i + k);
      const inSameRow =
        Math.floor((i - 1) / FULL_ROW_SIZE) ===
        Math.floor((i + count - 2) / FULL_ROW_SIZE);
      if (inSameRow && block.every((seat) => !bookedSeats.includes(seat))) {
        return block;
      }
    }

    // If no together block found, try scattered
    for (let i = 1; i <= TOTAL_SEATS; i++) {
      if (!bookedSeats.includes(i)) seats.push(i);
      if (seats.length === count) return seats;
    }

    return [];
  };

  const renderSeatButton = (seatNum: number) => {
    return (
      <button
        key={seatNum}
        disabled={isSeatTaken(seatNum)}
        onClick={() => handleManualSelect(seatNum)}
        className={clsx(
          " p-4 flex justify-center m-1 rounded-md border text-sm",
          getSeatClass(seatNum)
        )}
      >
        {seatNum}
      </button>
    );
  };

  const renderSeats = () => {
    const seats = [];

    // Full 11 rows of 7
    for (let row = 0; row < FULL_ROW_COUNT; row++) {
      for (let col = 0; col < FULL_ROW_SIZE; col++) {
        const seatNum = row * FULL_ROW_SIZE + col + 1;
        seats.push(renderSeatButton(seatNum));
      }
    }

    // Last row of 3
    for (let i = 0; i < LAST_ROW_SIZE; i++) {
      const seatNum = FULL_ROW_COUNT * FULL_ROW_SIZE + i + 1;
      seats.push(renderSeatButton(seatNum));
    }

    return seats;
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className=" text-sm flex flex-wrap gap-4 leading-none">
        <p>
          <span className="inline-block w-3 h-3 bg-green-500 mr-2 rounded-full"></span>{" "}
          Suggested
        </p>
        <p>
          <span className="inline-block w-3 h-3 bg-yellow-400 mr-2 rounded-full"></span>{" "}
          Not together
        </p>

        <p>
          <span className="inline-block w-3 h-3 bg-red-500 mr-2 rounded-full"></span>
          Booked
        </p>
        <p>
          <span className="inline-block w-3 h-3 bg-blue-400 mr-2 rounded-full"></span>{" "}
          Manually selected
        </p>
      </div>

      <div className="mb-4 w-full mt-10">
        <label className="block font-medium mb-2">
          How many seats do you want?
        </label>
        <div className="flex items-center ">
          <input
            type="number"
            min={1}
            max={7}
            className="border p-2 rounded-l outline-none w-full"
            value={selectedCount}
            onChange={(e) => setSelectedCount(Number(e.target.value))}
          />
          {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="size-10 bg-yellow-300 p-1.5 rounded-full"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
            />
          </svg> */}
          <div className="flex flex-col items-center">
            <button
              className=" px-4 py-2 bg-blue-600 border border-blue-600 text-white rounded-r hover:bg-blue-700"
              onClick={suggestSeats}
            >
              Suggest
            </button>
          </div>
        </div>
      </div>
      {/* <div className="flex flex-col items-center">
        <button
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={suggestSeats}
        >
          Suggest Seats
        </button>
      </div> */}
      <p className="bg-gray-200 text-center rounded-lg w-fit justify-self-center py-1 px-4 mb-3 font-semibold">Engine</p>

      <div className=" bg-gray-50 p-4">
        <div className="grid grid-cols-7  rounded-lg">{renderSeats()}</div>
      </div>
    </div>
  );
}
