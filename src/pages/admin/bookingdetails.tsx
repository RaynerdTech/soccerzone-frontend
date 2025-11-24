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
    // Added px-4 for mobile side padding
    <section className="max-w-6xl mx-auto py-8 px-0 sm:py-12 sm:px-6">
      {/* HEADER SECTION: Flex-col on mobile, Flex-row on desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          All Bookings
        </h1>

        {/* DELETE BUTTON */}
        {selectedBookings.length > 0 && (
          <button
            onClick={deleteSelectedBookings}
            disabled={deleting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-md hover:bg-red-700 transition-colors"
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
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Enter Ticket ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-green-600 outline-none shadow-sm"
          />
        </div>
      </div>

      {/* BOOKINGS LIST */}
      <div className="space-y-6">
        {filteredBookings.map((booking) => (
          <div
            key={booking.bookingId}
            className="relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            {/* SELECT CHECKBOX - Absolute positioned */}
            <div className="absolute top-0 left-0 bottom-0 w-12 flex justify-center pt-5 bg-gray-50/50 sm:bg-transparent z-10">
              <input
                type="checkbox"
                checked={selectedBookings.includes(booking.bookingId)}
                onChange={() => toggleSelect(booking.bookingId)}
                className="w-5 h-5 cursor-pointer text-green-600 rounded focus:ring-green-500 border-gray-300"
              />
            </div>

            {/* Card Content - Added padding-left to account for checkbox */}
            <div className="pl-12">
              {/* Top Section: Info & Status */}
              <div className="bg-gray-50 p-4 sm:p-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start gap-4">
                {/* Left: User & Ticket Info */}
                <div className="space-y-3 w-full md:w-auto overflow-hidden">
                  <h3 className="font-bold text-lg text-green-700 flex items-center gap-2 truncate">
                    <Hash className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                      {booking.ticketId || "No Ticket ID"}
                    </span>
                  </h3>
                  
                  <div className="text-sm text-gray-600 space-y-1.5">
                    <p className="flex items-center gap-2 truncate">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {booking.user?.name || "Guest User"}
                      </span>
                    </p>
                    <p className="flex items-center gap-2 truncate">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">
                        {booking.user?.email || "No Email"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right: Status & Price - Stacked on desktop, Row on mobile */}
                <div className="w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end gap-2 md:gap-1 mt-2 md:mt-0 border-t md:border-t-0 border-gray-200 pt-3 md:pt-0">
                  {/* Status Badge */}
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
                    <span className="capitalize">{booking.status}</span>
                  </div>

                  {/* Amount */}
                  <h3 className="text-xl font-bold text-gray-900">
                    ₦{booking.totalAmount.toLocaleString()}
                  </h3>
                </div>
              </div>

              {/* SLOTS */}
              <div className="p-4 sm:p-5 space-y-3">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Booked Slot Details
                </h4>

                {booking.slots.map((slot) => (
                  <div
                    key={slot.slotId}
                    className="bg-white border border-gray-200 rounded-md p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="font-medium text-gray-800">
                        {new Date(slot.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 sm:justify-end">
                      <Clock className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="font-medium text-gray-800 whitespace-nowrap">
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
          <div className="flex flex-col items-center justify-center p-12 text-gray-500 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
            <Search className="w-10 h-10 mb-3 text-gray-300" />
            <p>No bookings found matching your search.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AllBookings;