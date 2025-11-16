// import React from "react";
import AvailableSlots from "../components/AvailableSlots";

const Bookings = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          Book Your Football Slot
        </h1>
        <p className="text-gray-600 mb-10 text-lg">
          Choose your preferred time and join the game! Reserve your spot before it’s taken.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <AvailableSlots />
      </div>
    </div> 
  );  
};

export default Bookings;
