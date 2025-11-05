import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Clock,
  Banknote,
  CalendarX2,
} from "lucide-react";
import { jsPDF } from "jspdf";

interface Slot {
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
  status: string;
}

interface Booking {
  bookingId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  slots: Slot[];
  paymentRef?: string;
  ticketId?: string | null;
  email?: boolean;
}

interface BookingCardProps {
  booking: Booking;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateForPDF = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const downloadPDF = () => {
    const doc = new jsPDF();

    // Add logo/header
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("SOCCERZONE", 105, 18, { align: "center" });

    // Booking title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("BOOKING RECEIPT", 105, 45, { align: "center" });

    let yPosition = 60;

    // Booking ID and Status
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Booking ID:", 20, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(`#${booking.bookingId.slice(-8).toUpperCase()}`, 60, yPosition);

    doc.setFont("helvetica", "bold");
    doc.text("Status:", 140, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(booking.status.toUpperCase(), 160, yPosition);

    yPosition += 15;

    // Created Date and Total Amount
    doc.setFont("helvetica", "bold");
    doc.text("Booking Date:", 20, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(formatDateForPDF(booking.createdAt), 60, yPosition);

    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", 140, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(`₦${booking.totalAmount.toLocaleString()}`, 170, yPosition);

    yPosition += 15;

    // Payment Reference and Ticket ID
    if (booking.paymentRef) {
      doc.setFont("helvetica", "bold");
      doc.text("Payment Ref:", 20, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(booking.paymentRef, 60, yPosition);
    }

    if (booking.ticketId) {
      doc.setFont("helvetica", "bold");
      doc.text("Ticket ID:", 140, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(booking.ticketId, 160, yPosition);
    }

    yPosition += 20;

    // Time Slots Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("TIME SLOTS", 20, yPosition);
    yPosition += 10;

    if (booking.slots.length > 0) {
      booking.slots.forEach((slot, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`Slot ${index + 1}:`, 25, yPosition);

        doc.setFont("helvetica", "normal");
        doc.text(`Date: ${formatDateForPDF(slot.date)}`, 25, yPosition + 6);
        doc.text(
          `Time: ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
          25,
          yPosition + 12
        );
        doc.text(
          `Amount: ₦${slot.amount.toLocaleString()}`,
          25,
          yPosition + 18
        );
        doc.text(`Status: ${slot.status}`, 25, yPosition + 24);

        yPosition += 35;
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.text("No slots available for this booking", 25, yPosition);
      yPosition += 15;
    }

    yPosition += 10;

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for choosing SoccerZone!", 105, 280, {
      align: "center",
    });
    doc.text("For inquiries, please contact support@soccerzone.com", 105, 285, {
      align: "center",
    });

    // Download the PDF
    doc.save(`booking-${booking.bookingId.slice(-8)}.pdf`);
  };

  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const lowerStatus = status.toLowerCase();
    const statusConfig = {
      completed: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      },
      confirmed: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      },
      booked: { // Added for slot status
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      },
      pending: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
      },
      cancelled: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
      },
      default: {
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
      },
    };

    const config =
      statusConfig[lowerStatus as keyof typeof statusConfig] ||
      statusConfig.default;

    return (
      <span
        className={`px-3 py-1.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} capitalize inline-flex items-center`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-70"></span>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-[#E0FFEC] rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 mb-4 overflow-hidden">
      {/* Booking Header - Always Visible */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 border-l-transparent"
        onClick={toggleExpand}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    Booking #{booking.bookingId.slice(-8).toUpperCase()}
                  </h3>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Amount</p>
                    <p className="font-semibold text-green-600">
                      ₦{booking.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Slots</p>
                    <p className="font-medium text-gray-900">
                      {booking.slots.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ticket ID</p>
                    <p className="font-mono text-sm text-gray-900">
                      {booking.ticketId || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
            {/* Desktop Download Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadPDF();
              }}
              className="hidden md:flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              title="Download Receipt"
            >
              <Download size={16} />
              <span>PDF</span>
            </button>
            {/* Toggle Button (Visible on all screens) */}
            <button
              onClick={toggleExpand}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp size={20} className="text-gray-600" />
              ) : (
                <ChevronDown size={20} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Download Button - Hidden on desktop */}
        <div className="mt-4 md:hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadPDF();
            }}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Download size={18} />
            <span>Download Receipt PDF</span>
          </button>
        </div>
      </div>

      {/* Expandable Slots Section */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-slate-50/80">
          <div className="p-4 space-y-4">
            {/* Booking Details */}
            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></span>
                Booking Details
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-600 text-xs font-medium mb-1">
                    Payment Ref
                  </p>
                  <p className="font-mono text-slate-800 text-sm">
                    {booking.paymentRef || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 text-xs font-medium mb-1">
                    Email Sent
                  </p>
                  <p
                    className={`font-medium text-sm ${
                      booking.email ? "text-green-600" : "text-slate-500"
                    }`}
                  >
                    {booking.email ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 text-xs font-medium mb-1">
                    Created
                  </p>
                  <p className="text-slate-800 text-sm">
                    {formatDate(booking.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 text-xs font-medium mb-1">
                    Total Slots
                  </p>
                  <p className="text-slate-800 text-sm">
                    {booking.slots.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Slots List */}
            <div>
              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></span>
                Time Slots ({booking.slots.length})
              </h4>
              {booking.slots.length > 0 ? (
                <div className="space-y-3">
                  {booking.slots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors shadow-xs"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
                              <p className="font-medium text-slate-800">
                                {formatDate(slot.date)}
                              </p>
                              {/* Replaced hard-coded span with StatusBadge component */}
                              <StatusBadge status={slot.status} />
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                              {/* Replaced ⏰ emoji with Clock icon */}
                              <span className="flex items-center">
                                <Clock
                                  size={15}
                                  className="text-slate-400 mr-1.5"
                                />
                                {formatTime(slot.startTime)} -{" "}
                                {formatTime(slot.endTime)}
                              </span>
                              {/* Replaced 💰 emoji with Banknote icon */}
                              <span className="flex items-center">
                                <Banknote
                                  size={15}
                                  className="text-slate-400 mr-1.5"
                                />
                                ₦{slot.amount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-white rounded-lg border border-slate-200">
                  {/* Replaced ⏰ emoji with CalendarX2 icon */}
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CalendarX2 size={24} className="text-slate-500" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    No slots available
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    No time slots for this booking
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Download Button in Expanded Section */}
            <div className="md:hidden">
              <button
                onClick={downloadPDF}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Download size={18} />
                <span>Download Receipt PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCard;