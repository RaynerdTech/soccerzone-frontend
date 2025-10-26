import axios from "axios";

const BASE_URL = "https://soccerzone-backend.onrender.com/api";

export const verifyPayment = async (reference) => {
  return axios.post(
    "https://soccerzone-backend.onrender.com/api/bookings/verify-payment",
    { reference }
  );
};
