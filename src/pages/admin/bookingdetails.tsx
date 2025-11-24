import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Hash,
  Mail,
  Search,
  Trash2,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface BookedSlot {
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
  status: string;
}

interface UserDetails {
  _id: string;
  email: string;
  role: string;
  name: string;
}

interface Booking {
  bookingId: string;
  user: UserDetails | null;
  totalAmount: number;
  status: "confirmed" | "pending" | "cancelled";
  createdAt: string;
  ticketId: string | null;
  slots: BookedSlot[];
}

const AllBookings: React.FC = () => {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedBookings, setSelectedBookings] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all bookings
  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://soccerzone-backend.onrender.com/api/bookings/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch bookings");

      const data = await res.json();

      const bookingsArray: Booking[] = data.bookings.bookings;
      setAllBookings(bookingsArray);
      setFilteredBookings(bookingsArray);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  // Handle search filtering
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredBookings(allBookings);
    } else {
      const filtered = allBookings.filter((booking) =>
        (booking.ticketId || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredBookings(filtered);
    }
  }, [searchTerm, allBookings]);

  // Toggle checkbox selection
  const toggleSelect = (bookingId: string) => {
    setSelectedBookings((prev) =>
      prev.includes(bookingId)
        ? prev.filter((id) => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  // Delete/cancel selected bookings
  const deleteSelectedBookings = async () => {
    if (selectedBookings.length === 0) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        "https://soccerzone-backend.onrender.com/api/bookings/cancel/multiple",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookingIds: selectedBookings }),
        }
      );

      const data = await res.json();
      console.log("Delete Response:", data);

      // Refresh bookings
      await fetchAllBookings();
      setSelectedBookings([]);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading all bookings...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <section className="max-w-6xl mx-auto py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">All Bookings</h1>

        {/* DELETE BUTTON */}
        {selectedBookings.length > 0 && (
          <button
            onClick={deleteSelectedBookings}
            disabled={deleting}
            className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-md hover:bg-red-700"
          >
            <Trash2 className="w-5 h-5" />
            {deleting ? "Deleting..." : `Delete (${selectedBookings.length})`}
          </button>
        )}
      </div>

      {/* SEARCH BAR */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search by Ticket ID
        </label>
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Enter Ticket ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>

      {/* BOOKINGS LIST */}
      <div className="space-y-6">
        {filteredBookings.map((booking) => (
          <div
            key={booking.bookingId}
            className="relative bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
          >
            {/* SELECT CHECKBOX */}
            <input
              type="checkbox"
              checked={selectedBookings.includes(booking.bookingId)}
              onChange={() => toggleSelect(booking.bookingId)}
              className="absolute top-4 left-4 w-5 h-5 cursor-pointer"
            />

            {/* Card */}
            <div className="pl-12">
              <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-start">
                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-green-700 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    {booking.ticketId || "No Ticket ID"}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {booking.user?.name || "Guest User"}
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {booking.user?.email || "No Email"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {booking.status === "confirmed" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {booking.status}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900">
                    ₦{booking.totalAmount.toLocaleString()}
                  </h3>
                </div>
              </div>

              {/* SLOTS */}
              <div className="p-4 space-y-4">
                <h4 className="font-semibold text-gray-800">
                  Booked Slot Details:
                </h4>

                {booking.slots.map((slot) => (
                  <div
                    key={slot.slotId}
                    className="bg-gray-50 border border-gray-200 rounded-md p-4 flex justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-gray-800">
                        {new Date(slot.date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-green-600" />
                      <p className="font-semibold text-gray-800">
                        {slot.startTime} – {slot.endTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="p-8 text-center text-gray-600 bg-gray-50 rounded-lg">
            No bookings found.
          </div>
        )}
      </div>
    </section>
  );
};

export default AllBookings;
