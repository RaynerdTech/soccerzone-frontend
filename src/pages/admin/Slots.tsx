
// import BookingsViewer from "../../components/AdminDashboard/BookingsViewer";

// const Slots = () => {
//   return (
//     <div className="min-h-screen bg-gray-50 py-16 px-2">
//       <div className=" mx-auto text-center">
//         <h1 className="text-3xl font-bold text-green-700 mb-4">
//           Book Your Football Slot
//         </h1>
//         <p className="text-gray-600 mb-10 text-lg">
//           Choose your preferred time and join the game! Reserve your spot before it’s taken.
//         </p>
//       </div>

//       <div className="max-w-6xl mx-auto">
//         <BookingsViewer/>
//       </div>
//     </div>
//   );
// };

// export default Slots;


import AdminBookingsViewer from "../../components/AdminDashboard/AdminBookingsViewer";

const Slots = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-2">
      <div className=" mx-auto text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">
          Book Your Football Slot
        </h1>
        <p className="text-gray-600 mb-10 text-lg">
          Choose your preferred time and join the game! Reserve your spot before it’s taken.
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        <AdminBookingsViewer/>
      </div>
    </div>
  );
};

export default Slots;
