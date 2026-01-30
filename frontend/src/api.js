import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: apiBaseUrl
});

export const registerUser = (payload) => api.post("/api/users/register", payload);
export const loginUser = (payload) => api.post("/api/users/login", payload);
export const fetchPros = () => api.get("/api/users/pros");

export const fetchSlots = (proId, from, to) =>
  api.get(`/api/availability/${proId}`, { params: { from, to } });

export const createSlots = (proId, slots) =>
  api.post(`/api/availability/${proId}/slots`, { slots });

export const bookAppointment = (payload) => api.post("/api/appointments", payload);
export const fetchAppointments = (userId) =>
  api.get("/api/appointments", { params: { userId } });
export const cancelAppointment = (appointmentId) =>
  api.delete(`/api/appointments/${appointmentId}`);
