import axiosInstance from "../axiosInstance";


// --- Get all users ---
export const getUsers = async () => {
  const response = await axiosInstance.get("/users");
  return response.data; // returns array of users
};

// --- Get user by ID (with summary and bookings) ---
export const getUserById = async (id: string) => {
  const response = await axiosInstance.get(`/users/${id}`);
  return response.data;
};
