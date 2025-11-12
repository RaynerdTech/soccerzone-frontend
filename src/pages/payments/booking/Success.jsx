import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { verifyPayment } from "../../../api/payments";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const contentRef = useRef(null);

  // --- FIXED STATE ---
  // Use a single state to manage the view: 'loading', 'success', or 'error'
  // This avoids the race condition between loading=false and booking=null
  const [pageState, setPageState] = useState("loading");
  
  // Renamed 'status' to 'statusMessage' for clarity
  const [statusMessage, setStatusMessage] = useState("Verifying payment...");
  
  const [booking, setBooking] = useState(null);
  const [downloading, setDownloading] = useState(false);
  // --- END FIXED STATE ---

  useEffect(() => {
    if (!reference) {
      setStatusMessage("Missing payment reference");
      setPageState("error"); // Set to error state
      return;
    }

    const checkPayment = async () => {
      try {
        const res = await verifyPayment(reference);

        if (res.data.success) {
          setStatusMessage(res.data.message);
          setBooking({
            date: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            ticketId: res.data.data.ticketId,
            bookings: res.data.data.slots,
          });
          setPageState("success"); // Set to success state
        } else {
          setStatusMessage(res.data.message);
          setPageState("error"); // Set to error state
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setStatusMessage("Error verifying payment. Please contact support.");
        setPageState("error"); // Set to error state
      }
      // The 'finally' block was removed, as state is now set explicitly
      // in all code paths (success, fail, catch).
    };

    checkPayment();
  }, [reference]);

  const downloadPDF = async () => {
    if (!contentRef.current) return;

    setDownloading(true);
    try {
      // Create a clone of the content for PDF generation
      const element = contentRef.current;
      const clone = element.cloneNode(true);
      
      // Apply PDF-specific styles
      clone.style.width = "210mm";
      clone.style.minHeight = "297mm";
      clone.style.padding = "20mm";
      clone.style.boxSizing = "border-box";
      clone.style.backgroundColor = "#ffffff";
      
      // Hide interactive elements for PDF
      const buttons = clone.querySelectorAll('button');
      buttons.forEach(btn => btn.style.display = 'none');
      
      // Temporarily add to document
      clone.style.position = "fixed";
      clone.style.left = "-9999px";
      clone.style.top = "0";
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc, element) => {
          // Ensure all styles are properly applied in the clone
          element.style.width = "210mm";
          element.style.backgroundColor = "#ffffff";
        }
      });

      // Clean up the clone
      document.body.removeChild(clone);

      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png", 1.0);
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(
        imgData, 
        "PNG", 
        imgX, 
        imgY, 
        imgWidth * ratio, 
        imgHeight * ratio,
        undefined,
        "FAST"
      );
      
      pdf.save(`SoccerZone-Ticket-${booking?.ticketId}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again or contact support.");
    } finally {
      setDownloading(false);
    }
  };

  // Alternative PDF generation method using direct HTML to PDF
  const downloadPDFAlternative = async () => {
    setDownloading(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      
      // Add header
      pdf.setFillColor(6, 78, 59); // green-900
      pdf.rect(0, 0, 210, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("⚽ SoccerZone", 105, 20, { align: "center" });
      
      pdf.setFontSize(12);
      pdf.text("Booking Confirmation", 105, 30, { align: "center" });
      
      // Add content
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.text("Payment Successful", 20, 60);
      
      pdf.setFontSize(12);
      pdf.text(`Booking Date: ${booking.date}`, 20, 80);
      pdf.text(`Ticket ID: ${booking.ticketId}`, 20, 90);
      
      // Add booked slots
      pdf.text("Booked Slots:", 20, 110);
      let yPosition = 120;
      
      booking.bookings?.forEach((slot, index) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${slot.startTime} - ${slot.endTime}`, 30, yPosition);
        yPosition += 10;
      });
      
      pdf.save(`SoccerZone-Ticket-${booking?.ticketId}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback to html2canvas method
      await downloadPDF();
    } finally {
      setDownloading(false);
    }
  };

  // --- FIXED RENDER LOGIC ---

  // 1. Loading State
  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-900"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">{statusMessage}</p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (pageState === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Verification Failed</h3>
          <p className="text-gray-600 mb-6">{statusMessage}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-green-900 hover:bg-green-800 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  // 3. Success State
  // If pageState is 'success', we can safely render the success UI
  // because the 'booking' object is guaranteed to be set.
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful</h1>
          <p className="text-gray-600">Your booking has been confirmed</p>
        </div>

        {/* Booking Card - This will be used for PDF */}
        <div
          ref={contentRef}
          id="booking-content"
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 mb-6 pdf-content"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-900 to-green-800 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">⚽ SoccerZone</h2>
                <p className="text-green-100 opacity-90">Booking Confirmation</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Status</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-700 bg-opacity-50">
                  Confirmed
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Booking Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Booking Date</p>
                <p className="text-lg font-semibold text-gray-900">{booking.date}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Ticket ID</p>
                <p className="text-lg font-mono font-semibold text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {booking.ticketId}
                </p>
              </div>
            </div>

            {/* Booked Slots */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Booked Slots</h3>
              <div className="space-y-3">
                {booking.bookings?.length > 0 ? (
                  booking.bookings.map((slot, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="font-medium text-gray-900">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">Slot {i + 1}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No slots found
                  </div>
                )}
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                Please bring this confirmation with you when you visit SoccerZone
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={downloadPDFAlternative}
            disabled={downloading}
            className="flex items-center justify-center space-x-2 bg-green-900 hover:bg-green-800 disabled:bg-gray-400 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download as PDF</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-8 rounded-lg border border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Fallback message */}
        {downloading && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              If PDF download fails, please check your pop-up blocker or try again.
            </p>
          </div>
        )}
      </div>

      {/* Add CSS for PDF generation */}
      <style jsx>{`
        @media print {
          .pdf-content {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 20mm !important;
            box-shadow: none !important;
            border: 1px solid #ccc !important;
          }
        }
      `}</style>
    </div>
  );
}