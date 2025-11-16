import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Hash,
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Search,
} from "lucide-react";

// --- 1. Define Types based on your JSON example ---
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
  user: UserDetails | null; // Can be null
  totalAmount: number;
  status: "confirmed" | "pending" | "cancelled";
  createdAt: string;
  ticketId: string | null; // ✅ Can also be null
  slots: BookedSlot[]; // An array of slots
}

// --- 2. Create the component ---
const AllBookings: React.FC = () => {
  // Master list of all bookings from the API
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  // The list of bookings to display (after filtering)
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for the search term
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // --- 3. Fetch all bookings from the admin endpoint ---
    const fetchAllBookings = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token"); // Assumes admin token
        if (!token) {
          throw new Error("Admin token not found. Please log in.");
        }

        const res = await fetch(
          "https://soccerzone-backend.onrender.com/api/bookings/all",
          {
            headers: {
              Authorization: `Bearer ${token}`, // Admin endpoint needs auth
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch bookings. (Admin access required)");
        }

        // --- Handle the nested JSON response ---
        const data = await res.json();
        
        // Check if the structure is { message: "...", bookings: { message: "...", bookings: [...] } }
        if (data.bookings && Array.isArray(data.bookings.bookings)) {
          const bookingsArray: Booking[] = data.bookings.bookings;
          setAllBookings(bookingsArray);
          setFilteredBookings(bookingsArray); // Initially, show all
        } else {
          throw new Error("Unexpected API response structure.");
        }
        
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBookings();
  }, []); // Runs once when the component mounts

  // --- 4. Handle search filtering ---
  useEffect(() => {
    if (searchTerm === "") {
      // If search is empty, show all bookings
      setFilteredBookings(allBookings);
    } else {
      // Otherwise, filter by ticketId
      const filtered = allBookings.filter((booking) =>
        // ✅ FIX 1: Add a fallback for null ticketId
        // (booking.ticketId || '') checks if ticketId is null/undefined
        // If it is, it uses an empty string '' which won't crash
        (booking.ticketId || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBookings(filtered);
    }
  }, [searchTerm, allBookings]); // Re-run this whenever searchTerm or the main list changes

  // --- 5. Render Loading/Error States ---
  if (loading) {
    // ✅ FIX 2: Added a better loading spinner
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-green-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 font-medium">Loading all bookings...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  // --- 6. Render the search bar and the list of bookings ---
  return (
    <section className="max-w-6xl mx-auto py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">All Bookings</h1>

      {/* --- Search Bar --- */}
      <div className="mb-8">
        <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-2">
          Search by Ticket ID
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full max-w-lg border border-slate-300 rounded-md pl-10 pr-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-green-600 focus:border-transparent"
            placeholder="Enter Ticket ID (e.g., CZ17S3014)"
          />
        </div>
      </div>

      {/* --- Bookings List --- */}
      <div className="space-y-6">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div
              key={booking.bookingId}
              className="bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden"
            >
              {/* Booking Header */}
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap justify-between items-start gap-4">
                {/* Ticket & User Info */}
                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-green-700 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    {/* Use fallback here too, just in case */}
                    {booking.ticketId || "No Ticket ID"}
                  </h3>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p className="flex items-center gap-2">
                      <User className="w-4 h-4" /> 
                      <strong>{booking.user?.name || "Guest User"}</strong>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4" /> 
                      {booking.user?.email || "No Email"}
                    </p>
                  </div>
                </div>

                {/* Status & Amount */}
                <div className="text-right flex-shrink-0">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-3 ${
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
                  <h3 className="text-xl font-bold text-slate-900">
                    ₦{booking.totalAmount.toLocaleString()}
                  </h3>
                   <p className="text-xs text-slate-500 mt-1">
                    Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* List of Slots in this Booking */}
              <div className="p-4 space-y-4">
                <h4 className="font-semibold text-slate-800">
                  Booked Slot Details:
                </h4>
                
                {/* ✅ FIX 3: Add fallback for slots array just in case it's null */}
                {(booking.slots || []).map((slot) => (
                  <div
                    key={slot.slotId}
                    className="bg-slate-50 border border-slate-200 rounded-md p-4 flex flex-wrap gap-4 justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {new Date(slot.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {slot.startTime} – {slot.endTime}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          // No results found (either from search or initially)
          <div className="p-8 text-center text-slate-600 bg-slate-50 rounded-lg">
            {searchTerm
              ? `No bookings found for Ticket ID "${searchTerm}".`
              : "No bookings found."}
          </div>
        )}
      </div>
    </section>
  );
};

export default AllBookings;