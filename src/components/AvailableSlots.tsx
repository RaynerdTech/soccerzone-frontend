import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info,
  ShoppingCart,
  UserCheck,
} from "lucide-react";

interface Slot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
  status: string;
}

const AvailableSlots: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [error, setError] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [booking, setBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // --- MODIFIED fetchSlots ---
  // Removed logic that deleted the pending booking.
  // It now *only* reads and applies.
  const fetchSlots = async (date: string) => {
    try {
      setLoading(true);
      setError("");
      // setSelectedSlots(new Set()); // This is handled by the date onChange
      const res = await fetch(
        `https://soccerzone-backend.onrender.com/api/slots?date=${date}`
      );
      if (!res.ok) throw new Error("Failed to fetch slots");
      const data = await res.json();
      setSlots(data);
    } catch (err) {
      setError("Unable to load available slots. Please try again.");
    } finally {
      setLoading(false);
      
      // --- MODIFIED LOGIC ---
      // Apply pending booking if it exists for this date.
      // DO NOT remove it here.
      const pendingBookingRaw = localStorage.getItem("pendingBooking");
      if (pendingBookingRaw) {
        try {
          const pending = JSON.parse(pendingBookingRaw);
          if (pending.date === date) {
            setSelectedSlots(new Set(pending.startTimes));
          }
        } catch (e) {
          console.error("Failed to parse pending booking", e);
          localStorage.removeItem("pendingBooking"); // Clear bad data
        }
      }
      // --- END MODIFIED LOGIC ---
    }
  };


  useEffect(() => {
    try {
      // 1. Check for URL parameters
      const params = new URLSearchParams(window.location.search);
      const dateFromUrl = params.get('date');
      const slotsFromUrl = params.get('slots');

      if (dateFromUrl && slotsFromUrl) {
        // User was redirected back from login
        const pending = {
          date: dateFromUrl,
          startTimes: slotsFromUrl.split(','),
        };
        // Save it to localStorage so fetchSlots can apply it
        localStorage.setItem("pendingBooking", JSON.stringify(pending)); 
        setSelectedDate(dateFromUrl);
        // Clean the URL so a refresh doesn't re-apply
        window.history.replaceState({}, '', window.location.pathname); 
      } else {
        // 2. Fallback: Check for localStorage (user refreshed)
        const pendingBookingRaw = localStorage.getItem("pendingBooking");
        if (pendingBookingRaw) {
          const pending = JSON.parse(pendingBookingRaw);
          const today = new Date().toISOString().split("T")[0];
          
          if (pending.date && pending.date !== today) {
            setSelectedDate(pending.date); 
          }
        }
      }
    } catch (e) {
      console.error("Failed to init pending booking", e);
      localStorage.removeItem("pendingBooking"); // Clear bad data
    }
  }, []); // Empty array, runs only once on mount

  // Fetches slots when selectedDate changes
  useEffect(() => {
    fetchSlots(selectedDate);
    setShowLoginPrompt(false);
  }, [selectedDate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // --- MODIFIED toggleSlotSelection ---
  const toggleSlotSelection = (slot: Slot) => {
    if (slot.status !== "available") return;
    
    // --- NEW ---
    // Any manual change clears the "saved" booking
    localStorage.removeItem("pendingBooking");

    const newSelected = new Set(selectedSlots);
    if (newSelected.has(slot.startTime)) {
      newSelected.delete(slot.startTime);
    } else {
      newSelected.add(slot.startTime);
    }
    setSelectedSlots(newSelected);
    setBookingError("");
    setShowLoginPrompt(false);
  };

  // --- MODIFIED handleBooking ---
  const handleBooking = async () => {
    if (selectedSlots.size === 0) {
      setBookingError("Please select at least one time slot");
      return;
    }

    setBookingError("");
    setShowLoginPrompt(false);

    const token = localStorage.getItem("token");

    // --- SAVE TO LOCAL STORAGE ---
    // We save here in case the token is invalid OR missing
    const pendingBooking = {
      date: selectedDate,
      startTimes: Array.from(selectedSlots),
      returnTo: window.location.pathname,
    };
    localStorage.setItem("pendingBooking", JSON.stringify(pendingBooking));

    if (!token) {
      setShowLoginPrompt(true);
      return; // Stop here
    }

    try {
      setBooking(true);

      const res = await fetch(
        `https://soccerzone-backend.onrender.com/api/bookings?date=${selectedDate}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            startTimes: Array.from(selectedSlots),
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Booking failed");
      }

      const data = await res.json();

      if (data.paymentUrl) {
        // --- SUCCESS ---
        // Clear the pending booking *only* on success
        localStorage.removeItem("pendingBooking"); 
        window.location.href = data.paymentUrl;
      }
    } catch (err: any) {
      const errorMsg =
        err.message || "Unable to complete booking. Please try again.";

      if (
        errorMsg.toLowerCase().includes("token") ||
        errorMsg.toLowerCase().includes("unauthorized")
      ) {
        // Token was invalid. We already saved the pending booking.
        localStorage.removeItem("token");
        setShowLoginPrompt(true);
      } else {
        // A different error (e.g., server down)
        // We *keep* the pending booking saved, but show the error
        setBookingError(errorMsg);
        localStorage.removeItem("pendingBooking"); // Don't keep if booking itself failed
      }
    } finally {
      setBooking(false);
    }
  };

  const availableCount = slots.filter((s) => s.status === "available").length;
  const totalCount = slots.length;

  return (
    <section
      className="min-h-screen py-16 lg:py-24 bg-white"
      id="available-slots"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section (Unchanged) */}
        <motion.div
          className="max-w-3xl mb-12 lg:mb-16"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-sm font-semibold text-green-600 tracking-wider uppercase mb-3">
            Book Your Session
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 tracking-tight">
            Available Time Slots
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Select your preferred date and time slots. You can book multiple slots
            at once.
          </p>
        </motion.div>

        {/* Instruction Banner (Unchanged) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Info className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">
                  💡 Select Multiple Slots
                </h3>
                <p className="text-blue-100 text-sm sm:text-base">
                  Click on any available time slots below to add them to your
                  booking. You can select as many slots as you need - perfect for
                  extended sessions!
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12 lg:mb-16">
          {/* Date Selector */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="lg:col-span-2"
          >
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Select Date
              </label>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-2">
                  <Calendar className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1">
                  <input
                    type="date"
                    value={selectedDate}
                    min={getMinDate()}
                    // --- MODIFIED onChange ---
                    onChange={(e) => {
                      localStorage.removeItem("pendingBooking"); // Clear on manual change
                      setSelectedSlots(new Set()); // Clear selection
                      setSelectedDate(e.target.value);
                    }}
                    className="w-full border border-slate-300 rounded-md px-4 py-2.5 text-slate-900 font-medium focus:ring-2 focus:ring-green-600 focus:border-transparent focus:outline-none transition-all bg-white"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    {formatDate(selectedDate)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Summary Card (Unchanged) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {!loading && !error && totalCount > 0 && (
              <div className="bg-green-600 text-white rounded-lg p-6 h-full flex flex-col justify-between">
                <div>
                  <p className="text-sm font-medium text-green-100 mb-2">
                    Availability
                  </p>
                  <p className="text-3xl font-bold mb-1">
                    {availableCount}/{totalCount}
                  </p>
                  <p className="text-sm text-green-100">
                    {availableCount === 1
                      ? "slot available"
                      : "slots available"}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Selection Info */}
        {selectedSlots.size > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6"
          >
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-5 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-900">
                      {selectedSlots.size}{" "}
                      {selectedSlots.size === 1 ? "Slot" : "Slots"} in Cart
                    </p>
                    <p className="text-xs text-green-700">
                      Click more slots to add or remove
                    </p>
                  </div>
                </div>
                <button
                  // --- MODIFIED onClick ---
                  onClick={() => {
                    localStorage.removeItem("pendingBooking"); // Clear on manual change
                    setSelectedSlots(new Set());
                  }}
                  className="px-4 py-2 bg-white border border-green-300 text-green-700 hover:bg-green-50 rounded-md text-sm font-semibold transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State (Unchanged) */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-12 h-12 border-3 border-slate-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 font-medium">Loading slots...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-8"
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">
                    Unable to Load Slots
                  </h3>
                  <p className="text-red-700 text-sm mb-4">{error}</p>
                  <button
                    // --- MODIFIED onClick ---
                    onClick={() => {
                      localStorage.removeItem("pendingBooking"); // Clear on manual change
                      setSelectedSlots(new Set());
                      fetchSlots(selectedDate);
                    }}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slots Grid (Unchanged) */}
        <AnimatePresence mode="wait">
          {!loading && !error && (
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {slots.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {slots.map((slot, index) => {
                      const isSelected = selectedSlots.has(slot.startTime);
                      const isAvailable = slot.status === "available";

                      return (
                        <motion.button
                          key={slot._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.02 }}
                          onClick={() => toggleSlotSelection(slot)}
                          disabled={!isAvailable}
                          className={`relative p-6 rounded-xl border-2 text-left transition-all transform hover:scale-105 group ${
                            isSelected
                              ? "border-green-600 bg-green-50 shadow-lg ring-2 ring-green-200"
                              : isAvailable
                              ? "border-green-300 bg-white hover:border-green-400 hover:shadow-md cursor-pointer"
                              : "border-red-200 bg-red-50 cursor-not-allowed opacity-90"
                          }`}
                        >
                          {/* ... (rest of the slot card UI is unchanged) ... */}
                           {/* Selection Indicator */}
                           {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2"
                            >
                              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              </div>
                            </motion.div>
                          )}

                          {/* Click Hint for Available Slots */}
                          {!isSelected && isAvailable && (
                            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-7 h-7 bg-slate-100 border-2 border-slate-300 rounded-full flex items-center justify-center">
                                <span className="text-xs text-slate-600 font-bold">
                                  +
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Time Display */}
                          <div className="flex items-start gap-3 mb-4">
                            <div
                              className={`flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center ${
                                isSelected
                                  ? "bg-green-100"
                                  : isAvailable
                                  ? "bg-slate-100"
                                  : "bg-red-100"
                              }`}
                            >
                              <Clock
                                className={`w-5 h-5 ${
                                  isSelected
                                    ? "text-green-700"
                                    : isAvailable
                                    ? "text-slate-600"
                                    : "text-red-600"
                                }`}
                              />
                            </div>
                            <div className="flex-1">
                              <p
                                className={`text-lg font-bold mb-0.5 ${
                                  isSelected
                                    ? "text-green-900"
                                    : isAvailable
                                    ? "text-slate-900"
                                    : "text-red-900"
                                }`}
                              >
                                {slot.startTime}
                              </p>
                              <p
                                className={`text-sm ${
                                  isSelected
                                    ? "text-green-700"
                                    : isAvailable
                                    ? "text-slate-500"
                                    : "text-red-600"
                                }`}
                              >
                                to {slot.endTime}
                              </p>
                            </div>
                          </div>

                          {/* Status */}
                          <div className="flex items-center gap-2">
                            {isAvailable ? (
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                                  isSelected
                                    ? "bg-green-600 text-white"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    isSelected ? "bg-white" : "bg-green-600"
                                  } ${isSelected ? "" : "animate-pulse"}`}
                                ></div>
                                {isSelected ? "Selected" : "Click to Select"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-400 text-white">
                                <Info className="w-3.5 h-3.5" />
                                Booked
                              </span>
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Booking Button & Error Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    {/* Regular Booking Error */}
                    {bookingError && (
                      <div className="w-full max-w-2xl bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700">{bookingError}</p>
                      </div>
                    )}

                    {/* LOGIN PROMPT */}
                    <AnimatePresence>
                      {showLoginPrompt && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="w-full max-w-2xl bg-blue-50 border border-blue-200 rounded-lg p-5"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <UserCheck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-blue-900 mb-1">
                                Please Log In to Continue
                              </h4>
                              <p className="text-sm text-blue-700 mb-4">
                                We've saved your selected slots. Just log in or
                                create an account, and you can complete your
                                booking!
                              </p>
                              <button
                                onClick={() => {
                                  const date = selectedDate;
                                  const slots = Array.from(selectedSlots).join(',');
                                  
                                  // Create the return URL
                                  const returnUrl = `/available-slots?date=${date}&slots=${slots}`;
                                  
                                  // Redirect to signup, passing the return URL
                                  window.location.href = `/signup?returnTo=${encodeURIComponent(returnUrl)}`;
                                }}
                                className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                              >
                                Go to Sign Up
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Booking Button (Unchanged) */}
               <button
  onClick={handleBooking}
  disabled={selectedSlots.size === 0 || booking || showLoginPrompt}
  className={`px-10 py-5 rounded-xl font-bold text-lg uppercase tracking-wide transition-all transform ${
    selectedSlots.size > 0 && !booking && !showLoginPrompt
      ? "bg-gradient-to-r from-green-700 to-emerald-600 text-white hover:from-green-800 hover:to-emerald-700 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
      : "bg-slate-200 text-slate-400 cursor-not-allowed"
  }`}
>
  {booking ? (
    <span className="flex items-center gap-3">
      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
      Securing Your Match...
    </span>
  ) : (
    <span className="flex items-center gap-3">
      <span className="text-xl">⚽</span>
      {selectedSlots.size > 0
        ? `Book ${selectedSlots.size} ${
            selectedSlots.size === 1 ? "Game Slot" : "Game Slots"
          }`
        : "Select Your Game Slots"}
    </span>
  )}
</button>



                    {selectedSlots.size > 0 && !showLoginPrompt && (
                      <p className="text-sm text-slate-600 text-center">
                        🔒 Total amount will be calculated securely on the
                        payment page
                      </p>
                    )}
                  </motion.div>
                </>
              ) : (
                // No Slots Available (Unchanged)
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 rounded-full mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    No Slots Available
                  </h3>
                  <p className="text-slate-600">
                    There are currently no available time slots for{" "}
                    {formatDate(selectedDate)}. Please select a different date.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AvailableSlots;