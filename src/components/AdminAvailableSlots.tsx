import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Calendar, CheckCircle2, Clock } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Slot {
  _id: string;
  date: string;
  startTime: string;
  isBooked: boolean;
}

interface Props {
  selectedDate: string;
}

const AdminAvailableSlots: React.FC<Props> = ({ selectedDate }) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // Admin Input Fields
  const [userEmail, setUserEmail] = useState("");
  const [teamName, setTeamName] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://soccerzone-backend.onrender.com/api/slots?date=${selectedDate}`
      );
      const data = await res.json();
      setSlots(data.slots || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) fetchSlots();
  }, [selectedDate]);

  const toggleSlotSelection = (time: string) => {
    const newSelection = new Set(selectedSlots);

    if (newSelection.has(time)) {
      newSelection.delete(time);
    } else {
      newSelection.add(time);
    }

    setSelectedSlots(newSelection);
  };

  const handleBooking = async () => {
    if (selectedSlots.size === 0) {
      setBookingError("Please select at least one time slot");
      return;
    }

    setBookingError("");

    // Optional validation
    if (userEmail && !userEmail.includes("@")) {
      setBookingError("Invalid email format");
      return;
    }

    try {
      setBooking(true);

      const res = await fetch(
        `https://soccerzone-backend.onrender.com/api/bookings/admin/book-cash?date=${selectedDate}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startTimes: Array.from(selectedSlots),
            userEmail: userEmail || undefined,
            teamName: teamName || undefined,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Booking failed");
      }

      // SUCCESS
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      setUserEmail("");
      setTeamName("");
      setSelectedSlots(new Set());
      fetchSlots();
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="p-4 border rounded-xl bg-white shadow-sm">

      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
        <Calendar size={18} /> Admin Booking for {selectedDate}
      </h2>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-sm font-semibold">User Email (optional)</label>
          <input
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full border rounded-lg p-2"
            placeholder="customer@example.com"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Team Name (optional)</label>
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="w-full border rounded-lg p-2"
            placeholder="Team Legends"
          />
        </div>
      </div>

      {bookingError && (
        <div className="flex items-center gap-2 text-red-600 mb-3">
          <AlertCircle size={18} /> {bookingError}
        </div>
      )}

      {/* Slots */}
      {loading ? (
        <p>Loading slots...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {slots.map((slot) => (
            <button
              key={slot.startTime}
              disabled={slot.isBooked}
              onClick={() => toggleSlotSelection(slot.startTime)}
              className={`p-3 rounded-lg border text-sm transition-all
                ${
                  slot.isBooked
                    ? "bg-red-100 border-red-300 text-red-700 cursor-not-allowed"
                    : selectedSlots.has(slot.startTime)
                    ? "bg-green-600 text-white border-green-700"
                    : "bg-gray-100 border-gray-300"
                }
              `}
            >
              <Clock size={16} className="inline-block mr-1" />
              {slot.startTime}
            </button>
          ))}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleBooking}
        disabled={booking}
        className="w-full p-3 bg-black text-white rounded-lg font-semibold"
      >
        {booking ? "Booking..." : "Book Slot (Cash Payment)"}
      </button>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-5 right-5 bg-green-700 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 size={20} /> Booking successful!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminAvailableSlots;
