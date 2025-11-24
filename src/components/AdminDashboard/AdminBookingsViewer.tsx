// AdminBookingsViewer.tsx
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface Slot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  amount?: number;
  status: "available" | "booked" | "blocked" | string;
}

const AdminBookingsViewer: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Admin optional fields
  const [userEmail, setUserEmail] = useState("");
  const [teamName, setTeamName] = useState("");

  // Fetch slots for selected date
  const fetchSlots = async (date: string) => {
    setLoading(true);
    setBookingError("");
    try {
      // adjust URL if your slots endpoint differs
      const res = await fetch(`https://soccerzone-backend.onrender.com/api/slots?date=${date}`);
      if (!res.ok) throw new Error("Failed to load slots");
      const data = await res.json();
      // assume API returns an array or { slots: [...] }
      const fetchedSlots: Slot[] = Array.isArray(data)
        ? data
        : data.slots ?? [];
      setSlots(fetchedSlots);
    } catch (err) {
      console.error(err);
      setBookingError("Unable to load slots. Please try again.");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots(selectedDate);
    // clear selection when date changes
    setSelectedSlots(new Set());
  }, [selectedDate]);

  const toggleSlotSelection = (slot: Slot) => {
    if (slot.status !== "available") return;
    const newSet = new Set(selectedSlots);
    if (newSet.has(slot.startTime)) newSet.delete(slot.startTime);
    else newSet.add(slot.startTime);
    setSelectedSlots(newSet);
    setBookingError("");
  };

  const validateEmailIfProvided = (email: string) => {
    if (!email) return true;
    // simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleCreateBooking = async () => {
    const token = localStorage.getItem("token");
    if (selectedSlots.size === 0) {
      setBookingError("Please select at least one slot to book.");
      return;
    }

    if (!validateEmailIfProvided(userEmail)) {
      setBookingError("Please enter a valid email address or leave it empty.");
      return;
    }

    setBookingError("");
    setBooking(true);

    try {
      const body = {
        startTimes: Array.from(selectedSlots),
        // include only if provided (server accepts optional fields)
        ...(userEmail ? { userEmail } : {}),
        ...(teamName ? { teamName } : {}),
      };

      const res = await fetch(
        `https://soccerzone-backend.onrender.com/api/bookings/admin/book-cash?date=${selectedDate}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
             Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        // try to parse error body
        let message = "Booking failed";
        try {
          const errData = await res.json();
          message = errData?.message || JSON.stringify(errData) || message;
        } catch (e) {
          // ignore parse error
        }
        throw new Error(message);
      }

      // success
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // reset selections & fields
      setSelectedSlots(new Set());
      setUserEmail("");
      setTeamName("");

      // refresh slots to reflect booked state
      await fetchSlots(selectedDate);
    } catch (err: any) {
      console.error("Admin booking error:", err);
      setBookingError(err.message || "Unable to complete booking.");
    } finally {
      setBooking(false);
    }
  };

  const availableCount = slots.filter((s) => s.status === "available").length;
  const totalCount = slots.length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section className="min-h-screen py-12" id="admin-bookings-viewer">
      <div className="mx-auto max-w-5xl px-4">
        <motion.header
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-sm font-semibold text-green-600 uppercase">
            Admin — Create Cash Booking
          </p>
          <h2 className="text-3xl font-bold text-slate-900">
            Admin Bookings Viewer
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Select a date, pick available slots and create a booking (cash).
          </p>
        </motion.header>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white border rounded-lg p-4">
            <label className="block text-sm font-semibold mb-2">Select Date</label>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border rounded-md w-full"
              />
              <div className="text-sm text-slate-500">{formatDate(selectedDate)}</div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <p className="text-sm font-medium text-slate-600">Availability</p>
            <div className="mt-3">
              <div className="text-2xl font-bold">
                {availableCount}/{totalCount}
              </div>
              <div className="text-xs text-slate-500">
                {availableCount === 1 ? "slot available" : "slots available"}
              </div>
            </div>
          </div>
        </div>

        {/* Admin Details */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border rounded-lg p-4 mb-6"
        >
          <h3 className="font-semibold mb-3">Admin Booking Details (optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">User Email</label>
              <input
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-slate-400 mt-1">
                Leave empty if you don't want to record customer email
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Team Name</label>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team Black"
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-slate-400 mt-1">
                Optional team name for this booking
              </p>
            </div>
          </div>
        </motion.div>

        {/* Errors */}
        <AnimatePresence>
          {bookingError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 mt-1" />
              <div className="text-sm text-red-700">{bookingError}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slots grid */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          {loading ? (
            <div className="py-8 text-center">Loading slots...</div>
          ) : slots.length === 0 ? (
            <div className="py-8 text-center text-slate-600">
              No slots found for {formatDate(selectedDate)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {slots.map((slot) => {
                  const isSelected = selectedSlots.has(slot.startTime);
                  const isAvailable = slot.status === "available";

                  return (
                    <button
                      key={slot._id}
                      onClick={() => toggleSlotSelection(slot)}
                      disabled={!isAvailable || booking}
                      className={`p-4 rounded-lg text-left border transition-transform hover:scale-[1.02] ${
                        isSelected
                          ? "bg-green-600 text-white border-green-700"
                          : isAvailable
                          ? "bg-white border-slate-200"
                          : "bg-red-50 border-red-200 text-red-700 cursor-not-allowed opacity-90"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-md flex items-center justify-center ${
                              isSelected ? "bg-white/10" : "bg-slate-100"
                            }`}
                          >
                            <Clock className={`w-5 h-5 ${isSelected ? "text-white" : "text-slate-600"}`} />
                          </div>
                          <div>
                            <div className="font-bold text-lg">{slot.startTime}</div>
                            <div className="text-xs">{slot.endTime}</div>
                          </div>
                        </div>
                        <div>
                          {isAvailable ? (
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${isSelected ? "bg-white/20" : "bg-green-50 text-green-800"}`}>
                              {isSelected ? "Selected" : "Available"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-200 text-red-800">
                              Booked
                            </span>
                          )}
                        </div>
                      </div>

                      {slot.amount !== undefined && (
                        <div className="text-sm text-slate-500">₦{slot.amount}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <button
            onClick={handleCreateBooking}
            disabled={booking || selectedSlots.size === 0}
            className={`px-6 py-3 rounded-lg font-semibold ${
              !booking && selectedSlots.size > 0
                ? "bg-green-600 text-white"
                : "bg-slate-200 text-slate-500 cursor-not-allowed"
            }`}
          >
            {booking ? "Creating booking..." : `Create Booking (${selectedSlots.size})`}
          </button>

          <button
            onClick={() => {
              setSelectedSlots(new Set());
              setBookingError("");
            }}
            className="px-4 py-2 rounded-lg border text-sm"
          >
            Clear Selection
          </button>

          <div className="text-sm text-slate-500 ml-auto">
            {selectedSlots.size > 0 ? `${selectedSlots.size} selected` : "No slot selected"}
          </div>
        </div>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed right-5 bottom-5 bg-green-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <div className="text-sm">Booking created successfully</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AdminBookingsViewer;
