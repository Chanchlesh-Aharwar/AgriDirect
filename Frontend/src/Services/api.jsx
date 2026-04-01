import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api"
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
};

export const lotService = {
  getAll: () => API.get("/lots"),
  getById: (id) => API.get(`/lots/${id}`),
  getByFarmer: () => API.get("/lots/farmer"),
  create: (data) => API.post("/lots/create", data),
  getByStatus: (status) => API.get(`/lots/status/${status}`),
};

export const bidService = {
  place: (data) => API.post("/bids/place", data),
  getByLot: (lotId) => API.get(`/bids/lot/${lotId}`),
  getHighest: (lotId) => API.get(`/bids/highest/${lotId}`),
  getMyBids: () => API.get("/bids/my-bids"),
};

export const transactionService = {
  create: (lotId) => API.post(`/transactions/create/${lotId}`),
  getMyTransactions: () => API.get("/transactions/my-transactions"),
  getById: (id) => API.get(`/transactions/${id}`),
};

export const paymentService = {
  createOrder: (transactionId) => API.post("/payments/create-order", { transactionId }),
  verify: (data) => API.post("/payments/verify", data),
  getByTransaction: (transactionId) => API.get(`/payments/${transactionId}`),
};

export const transportService = {
  create: (data) => API.post("/transport/create", data),
  assign: (data) => API.post("/transport/assign", data),
  updateStatus: (id, status) => API.put(`/transport/update-status/${id}`, { status }),
  getById: (id) => API.get(`/transport/${id}`),
  getByTrackingId: (trackingId) => API.get(`/transport/tracking/${trackingId}`),
  getByTransaction: (transactionId) => API.get(`/transport/transaction/${transactionId}`),
};

export const weatherService = {
  getByCity: (city) => API.get(`/weather/city/${city}`),
  getByCoordinates: (lat, lon) => API.get(`/weather/coordinates?lat=${lat}&lon=${lon}`),
  getForecast: (city) => API.get(`/weather/forecast/${city}`),
};

export const profileService = {
  getProfile: () => API.get("/profile"),
  updateProfile: (data) => API.put("/profile/update", data),
};

export default API;
