"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";

// Constants for seat configuration
const TOTAL_SEATS = 80;
const FULL_ROW_SIZE = 7;
const FULL_ROW_COUNT = 11;
const LAST_ROW_SIZE = 3;

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

  // Whenever selected seat count changes, find best suggestion
  useEffect(() => {
    if (selectedCount > 0) {
      const suggestion = findBestSeats(selectedCount);
      setSuggestedSeats(suggestion);
      setManualSeats([]);
    }
  }, [selectedCount]);

  // Main logic to suggest best seats based on availability
  const suggestSeats = () => {
    const availableSeats = Array.from(
      { length: TOTAL_SEATS },
      (_, i) => i + 1
    ).filter((seat) => !bookedSeats.includes(seat));

    // Helper to find available seats in the same row as a target
    const getAvailableSameRowSeats = (targetSeat: number): number[] => {
      const row = Math.floor((targetSeat - 1) / FULL_ROW_SIZE);
      const rowStart = row * FULL_ROW_SIZE + 1;
      const rowEnd = rowStart + FULL_ROW_SIZE - 1;

      const sameRowSeats = [];
      for (let i = rowStart; i <= rowEnd; i++) {
        if (!bookedSeats.includes(i)) {
          sameRowSeats.push(i);
          if (sameRowSeats.length === selectedCount) break;
        }
      }

      return sameRowSeats.length === selectedCount ? sameRowSeats : [];
    };

    // Step 1: If no manual seat is selected, find best continuous block
    if (manualSeats.length === 0) {
      const bestBlock = findBestSeats(selectedCount);
      if (bestBlock.length > 0) {
        setSuggestedSeats(bestBlock);
        setManualSeats([]);
        return;
      }

      alert("No suitable block found.");
      return;
    }

    // Step 2: If manual seat is selected, prioritize same-row seats
    const targetSeat = manualSeats[0];
    const sameRowSuggestion = getAvailableSameRowSeats(targetSeat);

    if (sameRowSuggestion.length > 0) {
      setSuggestedSeats(sameRowSuggestion);
      setManualSeats([]);
      return;
    }

    // Step 3: Fallback to scattered seats
    const fallbackBlock = findBestSeats(selectedCount);
    if (fallbackBlock.length > 0) {
      setSuggestedSeats(fallbackBlock);
      setManualSeats([]);
    } else {
      alert("No suitable seats found.");
    }
  };

  // Handles user manual seat selection
  const handleManualSelect = (startSeat: number) => {
    if (isSeatTaken(startSeat)) return;

    const selected: number[] = [];
    let current = startSeat;

    // Try to collect desired number of seats starting from clicked seat
    while (selected.length < selectedCount && current <= TOTAL_SEATS) {
      if (!bookedSeats.includes(current)) {
        selected.push(current);
      }
      current++;
    }

    // If not enough were found, select only the clicked seat
    if (selected.length < selectedCount) {
      setManualSeats([startSeat]);
    } else {
      setManualSeats(selected);
    }

    // Clear suggestions
    setSuggestedSeats([]);
  };

  // Utility functions for seat state
  const isSeatTaken = (seat: number) => bookedSeats.includes(seat);
  const isSuggested = (seat: number) => suggestedSeats.includes(seat);
  const isManual = (seat: number) => manualSeats.includes(seat);

  // Returns appropriate className based on seat status
  const getSeatClass = (seat: number) => {
    if (isSeatTaken(seat)) return "bg-red-500 text-white cursor-not-allowed";

    const isContinuous =
      manualSeats[manualSeats.length - 1] - manualSeats[0] == selectedCount - 1;
    const together = areSeatsTogether(manualSeats, FULL_ROW_SIZE);

    if (isManual(seat)) {
      if (isContinuous && together) {
        return "bg-blue-400 text-white";
      } else {
        return "bg-yellow-400 text-white";
      }
    }

    if (isSuggested(seat)) {
      return together ? "bg-green-500 text-white" : "bg-yellow-400 text-black";
    }

    return "bg-white hover:bg-gray-100";
  };

  // Checks if given seats are together in the same row and consecutive
  const areSeatsTogether = (seats: number[], seatsPerRow: number) => {
    const sorted = [...seats].sort((a, b) => a - b);
    const row = Math.floor(sorted[0] / seatsPerRow);
    const allSameRow = sorted.every(seat => Math.floor((seat - 1) / seatsPerRow) === row);
    if (!allSameRow) return false;

    return sorted.every((seat, i) =>
      i === 0 ? true : seat === sorted[i - 1] + 1
    );
  };

  // Finds the best block of seats to suggest
  const findBestSeats = (count: number) => {
    const seats: number[] = [];

    // 1. Try consecutive seats in same row
    for (let i = 1; i <= TOTAL_SEATS - count + 1; i++) {
      const block = Array.from({ length: count }, (_, k) => i + k);
      const inSameRow =
        Math.floor((i - 1) / FULL_ROW_SIZE) ===
        Math.floor((i + count - 2) / FULL_ROW_SIZE);

      if (inSameRow && block.every((seat) => !bookedSeats.includes(seat))) {
        return block;
      }
    }

    // 2. Try non-consecutive seats in same row
    for (let row = 0; row < TOTAL_SEATS / FULL_ROW_SIZE; row++) {
      const rowStart = row * FULL_ROW_SIZE + 1;
      const rowEnd = rowStart + FULL_ROW_SIZE - 1;

      const availableInRow = [];
      for (let i = rowStart; i <= rowEnd; i++) {
        if (!bookedSeats.includes(i)) {
          availableInRow.push(i);
          if (availableInRow.length === count) return availableInRow;
        }
      }
    }

    // 3. Fallback: scattered seats anywhere
    for (let i = 1; i <= TOTAL_SEATS; i++) {
      if (!bookedSeats.includes(i)) {
        seats.push(i);
        if (seats.length === count) return seats;
      }
    }

    return [];
  };

  // Renders individual seat button
  const renderSeatButton = (seatNum: number) => {
    return (
      <button
        key={seatNum}
        disabled={isSeatTaken(seatNum)}
        onClick={() => handleManualSelect(seatNum)}
        className={clsx(
          "p-4 flex justify-center m-1 rounded-md border text-sm",
          getSeatClass(seatNum)
        )}
      >
        {seatNum}
      </button>
    );
  };

  // Renders all seat buttons
  const renderSeats = () => {
    const seats = [];

    // First 11 full rows (7 seats each)
    for (let row = 0; row < FULL_ROW_COUNT; row++) {
      for (let col = 0; col < FULL_ROW_SIZE; col++) {
        const seatNum = row * FULL_ROW_SIZE + col + 1;
        seats.push(renderSeatButton(seatNum));
      }
    }

    // Final row with 3 seats
    for (let i = 0; i < LAST_ROW_SIZE; i++) {
      const seatNum = FULL_ROW_COUNT * FULL_ROW_SIZE + i + 1;
      seats.push(renderSeatButton(seatNum));
    }

    return seats;
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      {/* Seat legends */}
      <div className="text-sm flex flex-wrap gap-4 leading-none">
        <p>
          <span className="inline-block w-3 h-3 bg-green-500 mr-2 rounded-full"></span> Suggested
        </p>
        <p>
          <span className="inline-block w-3 h-3 bg-yellow-400 mr-2 rounded-full"></span> Not together
        </p>
        <p>
          <span className="inline-block w-3 h-3 bg-red-500 mr-2 rounded-full"></span> Booked
        </p>
        <p>
          <span className="inline-block w-3 h-3 bg-blue-400 mr-2 rounded-full"></span> Manually selected
        </p>
      </div>

      {/* Seat selection input */}
      <div className="mb-4 w-full mt-10">
        <label className="block font-medium mb-2">
          How many seats do you want?
        </label>
        <div className="flex items-center">
          <input
            type="number"
            min={1}
            max={7}
            className="border p-2 rounded-l outline-none w-full"
            value={selectedCount}
            onChange={(e) => setSelectedCount(Number(e.target.value))}
          />
          <div className="flex flex-col items-center">
            <button
              className="px-4 py-2 bg-blue-500 border border-blue-500 text-white rounded-r"
              onClick={suggestSeats}
            >
              Suggest
            </button>
          </div>
        </div>
      </div>

      <p className="bg-gray-200 text-center rounded-lg w-fit justify-self-center py-1 px-4 mb-3 font-semibold">
        Engine
      </p>

      {/* Render seat layout */}
      <div className="bg-gray-50 shadow-inner border rounded-xl p-4">
        <div className="grid grid-cols-7">{renderSeats()}</div>
      </div>
    </div>
  );
}
