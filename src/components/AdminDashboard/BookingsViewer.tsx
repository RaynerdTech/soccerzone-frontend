import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Clock, Info, AlertCircle } from "lucide-react";

interface Slot {
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
  status: string;
}

interface Booking {
  bookingId: string;
  ticketId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
  slots: Slot[];
}

const BookingsDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTicket, setSearchTicket] = useState("");

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("http://localhost:4000/api/bookings/all");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || "Unable to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter bookings by ticket ID
  const filteredBookings = bookings.filter((b) =>
    b.ticketId.toLowerCase().includes(searchTicket.toLowerCase())
  );

  return (
    <section className="min-h-screen p-8 bg-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Bookings Dashboard</h1>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by Ticket ID..."
            value={searchTicket}
            onChange={(e) => setSearchTicket(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {loading && (
          <div className="text-center py-20 text-slate-600 font-semibold">
            Loading bookings...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {/* Bookings List */}
        <AnimatePresence>
          {!loading && filteredBookings.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-slate-600 py-20"
            >
              No bookings found.
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <motion.div
              key={booking.bookingId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="border border-slate-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedBooking(booking)}
            >
              <p className="font-bold text-lg">Ticket: {booking.ticketId}</p>
              <p className="text-sm text-slate-500">User: {booking.user.name}</p>
              <p className="text-sm text-slate-500">Status: {booking.status}</p>
              <p className="text-sm text-slate-500">
                Slots: {booking.slots.length}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Selected Booking Details */}
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10 bg-slate-50 border border-slate-200 rounded-xl p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Booking Details - {selectedBooking.ticketId}
              </h2>
              <button
                className="text-red-600 font-semibold"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
            </div>

            <p className="mb-2">
              <strong>User:</strong> {selectedBooking.user.name} (
              {selectedBooking.user.email})
            </p>
            <p className="mb-2">
              <strong>Status:</strong> {selectedBooking.status}
            </p>
            <p className="mb-2">
              <strong>Total Amount:</strong> ₦{selectedBooking.totalAmount}
            </p>
            <p className="mb-4">
              <strong>Created At:</strong>{" "}
              {new Date(selectedBooking.createdAt).toLocaleString()}
            </p>

            <h3 className="font-semibold mb-2">Slots:</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {selectedBooking.slots.map((slot) => (
                <div
                  key={slot.slotId}
                  className="border border-slate-300 rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <p>
                      {slot.startTime} - {slot.endTime}
                    </p>
                    <p className="text-sm text-slate-500">{slot.date}</p>
                  </div>
                  <div className="text-sm font-bold">
                    ₦{slot.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BookingsDashboard;
