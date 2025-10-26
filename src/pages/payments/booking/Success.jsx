import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { verifyPayment } from "../../../api/payments"; // ✅ corrected import path

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get("reference") || searchParams.get("trxref");


  const [status, setStatus] = useState("Verifying payment...");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!reference) {
      setStatus("❌ Missing payment reference");
      setLoading(false);
      return;
    }

    const checkPayment = async () => {
      try {
        const res = await verifyPayment(reference);

        if (res.data.success) {
          setStatus("✅ " + res.data.message);
          setBooking({
            date: new Date().toLocaleDateString(),
            ticketId: res.data.data.ticketId,
            bookings: res.data.data.slots,
          });
        } else {
          setStatus("⚠ " + res.data.message);
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatus("❌ Error verifying payment. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    checkPayment();
  }, [reference]);

  const downloadPDF = () => {
    const input = document.getElementById("booking-content");
    if (!input) return;

    html2canvas(input).then((canvas) => {
      const pdf = new jsPDF("p", "mm", "a4");
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, width, height);
      pdf.save(`SoccerZone-Ticket-${booking?.ticketId}.pdf`);
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-600 text-lg">{status}</p>
      </div>
    );

  if (!booking)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <p className="text-red-500 text-lg mb-4">{status}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-green-900 hover:bg-green-800 text-white px-5 py-2 rounded-lg"
        >
          Go to Dashboard
        </button>
      </div>
    );

  return (
    <div className="bg-gray-100 min-h-screen p-4 flex flex-col items-center">
      <div
        id="booking-content"
        className="bg-white max-w-lg w-full rounded-xl shadow-md border border-gray-200"
      >
        <div className="bg-green-900 text-white text-center py-4">
          <h2 className="text-2xl font-bold">⚽ SoccerZone</h2>
          <p className="text-sm">Booking Confirmation</p>
        </div>

        <div className="p-6 text-gray-800">
          <p className="mt-2">
            Your booking has been{" "}
            <span className="text-green-600 font-semibold">confirmed</span>.
          </p>

          <div className="mt-4 space-y-2">
            <p>
              <strong>Date:</strong> {booking.date}
            </p>
            <p>
              <strong>Ticket ID:</strong>{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                {booking.ticketId}
              </code>
            </p>
          </div>

          <p className="mt-4 font-medium">Booked Slots:</p>
          <div className="mt-2 space-y-2">
            {booking.bookings?.length > 0 ? (
              booking.bookings.map((slot, i) => (
                <div
                  key={i}
                  className="bg-gray-100 px-3 py-2 rounded-md text-sm"
                >
                  {slot.startTime} - {slot.endTime}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No slots found</p>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={downloadPDF}
        className="mt-6 bg-green-900 hover:bg-green-800 text-white px-5 py-2 rounded-lg shadow"
      >
        Download as PDF
      </button>
    </div>
  );
}
